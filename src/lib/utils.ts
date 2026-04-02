import { type ClassValue, clsx } from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { twMerge } from 'tailwind-merge';

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(ts: number): string {
  return dayjs(ts).format('MMM D, YYYY');
}

export function formatDateShort(ts: number): string {
  return dayjs(ts).format('MMM D');
}

export function formatRelativeTime(ts: number): string {
  return dayjs(ts).fromNow();
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function getMostCommonDomain(steps: { url?: string | null }[]): string {
  const counts = new Map<string, number>();
  for (const s of steps) {
    const d = extractDomain(s.url || '');
    if (d) counts.set(d, (counts.get(d) || 0) + 1);
  }
  let best = '';
  let max = 0;
  for (const [d, c] of counts) {
    if (c > max) {
      max = c;
      best = d;
    }
  }
  return best;
}

export function getFaviconUrl(url: string, size = 64): string {
  try {
    const full = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(full)}&size=${size}&drop_404_icon=true`;
  } catch {
    return '';
  }
}
