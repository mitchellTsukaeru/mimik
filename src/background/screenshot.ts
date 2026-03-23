import { db } from '../shared/db-schema';
import type { Screenshot } from '../shared/types';

export async function captureAndStore(tabId: number, stepId: string): Promise<Screenshot> {
  const dataUrl = await chrome.tabs.captureVisibleTab(null, {
    format: 'jpeg',
    quality: 85,
  });

  const blob = await fetch(dataUrl).then(r => r.blob());

  const screenshot: Screenshot = {
    id: crypto.randomUUID(),
    stepId,
    blob,
    mimeType: 'image/jpeg',
    width: 0,
    height: 0,
  };

  await db.screenshots.add(screenshot);
  return screenshot;
}

export function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then(r => r.blob());
}
