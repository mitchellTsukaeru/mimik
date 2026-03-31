import { useEffect } from 'react';
import { useRoute } from './router';
import { useFullviewStore } from '@/stores/fullview';
import TopNav from './TopNav';
import LibraryContent from './LibraryContent';
import GuideContent from './GuideContent';
import SearchModal from './SearchModal';

export default function FullViewApp() {
  const route = useRoute();
  const toggleSearch = useFullviewStore((s) => s.toggleSearch);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSearch]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav route={route} />
      <SearchModal />

      {route.page === 'library' && (
        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          <LibraryContent category={route.category} />
        </main>
      )}

      {route.page === 'guide' && (
        <main className="flex-1 py-10 px-6">
          <div className="max-w-[720px] mx-auto">
            <GuideContent guideId={route.guideId} />
          </div>
        </main>
      )}
    </div>
  );
}
