import { describe, expect, it } from 'vitest';
import type { Screenshot, Step } from '@/core/guides/types';
import { selectRepresentativeSteps, selectTextSteps } from '../improve';

function step(index: number, host = 'one.example', screenshot = true): Step {
  return {
    id: `step-${index}`,
    guideId: 'guide-1',
    index,
    description: `Step ${index}`,
    action: 'click',
    url: `https://${host}/page/${index}`,
    timestamp: index,
    screenshotId: screenshot ? `shot-${index}` : undefined,
  };
}

function screenshot(item: Step): Screenshot {
  return {
    id: item.screenshotId!,
    stepId: item.id,
    blob: new Blob(['image'], { type: 'image/jpeg' }),
    mimeType: 'image/jpeg',
    width: 100,
    height: 100,
  };
}

describe('Improve guide context selection', () => {
  it('keeps complete sequences up to 100 steps', () => {
    const steps = Array.from({ length: 100 }, (_, index) => step(index));
    expect(selectTextSteps(steps)).toEqual(steps);
  });

  it('keeps the first 40, last 40, sampled middle, and hostname transitions for long guides', () => {
    const steps = Array.from({ length: 140 }, (_, index) => step(index, index >= 71 ? 'two.example' : 'one.example'));
    const selected = selectTextSteps(steps);

    expect(selected.slice(0, 40).map((item) => item.index)).toEqual(Array.from({ length: 40 }, (_, index) => index));
    expect(selected.map((item) => item.index)).toContain(71);
    expect(selected.slice(-40).map((item) => item.index)).toEqual(
      Array.from({ length: 40 }, (_, index) => index + 100),
    );
  });

  it('selects at most eight frames including first, last, and hostname transitions', () => {
    const steps = Array.from({ length: 20 }, (_, index) => step(index, index >= 9 ? 'two.example' : 'one.example'));
    const screenshots = new Map(steps.map((item) => [item.id, screenshot(item)]));
    const selected = selectRepresentativeSteps(steps, screenshots);

    expect(selected).toHaveLength(8);
    expect(selected.map((item) => item.index)).toEqual(expect.arrayContaining([0, 9, 19]));
  });
});
