import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CaptureState } from '@/core/capture/machine';
import type { CaptureStepData } from '@/lib/messaging';

const mocks = vi.hoisted(() => ({
  actorSend: vi.fn(),
  addStepToGuide: vi.fn(),
  captureVisibleTab: vi.fn(),
  createStep: vi.fn(),
  saveScreenshot: vi.fn(),
}));

vi.mock('../actor', () => ({
  getActor: () => ({
    getSnapshot: () => ({
      value: CaptureState.RECORDING,
      context: {
        currentGuideId: 'guide-1',
        currentUrl: 'https://example.com/workflow',
        stepCount: 0,
      },
    }),
    send: mocks.actorSend,
  }),
}));

vi.mock('@/core/guides/db', () => ({
  db: { steps: { update: vi.fn() } },
}));

vi.mock('@/core/guides/service', () => ({
  addStepToGuide: mocks.addStepToGuide,
  createStep: mocks.createStep,
  saveScreenshot: mocks.saveScreenshot,
  updateStepDescription: vi.fn(),
}));

vi.mock('@/lib/browser-api', () => ({
  captureVisibleTab: mocks.captureVisibleTab,
  localStorage: { get: vi.fn().mockResolvedValue({}) },
}));

function captureData(overrides: Partial<CaptureStepData> = {}): CaptureStepData {
  return {
    guideId: 'guide-1',
    action: 'click',
    eventId: crypto.randomUUID(),
    elementMeta: {
      tag: 'button',
      cssSelector: '#submit',
      textContent: 'Submit',
      ariaLabel: null,
      placeholder: null,
      altText: null,
      name: null,
      role: 'button',
      href: null,
      inputType: null,
      dataTestId: null,
      rect: { x: 10, y: 20, width: 100, height: 40 },
      devicePixelRatio: 2,
    },
    ...overrides,
  };
}

describe('step pipeline click coordination', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.captureVisibleTab.mockResolvedValue('data:image/jpeg;base64,AA==');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ blob: () => Promise.resolve(new Blob()) }));
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 1280, height: 800, close: vi.fn() }));
  });

  it('reuses the screenshot started before the click', async () => {
    const { handleCaptureStep, prepareCapture } = await import('../step-pipeline');
    const captureId = 'pointer-capture-1';

    await prepareCapture(captureId);
    await handleCaptureStep(captureData({ captureId }));

    expect(mocks.captureVisibleTab).toHaveBeenCalledOnce();
    expect(mocks.saveScreenshot).toHaveBeenCalledOnce();
    expect(mocks.createStep).toHaveBeenCalledOnce();
  });

  it('creates only one step for duplicate deliveries of the same DOM event', async () => {
    const { handleCaptureStep } = await import('../step-pipeline');
    const data = captureData({ eventId: 'same-click-event' });

    const [first, duplicate] = await Promise.all([handleCaptureStep(data), handleCaptureStep(data)]);

    expect(duplicate).toEqual(first);
    expect(mocks.captureVisibleTab).toHaveBeenCalledOnce();
    expect(mocks.createStep).toHaveBeenCalledOnce();
    expect(mocks.addStepToGuide).toHaveBeenCalledOnce();
    expect(mocks.actorSend).toHaveBeenCalledOnce();
  });
});
