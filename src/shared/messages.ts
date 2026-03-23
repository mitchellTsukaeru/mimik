export type MessageType = 'PING' | 'CAPTURE_SCREENSHOT' | 'GET_STATE';

export interface PingMessage { type: 'PING'; }
export interface PingResponse { alive: boolean; }

export interface CaptureScreenshotMessage { type: 'CAPTURE_SCREENSHOT'; tabId: number; stepId: string; }
export interface CaptureScreenshotResponse { screenshotId: string; }

export interface GetStateMessage { type: 'GET_STATE'; }
export interface GetStateResponse { state: string; }

export type ExtensionMessage = PingMessage | CaptureScreenshotMessage | GetStateMessage;
