import { describe, expect, it } from 'vitest';
import type { ElementMeta, Screenshot, Step } from '@/core/guides/types';
import { getGuideMeHighlightStyle } from '../guide-me-highlight';

function makeElementMeta(): ElementMeta {
  return {
    tag: 'button',
    cssSelector: 'button.submit',
    textContent: 'Submit',
    ariaLabel: null,
    placeholder: null,
    altText: null,
    name: null,
    role: 'button',
    href: null,
    inputType: null,
    dataTestId: null,
    rect: { x: 400, y: 200, width: 80, height: 40 },
    devicePixelRatio: 2,
  };
}

function makeScreenshot(): Screenshot {
  return {
    id: 'screenshot-1',
    stepId: 'step-1',
    blob: new Blob(),
    mimeType: 'image/jpeg',
    width: 1600,
    height: 1000,
    bounds: { x: 400, y: 200, width: 80, height: 40 },
    pixelRatio: 2,
  };
}

describe('getGuideMeHighlightStyle', () => {
  it('positions the target against the full screenshot, not screenshot bounds', () => {
    const step = { elementMeta: makeElementMeta() } as Step;

    expect(getGuideMeHighlightStyle(step, makeScreenshot())).toEqual({
      left: '50%',
      top: '40%',
      width: '10%',
      height: '8%',
    });
  });

  it('falls back to the captured element pixel ratio', () => {
    const step = { elementMeta: makeElementMeta() } as Step;
    const screenshot = { ...makeScreenshot(), pixelRatio: undefined };

    expect(getGuideMeHighlightStyle(step, screenshot)?.left).toBe('50%');
  });

  it('returns no style when the step or screenshot is incomplete', () => {
    expect(getGuideMeHighlightStyle(null, makeScreenshot())).toBeNull();
    expect(getGuideMeHighlightStyle({ elementMeta: makeElementMeta() }, undefined)).toBeNull();
    expect(getGuideMeHighlightStyle({ elementMeta: makeElementMeta() }, { width: 0, height: 100 })).toBeNull();
  });
});
