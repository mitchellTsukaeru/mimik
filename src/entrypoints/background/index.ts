import { defineBackground } from "#imports";
import { logger } from "@/lib/logger";
import { setSidePanelBehavior, getActiveTab, localStorage } from "@/lib/browser-api";
import { onMessage } from "@/lib/messaging";
import { setupPortListener, broadcastStateToPanel } from "@/lib/port";
import { createGuide, saveRrwebChunk, getStepsForGuide, updateGuideTitle } from "@/core/guides/service";
import { generateGuideTitle } from "@/core/capture/ai-description";
import {
  initActor,
  initActorFallback,
  getActor,
  getStateUpdate,
  waitUntilReady,
} from "./actor";
import { broadcastStartCapture, broadcastStopCapture, showNotificationOnTab } from "./tab-manager";
import { handleUserAction } from "./step-pipeline";
import { registerNavigationListeners } from "./navigation";

async function generateTitleInBackground(guideId: string) {
  try {
    const settings = await localStorage.get(['aiApiKey', 'aiProvider', 'aiModel']);
    if (!settings.aiApiKey) return;

    const steps = await getStepsForGuide(guideId);
    const descriptions = steps.map(s => s.description).filter(Boolean);
    if (descriptions.length === 0) return;

    const provider = (settings.aiProvider as string) || 'openai';
    const model = (settings.aiModel as string) || 'gpt-4o-mini';
    const title = await generateGuideTitle(descriptions, provider, model, settings.aiApiKey as string);
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
      try {
        port.postMessage(getStateUpdate());
      } catch {}
    });
  });

  waitUntilReady().then(() => {
    getActor().subscribe(() => broadcastStateToPanel(getStateUpdate()));
  });

  onMessage("getState", async () => {
    await waitUntilReady();
    const update = getStateUpdate();
    logger.debug("getState →", update.state);
    return update;
  });

  onMessage("startRecording", async ({ data }) => {
    logger.info("startRecording →", data.url);
    await waitUntilReady();
    const actor = getActor();
    actor.send({ type: "START_RECORDING", url: data.url });
    const guideId = actor.getSnapshot().context.currentGuideId!;

    await createGuide(guideId);

    const activeTab = await getActiveTab();
    if (activeTab?.id) {
      await showNotificationOnTab(activeTab.id);
    }

    await broadcastStartCapture(guideId);
    logger.info("Recording started → guideId:", guideId);
    return { guideId };
  });

  onMessage("stopRecording", async () => {
    await waitUntilReady();
    const actor = getActor();
    const guideId = actor.getSnapshot().context.currentGuideId;
    logger.info("stopRecording → guideId:", guideId);
    await broadcastStopCapture();
    actor.send({ type: "STOP_RECORDING" });

    if (guideId) {
      generateTitleInBackground(guideId);
    }

    return { success: true, guideId: guideId ?? undefined };
  });

  onMessage("userAction", async (message) => {
    await waitUntilReady();
    logger.debug("userAction →", message.data.action);
    return handleUserAction(message.data, message.sender);
  });

  onMessage("rrwebChunk", async ({ data }) => {
    logger.debug("rrwebChunk →", data.events.length, "events");
    await saveRrwebChunk({
      id: crypto.randomUUID(),
      guideId: data.guideId,
      events: data.events,
      timestamp: data.timestamp,
    });
    return { stored: true };
  });
});
