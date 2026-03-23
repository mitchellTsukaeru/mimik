import { useState, useEffect, useCallback } from 'react';
import { Video } from 'lucide-react';
import LibraryView from './LibraryView';
import GuideEditor from './GuideEditor';
import RecordingView from './RecordingView';

type View =
  | { name: 'library' }
  | { name: 'editor'; guideId: string }
  | { name: 'recording'; guideId: string };

export default function App() {
  const [isAlive, setIsAlive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [view, setView] = useState<View>({ name: 'library' });

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
      if (response?.alive) setIsAlive(true);
    });

    const interval = setInterval(() => {
      chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response?.state === 'recording') {
          setIsRecording(true);
          if (response.currentGuideId) {
            setView(prev => {
              if (prev.name === 'recording') return prev;
              return { name: 'recording', guideId: response.currentGuideId };
            });
          }
        } else {
          setIsRecording(false);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
          setView({ name: 'recording', guideId: response.guideId });
        }
      }
    );
  }, []);

  const handleStopRecording = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'STOP_RECORDING' }, (response) => {
      if (response?.success) {
        setIsRecording(false);
        if (response.guideId) {
          setView({ name: 'editor', guideId: response.guideId });
        } else {
          setView({ name: 'library' });
        }
      }
    });
  }, []);

  if (view.name === 'recording') {
    return (
      <RecordingView
        guideId={view.guideId}
        onStop={handleStopRecording}
      />
    );
  }

  if (view.name === 'editor') {
    return (
      <GuideEditor
        guideId={view.guideId}
        onBack={() => setView({ name: 'library' })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mimik</h1>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isAlive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            {isAlive ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        {/* Start Capture button */}
        <button
          onClick={handleStartRecording}
          disabled={!isAlive}
          className="w-full py-3.5 px-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 active:bg-blue-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
        >
          <Video size={20} />
          Start Capture
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Recent guides */}
      <div className="px-5 pt-3 pb-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recent</p>
      </div>
      <LibraryView
        onOpen={(guideId) => setView({ name: 'editor', guideId })}
        isAlive={isAlive}
      />
    </div>
  );
}
