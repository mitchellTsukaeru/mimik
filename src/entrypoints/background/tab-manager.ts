import { sendMessageToTab, executeScript, getAllWindows, queryTabs } from '@/lib/browser-api';

export function isInjectableTab(tab: { url?: string; pendingUrl?: string }): boolean {
  const url = tab.url || tab.pendingUrl || '';
  if (
    !url ||
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('chrome.google.com/webstore') ||
    url.startsWith('about:')
  )
    return false;
  return /^https?:/.test(url);
}

export async function injectContentScript(tabId: number): Promise<void> {
  try {
    await sendMessageToTab(tabId, { type: 'PING' });
  } catch {
    try {
      await executeScript(tabId, ['/content-scripts/content.js']);
    } catch {
    }
  }
}

export async function injectAllTabs(): Promise<void> {
  try {
    const windows = await getAllWindows();
    for (const win of windows) {
      for (const tab of win.tabs || []) {
        if (tab.id && isInjectableTab(tab)) {
          injectContentScript(tab.id);
        }
      }
    }
  } catch (err) {
    console.warn('[Mimik] injectAllTabs failed', err);
  }
}

export async function broadcastStartCapture(guideId: string): Promise<void> {
  try {
    const tabs = await queryTabs({});
    for (const tab of tabs) {
      if (tab.id && isInjectableTab(tab)) {
        sendMessageToTab(tab.id, { type: 'START_CAPTURE', guideId }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[Mimik] broadcastStartCapture failed', err);
  }
}

export async function broadcastStopCapture(): Promise<void> {
  try {
    const tabs = await queryTabs({});
    for (const tab of tabs) {
      if (tab.id) {
        sendMessageToTab(tab.id, { type: 'STOP_CAPTURE' }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[Mimik] broadcastStopCapture failed', err);
  }
}
