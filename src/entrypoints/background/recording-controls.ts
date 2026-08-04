import { type CaptureEvent, CaptureState } from '@/core/capture/machine';

interface RecordingActor {
  send(event: CaptureEvent): void;
  getSnapshot(): {
    value: unknown;
    context: { currentGuideId: string | null; activeTabId: number | null; captureToken: string | null };
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
  startCaptureOnTab(tabId: number, guideId: string, captureToken: string): Promise<boolean>;
  stopCaptureOnTab(tabId: number): Promise<unknown>;
  generateTitle(guideId: string): void | Promise<void>;
}

function token(): string {
  return crypto.randomUUID();
}

export function createRecordingControls(dependencies: RecordingControlsDependencies) {
  async function startReady(actor: RecordingActor, requestedUrl?: string): Promise<string> {
    const activeTab = await dependencies.getActiveTab();
    const captureToken = token();
    actor.send({
      type: 'START_RECORDING',
      url: requestedUrl ?? activeTab?.url,
      tabId: activeTab?.id,
      captureToken,
    });
    const guideId = actor.getSnapshot().context.currentGuideId;
    if (!guideId) throw new Error('Capture state did not create a guide');

    await dependencies.createGuide(guideId);
    if (activeTab?.id) {
      await dependencies.showNotificationOnTab(activeTab.id);
      const attached = await dependencies.startCaptureOnTab(activeTab.id, guideId, captureToken);
      if (!attached) actor.send({ type: 'PAUSE_RECORDING' });
    } else {
      actor.send({ type: 'PAUSE_RECORDING' });
    }
    return guideId;
  }

  async function stopReady(actor: RecordingActor): Promise<string | undefined> {
    const snapshot = actor.getSnapshot();
    const guideId = snapshot.context.currentGuideId ?? undefined;
    if (snapshot.context.activeTabId) await dependencies.stopCaptureOnTab(snapshot.context.activeTabId);
    actor.send({ type: 'STOP_RECORDING' });
    if (guideId) void dependencies.generateTitle(guideId);
    return guideId;
  }

  return {
    async start(requestedUrl?: string): Promise<string> {
      await dependencies.waitUntilReady();
      return startReady(dependencies.getActor(), requestedUrl);
    },

    async pause(): Promise<boolean> {
      await dependencies.waitUntilReady();
      const actor = dependencies.getActor();
      const snapshot = actor.getSnapshot();
      if (snapshot.value !== CaptureState.RECORDING) return false;
      actor.send({ type: 'PAUSE_RECORDING' });
      if (snapshot.context.activeTabId) await dependencies.stopCaptureOnTab(snapshot.context.activeTabId);
      return true;
    },

    async resume(): Promise<{ resumed: boolean; error?: string }> {
      await dependencies.waitUntilReady();
      const actor = dependencies.getActor();
      if (actor.getSnapshot().value !== CaptureState.PAUSED) return { resumed: false };
      const activeTab = await dependencies.getActiveTab();
      if (!activeTab?.id || !activeTab.url?.startsWith('http')) {
        return { resumed: false, error: 'This page cannot be recorded' };
      }
      const guideId = actor.getSnapshot().context.currentGuideId;
      if (!guideId) return { resumed: false, error: 'Guide not found' };
      const captureToken = token();
      actor.send({
        type: 'RESUME_RECORDING',
        url: activeTab.url,
        tabId: activeTab.id,
        captureToken,
      });
      const attached = await dependencies.startCaptureOnTab(activeTab.id, guideId, captureToken);
      if (!attached) {
        actor.send({ type: 'PAUSE_RECORDING' });
        return { resumed: false, error: 'This page cannot be recorded' };
      }
      return { resumed: true };
    },

    async stop(): Promise<string | undefined> {
      await dependencies.waitUntilReady();
      return stopReady(dependencies.getActor());
    },

    async handleCommand(command: string): Promise<string | undefined> {
      if (command !== 'toggle-recording') return undefined;
      await dependencies.waitUntilReady();
      const actor = dependencies.getActor();
      return actor.getSnapshot().value === CaptureState.IDLE ? startReady(actor) : stopReady(actor);
    },
  };
}
