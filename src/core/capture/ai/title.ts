import { generateText } from 'ai';
import { logger } from '@/lib/logger';
import { GUIDE_TITLE_PROMPT } from './prompts';
import { createModel } from './provider';

export async function generateGuideTitle(
  steps: { description: string; url: string }[],
  provider: string,
  model: string,
  apiKey: string,
): Promise<string | null> {
  if (steps.length === 0) return null;

  const formatted = steps.map((s, i) => `${i + 1}. [${s.url}] ${s.description}`).join('\n');

  try {
    const { text } = await generateText({
      model: createModel(provider, model, apiKey),
      prompt: GUIDE_TITLE_PROMPT.replace('{{steps}}', formatted),
      maxOutputTokens: 30,
    });
    return text.trim().replace(/^"|"$/g, '') || null;
  } catch (err) {
    logger.error('Guide title generation failed', err);
    return null;
  }
}
