import { describe, it, expect, beforeAll, vi } from 'vitest';
import type { Guide, Step, Screenshot } from '../src/shared/types';

class MockFileReader {
  result: string | ArrayBuffer | null = null;
  onload: ((ev: ProgressEvent) => void) | null = null;
  onerror: ((ev: ProgressEvent) => void) | null = null;

  readAsDataURL(blob: Blob) {
    setTimeout(() => {
      this.result = `data:image/jpeg;base64,dGVzdA==`;
      if (this.onload) this.onload({} as ProgressEvent);
    }, 0);
  }
}

beforeAll(() => {
  // @ts-expect-error replace FileReader for test environment
  globalThis.FileReader = MockFileReader;
});

let exportGuideAsHTML: typeof import('../src/export/html-export').exportGuideAsHTML;

beforeAll(async () => {
  const mod = await import('../src/export/html-export');
  exportGuideAsHTML = mod.exportGuideAsHTML;
});

const guide: Guide = {
  id: 'g1',
  title: 'Test Guide',
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  stepIds: ['s1', 's2'],
};

const steps: Step[] = [
  { id: 's1', guideId: 'g1', index: 0, description: 'Click the button', action: 'click', url: 'https://example.com', timestamp: 1700000001000, screenshotId: 'sc1' },
  { id: 's2', guideId: 'g1', index: 1, description: 'Type your name', action: 'input', url: 'https://example.com', timestamp: 1700000002000, screenshotId: 'sc2' },
];

const stepWithoutScreenshot: Step = {
  id: 's3', guideId: 'g1', index: 2, description: 'No screenshot step', action: 'click', url: 'https://example.com', timestamp: 1700000003000,
};

const screenshots: Map<string, Screenshot> = new Map([
  ['s1', { id: 'sc1', stepId: 's1', blob: new Blob(['test'], { type: 'image/jpeg' }), mimeType: 'image/jpeg', width: 1280, height: 720 }],
  ['s2', { id: 'sc2', stepId: 's2', blob: new Blob(['test2'], { type: 'image/jpeg' }), mimeType: 'image/jpeg', width: 1280, height: 720 }],
]);

describe('exportGuideAsHTML', () => {
  it('returns a string starting with <!DOCTYPE html>', async () => {
    const html = await exportGuideAsHTML(guide, steps, screenshots);
    expect(html.trimStart()).toMatch(/^<!DOCTYPE html>/i);
  });

  it('contains the guide title in an <h1> tag', async () => {
    const html = await exportGuideAsHTML(guide, steps, screenshots);
    expect(html).toContain('<h1>Test Guide</h1>');
  });

  it('contains step descriptions', async () => {
    const html = await exportGuideAsHTML(guide, steps, screenshots);
    expect(html).toContain('Click the button');
    expect(html).toContain('Type your name');
  });

  it('embeds screenshots as data:image/jpeg;base64, in <img> tags', async () => {
    const html = await exportGuideAsHTML(guide, steps, screenshots);
    expect(html).toContain('data:image/jpeg;base64,');
    expect(html).toContain('<img src=');
  });

  it('steps without screenshots have no <img> tag', async () => {
    const stepsNoScreenshot = [stepWithoutScreenshot];
    const html = await exportGuideAsHTML(guide, stepsNoScreenshot, new Map());
    expect(html).not.toContain('<img');
    expect(html).toContain('No screenshot step');
  });

  it('escapes HTML special characters in descriptions', async () => {
    const xssStep: Step = { id: 'sx', guideId: 'g1', index: 0, description: '<script>alert("xss")</script>', action: 'click', url: 'https://example.com', timestamp: 1700000001000 };
    const html = await exportGuideAsHTML(guide, [xssStep], new Map());
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
