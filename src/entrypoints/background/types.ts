import type { createActor } from 'xstate';
import type { captureMachine } from '@/capture/machine';

export type ActorRef = ReturnType<typeof createActor<typeof captureMachine>>;
export type ActorReady = Promise<void>;
