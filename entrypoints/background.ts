import { defineBackground } from 'wxt/utils/define-background';
import { createActor } from 'xstate';
import { captureMachine } from '../src/background/machine';

export default defineBackground(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  let actor: ReturnType<typeof createActor<typeof captureMachine>>;

  async function startActor() {
    const result = await chrome.storage.session.get('machineSnapshot');
    const snapshot = result.machineSnapshot ?? undefined;
    actor = createActor(captureMachine, { snapshot });
    actor.start();

    actor.subscribe(() => {
      const persisted = actor.getPersistedSnapshot();
      chrome.storage.session.set({ machineSnapshot: persisted });
    });
  }

  startActor();

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'PING') {
      sendResponse({ alive: true });
    }
    if (msg.type === 'GET_STATE') {
      sendResponse({ state: actor?.getSnapshot().value ?? 'unknown' });
    }
    return true;
  });
});
