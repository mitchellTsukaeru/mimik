import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CaptureStateValue } from '@/core/capture/machine';
import { CaptureState } from '@/core/capture/machine';
import { createRecordingControls, type RecordingControlsDependencies } from '../recording-controls';

function createHarness(state: CaptureStateValue = CaptureState.IDLE) {
  let currentState = state;
  let activeTabId: number | null = state === CaptureState.RECORDING ? 42 : null;
  let captureToken: string | null = state === CaptureState.RECORDING ? 'existing-token' : null;
  const actor = {
    send: vi.fn((event: { type: string; tabId?: number; captureToken?: string }) => {
      if (event.type === 'START_RECORDING' || event.type === 'RESUME_RECORDING') {
        currentState = CaptureState.RECORDING;
        activeTabId = event.tabId ?? null;
        captureToken = event.captureToken ?? null;
      }
      if (event.type === 'PAUSE_RECORDING') {
        currentState = CaptureState.PAUSED;
        activeTabId = null;
        captureToken = null;
      }
      if (event.type === 'STOP_RECORDING') {
        currentState = CaptureState.IDLE;
        activeTabId = null;
        captureToken = null;
      }
    }),
    getSnapshot: vi.fn(() => ({
      value: currentState,
      context: {
        currentGuideId: currentState === CaptureState.IDLE ? null : 'guide-123',
        activeTabId,
        captureToken,
      },
    })),
  };
  const dependencies: RecordingControlsDependencies = {
    waitUntilReady: vi.fn().mockResolvedValue(undefined),
    getActor: vi.fn(() => actor),
    getActiveTab: vi.fn().mockResolvedValue({ id: 42, url: 'https://active.example/workflow' }),
    createGuide: vi.fn().mockResolvedValue(undefined),
    showNotificationOnTab: vi.fn().mockResolvedValue(undefined),
    startCaptureOnTab: vi.fn().mockResolvedValue(true),
    stopCaptureOnTab: vi.fn().mockResolvedValue(undefined),
    generateTitle: vi.fn(),
  };

  return { actor, dependencies, controls: createRecordingControls(dependencies) };
}

describe('recording controls', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses the caller URL for the normal start flow', async () => {
    const { actor, controls, dependencies } = createHarness();

    await expect(controls.start('https://requested.example/start')).resolves.toBe('guide-123');

    expect(actor.send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'START_RECORDING',
        url: 'https://requested.example/start',
        tabId: 42,
        captureToken: expect.any(String),
      }),
    );
    expect(dependencies.createGuide).toHaveBeenCalledWith('guide-123');
    expect(dependencies.showNotificationOnTab).toHaveBeenCalledWith(42);
    expect(dependencies.startCaptureOnTab).toHaveBeenCalledWith(42, 'guide-123', expect.any(String));
  });

  it('starts from the active tab when the keyboard command is used while idle', async () => {
    const { actor, controls } = createHarness();

    await controls.handleCommand('toggle-recording');

    expect(actor.send).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'START_RECORDING', url: 'https://active.example/workflow', tabId: 42 }),
    );
  });

  it('stops and generates a title when the keyboard command is used while recording', async () => {
    const { actor, controls, dependencies } = createHarness(CaptureState.RECORDING);

    await expect(controls.handleCommand('toggle-recording')).resolves.toBe('guide-123');

    expect(dependencies.stopCaptureOnTab).toHaveBeenCalledWith(42);
    expect(actor.send).toHaveBeenCalledWith({ type: 'STOP_RECORDING' });
    expect(dependencies.generateTitle).toHaveBeenCalledWith('guide-123');
  });

  it('pauses without finishing the guide and resumes on the active tab with a new token', async () => {
    const { actor, controls, dependencies } = createHarness(CaptureState.RECORDING);

    await expect(controls.pause()).resolves.toBe(true);
    expect(dependencies.stopCaptureOnTab).toHaveBeenCalledWith(42);
    expect(actor.send).toHaveBeenCalledWith({ type: 'PAUSE_RECORDING' });
    expect(dependencies.generateTitle).not.toHaveBeenCalled();

    await expect(controls.resume()).resolves.toEqual({ resumed: true });
    expect(actor.send).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'RESUME_RECORDING', tabId: 42, captureToken: expect.any(String) }),
    );
    expect(dependencies.startCaptureOnTab).toHaveBeenCalledWith(42, 'guide-123', expect.any(String));
  });

  it('keeps a paused guide paused when the active page is unsupported', async () => {
    const { controls, dependencies } = createHarness(CaptureState.PAUSED);
    vi.mocked(dependencies.getActiveTab).mockResolvedValue({ id: 42, url: 'chrome://settings' });

    await expect(controls.resume()).resolves.toEqual({ resumed: false, error: 'This page cannot be recorded' });
    expect(dependencies.startCaptureOnTab).not.toHaveBeenCalled();
  });

  it('ignores unrelated extension commands', async () => {
    const { actor, controls } = createHarness();

    await expect(controls.handleCommand('unrelated-command')).resolves.toBeUndefined();

    expect(actor.send).not.toHaveBeenCalled();
  });
});
