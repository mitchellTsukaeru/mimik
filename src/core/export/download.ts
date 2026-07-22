const OBJECT_URL_LIFETIME_MS = 60_000;

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // Revoking synchronously can invalidate downloads observed through Playwright
  // before Chromium has finished copying the object URL into its download job.
  setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_LIFETIME_MS);
}

export function downloadText(content: string, filename: string, mimeType: string): void {
  downloadBlob(new Blob([content], { type: mimeType }), filename);
}
