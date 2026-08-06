import { defineExtensionMessaging } from '@webext-core/messaging';
import type { GuideImprovementProposal } from '@/core/capture/ai/improve';
import type { DOMContext } from '@/core/capture/dom/context';
import type { CaptureStateValue } from '@/core/capture/machine';
import type { ElementMeta, GuideImpact } from '@/core/guides/types';

export interface GetStateResponse {
  state: CaptureStateValue;
  stepCount: number;
  currentGuideId: string | null;
  captureToken: string | null;
}

export interface StartRecordingData {
  url: string;
}

export interface StartRecordingResponse {
  guideId: string;
}

export interface StopRecordingResponse {
  success: boolean;
  guideId?: string;
}

export interface CaptureStepData {
  guideId: string;
  captureToken: string;
  pageUrl: string;
  action: string;
  elementMeta: ElementMeta;
  domContext?: DOMContext;
  captureId?: string;
  eventId?: string;
}

export type CaptureStepResponse = { stepId: string } | { ignored: true } | { error: string };

export interface PrepareCaptureData {
  captureId: string;
}

export interface PrepareCaptureResponse {
  prepared: boolean;
}

export interface UpdateInputStepData {
  guideId: string;
  captureToken: string;
  stepId: string;
  description: string;
  inputValue?: string;
}

export interface UpdateInputStepResponse {
  updated: boolean;
}

export interface FinalizeInputStepData {
  guideId: string;
  captureToken: string;
  stepId: string;
  elementMeta: ElementMeta;
  domContext?: DOMContext;
}

export interface FinalizeInputStepResponse {
  updated: boolean;
}

export interface StartGuideMeData {
  guideId: string;
  confirmedImpact?: boolean;
}

export interface StartGuideMeResponse {
  started: boolean;
  error?: string;
  confirmationRequired?: boolean;
  impact?: GuideImpact;
}

export interface GuideMeStepCompletedData {
  stepIndex: number;
}

export interface GuideMeStepCompletedResponse {
  advanced: boolean;
  completed?: boolean;
}

export interface GuideMe_CancelResponse {
  cancelled: boolean;
}

export interface GuideMe_PrevData {
  stepIndex: number;
}

export interface GuideMe_PrevResponse {
  moved: boolean;
}

export interface EnterBlurModeResponse {
  entered: boolean;
}

export interface ExitBlurModeResponse {
  exited: boolean;
}

export interface ImproveGuideData {
  guideId: string;
  includeScreenshots: boolean;
}

export type ImproveGuideResponse =
  | { success: true; proposal: GuideImprovementProposal }
  | { success: false; error: string; needsConfiguration?: boolean; imageUnsupported?: boolean };

export interface StartTranslationData {
  guideId: string;
  targetLanguage: string;
}

export type StartTranslationResponse =
  | { success: true; jobId: string }
  | { success: false; error: string; needsConfiguration?: boolean };

export interface TranslationJobData {
  jobId: string;
}

interface TaskStitchProtocol {
  getState(): GetStateResponse;
  startRecording(data: StartRecordingData): StartRecordingResponse;
  stopRecording(): StopRecordingResponse;
  pauseRecording(): { paused: boolean };
  resumeRecording(): { resumed: boolean; error?: string };
  prepareCapture(data: PrepareCaptureData): PrepareCaptureResponse;
  captureStep(data: CaptureStepData): CaptureStepResponse;
  updateInputStep(data: UpdateInputStepData): UpdateInputStepResponse;
  finalizeInputStep(data: FinalizeInputStepData): FinalizeInputStepResponse;
  startGuideMe(data: StartGuideMeData): StartGuideMeResponse;
  guideMeStepCompleted(data: GuideMeStepCompletedData): GuideMeStepCompletedResponse;
  guideMeCancel(): GuideMe_CancelResponse;
  guideMePrev(data: GuideMe_PrevData): GuideMe_PrevResponse;
  enterBlurMode(): EnterBlurModeResponse;
  exitBlurMode(): ExitBlurModeResponse;
  improveGuide(data: ImproveGuideData): ImproveGuideResponse;
  startTranslation(data: StartTranslationData): StartTranslationResponse;
  retryTranslation(data: TranslationJobData): { success: boolean; error?: string };
}

export const { sendMessage, onMessage } = defineExtensionMessaging<TaskStitchProtocol>();
