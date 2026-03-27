import { browser } from '#imports';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { sendMessage } from '@/lib/messaging';
import { startCapture } from '@/capture/events';
import { startRrwebRecording } from '@/capture/rrweb-recorder';
import { updateUrl } from '@/capture/spa-nav';

const CLEANUP_EVENT = `mimik_remove_content_script_${browser.runtime.id}`;

export default defineContentScript({
  matches: ['<all_urls>'],
  allFrames: true,
  matchAboutBlank: true,
  runAt: 'document_idle',

  main() {
    document.dispatchEvent(new CustomEvent(CLEANUP_EVENT));

    let stopCapture: (() => void) | null = null;
    let stopRrweb: (() => void) | null = null;
    let destroyed = false;

    function beginCapture(guideId: string) {
      if (destroyed) return;
      stopCapture?.();
      stopRrweb?.();
      stopCapture = startCapture(guideId);
      stopRrweb = startRrwebRecording(guideId);
    }

    function endCapture() {
      stopCapture?.();
      stopRrweb?.();
      stopCapture = null;
      stopRrweb = null;
    }

    function cleanup() {
      destroyed = true;
      endCapture();
      browser.runtime.onMessage.removeListener(messageHandler);
      document.removeEventListener(CLEANUP_EVENT, cleanup);
    }

    document.addEventListener(CLEANUP_EVENT, cleanup);
    window.addEventListener('beforeunload', () => endCapture());

    function messageHandler(
      msg: Record<string, unknown>,
      _sender: unknown,
      sendResponse: (r: unknown) => void,
    ) {
      if (destroyed) return false;

      if (msg.type === 'PING') {
        sendResponse({ alive: true });
        return true;
      }

      if (msg.type === 'GET_ROUTE') {
        sendResponse({ alive: true, capturing: !!stopCapture });
        return true;
      }

      if (msg.type === 'START_CAPTURE' && msg.guideId) {
        beginCapture(msg.guideId as string);
        sendResponse({ started: true });
        return true;
      }

      if (msg.type === 'STOP_CAPTURE') {
        endCapture();
        sendResponse({ stopped: true });
        return true;
      }

      if (msg.type === 'SPA_NAVIGATE' && msg.url) {
        updateUrl(msg.url as string);
        sendResponse({ updated: true });
        return true;
      }

      return false;
    }

    browser.runtime.onMessage.addListener(messageHandler);

    sendMessage('getState', undefined)
      .then(res => {
        if (destroyed) return;
        if (res.state === 'recording' && res.currentGuideId) {
          beginCapture(res.currentGuideId);
        }
      })
      .catch(() => {});

    console.log('[Mimik] Content script loaded');
  },
});
