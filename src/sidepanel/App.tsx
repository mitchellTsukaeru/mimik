import { useState, useEffect } from 'react';

export default function App() {
  const [isAlive, setIsAlive] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
      if (response?.alive) setIsAlive(true);
    });
  }, []);

  return (
    <div className="p-4 min-h-screen bg-white">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Mimik</h1>
      <p className="text-sm text-gray-600 mb-2">
        Auto-capture browser workflows into step-by-step guides.
      </p>
      <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
        <p className="text-xs text-gray-500">
          Service Worker: {isAlive ? '✓ Connected' : '... Connecting'}
        </p>
      </div>
      <button
        className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        disabled
      >
        Start Recording (Phase 2)
      </button>
    </div>
  );
}
