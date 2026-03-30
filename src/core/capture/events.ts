import { logger } from '@/lib/logger';
import { sendMessage } from '@/lib/messaging';
import { extractElementMeta } from './element-meta';

const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="radio"], [tabindex], [contenteditable="true"]';

const MERGE_WINDOW_MS = 800;
const MERGE_MAX_ABSORB = 4;
const DEDUP_MS = 300;
const DRAG_MIN_PX = 30;
const INTERCEPT_DELAY_MS = 100;
const MAX_ELEMENT_RATIO = 0.8;

let lastClickTarget: Element | null = null;
let lastClickTime = 0;

function findFocusableAncestor(el: Element): HTMLElement {
  const focusable = el.closest(FOCUSABLE_SELECTOR);
  if (focusable instanceof HTMLElement) return focusable;
  if (el instanceof HTMLElement) return el;
  if (el.parentElement instanceof HTMLElement) return el.parentElement;
  return document.body;
}

function isTextField(el: Element): boolean {
  if (el instanceof HTMLInputElement) {
    const textTypes = ['text', 'email', 'password', 'search', 'tel', 'url', 'number'];
    return textTypes.includes(el.type);
  }
  return el instanceof HTMLTextAreaElement
    || (el instanceof HTMLElement && el.isContentEditable);
}

function isNavigatingClick(el: HTMLElement): boolean {
  const anchor = el.closest('a[href]');
  if (!anchor) return false;
  const href = anchor.getAttribute('href');
  if (!href || href === '#' || href.startsWith('javascript:')) return false;
  return true;
}

function isTooLarge(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return (rect.width / window.innerWidth > MAX_ELEMENT_RATIO)
      && (rect.height / window.innerHeight > MAX_ELEMENT_RATIO);
}

interface HighlightHost {
  host: HTMLElement;
  overlay: HTMLDivElement;
}

function createHighlightOverlay(): HighlightHost {
  const host = document.createElement('mimik-highlight');
  host.setAttribute('data-mimik-ignore', '');
  host.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647;pointer-events:none;';
  const shadow = host.attachShadow({ mode: 'closed' });

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    outline: 2.5px dashed #F59E0B;
    outline-offset: 3px;
    border-radius: 4px;
    box-sizing: border-box;
    opacity: 0;
    transition: opacity 0.15s ease;
  `;
  shadow.appendChild(overlay);
  document.documentElement.appendChild(host);
  return { host, overlay };
}

interface MergeWindow {
  startTime: number;
  count: number;
  timer: ReturnType<typeof setTimeout> | null;
  firstTarget: Element | null;
}

function createMergeWindow(): MergeWindow {
  return { startTime: 0, count: 0, timer: null, firstTarget: null };
}

function shouldAbsorb(win: MergeWindow, target: Element): boolean {
  if (win.count === 0) return false;
  const elapsed = Date.now() - win.startTime;
  if (elapsed >= MERGE_WINDOW_MS) return false;
  if (win.count >= MERGE_MAX_ABSORB) return false;
  if (target === win.firstTarget) return false;
  return true;
}

function resetWindow(win: MergeWindow): void {
  if (win.timer) clearTimeout(win.timer);
  win.startTime = 0;
  win.count = 0;
  win.timer = null;
  win.firstTarget = null;
}

export interface CaptureHandle {
  stop: () => void;
  hideOverlay: () => void;
  showOverlay: () => void;
}

export function startCapture(guideId: string): CaptureHandle {
  let highlight: HighlightHost | null = null;
  let hoveredElement: Element | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let rafId: number | null = null;
  let dragStartX: number | null = null;
  let dragStartY: number | null = null;
  let dragStartElement: Element | null = null;
  let eventQueue: Promise<void> = Promise.resolve();
  const mergeWin = createMergeWindow();

  function enqueue(fn: () => void) {
    eventQueue = eventQueue.then(() => {
      try { fn(); } catch (err) { logger.warn('Event handler error', err); }
    });
  }

  function showHighlight(target: Element) {
    if (!highlight) highlight = createHighlightOverlay();
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    const rect = target.getBoundingClientRect();
    highlight.overlay.style.top = `${rect.top}px`;
    highlight.overlay.style.left = `${rect.left}px`;
    highlight.overlay.style.width = `${rect.width}px`;
    highlight.overlay.style.height = `${rect.height}px`;
    highlight.overlay.style.opacity = '1';
  }

  function hideHighlight() {
    if (highlight) highlight.overlay.style.opacity = '0';
  }

  function handleMouseOver(e: MouseEvent) {
    const rawTarget = e.target;
    if (!rawTarget || !(rawTarget instanceof Element)) return;
    if (rawTarget.closest('[data-mimik-ignore]')) return;
    const target = findFocusableAncestor(rawTarget);
    if (target === document.body || target === document.documentElement) return;
    if (isTooLarge(target)) return;
    if (target === hoveredElement) return;
    hoveredElement = target;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => showHighlight(target));
  }

  function handleMouseOut(e: MouseEvent) {
    const related = e.relatedTarget;
    if (related instanceof Element && hoveredElement?.contains(related)) return;
    hoveredElement = null;
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHighlight, 80);
  }

  function sendAction(action: string, meta: ReturnType<typeof extractElementMeta>) {
    sendMessage('userAction', { guideId, action, elementMeta: meta })
      .catch(err => logger.warn('Failed to send action', err));
  }

  function tryMergeOrSend(target: HTMLElement, action: string) {
    if (shouldAbsorb(mergeWin, target)) {
      mergeWin.count++;
      if (mergeWin.timer) clearTimeout(mergeWin.timer);
      mergeWin.timer = setTimeout(() => resetWindow(mergeWin), MERGE_WINDOW_MS);
      return;
    }

    resetWindow(mergeWin);
    mergeWin.startTime = Date.now();
    mergeWin.count = 1;
    mergeWin.firstTarget = target;
    mergeWin.timer = setTimeout(() => resetWindow(mergeWin), MERGE_WINDOW_MS);

    try {
      const meta = extractElementMeta(target);
      sendAction(action, meta);
    } catch (err) {
      logger.warn('Failed to capture action', err);
    }
  }

  function handleClick(e: MouseEvent) {
    const rawTarget = e.target;
    if (!rawTarget || !(rawTarget instanceof Element)) return;

    const target = findFocusableAncestor(rawTarget);
    if (target.closest('[data-mimik-ignore]')) return;

    const now = Date.now();
    if (target === lastClickTarget && now - lastClickTime < DEDUP_MS) return;
    lastClickTarget = target;
    lastClickTime = now;

    if (!isTextField(target) && !(target instanceof HTMLSelectElement) && !(target instanceof HTMLOptionElement)) {
      if (isNavigatingClick(target)) {
        e.preventDefault();
        e.stopImmediatePropagation();

        enqueue(() => tryMergeOrSend(target, 'click'));

        const anchor = target.closest('a[href]') as HTMLAnchorElement;
        if (anchor) {
          const href = anchor.href;
          requestAnimationFrame(() => {
            setTimeout(() => { window.location.href = href; }, INTERCEPT_DELAY_MS);
          });
        }
        return;
      }
    }

    enqueue(() => tryMergeOrSend(target, 'click'));
  }

  function handleAuxClick(e: MouseEvent) {
    const rawTarget = e.target;
    if (!rawTarget || !(rawTarget instanceof Element)) return;
    const target = findFocusableAncestor(rawTarget);
    if (target.closest('[data-mimik-ignore]')) return;

    enqueue(() => tryMergeOrSend(target, 'auxclick'));
  }

  function handleKeydown(e: KeyboardEvent) {
    const target = e.target instanceof HTMLElement ? e.target : document.activeElement;
    if (!target || !(target instanceof HTMLElement)) return;
    if (target.closest('[data-mimik-ignore]')) return;

    enqueue(() => {
      try {
        const meta = extractElementMeta(target);
        sendAction(`keydown:${e.key}`, meta);
      } catch (err) {
        logger.warn('Failed to capture keydown', err);
      }
    });
  }

  function handleInput(e: Event) {
    const target = e.target;
    if (!target || !(target instanceof HTMLElement)) return;
    if (!(target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target instanceof HTMLSelectElement
      || target.isContentEditable)) return;

    enqueue(() => {
      try {
        const meta = extractElementMeta(target);
        sendAction('input', meta);
      } catch (err) {
        logger.warn('Failed to capture input', err);
      }
    });
  }

  function handleClipboard(e: ClipboardEvent) {
    const target = e.target instanceof HTMLElement ? e.target : document.activeElement;
    if (!target || !(target instanceof HTMLElement)) return;
    if (target.closest('[data-mimik-ignore]')) return;

    enqueue(() => {
      try {
        const meta = extractElementMeta(target);
        sendAction(e.type, meta);
      } catch (err) {
        logger.warn('Failed to capture clipboard', err);
      }
    });
  }

  function handleMouseDown(e: MouseEvent) {
    dragStartX = e.pageX;
    dragStartY = e.pageY;
    dragStartElement = e.target instanceof Element ? e.target : null;
  }

  function handleMouseUp(e: MouseEvent) {
    if (dragStartX == null || dragStartY == null || !dragStartElement) {
      dragStartX = dragStartY = null;
      dragStartElement = null;
      return;
    }

    const dx = Math.abs(e.pageX - dragStartX);
    const dy = Math.abs(e.pageY - dragStartY);

    if (dx >= DRAG_MIN_PX || dy >= DRAG_MIN_PX) {
      const target = findFocusableAncestor(dragStartElement);
      if (!target.closest('[data-mimik-ignore]')) {
        enqueue(() => {
          try {
            const meta = extractElementMeta(target);
            sendAction('drag', meta);
          } catch (err) {
            logger.warn('Failed to capture drag', err);
          }
        });
      }
    }

    dragStartX = dragStartY = null;
    dragStartElement = null;
  }

  window.addEventListener('click', handleClick, { capture: true });
  window.addEventListener('auxclick', handleAuxClick, { capture: true });
  window.addEventListener('keydown', handleKeydown, { capture: true });
  window.addEventListener('input', handleInput, { capture: true });
  window.addEventListener('copy', handleClipboard as EventListener, { capture: true });
  window.addEventListener('paste', handleClipboard as EventListener, { capture: true });
  window.addEventListener('cut', handleClipboard as EventListener, { capture: true });
  window.addEventListener('mousedown', handleMouseDown, { capture: true });
  window.addEventListener('mouseup', handleMouseUp, { capture: true });
  window.addEventListener('mouseover', handleMouseOver, { capture: true });
  window.addEventListener('mouseout', handleMouseOut, { capture: true });

  return {
    stop() {
      window.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('auxclick', handleAuxClick, { capture: true });
      window.removeEventListener('keydown', handleKeydown, { capture: true });
      window.removeEventListener('input', handleInput, { capture: true });
      window.removeEventListener('copy', handleClipboard as EventListener, { capture: true });
      window.removeEventListener('paste', handleClipboard as EventListener, { capture: true });
      window.removeEventListener('cut', handleClipboard as EventListener, { capture: true });
      window.removeEventListener('mousedown', handleMouseDown, { capture: true });
      window.removeEventListener('mouseup', handleMouseUp, { capture: true });
      window.removeEventListener('mouseover', handleMouseOver, { capture: true });
      window.removeEventListener('mouseout', handleMouseOut, { capture: true });
      if (hideTimer) clearTimeout(hideTimer);
      if (rafId) cancelAnimationFrame(rafId);
      resetWindow(mergeWin);
      if (highlight) {
        highlight.host.remove();
        highlight = null;
      }
      hoveredElement = null;
    },
    hideOverlay() {
      logger.debug('hideOverlay called, highlight exists:', !!highlight);
      if (highlight) {
        highlight.host.style.display = 'none';
        logger.debug('Overlay hidden, display:', highlight.host.style.display);
      }
    },
    showOverlay() {
      logger.debug('showOverlay called');
      if (highlight) highlight.host.style.display = '';
    },
  };
}
