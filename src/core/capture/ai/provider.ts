import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

export function createModel(provider: string, model: string, apiKey: string) {
  if (provider === 'anthropic') return createAnthropic({ apiKey })(model);
  return createOpenAI({ apiKey })(model);
}
