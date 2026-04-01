export interface Highlight {
  host: HTMLElement;
  overlay: HTMLDivElement;
}

export function createHighlight(): Highlight {
  const host = document.createElement('mimik-highlight');
  host.setAttribute('data-mimik-ignore', '');
  host.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647;pointer-events:none;';
  const shadow = host.attachShadow({ mode: 'closed' });
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; pointer-events: none;
    outline: 2.5px dashed #F59E0B; outline-offset: 3px;
    border-radius: 4px; box-sizing: border-box;
    opacity: 0; transition: opacity 0.15s ease;
  `;
  shadow.appendChild(overlay);
  document.documentElement.appendChild(host);
  return { host, overlay };
}

export class HighlightManager {
  private highlight: Highlight | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private rafId: number | null = null;
  hoveredElement: Element | null = null;

  show(target: Element) {
    if (!this.highlight) this.highlight = createHighlight();
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    const rect = target.getBoundingClientRect();
    this.highlight.overlay.style.top = `${rect.top}px`;
    this.highlight.overlay.style.left = `${rect.left}px`;
    this.highlight.overlay.style.width = `${rect.width}px`;
    this.highlight.overlay.style.height = `${rect.height}px`;
    this.highlight.overlay.style.opacity = '1';
  }

  hide() {
    if (this.highlight) this.highlight.overlay.style.opacity = '0';
  }

  hideInstant() {
    if (this.highlight) this.highlight.host.style.display = 'none';
  }

  showInstant() {
    if (this.highlight) this.highlight.host.style.display = '';
  }

  scheduleShow(target: Element) {
    if (target === this.hoveredElement) return;
    this.hoveredElement = target;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.show(target));
  }

  scheduleHide() {
    this.hoveredElement = null;
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.hide(), 80);
  }

  dispose() {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.highlight) {
      this.highlight.host.remove();
      this.highlight = null;
    }
    this.hoveredElement = null;
  }
}
