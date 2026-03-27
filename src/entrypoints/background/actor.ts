import { sessionStorage } from '@/lib/browser-api';
import { createActor } from 'xstate';
import { captureMachine } from '@/capture/machine';
import type { ActorRef } from './types';

const STORAGE_KEY = 'machineSnapshot';

let actor: ActorRef;
let readyResolve!: () => void;

export const ready = new Promise<void>((resolve) => {
  readyResolve = resolve;
});

export function getActor(): ActorRef {
  return actor;
}

export async function initActor(): Promise<void> {
  try {
    const result = await sessionStorage.get(STORAGE_KEY);
    const snapshot = result[STORAGE_KEY] ?? undefined;
    actor = createActor(captureMachine, { snapshot });
    actor.start();
  } catch (err) {
    console.warn('[Mimik] Failed to restore snapshot, starting fresh', err);
    await sessionStorage.remove(STORAGE_KEY);
    actor = createActor(captureMachine);
    actor.start();
  }

  actor.subscribe(() => {
    const persisted = actor.getPersistedSnapshot();
    sessionStorage.set({ [STORAGE_KEY]: persisted });
  });

  readyResolve();
}

export function initActorFallback(): void {
  console.error('[Mimik] initActor failed, starting fresh');
  actor = createActor(captureMachine);
  actor.start();
  readyResolve();
}
