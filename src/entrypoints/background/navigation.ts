import { onNavigationCompleted, onHistoryStateUpdated, onTabActivated, onTabUpdated, sendMessageToTab, getTab } from '@/lib/browser-api';
import { isInjectableTab, injectContentScript } from './tab-manager';
import { getActor, ready } from './actor';

export function registerNavigationListeners() {
  onNavigationCompleted(async (details) => {
    if (details.frameId !== 0) return;
    await ready;
    const state = getActor().getSnapshot();
    if (state.value === 'recording') {
      getActor().send({ type: 'SPA_NAVIGATE', url: details.url });
    }
  });

  onHistoryStateUpdated(async (details) => {
    if (details.frameId !== 0) return;
    await ready;
    const state = getActor().getSnapshot();
    if (state.value === 'recording') {
      getActor().send({ type: 'SPA_NAVIGATE', url: details.url });
    }
  });

  onTabActivated(async (activeInfo) => {
    await ready;
    const state = getActor().getSnapshot();
    if (state.value !== 'recording') return;
    if (!state.context.currentGuideId) return;

    try {
      await sendMessageToTab(activeInfo.tabId, { type: 'PING' });
    } catch {
      try {
        const tab = await getTab(activeInfo.tabId);
        if (isInjectableTab(tab)) {
          await injectContentScript(activeInfo.tabId);
        }
      } catch {
      }
    }
  });

  onTabUpdated(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;
    await ready;
    const state = getActor().getSnapshot();
    if (state.value !== 'recording') return;
    if (!isInjectableTab(tab)) return;

    try {
      await sendMessageToTab(tabId, { type: 'PING' });
    } catch {
      try {
        await injectContentScript(tabId);
      } catch {
      }
    }
  });
}
