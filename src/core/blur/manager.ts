import { browser } from '#imports';
import { ElementPicker } from './element-picker';
import { BlurPanel } from './panel';
import type { PresetKey } from './regexes';
import { BlurScanner } from './scanner';
import { injectBlurStyles, removeBlurStyles } from './styles';

export class BlurManager {
  private scanner = new BlurScanner();
  private picker = new ElementPicker();
  private panel: BlurPanel | null = null;
  private active = false;

  async start() {
    if (this.active) return;
    this.active = true;
    injectBlurStyles();

    let stored: Record<string, unknown> = {};
    try {
      stored = await browser.storage.local.get(['blurPresets']);
    } catch {}
    const presets = (stored.blurPresets as Record<PresetKey, boolean>) || {
      email: true,
      phone: true,
      ssn: false,
      creditCard: false,
      ipAddress: false,
      macAddress: false,
    };

    const activePresets = (Object.entries(presets) as [PresetKey, boolean][]).filter(([, v]) => v).map(([k]) => k);

    this.scanner.start(activePresets);
    this.panel = new BlurPanel(presets);
    this.panel.mount();

    document.addEventListener('mimik-blur:update-presets', this.onUpdatePresets);
    document.addEventListener('mimik-blur:start-picker', this.onStartPicker);
    document.addEventListener('mimik-blur:reset', this.onReset);
    document.addEventListener('mimik-blur:done', this.onDone);
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    this.scanner.stop();
    this.picker.stop();
    this.panel?.unmount();
    this.panel = null;
    removeBlurStyles();
    document.removeEventListener('mimik-blur:update-presets', this.onUpdatePresets);
    document.removeEventListener('mimik-blur:start-picker', this.onStartPicker);
    document.removeEventListener('mimik-blur:reset', this.onReset);
    document.removeEventListener('mimik-blur:done', this.onDone);
  }

  private onUpdatePresets = ((e: CustomEvent<{ presets: PresetKey[] }>) => {
    this.scanner.updatePresets(e.detail.presets);
  }) as EventListener;

  private onStartPicker = (() => {
    this.picker.start(() => this.picker.stop());
  }) as EventListener;

  private onReset = (() => {
    this.scanner.unblurAll();
  }) as EventListener;

  private onDone = (() => {
    this.panel?.unmount();
    this.panel = null;
    this.scanner.detach();
    this.picker.stop();
    document.removeEventListener('mimik-blur:update-presets', this.onUpdatePresets);
    document.removeEventListener('mimik-blur:start-picker', this.onStartPicker);
    document.removeEventListener('mimik-blur:reset', this.onReset);
    document.removeEventListener('mimik-blur:done', this.onDone);
    this.active = false;
  }) as EventListener;
}
