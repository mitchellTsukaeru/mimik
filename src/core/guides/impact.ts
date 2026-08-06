import type { GuideImpact } from './types';

export const GUIDE_IMPACTS: Array<{
  value: GuideImpact;
  label: string;
  shortLabel: string;
  description: string;
  tone: 'safe' | 'warning' | 'danger' | 'neutral';
}> = [
  {
    value: 'read_only',
    label: 'View only',
    shortLabel: 'View only',
    description: 'Navigation and viewing only. The workflow does not intentionally change data.',
    tone: 'safe',
  },
  {
    value: 'makes_changes',
    label: 'Makes changes',
    shortLabel: 'Makes changes',
    description: 'The workflow can create, edit, send, publish, or provision something.',
    tone: 'warning',
  },
  {
    value: 'destructive',
    label: 'Destructive or sensitive',
    shortLabel: 'Destructive',
    description: 'The workflow can delete, disable, revoke, overwrite, or make a difficult-to-reverse change.',
    tone: 'danger',
  },
  {
    value: 'unknown',
    label: 'Not classified',
    shortLabel: 'Not classified',
    description: 'The effect has not been reviewed. Treat this guide as potentially able to make changes.',
    tone: 'neutral',
  },
];

export function guideImpact(value: GuideImpact | undefined) {
  return GUIDE_IMPACTS.find((impact) => impact.value === (value ?? 'unknown')) ?? GUIDE_IMPACTS.at(-1)!;
}
