import { logger } from '@/lib/logger';
import { sendMessage } from '@/lib/messaging';
import { type CaptureHandle, startCapture } from './events/handlers';
import { CaptureState } from './machine';

export class CaptureSession {
  private capture: CaptureHandle | null = null;
  private activeGuideId: string | null = null;
  private captureToken: string | null = null;
  private disabled = false;

  constructor() {
    this.syncWithBackground();
  }

  get isActive(): boolean {
    return this.activeGuideId !== null;
  }

  get isDisabled(): boolean {
    return this.disabled;
  }

  get guideId(): string | null {
    return this.activeGuideId;
  }

  start(guideId: string, captureToken: string): void {
    if (this.disabled) return;
    if (this.isActive) {
      this.stop();
    }

    logger.info('Capture started → guideId:', guideId);
    this.activeGuideId = guideId;
    this.captureToken = captureToken;
    const isTopFrame = window.self === window.top;
    this.capture = startCapture(guideId, captureToken, isTopFrame);
  }

  async stop(): Promise<void> {
    if (!this.isActive) return;

    logger.info('Capture stopped → guideId:', this.activeGuideId);
    const capture = this.capture;
    this.capture = null;
    this.activeGuideId = null;
    this.captureToken = null;
    await capture?.stop();
  }

  private syncWithBackground(): void {
    sendMessage('getState', undefined)
      .then((res) => {
        if (this.disabled) return;
        if (res.state === CaptureState.RECORDING && res.currentGuideId) {
          if (res.captureToken) this.start(res.currentGuideId, res.captureToken);
        }
      })
      .catch(() => {});
  }

  dispose(): void {
    this.stop();
    this.disabled = true;
    logger.debug('Capture session disposed');
  }
}
