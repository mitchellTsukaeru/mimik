import type { Screenshot } from '@/core/guides/types';

interface RenderOptions {
  type?: 'image/jpeg' | 'image/webp';
  quality?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function drawRoundedRect(
  context: OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.stroke();
}

function drawCursor(context: OffscreenCanvasRenderingContext2D, x: number, y: number, size: number) {
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x, y + size);
  context.lineTo(x + size * 0.28, y + size * 0.73);
  context.lineTo(x + size * 0.48, y + size);
  context.lineTo(x + size * 0.66, y + size * 0.88);
  context.lineTo(x + size * 0.47, y + size * 0.61);
  context.lineTo(x + size * 0.82, y + size * 0.58);
  context.closePath();
  context.lineJoin = 'round';
  context.fillStyle = '#FFFFFF';
  context.fill();
  context.strokeStyle = '#1E1B4B';
  context.lineWidth = 2;
  context.stroke();
}

function drawFocusAnnotation(
  context: OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.strokeStyle = '#4F46E5';
  context.lineWidth = 5;
  context.setLineDash([10, 6]);
  drawRoundedRect(context, x, y, width, height, 12);
  context.setLineDash([]);

  const cursorSize = clamp(Math.min(width, height) * 0.4, 20, 36);
  drawCursor(context, x + width * 0.55, y + height * 0.55, cursorSize);
}

export async function renderScreenshotVariants(screenshot: Screenshot, options: RenderOptions = {}) {
  const type = options.type ?? 'image/webp';
  const quality = options.quality ?? 0.8;
  const image = await createImageBitmap(screenshot.blob);
  const imageWidth = image.width;
  const imageHeight = image.height;
  const bounds = screenshot.bounds;
  const pixelRatio = screenshot.pixelRatio || 1;

  const fullCanvas = new OffscreenCanvas(imageWidth, imageHeight);
  const fullContext = fullCanvas.getContext('2d');
  if (!fullContext) throw new Error('Unable to create screenshot rendering context');
  fullContext.drawImage(image, 0, 0, imageWidth, imageHeight);

  if (!bounds) {
    image.close();
    const fullBlob = await fullCanvas.convertToBlob({ type, quality });
    return { fullBlob, croppedBlob: null };
  }

  const boundsX = bounds.x * pixelRatio;
  const boundsY = bounds.y * pixelRatio;
  const boundsWidth = bounds.width * pixelRatio;
  const boundsHeight = bounds.height * pixelRatio;
  drawFocusAnnotation(fullContext, boundsX, boundsY, boundsWidth, boundsHeight);

  const fullBlob = await fullCanvas.convertToBlob({ type, quality });
  const horizontalPadding = 0.3 * imageWidth;
  const verticalPadding = 0.3 * imageHeight;
  const imageAspect = imageWidth / imageHeight;
  const elementAspect = boundsWidth / boundsHeight;
  const centerX = boundsX + boundsWidth / 2;
  const centerY = boundsY + boundsHeight / 2;

  let visibleWidth = boundsWidth + horizontalPadding;
  let visibleHeight = boundsHeight + verticalPadding;
  if (elementAspect > 1) visibleHeight = visibleWidth / imageAspect;
  else if (elementAspect < 1) visibleWidth = visibleHeight * imageAspect;

  visibleWidth = Math.min(visibleWidth, imageWidth);
  visibleHeight = Math.min(visibleHeight, imageHeight);
  const cropX = clamp(centerX - visibleWidth / 2, 0, imageWidth - visibleWidth);
  const cropY = clamp(centerY - visibleHeight / 2, 0, imageHeight - visibleHeight);

  const cropCanvas = new OffscreenCanvas(imageWidth, imageHeight);
  const cropContext = cropCanvas.getContext('2d');
  if (!cropContext) throw new Error('Unable to create cropped screenshot rendering context');
  cropContext.drawImage(image, cropX, cropY, visibleWidth, visibleHeight, 0, 0, imageWidth, imageHeight);

  const scaleX = imageWidth / visibleWidth;
  const scaleY = imageHeight / visibleHeight;
  drawFocusAnnotation(
    cropContext,
    (boundsX - cropX) * scaleX,
    (boundsY - cropY) * scaleY,
    boundsWidth * scaleX,
    boundsHeight * scaleY,
  );

  image.close();
  const croppedBlob = await cropCanvas.convertToBlob({ type, quality });
  return { fullBlob, croppedBlob };
}
