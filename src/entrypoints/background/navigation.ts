import { CaptureState } from '@/core/capture/machine';
import {
  getTab,
  onHistoryStateUpdated,
  onNavigationCompleted,
  onTabActivated,
  onTabUpdated,
  sendMessageToTab,
} from '@/lib/browser-api';
import { logger } from '@/lib/logger';
import { TabMessage } from '@/lib/tab-messages';
import { getActor, waitUntilReady } from './actor';
import { injectContentScript, isInjectableTab, startCaptureOnTab, stopCaptureOnTab } from './tab-manager';

export function registerNavigationListeners() {
  onNavigationCompleted(async (details) => {
    if (details.frameId !== 0) return;
    await waitUntilReady();
    const state = getActor().getSnapshot();
    if (state.value === CaptureState.RECORDING && state.context.activeTabId === details.tabId) {
      logger.debug('URL changed (navigation) →', details.url);
      getActor().send({ type: 'URL_CHANGED', url: details.url });
      if (state.context.currentGuideId && state.context.captureToken) {
        await startCaptureOnTab(details.tabId, state.context.currentGuideId, state.context.captureToken);
      }
    }
  });

  onHistoryStateUpdated(async (details) => {
    if (details.frameId !== 0) return;
    await waitUntilReady();
    const state = getActor().getSnapshot();
    if (state.value === CaptureState.RECORDING && state.context.activeTabId === details.tabId) {
      logger.debug('URL changed (SPA pushState) →', details.url);
      getActor().send({ type: 'URL_CHANGED', url: details.url });
    }
  });

  onTabActivated(async (activeInfo) => {
    await waitUntilReady();
    const state = getActor().getSnapshot();
    if (state.value !== CaptureState.RECORDING) return;
    if (!state.context.currentGuideId) return;

    try {
      const tab = await getTab(activeInfo.tabId);
      const previousTabId = state.context.activeTabId;
      if (previousTabId && previousTabId !== activeInfo.tabId) await stopCaptureOnTab(previousTabId);
      if (!isInjectableTab(tab)) {
        getActor().send({ type: 'PAUSE_RECORDING' });
        return;
      }
      const captureToken = crypto.randomUUID();
      getActor().send({
        type: 'HANDOFF_TAB',
        tabId: activeInfo.tabId,
        url: tab.url,
        captureToken,
      });
      const attached = await startCaptureOnTab(activeInfo.tabId, state.context.currentGuideId, captureToken);
      if (!attached) {
        getActor().send({ type: 'PAUSE_RECORDING' });
        return;
      }
      logger.debug('Tab switched → capture handed off to tab', activeInfo.tabId);
    } catch (err) {
      logger.warn('Tab handoff failed', err);
      getActor().send({ type: 'PAUSE_RECORDING' });
    }
  });

  onTabUpdated(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;
    await waitUntilReady();
    const state = getActor().getSnapshot();
    if (state.value !== CaptureState.RECORDING) return;
    if (state.context.activeTabId !== tabId) return;
    if (!isInjectableTab(tab)) return;

    try {
      await sendMessageToTab(tabId, { type: TabMessage.PING });
      if (state.context.currentGuideId && state.context.captureToken) {
        await sendMessageToTab(tabId, {
          type: TabMessage.START_CAPTURE,
          guideId: state.context.currentGuideId,
          captureToken: state.context.captureToken,
        });
      }
    } catch {
      logger.debug('Tab loaded → injecting content script on tab', tabId);
      try {
        await injectContentScript(tabId);
        if (state.context.currentGuideId && state.context.captureToken) {
          await startCaptureOnTab(tabId, state.context.currentGuideId, state.context.captureToken);
        }
      } catch {}
    }
  });
}
