import { describe, expect, it } from 'vitest';
import { AI_PROVIDERS } from '../models';

describe('AI_PROVIDERS', () => {
  it('uses the current cost-sensitive OpenAI model by default', () => {
    expect(AI_PROVIDERS.openai.defaultModel).toBe('gpt-5.6-luna');
    expect(AI_PROVIDERS.openai.models).toEqual([
      { id: 'gpt-5.6-luna', label: 'GPT-5.6 Luna' },
      { id: 'gpt-5.6-terra', label: 'GPT-5.6 Terra' },
      { id: 'gpt-5.6-sol', label: 'GPT-5.6 Sol' },
    ]);
  });

  it('uses the current low-cost Anthropic model by default', () => {
    expect(AI_PROVIDERS.anthropic.defaultModel).toBe('claude-haiku-4-5-20251001');
    expect(AI_PROVIDERS.anthropic.models).toEqual([
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
      { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
      { id: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
      { id: 'claude-fable-5', label: 'Claude Fable 5' },
    ]);
  });
});
