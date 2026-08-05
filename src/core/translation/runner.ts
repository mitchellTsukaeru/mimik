import { browser } from '#imports';
import { db } from '@/core/guides/db';
import { getGuide } from '@/core/guides/service';
import type { TranslationJob } from '@/core/guides/types';
import { localStorage } from '@/lib/browser-api';
import { logger } from '@/lib/logger';
import { takeTranslationBatch, translateBatch } from './ai';
import { completeTranslationJob, createTranslationJob, getTranslationJob, updateTranslationJob } from './service';

const ALARM_PREFIX = 'taskstitch-translation:';
const activeJobs = new Set<string>();

function alarmName(jobId: string): string {
  return `${ALARM_PREFIX}${jobId}`;
}

async function schedule(jobId: string, delayInMinutes = 0.01) {
  await browser.alarms.create(alarmName(jobId), { delayInMinutes });
}

export async function startTranslation(sourceGuideId: string, targetLanguage: string): Promise<TranslationJob> {
  const guideData = await getGuide(sourceGuideId);
  if (!guideData) throw new Error('Guide not found');
  const job = await createTranslationJob(guideData.guide, guideData.steps, targetLanguage);
  await schedule(job.id);
  void processJob(job.id);
  return job;
}

export async function retryTranslation(jobId: string): Promise<void> {
  const job = await getTranslationJob(jobId);
  if (!job || job.status !== 'failed') throw new Error('Translation job cannot be retried');
  await updateTranslationJob(jobId, { status: 'queued', error: undefined });
  await schedule(jobId);
  void processJob(jobId);
}

async function processJob(jobId: string): Promise<void> {
  if (activeJobs.has(jobId)) return;
  activeJobs.add(jobId);
  try {
    let job = await getTranslationJob(jobId);
    if (!job || job.status === 'cancelled' || job.status === 'completed') return;
    const settings = await localStorage.get(['aiApiKey', 'aiProvider', 'aiModel', 'aiBaseUrl']);
    if (!settings.aiApiKey) {
      await updateTranslationJob(jobId, { status: 'failed', error: 'Configure an AI provider first' });
      return;
    }

    while (job.status !== 'cancelled') {
      const batch = takeTranslationBatch(job.items, job.nextIndex);
      if (batch.length === 0) {
        await completeTranslationJob(jobId);
        await browser.alarms.clear(alarmName(jobId));
        return;
      }
      await updateTranslationJob(jobId, { status: 'running', error: undefined });
      // If Chrome suspends the service worker during the provider call, this
      // watchdog wakes it and retries from the last fully saved batch.
      await schedule(jobId, 0.5);
      const translated = await translateBatch(batch, job.targetLanguage, {
        apiKey: settings.aiApiKey as string,
        provider: (settings.aiProvider as string) || 'openai',
        model: settings.aiModel as string | undefined,
        baseUrl: settings.aiBaseUrl as string | undefined,
      });

      const current = await getTranslationJob(jobId);
      if (!current || current.status === 'cancelled') return;
      const nextIndex = job.nextIndex + batch.length;
      await updateTranslationJob(jobId, {
        translations: { ...current.translations, ...translated },
        nextIndex,
        completedItems: nextIndex,
        status: 'queued',
      });
      job = (await getTranslationJob(jobId))!;
    }
  } catch (error) {
    logger.error('Guide translation batch failed', error);
    const current = await getTranslationJob(jobId);
    if (current && current.status !== 'cancelled') {
      await updateTranslationJob(jobId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Translation failed',
      });
    }
  } finally {
    activeJobs.delete(jobId);
  }
}

export function registerTranslationRunner(): void {
  browser.alarms.onAlarm.addListener((alarm) => {
    if (!alarm.name.startsWith(ALARM_PREFIX)) return;
    void processJob(alarm.name.slice(ALARM_PREFIX.length));
  });

  db.translationJobs
    .where('status')
    .anyOf(['queued', 'running'])
    .toArray()
    .then(async (jobs) => {
      for (const job of jobs) {
        if (job.status === 'running') await updateTranslationJob(job.id, { status: 'queued' });
        await schedule(job.id);
        void processJob(job.id);
      }
    })
    .catch((error) => logger.error('Translation job recovery failed', error));
}
