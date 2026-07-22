export interface AIModelOption {
  id: string;
  label: string;
}

export interface AIProviderConfig {
  label: string;
  defaultModel: string;
  models: AIModelOption[];
}

export const CUSTOM_MODEL_ID = '__custom__';

export const AI_PROVIDERS: Record<string, AIProviderConfig> = {
  openai: {
    label: 'OpenAI',
    defaultModel: 'gpt-5.6-luna',
    models: [
      { id: 'gpt-5.6-luna', label: 'GPT-5.6 Luna' },
      { id: 'gpt-5.6-terra', label: 'GPT-5.6 Terra' },
      { id: 'gpt-5.6-sol', label: 'GPT-5.6 Sol' },
    ],
  },
  anthropic: {
    label: 'Anthropic',
    defaultModel: 'claude-haiku-4-5-20251001',
    models: [
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
      { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
      { id: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
      { id: 'claude-fable-5', label: 'Claude Fable 5' },
    ],
  },
};

export type AIProviderKey = keyof typeof AI_PROVIDERS;

export function isPresetModel(provider: AIProviderKey, model: string): boolean {
  return AI_PROVIDERS[provider].models.some((option) => option.id === model);
}

export function getDefaultAIModel(provider: string): string {
  return AI_PROVIDERS[provider as AIProviderKey]?.defaultModel ?? AI_PROVIDERS.openai.defaultModel;
}
