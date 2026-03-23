export interface Guide {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  stepIds: string[];
}

export interface Step {
  id: string;
  guideId: string;
  index: number;
  description: string;
  action: 'click' | 'input' | 'scroll' | 'navigate';
  url: string;
  timestamp: number;
  screenshotId: string;
}

export interface Screenshot {
  id: string;
  stepId: string;
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
}

export interface Settings {
  aiApiKey: string;
  aiProvider: 'openai' | 'anthropic';
}
