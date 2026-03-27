
export const TabMessage = {
  PING: 'PING',
  START_CAPTURE: 'START_CAPTURE',
  STOP_CAPTURE: 'STOP_CAPTURE',
  GET_ROUTE: 'GET_ROUTE',
  URL_CHANGED: 'URL_CHANGED',
} as const;

export type TabMessageType = (typeof TabMessage)[keyof typeof TabMessage];
