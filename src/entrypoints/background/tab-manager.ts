import { executeScript, getTab, sendMessageToTab } from '@/lib/browser-api';
import { logger } from '@/lib/logger';
import { TabMessage } from '@/lib/tab-messages';

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
    await sendMessageToTab(tabId, { type: TabMessage.PING });
  } catch {
    try {
      await executeScript(tabId, ['/content-scripts/content.js']);
    } catch {}
  }
}

export async function showNotificationOnTab(tabId: number): Promise<void> {
  try {
    await sendMessageToTab(tabId, { type: TabMessage.SHOW_NOTIFICATION });
  } catch (err) {
    logger.warn('showNotificationOnTab failed', err);
  }
}

export async function startCaptureOnTab(tabId: number, guideId: string, captureToken: string): Promise<boolean> {
  try {
    const tab = await getTab(tabId);
    if (!isInjectableTab(tab)) return false;
    await injectContentScript(tabId);
    await sendMessageToTab(tabId, { type: TabMessage.START_CAPTURE, guideId, captureToken });
    return true;
  } catch (err) {
    logger.warn('startCaptureOnTab failed', err);
    return false;
  }
}

export async function stopCaptureOnTab(tabId: number): Promise<void> {
  await sendMessageToTab(tabId, { type: TabMessage.STOP_CAPTURE }).catch(() => {});
}
