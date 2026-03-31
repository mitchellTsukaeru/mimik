import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { getActiveTab } from '@/lib/browser-api';
import { getStepsForGuide, getScreenshotsForSteps, deleteStep } from '@/core/guides/service';
import type { Step, Screenshot } from '@/core/guides/types';
import ZoomScreenshot from './ZoomScreenshot';

interface RecordingViewProps {
  guideId: string;
  onStop: () => void;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function timeAgo(createdAt: number): string {
  const diff = Math.floor((Date.now() - createdAt) / 1000);
  if (diff < 3) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

interface LiveStep {
  step: Step;
  screenshot?: Screenshot;
}

export default function RecordingView({ guideId, onStop }: RecordingViewProps) {
  const [steps, setSteps] = useState<LiveStep[]>([]);
  const [siteUrl, setSiteUrl] = useState('');
  const [, setTick] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadSteps = useCallback(async () => {
    const allSteps = await getStepsForGuide(guideId);
    const screenshotIds = allSteps.map(s => s.screenshotId).filter(Boolean) as string[];
    const screenshotMap = await getScreenshotsForSteps(screenshotIds);

    setSteps(allSteps.map(step => ({
      step,
      screenshot: screenshotMap.get(step.id),
    })));

    if (allSteps.length > 0 && !siteUrl) {
      setSiteUrl(allSteps[0].url || '');
    }
  }, [guideId, siteUrl]);

  useEffect(() => {
    loadSteps();
    const interval = setInterval(loadSteps, 800);
    return () => clearInterval(interval);
  }, [loadSteps]);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const scroll = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    scroll();
    const t1 = setTimeout(scroll, 300);
    const t2 = setTimeout(scroll, 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [steps.length]);

  useEffect(() => {
    getActiveTab().then(tab => {
      if (tab?.url) setSiteUrl(tab.url);
    });
  }, []);

  const handleDeleteStep = useCallback(async (stepId: string) => {
    await deleteStep(guideId, stepId);
    await loadSteps();
  }, [guideId, loadSteps]);

  const domain = extractDomain(siteUrl);
  return (
    <div className="flex flex-col h-screen bg-white relative">
      {/* Floating recording pill */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border shadow-sm" style={{ borderColor: '#E8E2DA' }}>
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-semibold" style={{ color: '#451a03' }}>
          Recording · {steps.length} {steps.length === 1 ? 'step' : 'steps'}
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto pt-12">
        {steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-1">
            <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Ready to capture!</span>
            <span className="text-xs" style={{ color: '#d1d5db' }}>Click on the page to start</span>
          </div>
        ) : (
          <div>
            {steps.map((liveStep, idx) => (
              <div key={liveStep.step.id}>
                {/* Post */}
                <div className="px-4 pb-4 group">
                  {liveStep.screenshot && (
                    <div className="mb-2">
                      <ZoomScreenshot
                        screenshot={liveStep.screenshot}
                        alt={liveStep.step.description}
                        className="shadow-sm"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-medium leading-snug" style={{ color: '#451a03' }}>
                        {liveStep.step.description}
                      </p>
                      <span className="text-[10px]" style={{ color: '#9ca3af' }}>
                        {timeAgo(liveStep.step.timestamp)} · {extractDomain(liveStep.step.url || siteUrl)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteStep(liveStep.step.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                      style={{ color: '#d1d5db' }}
                      title="Delete step"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
                {/* Divider */}
                {idx < steps.length - 1 && (
                  <div className="mx-4 mb-4" style={{ height: 1, background: '#E8E2DA' }} />
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 border-t px-4 py-2.5 flex items-center gap-2" style={{ borderColor: '#E8E2DA' }}>
        <button
          onClick={onStop}
          className="flex-1 h-10 rounded-full font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors"
          style={{ background: '#451a03', color: '#FDE68A' }}
        >
          <Check size={16} strokeWidth={3} />
          Finish Recording
        </button>
        <button
          onClick={onStop}
          className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:border-red-300 hover:text-red-400"
          style={{ borderColor: '#E8E2DA', color: '#9ca3af' }}
          title="Discard"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
