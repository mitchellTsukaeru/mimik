import { Check, Languages, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { browser } from '#imports';
import { AI_LANGUAGES, type AILanguageCode } from '@/core/capture/ai/prompts';
import type { TranslationJob } from '@/core/guides/types';
import {
  cancelTranslationJob,
  getActiveTranslationJob,
  getTranslationJob,
  onTranslationChanged,
} from '@/core/translation/service';
import { createTab, getExtensionURL, localStorage } from '@/lib/browser-api';
import { sendMessage } from '@/lib/messaging';
import { Button } from '@/ui/components/ui/button';

export function TranslateGuideDialog({ guideId, onClose }: { guideId: string; onClose: () => void }) {
  const [targetLanguage, setTargetLanguage] = useState<AILanguageCode>('ja');
  const [job, setJob] = useState<TranslationJob>();
  const jobIdRef = useRef<string>();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const refreshJob = useCallback(
    async (jobId?: string) => {
      const current = jobId ? await getTranslationJob(jobId) : await getActiveTranslationJob(guideId);
      if (current) {
        jobIdRef.current = current.id;
        setJob(current);
      }
    },
    [guideId],
  );

  useEffect(() => {
    void refreshJob();
    void localStorage.get(['lastTranslationLanguage', 'aiLanguage']).then((settings) => {
      const preferred =
        settings.lastTranslationLanguage ||
        (String(settings.aiLanguage || 'en').startsWith('en') ? 'ja' : settings.aiLanguage);
      if (AI_LANGUAGES.some((language) => language.code === preferred)) {
        setTargetLanguage(preferred as AILanguageCode);
      }
    });
    const unsubscribe = onTranslationChanged((jobId) => {
      if (!jobIdRef.current || jobIdRef.current === jobId) void refreshJob(jobId);
    });
    const interval = window.setInterval(() => {
      if (jobIdRef.current) void refreshJob(jobIdRef.current);
    }, 1_500);
    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [refreshJob]);

  const progress = useMemo(
    () => (job ? Math.round((job.completedItems / Math.max(1, job.totalItems)) * 100) : 0),
    [job],
  );

  async function start() {
    setStarting(true);
    setError('');
    await localStorage.set({ lastTranslationLanguage: targetLanguage });
    try {
      const result = await sendMessage('startTranslation', { guideId, targetLanguage });
      if (!result.success) {
        setError(result.error);
        if (result.needsConfiguration) void browser.runtime.openOptionsPage();
        return;
      }
      await refreshJob(result.jobId);
    } finally {
      setStarting(false);
    }
  }

  async function retry() {
    if (!job) return;
    setError('');
    const result = await sendMessage('retryTranslation', { jobId: job.id });
    if (!result.success) setError(result.error || 'Translation could not resume');
    await refreshJob(job.id);
  }

  const isWorking = job?.status === 'queued' || job?.status === 'running';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Languages size={17} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">Create translated copy</h2>
              <p className="text-[11px] text-muted-foreground">Keep the original guide unchanged.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {!job && (
            <>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-foreground">Translate into</span>
                <select
                  value={targetLanguage}
                  onChange={(event) => setTargetLanguage(event.target.value as AILanguageCode)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                >
                  {AI_LANGUAGES.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-border bg-secondary/25 p-4">
                <div className="mb-3 flex items-center gap-2" aria-hidden="true">
                  <span className="rounded-md bg-card px-2 py-1 text-[10px] font-bold text-muted-foreground ring-1 ring-border">
                    SOURCE
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-border to-accent" />
                  <span className="rounded-md bg-accent px-2 py-1 text-[10px] font-bold text-white">
                    TRANSLATED COPY
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-foreground">
                  Only the guide title and step text are sent to your configured AI provider. Screenshots, URLs,
                  selectors, DOM details, and typed values stay in TaskStitch.
                </p>
              </div>
            </>
          )}

          {job && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {job.status === 'completed'
                      ? 'Translated copy ready'
                      : job.status === 'failed'
                        ? 'Translation paused'
                        : job.status === 'cancelled'
                          ? 'Translation cancelled'
                          : 'Translating guide'}
                  </span>
                  <span className="font-bold tabular-nums text-accent">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {job.completedItems} of {job.totalItems} text items saved
                </p>
              </div>

              {isWorking && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  You can close this window. TaskStitch saves each batch and resumes if the browser suspends the
                  extension.
                </p>
              )}
              {job.status === 'failed' && (
                <div className="rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {job.error || 'Translation stopped before the next batch.'}
                </div>
              )}
              {job.status === 'completed' && (
                <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-xs font-medium text-success">
                  <Check size={15} /> The original guide and its screenshots were not changed.
                </div>
              )}
            </div>
          )}

          {(error || (job?.status === 'cancelled' && error)) && (
            <div className="rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-secondary/20 px-5 py-3">
          {isWorking && (
            <Button
              variant="ghost"
              onClick={async () => {
                await cancelTranslationJob(job.id);
                await refreshJob(job.id);
              }}
            >
              Cancel translation
            </Button>
          )}
          {job?.status === 'failed' && (
            <Button variant="secondary" onClick={retry}>
              <RotateCcw size={14} /> Retry batch
            </Button>
          )}
          {job?.status === 'completed' && job.translatedGuideId ? (
            <Button
              onClick={() => {
                void createTab({ url: getExtensionURL(`/fullview.html?guideId=${job.translatedGuideId}`) });
                onClose();
              }}
            >
              Open translated guide
            </Button>
          ) : job ? (
            <Button variant="secondary" onClick={onClose}>
              {isWorking ? 'Continue in background' : 'Close'}
            </Button>
          ) : (
            <Button disabled={starting} onClick={start}>
              {starting ? 'Starting…' : 'Create translated copy'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
