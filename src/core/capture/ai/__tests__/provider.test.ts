import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createModel } from '../provider';

const mocks = vi.hoisted(() => ({
  createAnthropic: vi.fn(),
  createOpenAI: vi.fn(),
}));

vi.mock('@ai-sdk/anthropic', () => ({ createAnthropic: mocks.createAnthropic }));
vi.mock('@ai-sdk/openai', () => ({ createOpenAI: mocks.createOpenAI }));

describe('createModel', () => {
  beforeEach(() => {
    mocks.createAnthropic.mockReset();
    mocks.createOpenAI.mockReset();
  });

  it('uses the official OpenAI Responses API when no compatible endpoint is configured', () => {
    const responsesModel = { id: 'responses-model' };
    const chat = vi.fn();
    const openai = Object.assign(vi.fn().mockReturnValue(responsesModel), { chat });
    mocks.createOpenAI.mockReturnValue(openai);

    expect(createModel('openai', 'gpt-test', 'openai-key')).toBe(responsesModel);
    expect(mocks.createOpenAI).toHaveBeenCalledWith({ apiKey: 'openai-key', baseURL: undefined });
    expect(openai).toHaveBeenCalledWith('gpt-test');
    expect(chat).not.toHaveBeenCalled();
  });

  it('uses OpenAI Chat Completions for an OpenAI-compatible endpoint', () => {
    const chatModel = { id: 'chat-model' };
    const chat = vi.fn().mockReturnValue(chatModel);
    const openai = Object.assign(vi.fn(), { chat });
    mocks.createOpenAI.mockReturnValue(openai);

    expect(createModel('openai', 'compatible-model', 'compatible-key', ' https://example.test/v1/ ')).toBe(chatModel);
    expect(mocks.createOpenAI).toHaveBeenCalledWith({
      apiKey: 'compatible-key',
      baseURL: 'https://example.test/v1/',
    });
    expect(chat).toHaveBeenCalledWith('compatible-model');
    expect(openai).not.toHaveBeenCalled();
  });

  it('passes a compatible endpoint to the Anthropic provider', () => {
    const anthropicModel = { id: 'anthropic-model' };
    const anthropic = vi.fn().mockReturnValue(anthropicModel);
    mocks.createAnthropic.mockReturnValue(anthropic);

    expect(createModel('anthropic', 'claude-compatible', 'anthropic-key', 'https://example.test/anthropic')).toBe(
      anthropicModel,
    );
    expect(mocks.createAnthropic).toHaveBeenCalledWith({
      apiKey: 'anthropic-key',
      baseURL: 'https://example.test/anthropic',
    });
    expect(anthropic).toHaveBeenCalledWith('claude-compatible');
  });
});
