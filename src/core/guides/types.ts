import type { JSONContent } from '@tiptap/core';

export interface Guide {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  stepIds: string[];
  starred: boolean;
  deletedAt: number | null;
  titleEdited?: boolean;
}

export interface Step {
  id: string;
  guideId: string;
  index: number;
  description: string;
  action: string;
  url: string;
  timestamp: number;
  screenshotId?: string;
  elementMeta?: ElementMeta;
  inputValue?: string;
  kind?: 'captured' | 'manual';
  richDescription?: JSONContent;
}

export interface ScreenshotBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Screenshot {
  id: string;
  stepId: string;
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
  bounds?: ScreenshotBounds;
  pixelRatio?: number;
}

export interface Settings {
  aiApiKey: string;
  aiProvider: 'openai' | 'anthropic';
  aiModel: string;
  aiBaseUrl?: string;
}

export interface ElementMeta {
  tag: string;
  cssSelector: string;
  textContent: string | null;
  ariaLabel: string | null;
  placeholder: string | null;
  altText: string | null;
  name: string | null;
  role: string | null;
  href: string | null;
  inputType: string | null;
  dataTestId: string | null;
  rect: { x: number; y: number; width: number; height: number };
  devicePixelRatio: number;
}
