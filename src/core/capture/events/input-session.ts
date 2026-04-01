import { logger } from '@/lib/logger';
import { sendMessage } from '@/lib/messaging';
import { extractDOMContext } from '../dom/context';
import { extractElementMeta } from '../dom/element-meta';
import { getFieldLabel, getFieldValue } from '../dom/element-utils';
import type { HighlightManager } from './highlight';

export class InputSession {
  stepId: string | null = null;
  target: HTMLElement | null = null;

  private guideId: string;
  private hl: HighlightManager;

  constructor(guideId: string, hl: HighlightManager) {
    this.guideId = guideId;
    this.hl = hl;
  }

  get active() {
    return this.stepId !== null;
  }

  async start(target: HTMLElement) {
    await this.hl.hideInstant();
    try {
      const res = await sendMessage('captureStep', {
        guideId: this.guideId,
        action: 'input',
        elementMeta: extractElementMeta(target),
        domContext: extractDOMContext(target, 'input'),
      });
      if ('stepId' in res) {
        this.stepId = res.stepId;
        this.target = target;
      }
    } finally {
      this.hl.showInstant();
    }
  }

  update(target: HTMLElement) {
    if (!this.stepId) return;
    const val = getFieldValue(target);
    const desc = val ? `Type "${val}" in ${getFieldLabel(target)}` : `Clear ${getFieldLabel(target)}`;
    sendMessage('updateInputStep', { stepId: this.stepId, description: desc }).catch((err) =>
      logger.warn('Failed to update input step', err),
    );
  }

  async finalize() {
    if (!this.target || !this.stepId) return;
    const target = this.target;
    const stepId = this.stepId;
    this.stepId = null;
    this.target = null;
    await this.hl.hideInstant();
    try {
      await sendMessage('finalizeInputStep', {
        stepId,
        elementMeta: extractElementMeta(target),
        domContext: extractDOMContext(target, 'input'),
      });
    } finally {
      this.hl.showInstant();
    }
  }
}
