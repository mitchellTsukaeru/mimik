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

export function getFaviconUrl(url: string): string {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
  } catch {
    return '';
  }
}
