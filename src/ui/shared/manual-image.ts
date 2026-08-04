import type { Screenshot } from '@/core/guides/types';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_EDGE = 4096;

export async function normalizeManualImage(blob: Blob): Promise<Omit<Screenshot, 'id' | 'stepId'>> {
  if (!ALLOWED_TYPES.has(blob.type)) throw new Error('Choose a PNG, JPEG, or WebP image');
  if (blob.size > MAX_BYTES) throw new Error('Image must be smaller than 20 MB');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    throw new Error('This image could not be decoded');
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Image processing is unavailable');
  }
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const normalized = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
  if (!normalized) throw new Error('Image processing failed');
  return { blob: normalized, mimeType: 'image/jpeg', width, height };
}
