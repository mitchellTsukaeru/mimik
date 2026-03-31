import { useState, useEffect } from 'react';
import { localStorage } from '@/lib/browser-api';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.get(['aiApiKey', 'aiProvider']).then((result) => {
      if (result.aiApiKey) setApiKey(result.aiApiKey as string);
      if (result.aiProvider) setProvider(result.aiProvider as 'openai' | 'anthropic');
    });
  }, []);

  const handleSave = async () => {
    await localStorage.set({ aiApiKey: apiKey, aiProvider: provider });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-lg font-bold text-foreground mb-4">Mimik Settings</h1>

      <div className="space-y-4">
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-foreground mb-1">
            AI Provider
          </label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'openai' | 'anthropic')}
            className="w-full border border-border rounded-md px-3 py-2 text-sm text-foreground bg-card"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-foreground mb-1">
            API Key
          </label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Your key is stored locally and never sent to any server except the AI provider.
          </p>
        </div>

        <Button onClick={handleSave} className="w-full">
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
