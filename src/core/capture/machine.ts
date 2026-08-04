import { assign, createMachine, type SnapshotFrom } from 'xstate';

export const CaptureState = {
  IDLE: 'IDLE',
  RECORDING: 'RECORDING',
  PAUSED: 'PAUSED',
} as const;

export type CaptureStateValue = (typeof CaptureState)[keyof typeof CaptureState];

export type CaptureEvent =
  | { type: 'START_RECORDING'; url?: string; tabId?: number; captureToken: string }
  | { type: 'PAUSE_RECORDING' }
  | { type: 'RESUME_RECORDING'; url?: string; tabId?: number; captureToken: string }
  | { type: 'HANDOFF_TAB'; url?: string; tabId?: number; captureToken: string }
  | { type: 'STOP_RECORDING' }
  | { type: 'USER_ACTION' }
  | { type: 'URL_CHANGED'; url: string };

export interface CaptureContext {
  currentGuideId: string | null;
  stepCount: number;
  currentUrl: string;
  activeTabId: number | null;
  captureToken: string | null;
}

export const captureMachine = createMachine({
  id: 'capture',
  initial: CaptureState.IDLE,
  types: {} as {
    context: CaptureContext;
    events: CaptureEvent;
  },
  context: {
    currentGuideId: null,
    stepCount: 0,
    currentUrl: '',
    activeTabId: null,
    captureToken: null,
  },
  states: {
    [CaptureState.IDLE]: {
      on: {
        START_RECORDING: {
          target: CaptureState.RECORDING,
          actions: assign({
            currentGuideId: () => crypto.randomUUID(),
            stepCount: 0,
            currentUrl: ({ event }) => event.url ?? '',
            activeTabId: ({ event }) => event.tabId ?? null,
            captureToken: ({ event }) => event.captureToken,
          }),
        },
      },
    },
    [CaptureState.RECORDING]: {
      on: {
        STOP_RECORDING: {
          target: CaptureState.IDLE,
          actions: assign({
            currentGuideId: null,
            stepCount: 0,
            currentUrl: '',
            activeTabId: null,
            captureToken: null,
          }),
        },
        PAUSE_RECORDING: {
          target: CaptureState.PAUSED,
          actions: assign({ activeTabId: null }),
        },
        HANDOFF_TAB: {
          actions: assign({
            currentUrl: ({ event }) => event.url ?? '',
            activeTabId: ({ event }) => event.tabId ?? null,
            captureToken: ({ event }) => event.captureToken,
          }),
        },
        USER_ACTION: {
          actions: assign({
            stepCount: ({ context }) => context.stepCount + 1,
          }),
        },
        URL_CHANGED: {
          actions: assign({
            currentUrl: ({ event }) => event.url,
          }),
        },
      },
    },
    [CaptureState.PAUSED]: {
      on: {
        RESUME_RECORDING: {
          target: CaptureState.RECORDING,
          actions: assign({
            currentUrl: ({ event }) => event.url ?? '',
            activeTabId: ({ event }) => event.tabId ?? null,
            captureToken: ({ event }) => event.captureToken,
          }),
        },
        STOP_RECORDING: {
          target: CaptureState.IDLE,
          actions: assign({
            currentGuideId: null,
            stepCount: 0,
            currentUrl: '',
            activeTabId: null,
            captureToken: null,
          }),
        },
      },
    },
  },
});

export type CaptureSnapshot = SnapshotFrom<typeof captureMachine>;
