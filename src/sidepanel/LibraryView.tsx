import { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { getGuides, deleteGuide } from '../shared/guide-service';
import type { Guide } from '../shared/types';

function formatRelativeTime(timestamp: number): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffMs = timestamp - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffMs / (1000 * 60));
  const diffHour = Math.round(diffMs / (1000 * 60 * 60));
  const diffDay = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
  return rtf.format(diffDay, 'day');
}

interface LibraryViewProps {
  onOpen: (guideId: string) => void;
  onStartRecording?: () => void;
  isAlive?: boolean;
}

export default function LibraryView({ onOpen, onStartRecording, isAlive }: LibraryViewProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGuides = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getGuides();
      setGuides(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGuides();
  }, [loadGuides]);

  const handleDelete = useCallback(async (e: React.MouseEvent, guideId: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this guide?')) return;
    await deleteGuide(guideId);
    await loadGuides();
  }, [loadGuides]);

  if (loading) {
    return <p className="text-sm text-gray-500 p-4">Loading...</p>;
  }

  return (
    <div className="flex flex-col">
      {guides.length === 0 ? (
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-4">
            No guides yet. Start recording to create your first guide.
          </p>
          {onStartRecording && (
            <button
              onClick={onStartRecording}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              disabled={!isAlive}
            >
              Start Recording
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                onClick={() => onOpen(guide.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{guide.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {guide.stepIds.length} step{guide.stepIds.length !== 1 ? 's' : ''} &middot; {formatRelativeTime(guide.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, guide.id)}
                  className="ml-2 p-1 rounded text-gray-400 hover:text-red-500 flex-shrink-0"
                  title="Delete guide"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {onStartRecording && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={onStartRecording}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                disabled={!isAlive}
              >
                New Recording
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
