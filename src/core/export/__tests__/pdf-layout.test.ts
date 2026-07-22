import { describe, expect, it } from 'vitest';
import { fitImageWithin } from '../pdf-export';

describe('fitImageWithin', () => {
  it('preserves a landscape screenshot aspect ratio when height constrained', () => {
    expect(fitImageWithin(1920, 1080, 160, 60)).toEqual({ width: 106.66666666666666, height: 60 });
  });

  it('preserves a portrait screenshot aspect ratio when height constrained', () => {
    expect(fitImageWithin(800, 1600, 160, 90)).toEqual({ width: 45, height: 90 });
  });

  it('uses the available width when the image fits below the height limit', () => {
    expect(fitImageWithin(1600, 600, 160, 90)).toEqual({ width: 160, height: 60 });
  });
});
