import { useState, useEffect, useCallback } from 'react';
import { Trash2, FileText, Star } from 'lucide-react';
import { getGuides, softDeleteGuide, toggleStar, getFirstStepUrl } from '@/core/guides/service';
import type { Guide } from '@/core/guides/types';
import { getFaviconUrl, extractDomain, formatRelativeTime } from '@/lib/utils';

interface LibraryViewProps {
  onOpen: (guideId: string) => void;
  onStartRecording?: () => void;
  isAlive?: boolean;
  searchQuery?: string;
}

interface GuideWithMeta extends Guide {
  favicon: string;
  domain: string;
}

export default function LibraryView({ onOpen, searchQuery = '' }: LibraryViewProps) {
  const [guides, setGuides] = useState<GuideWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGuides = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getGuides();
      const withMeta: GuideWithMeta[] = await Promise.all(
        result.map(async (guide) => {
          const url = await getFirstStepUrl(guide.id);
          return {
            ...guide,
            favicon: url ? getFaviconUrl(url) : '',
            domain: url ? extractDomain(url) : '',
          };
        })
      );
      setGuides(withMeta);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGuides(); }, [loadGuides]);

  const handleStar = useCallback(async (e: React.MouseEvent, guideId: string) => {
    e.stopPropagation();
    await toggleStar(guideId);
    await loadGuides();
  }, [loadGuides]);

  const handleDelete = useCallback(async (e: React.MouseEvent, guideId: string) => {
    e.stopPropagation();
    await softDeleteGuide(guideId);
    await loadGuides();
  }, [loadGuides]);

  const filtered = searchQuery
    ? guides.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : guides;

  if (loading) {
    return <p className="text-sm py-4 text-warm">Loading...</p>;
  }

  if (guides.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 bg-gold border border-amber-light">
          <FileText size={20} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No guides yet</p>
        <p className="text-xs mt-1 text-warm">Start a capture to create your first guide</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-warm">No matching guides</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-4">
      {filtered.map((guide) => (
        <div
          key={guide.id}
          className="flex items-center gap-3 px-3.5 py-3 rounded-lg cursor-pointer group transition-all border border-gold hover:border-accent hover:shadow-sm"
          onClick={() => onOpen(guide.id)}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden text-xs font-semibold bg-gold border border-amber-light text-brown">
            {guide.favicon ? (
              <img
                src={guide.favicon}
                alt=""
                className="w-5 h-5"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = 'none';
                  el.parentElement!.textContent = guide.title.charAt(0).toUpperCase();
                }}
              />
            ) : (
              guide.title.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{guide.title}</p>
            <p className="text-xs mt-0.5 text-warm">
              {guide.stepIds.length} step{guide.stepIds.length !== 1 ? 's' : ''} &middot; {formatRelativeTime(guide.updatedAt)}
            </p>
          </div>

          <div className="flex items-center gap-0.5 ml-1 shrink-0">
            <button
              onClick={(e) => handleStar(e, guide.id)}
              className={`p-1.5 rounded-lg transition-all hover:text-accent ${guide.starred ? 'opacity-100 text-accent' : 'opacity-0 group-hover:opacity-100 text-border'}`}
              title={guide.starred ? 'Unstar' : 'Star'}
            >
              <Star size={14} fill={guide.starred ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => handleDelete(e, guide.id)}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-border hover:text-red-500"
              title="Move to trash"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
