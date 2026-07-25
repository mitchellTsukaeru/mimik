import { describe, expect, it } from 'vitest';
import { DEFAULT_SCREENSHOT_TIMING, getScreenshotDelayMs, SCREENSHOT_TIMINGS } from '../screenshot-timing';

describe('screenshot timing', () => {
  it('uses Normal as the default', () => {
    expect(DEFAULT_SCREENSHOT_TIMING).toBe('normal');
    expect(getScreenshotDelayMs(undefined)).toBe(500);
  });

  it.each([
    ['fast', 150],
    ['normal', 500],
    ['slow', 1000],
  ])('maps %s to %i milliseconds', (timing, delayMs) => {
    expect(getScreenshotDelayMs(timing)).toBe(delayMs);
  });

  it('falls back to Normal for an invalid value', () => {
    expect(getScreenshotDelayMs('immediate')).toBe(SCREENSHOT_TIMINGS.normal);
  });
});
