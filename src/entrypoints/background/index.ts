import { defineBackground } from '#imports';
import { generateGuideTitle } from '@/core/capture/ai/title';
import { advanceSession, cancelSession, completeSession, getSession, startSession } from '@/core/guideme/session';
import { createGuide, getGuideDomain, getStepsForGuide, saveRrwebChunk, updateGuideTitle } from '@/core/guides/service';
import { getActiveTab, localStorage, sendMessageToTab, setSidePanelBehavior, updateTab } from '@/lib/browser-api';
import { logger } from '@/lib/logger';
import { onMessage } from '@/lib/messaging';
import { broadcastStateToPanel, setupPortListener } from '@/lib/port';
import { getActor, getStateUpdate, initActor, initActorFallback, waitUntilReady } from './actor';
import { registerNavigationListeners } from './navigation';
import { handleCaptureStep, handleFinalizeInputStep, handleUpdateInputStep } from './step-pipeline';
import { broadcastStartCapture, broadcastStopCapture, showNotificationOnTab } from './tab-manager';

let offscreenPort: chrome.runtime.Port | null = null;

async function ensureOffscreen(): Promise<chrome.runtime.Port> {
  if (offscreenPort) return offscreenPort;

  const portReady = new Promise<void>((resolve) => {
    const listener = (port: chrome.runtime.Port) => {
      if (port.name === 'mimik-offscreen') {
        chrome.runtime.onConnect.removeListener(listener);
        offscreenPort = port;
        offscreenPort.onMessage.addListener((msg) => {
          if (msg.type === 'progress') {
            localStorage.set({ blurAiProgress: msg.progress });
          }
          if (msg.type === 'log') {
            logger.info('[OFFSCREEN]', msg.message);
          }
        });
        offscreenPort.onDisconnect.addListener(() => {
          offscreenPort = null;
        });
        resolve();
      }
    };
    chrome.runtime.onConnect.addListener(listener);
  });

  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['WORKERS' as chrome.offscreen.Reason],
      justification: 'AI PII detection via Transformers.js',
    });
  } catch {}

  await portReady;
  return offscreenPort!;
}

let offscreenMsgId = 0;
function sendToOffscreen(type: string, data: Record<string, unknown> = {}): Promise<any> {
  return ensureOffscreen().then((port) => {
    return new Promise((resolve, reject) => {
      const id = ++offscreenMsgId;
      const timeout = setTimeout(() => {
        port.onMessage.removeListener(handler);
        reject(new Error('Offscreen timeout'));
      }, 120000);
      const handler = (msg: any) => {
        if (msg.id === id) {
          clearTimeout(timeout);
          port.onMessage.removeListener(handler);
          resolve(msg);
        }
      };
      port.onMessage.addListener(handler);
      port.postMessage({ type, id, ...data });
    });
  });
}

async function generateTitleInBackground(guideId: string) {
  try {
    const settings = await localStorage.get(['aiApiKey', 'aiProvider', 'aiModel']);
    if (!settings.aiApiKey) {
      const domain = await getGuideDomain(guideId);
      if (domain) await updateGuideTitle(guideId, `Guide on ${domain}`);
      return;
    }

    const steps = await getStepsForGuide(guideId);
    const allSteps = steps.filter((s) => s.description).map((s) => ({ description: s.description, url: s.url }));
    if (allSteps.length === 0) return;
    const stepsWithUrl = allSteps.length > 15 ? [...allSteps.slice(0, 10), ...allSteps.slice(-5)] : allSteps;

    const provider = (settings.aiProvider as string) || 'openai';
    const model = (settings.aiModel as string) || 'gpt-4o-mini';
    const title = await generateGuideTitle(stepsWithUrl, provider, model, settings.aiApiKey as string);
    if (title) {
      await updateGuideTitle(guideId, title);
      logger.info('Generated guide title:', title);
    }
  } catch (err) {
    logger.error('Guide title generation failed', err);
    const domain = await getGuideDomain(guideId);
    if (domain) await updateGuideTitle(guideId, `Guide on ${domain}`);
  }
}

export default defineBackground(() => {
  logger.info('Background service worker started');

  setSidePanelBehavior(true);
  initActor().catch(initActorFallback);
  registerNavigationListeners();

  setupPortListener((port) => {
    logger.debug('Panel connected via port');
    waitUntilReady().then(() => {
      try {
        port.postMessage(getStateUpdate());
      } catch {}
    });

    port.onDisconnect.addListener(() => {
      getSession().then((session) => {
        if (session?.active) {
          cancelSession();
          logger.debug('Guide Me cancelled: sidepanel closed');
        }
      });
    });
  });

  waitUntilReady().then(() => {
    getActor().subscribe(() => broadcastStateToPanel(getStateUpdate()));
  });

  onMessage('getState', async () => {
    await waitUntilReady();
    return getStateUpdate();
  });

  onMessage('startRecording', async ({ data }) => {
    await waitUntilReady();
    const actor = getActor();
    actor.send({ type: 'START_RECORDING', url: data.url });
    const guideId = actor.getSnapshot().context.currentGuideId!;

    await createGuide(guideId);

    const activeTab = await getActiveTab();
    if (activeTab?.id) await showNotificationOnTab(activeTab.id);

    await broadcastStartCapture(guideId);
    return { guideId };
  });

  onMessage('stopRecording', async () => {
    await waitUntilReady();
    const actor = getActor();
    const guideId = actor.getSnapshot().context.currentGuideId;
    await broadcastStopCapture();
    actor.send({ type: 'STOP_RECORDING' });

    if (guideId) generateTitleInBackground(guideId);

    return { success: true, guideId: guideId ?? undefined };
  });

  onMessage('enterBlurMode', async () => {
    await waitUntilReady();
    await broadcastStopCapture();
    const activeTab = await getActiveTab();
    if (activeTab?.id) {
      sendMessageToTab(activeTab.id, { type: 'START_BLUR' }).catch(() => {});
    }
    return { entered: true };
  });

  onMessage('exitBlurMode', async () => {
    await waitUntilReady();
    await localStorage.set({ mimikBlurMode: false });
    const actor = getActor();
    const guideId = actor.getSnapshot().context.currentGuideId;
    if (guideId) {
      await broadcastStartCapture(guideId);
    }
    return { exited: true };
  });

  onMessage('captureStep', async ({ data }) => {
    await waitUntilReady();
    return handleCaptureStep(data);
  });

  onMessage('updateInputStep', async ({ data }) => {
    await waitUntilReady();
    await handleUpdateInputStep(data.stepId, data.description, data.inputValue);
    return { updated: true };
  });

  onMessage('finalizeInputStep', async ({ data }) => {
    await waitUntilReady();
    await handleFinalizeInputStep(data.stepId, data.elementMeta, data.domContext);
    return { updated: true };
  });

  onMessage('rrwebChunk', async ({ data }) => {
    await saveRrwebChunk({
      id: crypto.randomUUID(),
      guideId: data.guideId,
      events: data.events,
      timestamp: data.timestamp,
    });
    return { stored: true };
  });

  onMessage('startGuideMe', async ({ data }) => {
    const steps = await getStepsForGuide(data.guideId);
    if (steps.length === 0) return { started: false, error: 'No steps' };

    const firstStep = steps.find((s) => s.elementMeta) ?? steps[0];
    if (!steps.some((s) => s.elementMeta)) return { started: false, error: 'Guide lacks element metadata' };

    await startSession(data.guideId, steps.length, firstStep);

    const activeTab = await getActiveTab();
    if (activeTab?.id && firstStep.url) {
      await updateTab(activeTab.id, { url: firstStep.url });
    }

    return { started: true };
  });

  onMessage('guideMeStepCompleted', async ({ data }) => {
    const sessionData = await localStorage.get(['guideMeSession']);
    const session = sessionData.guideMeSession as { guideId: string } | undefined;
    if (!session) return { advanced: false };

    const steps = await getStepsForGuide(session.guideId);
    const nextIndex = data.stepIndex + 1;

    if (nextIndex >= steps.length) {
      await completeSession();
      return { advanced: true, completed: true };
    }

    const nextStep = steps[nextIndex];
    if (!nextStep) {
      await completeSession();
      return { advanced: true, completed: true };
    }
    await advanceSession(nextStep, nextIndex);

    const currentTab = await getActiveTab();
    if (currentTab?.id && nextStep.url && nextStep.url !== currentTab.url) {
      await updateTab(currentTab.id, { url: nextStep.url });
    }

    return { advanced: true };
  });

  onMessage('guideMeCancel', async () => {
    await cancelSession();
    return { cancelled: true };
  });

  onMessage('guideMePrev', async ({ data }) => {
    if (data.stepIndex <= 0) return { moved: false };

    const sessionData = await localStorage.get(['guideMeSession']);
    const session = sessionData.guideMeSession as { guideId: string } | undefined;
    if (!session) return { moved: false };

    const steps = await getStepsForGuide(session.guideId);
    const prevIndex = data.stepIndex - 1;
    const prevStep = steps[prevIndex];
    if (!prevStep) return { moved: false };
    await advanceSession(prevStep, prevIndex);

    const currentTab = await getActiveTab();
    if (currentTab?.id && prevStep.url && prevStep.url !== currentTab.url) {
      await updateTab(currentTab.id, { url: prevStep.url });
    }

    return { moved: true };
  });

  onMessage('blurAiDetect', async ({ data }) => {
    logger.info('[BLUR-AI] ensuring offscreen');
    await ensureOffscreen();
    logger.info('[BLUR-AI] sending detect to offscreen, text length:', data.text?.length);
    const res = await sendToOffscreen('offscreen:ai:detect', { text: data.text });
    logger.info('[BLUR-AI] offscreen response:', res);
    if (res?.entities) {
      const patterns = res.entities.map((e: { text: string }) => e.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      return { patterns };
    }
    return { patterns: [] };
  });
});
