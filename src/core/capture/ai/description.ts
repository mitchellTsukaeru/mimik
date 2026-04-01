import { generateText } from 'ai';
import { logger } from '@/lib/logger';
import type { DOMContext } from '../dom/context';
import { serializeDOMContext } from '../dom/context';
import { createModel } from './provider';
import { STEP_DESCRIPTION_PROMPT } from './prompts';

export async function getAIDescription(
  domContext: DOMContext,
  provider: string,
  model: string,
  apiKey: string,
): Promise<string | null> {
  try {
    const { text } = await generateText({
      model: createModel(provider, model, apiKey),
      prompt: STEP_DESCRIPTION_PROMPT.replace('{{context}}', serializeDOMContext(domContext)),
      maxOutputTokens: 50,
    });
    return text.trim() || null;
  } catch (err) {
    logger.error('AI description failed, using fallback', err);
    return null;
  }
}
