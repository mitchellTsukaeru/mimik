import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStorage: Record<string, unknown> = {};
const chromeMock = {
  storage: {
    local: {
      get: vi.fn((keys: string[]) =>
        Promise.resolve(
          Object.fromEntries(keys.filter(k => k in mockStorage).map(k => [k, mockStorage[k]]))
        )
      ),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
    },
  },
};
vi.stubGlobal('chrome', chromeMock);

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/options/App';

describe('Settings Page', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
    vi.clearAllMocks();
  });

  it('renders provider dropdown with openai and anthropic options', () => {
    render(<App />);
    const select = screen.getByLabelText(/provider/i);
    expect(select).toBeDefined();
    const options = select.querySelectorAll('option');
    const values = Array.from(options).map(o => o.value);
    expect(values).toContain('openai');
    expect(values).toContain('anthropic');
  });

  it('renders API key input with type password', () => {
    render(<App />);
    const input = screen.getByLabelText(/api key/i);
    expect(input.getAttribute('type')).toBe('password');
  });

  it('saves API key and provider to chrome.storage.local', async () => {
    render(<App />);
    const input = screen.getByLabelText(/api key/i);
    const select = screen.getByLabelText(/provider/i);
    const button = screen.getByRole('button', { name: /save/i });

    fireEvent.change(input, { target: { value: 'sk-test-key-123' } });
    fireEvent.change(select, { target: { value: 'anthropic' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
        aiApiKey: 'sk-test-key-123',
        aiProvider: 'anthropic',
      });
    });
  });

  it('loads existing values on mount', async () => {
    mockStorage.aiApiKey = 'existing-key';
    mockStorage.aiProvider = 'anthropic';

    render(<App />);

    await waitFor(() => {
      const input = screen.getByLabelText(/api key/i) as HTMLInputElement;
      expect(input.value).toBe('existing-key');
    });
  });
});
