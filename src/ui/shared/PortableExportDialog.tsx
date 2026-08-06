import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { downloadBlob } from '@/core/export/download';
import { GUIDE_IMPACTS } from '@/core/guides/impact';
import { exportTaskStitchGuide, taskStitchFilename } from '@/core/guides/portable';
import { updateGuideImpact } from '@/core/guides/service';
import type { Guide, GuideImpact, Screenshot, Step } from '@/core/guides/types';
import { Button } from '@/ui/components/ui/button';

export function PortableExportDialog({
  guide,
  steps,
  screenshots,
  onClose,
}: {
  guide: Guide;
  steps: Step[];
  screenshots: Map<string, Screenshot>;
  onClose: () => void;
}) {
  const [impact, setImpact] = useState<GuideImpact | ''>(
    guide.impact && guide.impact !== 'unknown' ? guide.impact : '',
  );
  const [impactNote, setImpactNote] = useState(guide.impactNote ?? '');
  const [exporting, setExporting] = useState(false);
  const choices = GUIDE_IMPACTS.filter((item) => item.value !== 'unknown');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Export interactive guide</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Classify what following this guide can do.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            {choices.map((choice) => {
              const selected = impact === choice.value;
              const stripe =
                choice.tone === 'safe' ? 'bg-success' : choice.tone === 'danger' ? 'bg-destructive' : 'bg-amber-500';
              return (
                <label
                  key={choice.value}
                  className={`relative flex cursor-pointer gap-3 overflow-hidden rounded-xl border p-3.5 pl-5 transition-colors ${selected ? 'border-accent bg-secondary/35' : 'border-border hover:border-accent/50'}`}
                >
                  <span className={`absolute inset-y-0 left-0 w-1 ${stripe}`} />
                  <input
                    type="radio"
                    name="guide-impact"
                    value={choice.value}
                    checked={selected}
                    onChange={() => setImpact(choice.value)}
                    className="mt-0.5 accent-accent"
                  />
                  <span>
                    <span className="block text-xs font-bold text-foreground">{choice.label}</span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
                      {choice.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-foreground">Safety note (optional)</span>
            <textarea
              value={impactNote}
              maxLength={500}
              rows={3}
              onChange={(event) => setImpactNote(event.target.value)}
              placeholder="Example: Creates a test customer in the AU sandbox."
              className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </label>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            The package includes screenshots and Guide Me targeting data. Captured typed values are replaced with
            “[redacted input]”.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-border bg-secondary/20 px-5 py-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!impact || exporting}
            onClick={async () => {
              if (!impact) return;
              setExporting(true);
              try {
                const blob = await exportTaskStitchGuide(guide, steps, screenshots, impact, impactNote);
                await updateGuideImpact(guide.id, impact, impactNote);
                downloadBlob(blob, taskStitchFilename(guide.title));
                onClose();
              } finally {
                setExporting(false);
              }
            }}
          >
            <Download size={14} /> {exporting ? 'Preparing…' : 'Download .taskstitch'}
          </Button>
        </div>
      </div>
    </div>
  );
}
