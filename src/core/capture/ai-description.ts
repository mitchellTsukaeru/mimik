import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { logger } from '@/lib/logger';
import type { ElementMeta } from '@/core/guides/types';

function createModel(provider: string, model: string, apiKey: string) {
  if (provider === 'anthropic') {
    return createAnthropic({ apiKey })(model);
  }
  return createOpenAI({ apiKey })(model);
}

export async function getAIDescription(
  blob: Blob,
  action: string,
  meta: ElementMeta,
  provider: string,
  model: string,
  apiKey: string,
): Promise<string | null> {
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  const targetText = meta.textContent || meta.ariaLabel || meta.placeholder || meta.tag;
  const prompt = `This is a browser screenshot. The highlighted element (blue border) is a ${meta.tag} with text "${targetText}". The user performed a "${action}" action on it. Write a single concise sentence describing this step (e.g., "Click the Submit button"). No preamble.`;

  try {
    const { text } = await generateText({
      model: createModel(provider, model, apiKey),
      messages: [{
        role: 'user',
        content: [
          { type: 'image', image: dataUrl },
          { type: 'text', text: prompt },
        ],
      }],
      maxOutputTokens: 100,
    });
    return text.trim() || null;
  } catch (err) {
    logger.error('AI description failed, using fallback', err);
    return null;
  }
}
