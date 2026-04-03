import { browser } from '#imports';
import type { Step } from '@/core/guides/types';
import { logger } from '@/lib/logger';
import { sendMessage } from '@/lib/messaging';
import { findElement } from './finder';
import { GuideMeOverlay } from './overlay';
import type { GuideMeSession } from './session';
import { SESSION_KEY, STEP_KEY } from './session';

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 1000;

export class GuideMeController {
  private overlay: GuideMeOverlay | null = null;
  private storageListener: ((changes: Record<string, { newValue?: unknown }>) => void) | null = null;
  private active = false;

  start() {
    if (window.self !== window.top) return;
    this.storageListener = (changes) => {
      if (changes[SESSION_KEY] || changes[STEP_KEY]) {
        this.onStorageChange();
      }
    };
    browser.storage.local.onChanged.addListener(this.storageListener);
    this.checkForActiveSession();
  }

  dispose() {
    if (this.storageListener) {
      browser.storage.local.onChanged.removeListener(this.storageListener);
      this.storageListener = null;
    }
    this.destroyOverlay();
    this.active = false;
  }

  private async checkForActiveSession() {
    const data = await browser.storage.local.get([SESSION_KEY, STEP_KEY]);
    const session = data[SESSION_KEY] as GuideMeSession | null;
    const step = data[STEP_KEY] as Step | null;

    if (session?.active && step) {
      this.showStep(step, session.stepIndex, session.totalSteps);
    }
  }

  private async onStorageChange() {
    const data = await browser.storage.local.get([SESSION_KEY, STEP_KEY]);
    const session = data[SESSION_KEY] as GuideMeSession | null;
    const step = data[STEP_KEY] as Step | null;

    if (!session?.active || !step) {
      this.destroyOverlay();
      this.active = false;
      return;
    }

    this.showStep(step, session.stepIndex, session.totalSteps);
  }

  private async showStep(step: Step, stepIndex: number, totalSteps: number) {
    this.destroyOverlay();

    if (!step.elementMeta) {
      this.mountOverlay(step, stepIndex, totalSteps, null);
      return;
    }

    let element: HTMLElement | null = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const result = findElement(step.elementMeta);
      if (result.element) {
        element = result.element;
        break;
      }
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
      }
    }

    this.mountOverlay(step, stepIndex, totalSteps, element);
  }

  private mountOverlay(step: Step, stepIndex: number, totalSteps: number, element: HTMLElement | null) {
    this.active = true;
    this.overlay = new GuideMeOverlay({
      onAdvance: (idx) => {
        sendMessage('guideMeStepCompleted', { stepIndex: idx }).catch((err) =>
          logger.warn('Failed to advance guide me step', err),
        );
      },
      onPrev: (idx) => {
        sendMessage('guideMePrev', { stepIndex: idx }).catch((err) =>
          logger.warn('Failed to go to previous step', err),
        );
      },
      onCancel: () => {
        sendMessage('guideMeCancel', undefined).catch((err) => logger.warn('Failed to cancel guide me', err));
      },
    });
    this.overlay.show(step, stepIndex, totalSteps, element);
  }

  private destroyOverlay() {
    this.overlay?.destroy();
    this.overlay = null;
  }
}
