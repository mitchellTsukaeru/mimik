import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Screenshot } from '@/core/guides/types';
import { renderScreenshotVariants } from '../screenshot-renderer';

interface CanvasCall {
  method: string;
  args: unknown[];
}

describe('renderScreenshotVariants', () => {
  const canvases: Array<{ calls: CanvasCall[] }> = [];

  beforeEach(() => {
    canvases.length = 0;
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 1200, height: 800, close: vi.fn() }));
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        calls: CanvasCall[] = [];

        constructor(
          public width: number,
          public height: number,
        ) {
          canvases.push(this);
        }

        getContext() {
          const calls = this.calls;
          return {
            beginPath: () => calls.push({ method: 'beginPath', args: [] }),
            moveTo: (...args: unknown[]) => calls.push({ method: 'moveTo', args }),
            lineTo: (...args: unknown[]) => calls.push({ method: 'lineTo', args }),
            quadraticCurveTo: (...args: unknown[]) => calls.push({ method: 'quadraticCurveTo', args }),
            closePath: () => calls.push({ method: 'closePath', args: [] }),
            stroke: () => calls.push({ method: 'stroke', args: [] }),
            fill: () => calls.push({ method: 'fill', args: [] }),
            drawImage: (...args: unknown[]) => calls.push({ method: 'drawImage', args }),
            setLineDash: (...args: unknown[]) => calls.push({ method: 'setLineDash', args }),
            set strokeStyle(value: string) {
              calls.push({ method: 'strokeStyle', args: [value] });
            },
            set fillStyle(value: string) {
              calls.push({ method: 'fillStyle', args: [value] });
            },
            set lineWidth(value: number) {
              calls.push({ method: 'lineWidth', args: [value] });
            },
            set lineJoin(value: string) {
              calls.push({ method: 'lineJoin', args: [value] });
            },
          };
        }

        convertToBlob({ type }: { type: string }) {
          return Promise.resolve(new Blob(['rendered'], { type }));
        }
      },
    );
  });

  it('renders a thicker dashed focus outline and cursor into exportable images', async () => {
    const screenshot: Screenshot = {
      id: 'shot-1',
      stepId: 'step-1',
      blob: new Blob(['image'], { type: 'image/jpeg' }),
      mimeType: 'image/jpeg',
      width: 1200,
      height: 800,
      bounds: { x: 10, y: 20, width: 100, height: 50 },
      pixelRatio: 2,
    };

    const result = await renderScreenshotVariants(screenshot);

    expect(result.fullBlob.type).toBe('image/webp');
    expect(result.croppedBlob?.type).toBe('image/webp');
    expect(canvases[0].calls).toContainEqual({ method: 'lineWidth', args: [5] });
    expect(canvases[0].calls).toContainEqual({ method: 'setLineDash', args: [[10, 6]] });
    expect(canvases[0].calls.some((call) => call.method === 'fill')).toBe(true);
  });
});
