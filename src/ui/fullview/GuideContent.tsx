import { useState, useEffect, useCallback } from 'react';
import { getGuide, updateGuideTitle, updateStepDescription, deleteStep, updateScreenshotBlob } from '@/core/guides/service';
import type { Guide, Step, Screenshot } from '@/core/guides/types';
import { useFullviewStore } from '@/stores/fullview';
import { extractDomain } from '@/lib/utils';
import { Input } from '@/ui/components/ui/input';
import GuideStepList from './components/GuideStepList';
import BlurCanvas from '@/ui/sidepanel/BlurCanvas';

interface GuideContentProps {
  guideId: string;
}

interface GuideData {
  guide: Guide;
  steps: Step[];
  screenshots: Map<string, Screenshot>;
}

export default function GuideContent({ guideId }: GuideContentProps) {
  const setGuideTitle = useFullviewStore((s) => s.setGuideTitle);
  const setGuideExportData = useFullviewStore((s) => s.setGuideExportData);

  const [data, setData] = useState<GuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [blurringStepId, setBlurringStepId] = useState<string | null>(null);

  const loadGuide = useCallback(async () => {
    const result = await getGuide(guideId);
    if (result) {
      setData(result);
      setTitle(result.guide.title);
      document.title = `${result.guide.title} — Mimik`;
      setGuideTitle(result.guide.title);
      setGuideExportData({ guideId, ...result });
    }
    setLoading(false);
  }, [guideId, setGuideTitle, setGuideExportData]);

  useEffect(() => { loadGuide(); }, [loadGuide]);

  const handleTitleBlur = useCallback(async () => {
    if (!data || title === data.guide.title) return;
    await updateGuideTitle(guideId, title);
    setData((prev) => prev ? { ...prev, guide: { ...prev.guide, title } } : prev);
    document.title = `${title} — Mimik`;
  }, [data, guideId, title]);

  const handleDescriptionChange = useCallback(async (stepId: string, description: string) => {
    await updateStepDescription(stepId, description);
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, steps: prev.steps.map((s) => s.id === stepId ? { ...s, description } : s) };
    });
  }, []);

  const handleDeleteStep = useCallback(async (stepId: string) => {
    await deleteStep(guideId, stepId);
    await loadGuide();
  }, [guideId, loadGuide]);

  const handleBlurSave = useCallback(async (blob: Blob) => {
    if (!blurringStepId || !data) return;
    const screenshot = data.screenshots.get(blurringStepId);
    if (!screenshot) return;
    await updateScreenshotBlob(screenshot.id, blob);
    setData((prev) => {
      if (!prev) return prev;
      const newScreenshots = new Map(prev.screenshots);
      newScreenshots.set(blurringStepId, { ...screenshot, blob });
      return { ...prev, screenshots: newScreenshots };
    });
    setBlurringStepId(null);
  }, [blurringStepId, data]);

  if (loading) return <p className="text-sm py-12 text-center text-warm">Loading...</p>;
  if (!data) return <p className="text-sm py-12 text-center text-warm">Guide not found.</p>;

  const domain = extractDomain(data.steps[0]?.url || '');
  const blurScreenshot = blurringStepId ? data.screenshots.get(blurringStepId) : undefined;

  return (
    <div>
      {blurringStepId && blurScreenshot && (
        <BlurCanvas screenshot={blurScreenshot} onSave={handleBlurSave} onCancel={() => setBlurringStepId(null)} />
      )}

      <input
        value={title}
        onChange={(e) => { setTitle(e.target.value); setGuideTitle(e.target.value); }}
        onBlur={handleTitleBlur}
        className="text-[32px] font-extrabold bg-transparent border-b-2 border-transparent hover:border-border focus:outline-none focus:border-accent w-full p-0 h-auto text-foreground"
      />

      <p className="text-xs mt-1 mb-8 text-muted-foreground">
        Created {new Date(data.guide.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        {' · '}{data.steps.length} step{data.steps.length !== 1 ? 's' : ''}
        {domain ? ` · ${domain}` : ''}
      </p>

      <GuideStepList
        guideId={guideId}
        steps={data.steps}
        screenshots={data.screenshots}
        onDescriptionChange={handleDescriptionChange}
        onDelete={handleDeleteStep}
        onBlur={(stepId) => setBlurringStepId(stepId)}
        onReorder={(newSteps) => setData((prev) => prev ? { ...prev, steps: newSteps } : prev)}
      />
    </div>
  );
}
