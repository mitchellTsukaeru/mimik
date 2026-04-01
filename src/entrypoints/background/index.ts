import { defineBackground } from "#imports";
import { logger } from "@/lib/logger";
import { setSidePanelBehavior, getActiveTab, localStorage } from "@/lib/browser-api";
import { onMessage } from "@/lib/messaging";
import { setupPortListener, broadcastStateToPanel } from "@/lib/port";
import { createGuide, saveRrwebChunk, getStepsForGuide, updateGuideTitle, updateStepDescription } from "@/core/guides/service";
import { generateGuideTitle } from "@/core/capture/ai/title";
import { handleCaptureStep, handleUpdateInputStep, handleFinalizeInputStep } from "./step-pipeline";
import {
  initActor,
  initActorFallback,
  getActor,
  getStateUpdate,
  waitUntilReady,
} from "./actor";
import { broadcastStartCapture, broadcastStopCapture, showNotificationOnTab } from "./tab-manager";
import { registerNavigationListeners } from "./navigation";

async function generateTitleInBackground(guideId: string) {
  try {
    const settings = await localStorage.get(['aiApiKey', 'aiProvider', 'aiModel']);
    if (!settings.aiApiKey) return;

    const steps = await getStepsForGuide(guideId);
    const allSteps = steps.filter(s => s.description).map(s => ({ description: s.description, url: s.url }));
    if (allSteps.length === 0) return;
    const stepsWithUrl = allSteps.length > 15
      ? [...allSteps.slice(0, 10), ...allSteps.slice(-5)]
      : allSteps;

    const provider = (settings.aiProvider as string) || 'openai';
    const model = (settings.aiModel as string) || 'gpt-4o-mini';
    const title = await generateGuideTitle(stepsWithUrl, provider, model, settings.aiApiKey as string);
    if (title) {
      await updateGuideTitle(guideId, title);
      logger.info('Generated guide title:', title);
    }
  } catch (err) {
    logger.error('Guide title generation failed', err);
  }
}

export default defineBackground(() => {
  logger.info("Background service worker started");

  setSidePanelBehavior(true);
  initActor().catch(initActorFallback);
  registerNavigationListeners();

  setupPortListener((port) => {
    logger.debug("Panel connected via port");
    waitUntilReady().then(() => {
      try { port.postMessage(getStateUpdate()); } catch {}
    });
  });

  waitUntilReady().then(() => {
    getActor().subscribe(() => broadcastStateToPanel(getStateUpdate()));
  });

  onMessage("getState", async () => {
    await waitUntilReady();
    return getStateUpdate();
  });

  onMessage("startRecording", async ({ data }) => {
    await waitUntilReady();
    const actor = getActor();
    actor.send({ type: "START_RECORDING", url: data.url });
    const guideId = actor.getSnapshot().context.currentGuideId!;

    await createGuide(guideId);

    const activeTab = await getActiveTab();
    if (activeTab?.id) await showNotificationOnTab(activeTab.id);

    await broadcastStartCapture(guideId);
    return { guideId };
  });

  onMessage("stopRecording", async () => {
    await waitUntilReady();
    const actor = getActor();
    const guideId = actor.getSnapshot().context.currentGuideId;
    await broadcastStopCapture();
    actor.send({ type: "STOP_RECORDING" });

    if (guideId) generateTitleInBackground(guideId);

    return { success: true, guideId: guideId ?? undefined };
  });

  onMessage("captureStep", async ({ data }) => {
    await waitUntilReady();
    return handleCaptureStep(data);
  });

  onMessage("updateInputStep", async ({ data }) => {
    await waitUntilReady();
    await handleUpdateInputStep(data.stepId, data.description);
    return { updated: true };
  });

  onMessage("finalizeInputStep", async ({ data }) => {
    await waitUntilReady();
    await handleFinalizeInputStep(data.stepId, data.elementMeta, data.domContext);
    return { updated: true };
  });

  onMessage("rrwebChunk", async ({ data }) => {
    await saveRrwebChunk({
      id: crypto.randomUUID(),
      guideId: data.guideId,
      events: data.events,
      timestamp: data.timestamp,
    });
    return { stored: true };
  });
});
