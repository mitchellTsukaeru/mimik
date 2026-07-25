export const SCREENSHOT_TIMINGS = {
  fast: 150,
  normal: 500,
  slow: 1000,
} as const;

export type ScreenshotTiming = keyof typeof SCREENSHOT_TIMINGS;

export const DEFAULT_SCREENSHOT_TIMING: ScreenshotTiming = 'normal';

export function getScreenshotDelayMs(value: unknown): number {
  if (typeof value === 'string' && value in SCREENSHOT_TIMINGS) {
    return SCREENSHOT_TIMINGS[value as ScreenshotTiming];
  }

  return SCREENSHOT_TIMINGS[DEFAULT_SCREENSHOT_TIMING];
}
