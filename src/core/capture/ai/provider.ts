import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

export function createModel(provider: string, model: string, apiKey: string, baseURL?: string) {
  const customBaseURL = baseURL?.trim() || undefined;

  if (provider === 'anthropic') {
    return createAnthropic({ apiKey, baseURL: customBaseURL })(model);
  }

  const openai = createOpenAI({ apiKey, baseURL: customBaseURL });
  return customBaseURL ? openai.chat(model) : openai(model);
}
