import { useEffect, useRef, useState } from 'react';
import { renderScreenshotVariants } from '@/core/export/screenshot-renderer';
import type { Screenshot } from '@/core/guides/types';

interface ZoomScreenshotProps {
  screenshot: Screenshot;
  className?: string;
  alt?: string;
  animate?: boolean;
  crop?: boolean;
}

async function renderScreenshot(
  screenshot: Screenshot,
): Promise<{ fullUrl: string; croppedUrl: string } | { fullUrl: string; croppedUrl: null }> {
  const { fullBlob, croppedBlob } = await renderScreenshotVariants(screenshot);
  return {
    fullUrl: URL.createObjectURL(fullBlob),
    croppedUrl: croppedBlob ? URL.createObjectURL(croppedBlob) : null,
  };
}

export default function ZoomScreenshot({
  screenshot,
  className = '',
  alt = '',
  animate = false,
  crop = false,
}: ZoomScreenshotProps) {
  const [fullUrl, setFullUrl] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [showCropped, setShowCropped] = useState(false);
  const processedKeyRef = useRef<string | null>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!screenshot.blob) return;
    const cacheKey = `${screenshot.id}:${screenshot.blob.size}`;
    if (processedKeyRef.current === cacheKey) return;

    let cancelled = false;

    (async () => {
      const result = await renderScreenshot(screenshot);
      if (cancelled) {
        URL.revokeObjectURL(result.fullUrl);
        if (result.croppedUrl) URL.revokeObjectURL(result.croppedUrl);
        return;
      }

      processedKeyRef.current = cacheKey;

      for (const u of urlsRef.current) URL.revokeObjectURL(u);

      if (crop && result.croppedUrl) {
        urlsRef.current = [result.fullUrl, result.croppedUrl];
        setShowCropped(false);
        setFullUrl(result.fullUrl);
        setCroppedUrl(result.croppedUrl);
      } else {
        if (result.croppedUrl) URL.revokeObjectURL(result.croppedUrl);
        urlsRef.current = [result.fullUrl];
        setShowCropped(true);
        setFullUrl(result.fullUrl);
        setCroppedUrl(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [screenshot, crop]);

  useEffect(() => {
    if (!croppedUrl || showCropped) return;
    if (!animate) {
      setShowCropped(true);
      return;
    }
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => {
        setShowCropped(true);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [croppedUrl, showCropped, animate]);

  useEffect(() => {
    return () => {
      for (const u of urlsRef.current) URL.revokeObjectURL(u);
    };
  }, []);

  const ratio = screenshot.width && screenshot.height ? screenshot.width / screenshot.height : 16 / 9;

  if (!fullUrl) {
    return (
      <div className={`rounded-lg bg-secondary p-4 flex flex-col gap-2.5 ${className}`} style={{ aspectRatio: ratio }}>
        <div className="h-7 rounded-md bg-border/60 animate-pulse" />
        <div className="flex-1 flex gap-3">
          <div className="w-[30%] flex flex-col gap-2">
            <div className="h-5 rounded bg-border/50 animate-pulse [animation-delay:100ms]" />
            <div className="h-4 rounded bg-border/40 animate-pulse [animation-delay:200ms]" />
            <div className="h-4 rounded bg-border/40 animate-pulse [animation-delay:300ms]" />
            <div className="h-4 rounded bg-border/40 animate-pulse [animation-delay:400ms]" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-6 w-3/5 rounded bg-border/40 animate-pulse [animation-delay:150ms]" />
            <div className="h-3 w-4/5 rounded bg-border/30 animate-pulse [animation-delay:250ms]" />
            <div className="h-3 w-[70%] rounded bg-border/30 animate-pulse [animation-delay:350ms]" />
            <div className="h-3 w-3/4 rounded bg-border/30 animate-pulse [animation-delay:450ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border border-border ${className}`}>
      <img src={croppedUrl || fullUrl} alt={alt} className="w-full block" />
      {croppedUrl && (
        <img
          src={fullUrl}
          alt=""
          className="absolute inset-0 w-full h-full block"
          style={{
            opacity: showCropped ? 0 : 1,
            transition: 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      )}
    </div>
  );
}
