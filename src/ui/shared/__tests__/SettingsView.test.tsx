// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsView from '../SettingsView';

const { storageGet, storageSet } = vi.hoisted(() => ({
  storageGet: vi.fn(),
  storageSet: vi.fn(),
}));

vi.mock('@/lib/browser-api', () => ({
  localStorage: {
    get: storageGet,
    set: storageSet,
  },
}));

describe('SettingsView AI configuration', () => {
  beforeEach(() => {
    storageGet.mockReset();
    storageSet.mockReset();
    storageGet.mockResolvedValue({});
    storageSet.mockResolvedValue(undefined);
  });

  it('offers Japanese descriptions', async () => {
    render(<SettingsView />);

    const language = await screen.findByLabelText('settings.aiLanguage');
    expect(language.textContent).toContain('日本語');
  });

  it('loads and saves a custom model ID without changing the direct BYOK settings shape', async () => {
    storageGet.mockResolvedValue({
      aiApiKey: 'local-test-key',
      aiProvider: 'openai',
      aiModel: 'ft:gpt-5.6-luna:example:guide-writer',
      aiLanguage: 'ja',
    });

    render(<SettingsView />);

    const modelChoice = (await screen.findByLabelText('settings.model')) as HTMLSelectElement;
    expect(modelChoice.value).toBe('__custom__');

    const customModel = screen.getByLabelText('settings.customModelId') as HTMLInputElement;
    expect(customModel.value).toBe('ft:gpt-5.6-luna:example:guide-writer');
    fireEvent.change(customModel, { target: { value: 'gpt-5.6-custom-team-model' } });
    fireEvent.click(screen.getByRole('button', { name: 'settings.saveSettings' }));

    await waitFor(() => {
      expect(storageSet).toHaveBeenCalledWith(
        expect.objectContaining({
          aiApiKey: 'local-test-key',
          aiProvider: 'openai',
          aiModel: 'gpt-5.6-custom-team-model',
          aiLanguage: 'ja',
        }),
      );
    });
  });
});
