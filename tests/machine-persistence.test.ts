import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { captureMachine } from '../src/background/machine';

describe('captureMachine', () => {
  it('starts in idle state', () => {
    const actor = createActor(captureMachine);
    actor.start();
    expect(actor.getSnapshot().value).toBe('idle');
    actor.stop();
  });

  it('transitions to recording on START_RECORDING', () => {
    const actor = createActor(captureMachine);
    actor.start();
    actor.send({ type: 'START_RECORDING' });
    expect(actor.getSnapshot().value).toBe('recording');
    actor.stop();
  });

  it('transitions back to idle on STOP_RECORDING', () => {
    const actor = createActor(captureMachine);
    actor.start();
    actor.send({ type: 'START_RECORDING' });
    actor.send({ type: 'STOP_RECORDING' });
    expect(actor.getSnapshot().value).toBe('idle');
    actor.stop();
  });

  it('assigns a new non-null guideId on START_RECORDING', () => {
    const actor = createActor(captureMachine);
    actor.start();
    actor.send({ type: 'START_RECORDING' });
    const { currentGuideId } = actor.getSnapshot().context;
    expect(currentGuideId).not.toBeNull();
    expect(typeof currentGuideId).toBe('string');
    expect(currentGuideId!.length).toBeGreaterThan(0);
    actor.stop();
  });

  it('resets guideId to null on STOP_RECORDING', () => {
    const actor = createActor(captureMachine);
    actor.start();
    actor.send({ type: 'START_RECORDING' });
    actor.send({ type: 'STOP_RECORDING' });
    expect(actor.getSnapshot().context.currentGuideId).toBeNull();
    actor.stop();
  });

  it('getPersistedSnapshot returns serializable JSON', () => {
    const actor = createActor(captureMachine);
    actor.start();
    actor.send({ type: 'START_RECORDING' });
    const persisted = actor.getPersistedSnapshot();
    const json = JSON.stringify(persisted);
    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(parsed).toBeDefined();
    actor.stop();
  });

  it('createActor with snapshot restores to the same state value', () => {
    const original = createActor(captureMachine);
    original.start();
    original.send({ type: 'START_RECORDING' });
    const persisted = original.getPersistedSnapshot();
    original.stop();

    const restored = createActor(captureMachine, { snapshot: persisted });
    restored.start();
    expect(restored.getSnapshot().value).toBe('recording');
    restored.stop();
  });

  it('restored actor in recording state can receive STOP_RECORDING and transition to idle', () => {
    const original = createActor(captureMachine);
    original.start();
    original.send({ type: 'START_RECORDING' });
    const persisted = original.getPersistedSnapshot();
    original.stop();

    const restored = createActor(captureMachine, { snapshot: persisted });
    restored.start();
    restored.send({ type: 'STOP_RECORDING' });
    expect(restored.getSnapshot().value).toBe('idle');
    restored.stop();
  });
});
