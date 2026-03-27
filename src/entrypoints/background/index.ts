import { defineBackground } from '#imports';
import { setSidePanelBehavior } from '@/lib/browser-api';
import { onMessage } from '@/lib/messaging';
import { db } from '@/guides/db';
import { initActor, initActorFallback, getActor, ready } from './actor';
import { injectAllTabs, broadcastStartCapture, broadcastStopCapture } from './tab-manager';
import { handleUserAction } from './step-pipeline';
import { registerNavigationListeners } from './navigation';

export default defineBackground(() => {
  setSidePanelBehavior(true);

  initActor().catch(initActorFallback);
  injectAllTabs();
  registerNavigationListeners();

  onMessage('ping', () => {
    return { alive: true };
  });

  onMessage('getState', async () => {
    await ready;
    const snap = getActor().getSnapshot();
    return {
      state: (snap.value as string) ?? 'unknown',
      stepCount: snap.context.stepCount,
      currentGuideId: snap.context.currentGuideId,
    };
  });

  onMessage('startRecording', async ({ data }) => {
    await ready;
    const actor = getActor();
    actor.send({ type: 'START_RECORDING', url: data.url });
    const guideId = actor.getSnapshot().context.currentGuideId!;

    await db.guides.add({
      id: guideId,
      title: 'Untitled Guide',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stepIds: [],
      starred: false,
      deletedAt: null,
    });

    await broadcastStartCapture(guideId);
    return { guideId };
  });

  onMessage('stopRecording', async () => {
    await ready;
    const actor = getActor();
    const guideId = actor.getSnapshot().context.currentGuideId;
    await broadcastStopCapture();
    actor.send({ type: 'STOP_RECORDING' });
    return { success: true, guideId: guideId ?? undefined };
  });

  onMessage('userAction', async (message) => {
    await ready;
    return handleUserAction(message.data, message.sender);
  });

  onMessage('rrwebChunk', async ({ data }) => {
    await db.rrwebEvents.add({
      id: crypto.randomUUID(),
      guideId: data.guideId,
      events: data.events,
      timestamp: data.timestamp,
    });
    return { stored: true };
  });
});
