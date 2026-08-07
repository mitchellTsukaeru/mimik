import type { Screenshot, Step } from '@/core/guides/types';

export interface GuideMeHighlightStyle {
  left: string;
  top: string;
  width: string;
  height: string;
}

/**
 * Convert the captured element rectangle from CSS pixels into percentages of
 * the full screenshot bitmap. Screenshot bounds describe the target area for
 * export cropping; they are not the dimensions of the screenshot itself.
 */
export function getGuideMeHighlightStyle(
  step: Pick<Step, 'elementMeta'> | null | undefined,
  screenshot: Pick<Screenshot, 'width' | 'height' | 'pixelRatio'> | undefined,
): GuideMeHighlightStyle | null {
  const rect = step?.elementMeta?.rect;
  if (!rect || !screenshot?.width || !screenshot.height) return null;

  const ratio = screenshot.pixelRatio || step.elementMeta?.devicePixelRatio || 1;
  const imageWidth = screenshot.width;
  const imageHeight = screenshot.height;

  return {
    left: `${(rect.x * ratio * 100) / imageWidth}%`,
    top: `${(rect.y * ratio * 100) / imageHeight}%`,
    width: `${(rect.width * ratio * 100) / imageWidth}%`,
    height: `${(rect.height * ratio * 100) / imageHeight}%`,
  };
}
