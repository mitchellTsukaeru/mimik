import { useState, useEffect, useCallback } from 'react';
import LibraryView from './LibraryView';
import GuideEditor from './GuideEditor';

type View = { name: 'library' } | { name: 'editor'; guideId: string } | { name: 'recording' };

export default function App() {
  const [isAlive, setIsAlive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [view, setView] = useState<View>({ name: 'library' });

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
      if (response?.alive) setIsAlive(true);
    });

    const interval = setInterval(() => {
      chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
        if (response?.state === 'recording') {
          setIsRecording(true);
          if (response.stepCount !== undefined) {
            setStepCount(response.stepCount);
          }
          setView({ name: 'recording' });
        } else {
          if (isRecording) {
          }
          setIsRecording(false);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = useCallback(async () => {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const url = tabs[0]?.url || '';

    chrome.runtime.sendMessage(
      { type: 'START_RECORDING', url },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Mimik] START_RECORDING error', chrome.runtime.lastError);
          return;
        }
        if (response?.guideId) {
          setIsRecording(true);
          setStepCount(0);
          setView({ name: 'recording' });
        }
      }
    );
  }, []);

  const handleStopRecording = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'STOP_RECORDING' }, (response) => {
      if (response?.success) {
        setIsRecording(false);
        setStepCount(0);
        if (response.guideId) {
          setView({ name: 'editor', guideId: response.guideId });
        } else {
          setView({ name: 'library' });
        }
      }
    });
  }, []);

  if (view.name === 'editor') {
    return (
      <GuideEditor
        guideId={view.guideId}
        onBack={() => setView({ name: 'library' })}
      />
    );
  }

  if (view.name === 'library' && !isRecording) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Mimik</h1>
          <span className="text-xs text-gray-400">
            {isAlive ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        <LibraryView
          onOpen={(guideId) => setView({ name: 'editor', guideId })}
          onStartRecording={handleStartRecording}
          isAlive={isAlive}
        />
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-white">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Mimik</h1>
      <p className="text-sm text-gray-600 mb-2">
        Auto-capture browser workflows into step-by-step guides.
      </p>
      <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
        <p className="text-xs text-gray-500">
          Service Worker: {isAlive ? 'Connected' : '... Connecting'}
        </p>
        {isRecording && (
          <p className="text-xs text-red-600 mt-1 font-medium">
            Recording... {stepCount} step{stepCount !== 1 ? 's' : ''} captured
          </p>
        )}
      </div>

      <button
        onClick={handleStopRecording}
        className="mt-4 w-full py-2 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
      >
        Stop Recording
      </button>
    </div>
  );
}
