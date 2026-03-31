import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogOverlay, DialogPortal } from '@/ui/components/ui/dialog';
import { Input } from '@/ui/components/ui/input';
import { getGuides, getFirstStepUrl } from '@/core/guides/service';
import type { Guide } from '@/core/guides/types';
import { useFullviewStore } from '@/stores/fullview';
import { getFaviconUrl } from '@/lib/utils';
import { navigate } from './router';
import SearchResults from './components/SearchResults';
import KeyboardHints from './components/KeyboardHints';

interface GuideResult { guide: Guide; favicon: string }

export default function SearchModal() {
  const open = useFullviewStore((s) => s.searchOpen);
  const setSearchOpen = useFullviewStore((s) => s.setSearchOpen);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GuideResult[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadResults = useCallback(async () => {
    const guides = await getGuides();
    const withFavicons = await Promise.all(
      guides.map(async (guide) => {
        const url = await getFirstStepUrl(guide.id);
        return { guide, favicon: url ? getFaviconUrl(url) : '' };
      }),
    );
    setResults(withFavicons);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      loadResults();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, loadResults]);

  const filtered = query
    ? results.filter((r) => r.guide.title.toLowerCase().includes(query.toLowerCase()))
    : results;

  const handleSelect = useCallback((guideId: string) => {
    setSearchOpen(false);
    navigate({ page: 'guide', guideId });
  }, [setSearchOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[selected]) handleSelect(filtered[selected].guide.id); }
  }, [filtered, selected, handleSelect]);

  return (
    <Dialog open={open} onOpenChange={setSearchOpen}>
      <DialogPortal>
        <DialogOverlay className="!bg-transparent backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-[640px] rounded-xl overflow-hidden bg-card shadow-lg"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search size={18} className="text-accent shrink-0" />
              <Input
                ref={inputRef}
                placeholder="Search guides..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                className="flex-1 text-[15px] font-medium border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 h-auto text-foreground"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-0.5 rounded text-warm">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="max-h-[320px] overflow-y-auto py-1">
              <SearchResults
                results={filtered}
                query={query}
                selected={selected}
                onSelect={handleSelect}
                onHover={setSelected}
              />
            </div>
            <KeyboardHints />
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
