import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CaptureState } from '@/core/capture/machine';
import { createRecordingControls, type RecordingControlsDependencies } from '../recording-controls';

function createHarness(state: CaptureState = CaptureState.IDLE) {
  let currentState = state;
  const actor = {
    send: vi.fn((event: { type: string; url?: string }) => {
      if (event.type === 'START_RECORDING') currentState = CaptureState.RECORDING;
      if (event.type === 'STOP_RECORDING') currentState = CaptureState.IDLE;
    }),
    getSnapshot: vi.fn(() => ({
      value: currentState,
      context: {
        currentGuideId: currentState === CaptureState.RECORDING ? 'guide-123' : null,
      },
    })),
  };
  const dependencies: RecordingControlsDependencies = {
    waitUntilReady: vi.fn().mockResolvedValue(undefined),
    getActor: vi.fn(() => actor),
    getActiveTab: vi.fn().mockResolvedValue({ id: 42, url: 'https://active.example/workflow' }),
    createGuide: vi.fn().mockResolvedValue(undefined),
    showNotificationOnTab: vi.fn().mockResolvedValue(undefined),
    broadcastStartCapture: vi.fn().mockResolvedValue(undefined),
    broadcastStopCapture: vi.fn().mockResolvedValue(undefined),
    generateTitle: vi.fn(),
  };

  return { actor, dependencies, controls: createRecordingControls(dependencies) };
}

describe('recording controls', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses the caller URL for the normal start flow', async () => {
    const { actor, controls, dependencies } = createHarness();

    await expect(controls.start('https://requested.example/start')).resolves.toBe('guide-123');

    expect(actor.send).toHaveBeenCalledWith({ type: 'START_RECORDING', url: 'https://requested.example/start' });
    expect(dependencies.createGuide).toHaveBeenCalledWith('guide-123');
    expect(dependencies.showNotificationOnTab).toHaveBeenCalledWith(42);
    expect(dependencies.broadcastStartCapture).toHaveBeenCalledWith('guide-123');
  });

  it('starts from the active tab when the keyboard command is used while idle', async () => {
    const { actor, controls } = createHarness();

    await controls.handleCommand('toggle-recording');

    expect(actor.send).toHaveBeenCalledWith({ type: 'START_RECORDING', url: 'https://active.example/workflow' });
  });

  it('stops and generates a title when the keyboard command is used while recording', async () => {
    const { actor, controls, dependencies } = createHarness(CaptureState.RECORDING);

    await expect(controls.handleCommand('toggle-recording')).resolves.toBe('guide-123');

    expect(dependencies.broadcastStopCapture).toHaveBeenCalledOnce();
    expect(actor.send).toHaveBeenCalledWith({ type: 'STOP_RECORDING' });
    expect(dependencies.generateTitle).toHaveBeenCalledWith('guide-123');
  });

  it('ignores unrelated extension commands', async () => {
    const { actor, controls } = createHarness();

    await expect(controls.handleCommand('unrelated-command')).resolves.toBeUndefined();

    expect(actor.send).not.toHaveBeenCalled();
  });
});
