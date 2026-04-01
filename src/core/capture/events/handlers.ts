import PQueue from 'p-queue';
import { sendMessage } from '@/lib/messaging';
import { extractDOMContext } from '../dom/context';
import { extractElementMeta } from '../dom/element-meta';
import {
  findFocusableAncestor,
  isMimikElement,
  isNavigatingClick,
  isTextField,
  isTooLarge,
} from '../dom/element-utils';
import { HighlightManager } from './highlight';
import { InputSession } from './input-session';

const DEDUP_MS = 300;
const DRAG_MIN_PX = 30;
const INTERCEPT_DELAY_MS = 100;

let lastClickTarget: Element | null = null;
let lastClickTime = 0;

export interface CaptureHandle {
  stop: () => void;
  hideOverlay: () => void;
  showOverlay: () => void;
}

class CaptureController {
  private hl = new HighlightManager();
  private input: InputSession;
  private queue = new PQueue({ concurrency: 1 });
  private listeners: [string, EventListener][] = [];
  private dragStartX: number | null = null;
  private dragStartY: number | null = null;
  private dragStartElement: Element | null = null;

  constructor(private guideId: string) {
    this.input = new InputSession(guideId, this.hl);
    this.listeners = [
      ['click', this.onClick.bind(this)],
      ['auxclick', this.onAuxClick.bind(this)],
      ['keydown', this.onKeydown.bind(this)],
      ['input', this.onInput.bind(this)],
      ['copy', this.onClipboard.bind(this)],
      ['paste', this.onClipboard.bind(this)],
      ['cut', this.onClipboard.bind(this)],
      ['pointerdown', this.onPointerDown.bind(this)],
      ['pointerup', this.onPointerUp.bind(this)],
      ['dragend', this.onDragEnd.bind(this)],
      ['mouseover', this.onMouseOver.bind(this)],
      ['mouseout', this.onMouseOut.bind(this)],
      ['focusin', this.onFocusIn.bind(this)],
      ['focusout', this.onFocusOut.bind(this)],
    ];
    for (const [event, handler] of this.listeners) {
      window.addEventListener(event, handler, { capture: true });
    }
  }

  private async captureAction(action: string, target: HTMLElement) {
    await this.hl.hideInstant();
    try {
      await sendMessage('captureStep', {
        guideId: this.guideId,
        action,
        elementMeta: extractElementMeta(target),
        domContext: extractDOMContext(target, action),
      });
    } finally {
      this.hl.showInstant();
    }
  }

  private resolveTarget(raw: EventTarget | null): HTMLElement | null {
    if (!raw || !(raw instanceof Element) || isMimikElement(raw)) return null;
    const target = findFocusableAncestor(raw);
    if (target === document.body || target === document.documentElement || isTooLarge(target)) return null;
    return target;
  }

  private onMouseOver(e: Event) {
    const target = this.resolveTarget((e as MouseEvent).target);
    if (target) this.hl.scheduleShow(target);
  }

  private onMouseOut(e: Event) {
    const related = (e as MouseEvent).relatedTarget;
    if (related instanceof Element && this.hl.hoveredElement?.contains(related)) return;
    this.hl.scheduleHide();
  }

  private onFocusIn(e: Event) {
    const target = this.resolveTarget((e as FocusEvent).target);
    if (target) this.hl.scheduleShow(target);
  }

  private onClick(e: Event) {
    const me = e as MouseEvent;
    const raw = me.target;
    if (!raw || !(raw instanceof Element)) return;
    const target = findFocusableAncestor(raw);
    if (isMimikElement(target)) return;

    const now = Date.now();
    if (target === lastClickTarget && now - lastClickTime < DEDUP_MS) return;
    lastClickTarget = target;
    lastClickTime = now;

    if (isTextField(target)) {
      this.queue.add(async () => {
        if (this.input.active && this.input.target !== target) await this.input.finalize();
        if (!this.input.active) await this.input.start(target);
      });
      return;
    }

    if (isNavigatingClick(target)) {
      me.preventDefault();
      me.stopImmediatePropagation();
      this.queue.add(() => this.captureAction('click', target));
      const anchor = target.closest('a[href]') as HTMLAnchorElement;
      if (anchor) {
        const href = anchor.href;
        requestAnimationFrame(() =>
          setTimeout(() => {
            window.location.href = href;
          }, INTERCEPT_DELAY_MS),
        );
      }
      return;
    }

    this.queue.add(() => this.captureAction('click', target));
  }

  private onAuxClick(e: Event) {
    const raw = (e as MouseEvent).target;
    if (!raw || !(raw instanceof Element)) return;
    const target = findFocusableAncestor(raw);
    if (isMimikElement(target)) return;
    this.queue.add(() => this.captureAction('auxclick', target));
  }

  private onKeydown(e: Event) {
    const ke = e as KeyboardEvent;
    const target = ke.target instanceof HTMLElement ? ke.target : document.activeElement;
    if (!target || !(target instanceof HTMLElement) || isMimikElement(target)) return;

    if (this.input.active && (ke.key === 'Enter' || ke.key === 'Escape')) {
      this.queue.add(() => this.input.finalize());
      return;
    }

    if (isTextField(target)) return;
    this.queue.add(() => this.captureAction(`keydown:${ke.key}`, target));
  }

  private onInput(e: Event) {
    const target = e.target;
    if (!target || !(target instanceof HTMLElement)) return;
    if (
      !(
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable
      )
    )
      return;

    if (target instanceof HTMLSelectElement) {
      this.queue.add(() => this.captureAction('input', target));
      return;
    }

    if (this.input.active && this.input.target !== target) {
      this.queue.add(() => this.input.finalize());
    }

    if (!this.input.active) {
      this.queue.add(() => this.input.start(target));
    } else {
      this.input.update(target);
    }
  }

  private onFocusOut(e: Event) {
    if (!this.input.active) return;
    const related = (e as FocusEvent).relatedTarget;
    if (related instanceof Element && related === this.input.target) return;
    this.queue.add(() => this.input.finalize());
  }

  private onClipboard(e: Event) {
    const target =
      (e as ClipboardEvent).target instanceof HTMLElement
        ? ((e as ClipboardEvent).target as HTMLElement)
        : document.activeElement;
    if (!target || !(target instanceof HTMLElement) || isMimikElement(target)) return;
    this.queue.add(() => this.captureAction(e.type, target));
  }

  private onPointerDown(e: Event) {
    const pe = e as PointerEvent;
    this.dragStartX = pe.pageX;
    this.dragStartY = pe.pageY;
    this.dragStartElement = pe.target instanceof Element ? pe.target : null;
  }

  private onPointerUp(e: Event) {
    const pe = e as PointerEvent;
    if (this.dragStartX == null || this.dragStartY == null || !this.dragStartElement) {
      this.dragStartX = this.dragStartY = null;
      this.dragStartElement = null;
      return;
    }

    const dx = Math.abs(pe.pageX - this.dragStartX);
    const dy = Math.abs(pe.pageY - this.dragStartY);

    if (dx >= DRAG_MIN_PX || dy >= DRAG_MIN_PX) {
      const target = findFocusableAncestor(this.dragStartElement);
      if (!isMimikElement(target)) this.queue.add(() => this.captureAction('drag', target));
    }

    this.dragStartX = this.dragStartY = null;
    this.dragStartElement = null;
  }

  private onDragEnd(e: Event) {
    if (!e.target || !(e.target instanceof Element) || isMimikElement(e.target)) return;
    this.queue.add(() => this.captureAction('drag', findFocusableAncestor(e.target as Element)));
  }

  stop() {
    for (const [event, handler] of this.listeners) {
      window.removeEventListener(event, handler, { capture: true });
    }
    this.queue.add(() => this.input.finalize());
    this.hl.dispose();
  }

  hideOverlay() {
    this.hl.hideInstant();
  }
  showOverlay() {
    this.hl.showInstant();
  }
}

export function startCapture(guideId: string): CaptureHandle {
  const controller = new CaptureController(guideId);
  return {
    stop: () => controller.stop(),
    hideOverlay: () => controller.hideOverlay(),
    showOverlay: () => controller.showOverlay(),
  };
}
