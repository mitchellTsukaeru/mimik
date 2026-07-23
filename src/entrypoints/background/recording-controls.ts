import { CaptureState, type CaptureStateValue } from '@/core/capture/machine';

interface RecordingActor {
  send(event: { type: 'START_RECORDING'; url?: string } | { type: 'STOP_RECORDING' }): void;
  getSnapshot(): {
    value: CaptureStateValue;
    context: { currentGuideId: string | null };
  };
}

interface ActiveTab {
  id?: number;
  url?: string;
}

export interface RecordingControlsDependencies {
  waitUntilReady(): Promise<unknown>;
  getActor(): RecordingActor;
  getActiveTab(): Promise<ActiveTab | undefined>;
  createGuide(guideId: string): Promise<unknown>;
  showNotificationOnTab(tabId: number): Promise<unknown>;
  broadcastStartCapture(guideId: string): Promise<unknown>;
  broadcastStopCapture(): Promise<unknown>;
  generateTitle(guideId: string): void | Promise<void>;
}

export function createRecordingControls(dependencies: RecordingControlsDependencies) {
  async function startReady(actor: RecordingActor, requestedUrl?: string): Promise<string> {
    const activeTab = await dependencies.getActiveTab();
    actor.send({ type: 'START_RECORDING', url: requestedUrl ?? activeTab?.url });
    const guideId = actor.getSnapshot().context.currentGuideId;
    if (!guideId) throw new Error('Capture state did not create a guide');

    await dependencies.createGuide(guideId);
    if (activeTab?.id) await dependencies.showNotificationOnTab(activeTab.id);
    await dependencies.broadcastStartCapture(guideId);
    return guideId;
  }

  async function stopReady(actor: RecordingActor): Promise<string | undefined> {
    const guideId = actor.getSnapshot().context.currentGuideId ?? undefined;
    await dependencies.broadcastStopCapture();
    actor.send({ type: 'STOP_RECORDING' });
    if (guideId) void dependencies.generateTitle(guideId);
    return guideId;
  }

  return {
    async start(requestedUrl?: string): Promise<string> {
      await dependencies.waitUntilReady();
      return startReady(dependencies.getActor(), requestedUrl);
    },

    async stop(): Promise<string | undefined> {
      await dependencies.waitUntilReady();
      return stopReady(dependencies.getActor());
    },

    async handleCommand(command: string): Promise<string | undefined> {
      if (command !== 'toggle-recording') return undefined;
      await dependencies.waitUntilReady();
      const actor = dependencies.getActor();
      return actor.getSnapshot().value === CaptureState.RECORDING ? stopReady(actor) : startReady(actor);
    },
  };
}
