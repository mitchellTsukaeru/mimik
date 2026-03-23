import { createMachine, assign } from 'xstate';

export const captureMachine = createMachine({
  id: 'capture',
  initial: 'idle',
  context: {
    currentGuideId: null as string | null,
    stepCount: 0,
  },
  states: {
    idle: {
      on: {
        START_RECORDING: {
          target: 'recording',
          actions: assign({
            currentGuideId: () => crypto.randomUUID(),
            stepCount: 0,
          }),
        },
      },
    },
    recording: {
      on: {
        STOP_RECORDING: {
          target: 'idle',
          actions: assign({
            currentGuideId: null,
            stepCount: 0,
          }),
        },
      },
    },
  },
});
