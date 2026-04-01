export const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="radio"], [tabindex], [contenteditable="true"]';

const MAX_ELEMENT_RATIO = 0.8;

export function findFocusableAncestor(el: Element): HTMLElement {
  const focusable = el.closest(FOCUSABLE_SELECTOR);
  if (focusable instanceof HTMLElement) return focusable;
  if (el instanceof HTMLElement) return el;
  if (el.parentElement instanceof HTMLElement) return el.parentElement;
  return document.body;
}

export function isTextField(el: Element): boolean {
  if (el instanceof HTMLInputElement) {
    return ['text', 'email', 'password', 'search', 'tel', 'url', 'number'].includes(el.type);
  }
  return el instanceof HTMLTextAreaElement || (el instanceof HTMLElement && el.isContentEditable);
}

export function isNavigatingClick(el: HTMLElement): boolean {
  const anchor = el.closest('a[href]');
  if (!anchor) return false;
  const href = anchor.getAttribute('href');
  return !(!href || href === '#' || href.startsWith('javascript:'));
}

export function isTooLarge(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return (rect.width / window.innerWidth > MAX_ELEMENT_RATIO)
      && (rect.height / window.innerHeight > MAX_ELEMENT_RATIO);
}

export function isMimikElement(el: Element): boolean {
  return !!el.closest('[data-mimik-ignore]');
}

export function getFieldValue(el: HTMLElement): string {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.value;
  if (el.isContentEditable) return el.textContent?.trim() ?? '';
  return '';
}

export function getFieldLabel(el: HTMLElement): string {
  return el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('name') || 'text field';
}
