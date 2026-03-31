import { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, LayoutList, FileText } from 'lucide-react';
import { getGuides, getStarredGuides, getTrashedGuides, softDeleteGuide, permanentlyDeleteGuide, restoreGuide, toggleStar, getFirstScreenshot, onGuidesChanged, type GuideChangeEvent } from '@/core/guides/service';
import type { Guide, Screenshot } from '@/core/guides/types';
import { useFullviewStore } from '@/stores/fullview';
import { Button } from '@/ui/components/ui/button';
import GuideListView from './components/GuideListView';
import GuideGridView from './components/GuideGridView';

interface LibraryContentProps {
  category: 'all' | 'starred' | 'trash';
}

const titles: Record<string, string> = { all: 'All Guides', starred: 'Starred', trash: 'Trash' };
const emptyMessages: Record<string, string> = {
  all: 'No guides yet. Start a capture from the Mimik extension.',
  starred: 'No starred guides. Star a guide to find it quickly.',
  trash: 'Trash is empty.',
};

export default function LibraryContent({ category }: LibraryContentProps) {
  const setCounts = useFullviewStore((s) => s.setCounts);

  const [guides, setGuides] = useState<Guide[]>([]);
  const [thumbnails, setThumbnails] = useState<Map<string, Screenshot>>(new Map());
  const [loading, setLoading] = useState(true);
  const [display, setDisplay] = useState<'list' | 'grid'>(() =>
    (localStorage.getItem('mimik-display') as 'list' | 'grid') || 'list'
  );

  const refreshCounts = useCallback(async () => {
    const [all, starred, trashed] = await Promise.all([getGuides(), getStarredGuides(), getTrashedGuides()]);
    setCounts({ all: all.length, starred: starred.length, trash: trashed.length });
  }, [setCounts]);

  const loadGuides = useCallback(async () => {
    setLoading(true);
    const [all, starred, trashed] = await Promise.all([getGuides(), getStarredGuides(), getTrashedGuides()]);
    setCounts({ all: all.length, starred: starred.length, trash: trashed.length });

    const current = category === 'starred' ? starred : category === 'trash' ? trashed : all;
    setGuides(current);

    const thumbMap = new Map<string, Screenshot>();
    for (const guide of current.slice(0, 20)) {
      const screenshot = await getFirstScreenshot(guide.id);
      if (screenshot) thumbMap.set(guide.id, screenshot);
    }
    setThumbnails(thumbMap);
    setLoading(false);
  }, [category, setCounts]);

  useEffect(() => { loadGuides(); }, [loadGuides]);

  useEffect(() => onGuidesChanged((event: GuideChangeEvent) => {
    if (event.type === 'starred') {
      setGuides(prev => prev.map(g => g.id === event.id ? { ...g, starred: event.starred } : g));
      refreshCounts();
    } else {
      loadGuides();
    }
  }), [refreshCounts, loadGuides]);

  const toggleDisplay = () => {
    const next = display === 'list' ? 'grid' : 'list';
    setDisplay(next);
    localStorage.setItem('mimik-display', next);
  };

  const handleStar = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setGuides(prev => prev.map(g => g.id === id ? { ...g, starred: !g.starred } : g));
    await toggleStar(id);
    await refreshCounts();
  };
  const handleTrash = async (e: React.MouseEvent, id: string) => { e.stopPropagation(); await softDeleteGuide(id); await loadGuides(); };
  const handleRestore = async (e: React.MouseEvent, id: string) => { e.stopPropagation(); await restoreGuide(id); await loadGuides(); };
  const handlePermanentDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Permanently delete this guide? This cannot be undone.')) return;
    await permanentlyDeleteGuide(id); await loadGuides();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{titles[category]}</h2>
        <Button variant="outline" size="icon-sm" onClick={toggleDisplay} title={display === 'list' ? 'Grid view' : 'List view'}>
          {display === 'list' ? <LayoutGrid size={16} /> : <LayoutList size={16} />}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm py-12 text-center text-warm">Loading...</p>
      ) : guides.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={40} className="mx-auto mb-3 text-border" />
          <p className="text-lg text-muted-foreground">{emptyMessages[category]}</p>
        </div>
      ) : display === 'list' ? (
        <GuideListView
          guides={guides}
          category={category}
          onStar={handleStar}
          onTrash={handleTrash}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
        />
      ) : (
        <GuideGridView guides={guides} thumbnails={thumbnails} />
      )}
    </div>
  );
}
