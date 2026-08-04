import type { DOMContext } from '@/core/capture/dom/context';
import { CaptureState } from '@/core/capture/machine';
import { buildFallbackDescription } from '@/core/capture/step-description';
import { db } from '@/core/guides/db';
import { addStepToGuide, createStep, saveScreenshot, updateStepDescription } from '@/core/guides/service';
import type { ElementMeta, Screenshot, Step } from '@/core/guides/types';
import { captureVisibleTab, getActiveTab } from '@/lib/browser-api';
import { logger } from '@/lib/logger';
import type { CaptureStepData, CaptureStepResponse } from '@/lib/messaging';
import { getActor } from './actor';

const CAPTURE_CACHE_TTL_MS = 10_000;

interface CachedCapture<T> {
  expiresAt: number;
  promise: Promise<T>;
}

const preparedCaptures = new Map<string, CachedCapture<string | undefined>>();
const captureRequests = new Map<string, CachedCapture<CaptureStepResponse>>();

function purgeExpiredCaptures() {
  const now = Date.now();
  for (const [id, capture] of preparedCaptures) {
    if (capture.expiresAt <= now) preparedCaptures.delete(id);
  }
  for (const [id, capture] of captureRequests) {
    if (capture.expiresAt <= now) captureRequests.delete(id);
  }
}

async function captureTabDataUrl(): Promise<string | undefined> {
  try {
    return await captureVisibleTab('jpeg', 90);
  } catch (err) {
    logger.warn('Screenshot capture failed', err);
    return undefined;
  }
}

export async function prepareCapture(captureId: string): Promise<boolean> {
  purgeExpiredCaptures();
  let cached = preparedCaptures.get(captureId);
  if (!cached) {
    cached = {
      expiresAt: Date.now() + CAPTURE_CACHE_TTL_MS,
      promise: captureTabDataUrl(),
    };
    preparedCaptures.set(captureId, cached);
  }
  return (await cached.promise) !== undefined;
}

async function takeScreenshot(stepId: string, meta: ElementMeta, captureId?: string): Promise<string | undefined> {
  try {
    const prepared = captureId ? preparedCaptures.get(captureId) : undefined;
    const dataUrl = (await prepared?.promise) ?? (await captureTabDataUrl());
    if (captureId) preparedCaptures.delete(captureId);
    if (!dataUrl) return undefined;
    const blob = await fetch(dataUrl).then((r) => r.blob());
    const img = await createImageBitmap(blob);
    const screenshot: Screenshot = {
      id: crypto.randomUUID(),
      stepId,
      blob,
      mimeType: 'image/jpeg',
      width: img.width,
      height: img.height,
      bounds: { x: meta.rect.x, y: meta.rect.y, width: meta.rect.width, height: meta.rect.height },
      pixelRatio: meta.devicePixelRatio,
    };
    img.close();
    await saveScreenshot(screenshot);
    return screenshot.id;
  } catch (err) {
    logger.warn('Screenshot capture failed', err);
    return undefined;
  }
}

export async function handleCaptureStep(data: CaptureStepData, senderTabId?: number): Promise<CaptureStepResponse> {
  purgeExpiredCaptures();
  if (!data.eventId) return performCaptureStep(data, senderTabId);

  const existing = captureRequests.get(data.eventId);
  if (existing) return existing.promise;

  const promise = performCaptureStep(data, senderTabId);
  captureRequests.set(data.eventId, {
    expiresAt: Date.now() + CAPTURE_CACHE_TTL_MS,
    promise,
  });
  return promise;
}

async function performCaptureStep(data: CaptureStepData, senderTabId?: number): Promise<CaptureStepResponse> {
  const snap = getActor().getSnapshot();
  if (snap.value !== CaptureState.RECORDING) return { ignored: true };
  if (data.guideId !== snap.context.currentGuideId || data.captureToken !== snap.context.captureToken) {
    return { ignored: true };
  }
  if (senderTabId !== undefined && senderTabId !== snap.context.activeTabId) return { ignored: true };
  if (senderTabId !== undefined) {
    const activeTab = await getActiveTab();
    if (activeTab?.id !== senderTabId) return { ignored: true };
  }

  const stepIndex = snap.context.stepCount;

  const guideId = snap.context.currentGuideId!;
  const stepId = crypto.randomUUID();

  const screenshotId = await takeScreenshot(stepId, data.elementMeta, data.captureId);
  const current = getActor().getSnapshot();
  const activeAfterCapture = senderTabId === undefined ? undefined : await getActiveTab();
  if (
    current.value !== CaptureState.RECORDING ||
    current.context.currentGuideId !== data.guideId ||
    current.context.captureToken !== data.captureToken ||
    (senderTabId !== undefined && activeAfterCapture?.id !== senderTabId)
  ) {
    if (screenshotId) await db.screenshots.delete(screenshotId);
    return { ignored: true };
  }
  getActor().send({ type: 'USER_ACTION' });

  await createStep({
    id: stepId,
    guideId,
    index: stepIndex,
    description: buildFallbackDescription(data.action, data.elementMeta),
    action: data.action,
    url: data.pageUrl,
    timestamp: Date.now(),
    screenshotId,
    elementMeta: data.elementMeta,
    kind: 'captured',
  });
  await addStepToGuide(guideId, stepId);

  return { stepId };
}

export async function handleUpdateInputStep(stepId: string, description: string, inputValue?: string) {
  await updateStepDescription(stepId, description);
  if (inputValue !== undefined) {
    await db.steps.update(stepId, { inputValue });
  }
}

export async function handleFinalizeInputStep(
  stepId: string,
  elementMeta: ElementMeta,
  domContext: DOMContext | undefined,
) {
  const updates: Partial<Step> = { elementMeta };
  if (getActor().getSnapshot().value === CaptureState.RECORDING) {
    const screenshotId = await takeScreenshot(stepId, elementMeta);
    if (screenshotId) updates.screenshotId = screenshotId;
  }
  await db.steps.update(stepId, updates);

  void domContext;
}
