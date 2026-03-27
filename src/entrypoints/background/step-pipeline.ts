import { localStorage } from '@/lib/browser-api';
import { captureAnnotated } from '@/capture/screenshot';
import { buildFallbackDescription } from '@/capture/step-description';
import { getAIDescription } from '@/capture/ai-description';
import { db } from '@/guides/db';
import { getActor } from './actor';
import type { Browser } from '#imports';
import type { ElementMeta } from '@/guides/types';

let captureQueue: Promise<void> = Promise.resolve();

function enqueue(fn: () => Promise<void>): void {
  captureQueue = captureQueue
    .then(fn)
    .catch((err) => console.error('[Mimik] Capture error', err));
}

interface UserActionData {
  guideId: string;
  action: string;
  elementMeta: ElementMeta;
}

export function handleUserAction(
  data: UserActionData,
  sender: Browser.runtime.MessageSender,
): { stepId: string } | { ignored: true } | { error: string } {
  const actor = getActor();
  const snap = actor.getSnapshot();

  if (snap.value !== 'recording') {
    return { ignored: true };
  }

  const stepIndex = snap.context.stepCount;
  actor.send({ type: 'USER_ACTION' });
  const guideId = snap.context.currentGuideId!;
  const stepId = crypto.randomUUID();
  const tabId = sender.tab?.id;

  if (!tabId) {
    return { error: 'no tabId' };
  }

  enqueue(async () => {
    const fallbackDescription = buildFallbackDescription(data.action, data.elementMeta);
    const currentUrl = snap.context.currentUrl;

    let screenshotId: string | undefined;
    let screenshotBlob: Blob | undefined;
    try {
      const screenshot = await captureAnnotated(tabId, stepId, data.elementMeta);
      screenshotId = screenshot.id;
      screenshotBlob = screenshot.blob;
    } catch (err) {
      console.warn('[Mimik] Screenshot capture failed, storing step without screenshot', err);
    }

    await db.steps.add({
      id: stepId,
      guideId,
      index: stepIndex,
      description: fallbackDescription,
      action: data.action,
      url: currentUrl,
      timestamp: Date.now(),
      screenshotId,
    });

    const guide = await db.guides.get(guideId);
    if (guide) {
      await db.guides.update(guideId, {
        stepIds: [...guide.stepIds, stepId],
        updatedAt: Date.now(),
      });
    }

    if (screenshotBlob) {
      (async () => {
        try {
          const settings = await localStorage.get(['aiApiKey', 'aiProvider']);
          if (settings.aiApiKey) {
            const provider = (settings.aiProvider as 'openai' | 'anthropic') || 'openai';
            const aiDescription = await getAIDescription(
              screenshotBlob,
              data.action,
              data.elementMeta,
              provider,
              settings.aiApiKey as string,
            );
            if (aiDescription) {
              await db.steps.update(stepId, { description: aiDescription });
            }
          }
        } catch (err) {
          console.error('[Mimik] AI description update failed', err);
        }
      })();
    }
  });

  return { stepId };
}
