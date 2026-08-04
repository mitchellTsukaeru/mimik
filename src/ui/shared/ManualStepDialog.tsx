import type { JSONContent } from '@tiptap/core';
import { ImagePlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { plainTextDocument, richTextToPlainText } from '@/core/guides/rich-text';
import type { Screenshot } from '@/core/guides/types';
import { Button } from '@/ui/components/ui/button';
import { normalizeManualImage } from './manual-image';
import { RichTextEditor } from './RichTextEditor';

interface ManualStepDialogProps {
  onCancel: () => void;
  onAdd: (content: JSONContent, screenshot?: Omit<Screenshot, 'id' | 'stepId'>) => Promise<void>;
}

export function ManualStepDialog({ onCancel, onAdd }: ManualStepDialogProps) {
  const [content, setContent] = useState<JSONContent>(() => plainTextDocument(''));
  const [screenshot, setScreenshot] = useState<Omit<Screenshot, 'id' | 'stepId'>>();
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function acceptImage(file: Blob) {
    setError('');
    try {
      const next = await normalizeManualImage(file);
      if (preview) URL.revokeObjectURL(preview);
      setScreenshot(next);
      setPreview(URL.createObjectURL(next.blob));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Image import failed');
    }
  }

  const canAdd = Boolean(richTextToPlainText(content) || screenshot);

  return (
    <div
      className="fixed inset-0 z-50 bg-deep/35 backdrop-blur-[2px] flex items-center justify-center p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onCancel()}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onPaste={(event) => {
          const image = Array.from(event.clipboardData.items)
            .find((item) => item.type.startsWith('image/'))
            ?.getAsFile();
          if (image) void acceptImage(image);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const image = Array.from(event.dataTransfer.files).find((file) => file.type.startsWith('image/'));
          if (image) void acceptImage(image);
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/40">
          <div>
            <h2 className="text-sm font-bold text-foreground">Add guide step</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Add context, a screenshot, or both.</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-border p-3 min-h-28 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10">
            <RichTextEditor content={content} onChange={(next) => setContent(next)} autoFocus />
          </div>
          {preview ? (
            <div className="relative rounded-xl border border-border overflow-hidden bg-secondary">
              <img src={preview} alt="Manual step preview" className="max-h-64 w-full object-contain" />
              <button
                onClick={() => {
                  URL.revokeObjectURL(preview);
                  setPreview('');
                  setScreenshot(undefined);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-card/90 text-destructive shadow"
                aria-label="Remove screenshot"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-border px-4 py-5 text-xs text-muted-foreground hover:border-accent hover:text-accent hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
            >
              <ImagePlus size={16} /> Upload, paste, or drop a screenshot
            </button>
          )}
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => event.target.files?.[0] && void acceptImage(event.target.files[0])}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2 bg-secondary/20">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={!canAdd || saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onAdd(content, screenshot);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? 'Adding…' : 'Add step'}
          </Button>
        </div>
      </div>
    </div>
  );
}
