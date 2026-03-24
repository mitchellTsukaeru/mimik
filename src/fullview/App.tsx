import { useState, useCallback } from 'react';
import { useRoute } from './router';
import Sidebar from './Sidebar';
import LibraryContent from './LibraryContent';
import GuideContent from './GuideContent';
import type { Step } from '../shared/types';

export default function FullViewApp() {
  const route = useRoute();
  const [counts, setCounts] = useState({ all: 0, starred: 0, trash: 0 });

  const [guideSteps, setGuideSteps] = useState<Step[]>([]);
  const [guideDomain, setGuideDomain] = useState('');
  const [guideFavicon, setGuideFavicon] = useState('');
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [scrollToStepId, setScrollToStepId] = useState<string | null>(null);

  const handleStepsLoaded = useCallback((steps: Step[], domain: string, favicon: string) => {
    setGuideSteps(steps);
    setGuideDomain(domain);
    setGuideFavicon(favicon);
  }, []);

  const handleStepClick = useCallback((stepId: string) => {
    setScrollToStepId(stepId);
    setTimeout(() => setScrollToStepId(null), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        route={route}
        guideCounts={counts}
        guideSteps={route.page === 'guide' ? guideSteps : undefined}
        guideDomain={guideDomain}
        guideFavicon={guideFavicon}
        activeStepId={activeStepId}
        onStepClick={handleStepClick}
      />
      <main className="ml-60 p-8">
        {route.page === 'library' && (
          <LibraryContent category={route.category} onCountsChange={setCounts} />
        )}
        {route.page === 'guide' && (
          <div className="max-w-3xl">
            <GuideContent
              guideId={route.guideId}
              onStepsLoaded={handleStepsLoaded}
              scrollToStepId={scrollToStepId}
              onActiveStepChange={setActiveStepId}
            />
          </div>
        )}
      </main>
    </div>
  );
}
