import { generateText } from 'ai';
import { isSimpleUnformattedDocument } from '@/core/guides/rich-text';
import type { Guide, Screenshot, Step } from '@/core/guides/types';
import { getDefaultAIModel } from './models';
import { getLanguageSuffix } from './prompts';
import { createModel } from './provider';

export interface GuideImprovementProposal {
  baselineTitle: string;
  proposedTitle?: string;
  descriptions: Array<{ stepId: string; original: string; proposed: string }>;
  screenshotsSent: number;
}

export interface ImproveSettings {
  apiKey: string;
  provider: string;
  model?: string;
  baseUrl?: string;
  language?: string;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function selectTextSteps(steps: Step[]): Step[] {
  if (steps.length <= 100) return steps;
  const selected = new Map<string, Step>();
  for (const step of steps.slice(0, 40)) selected.set(step.id, step);
  for (const step of steps.slice(-40)) selected.set(step.id, step);
  const middle = steps.slice(40, -40);
  for (let index = 0; index < 20 && middle.length; index++) {
    selected.set(
      middle[Math.floor((index * (middle.length - 1)) / 19)].id,
      middle[Math.floor((index * (middle.length - 1)) / 19)],
    );
  }
  for (let index = 1; index < steps.length; index++) {
    if (hostname(steps[index].url) !== hostname(steps[index - 1].url)) selected.set(steps[index].id, steps[index]);
  }
  return [...selected.values()].sort((a, b) => a.index - b.index);
}

export function selectRepresentativeSteps(steps: Step[], screenshots: Map<string, Screenshot>): Step[] {
  const available = steps.filter((step) => screenshots.has(step.id));
  if (available.length <= 8) return available;
  const selected = new Map<string, Step>();
  selected.set(available[0].id, available[0]);
  selected.set(available.at(-1)!.id, available.at(-1)!);
  for (let index = 1; index < available.length && selected.size < 8; index++) {
    if (hostname(available[index].url) !== hostname(available[index - 1].url))
      selected.set(available[index].id, available[index]);
  }
  for (let index = 1; selected.size < 8 && index < available.length - 1; index++) {
    const candidate = available[Math.round((index * (available.length - 1)) / 8)];
    selected.set(candidate.id, candidate);
  }
  return [...selected.values()].sort((a, b) => a.index - b.index).slice(0, 8);
}

async function imagePart(screenshot: Screenshot) {
  const bitmap = await createImageBitmap(screenshot.blob);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Screenshot processing unavailable');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
  return new Uint8Array(await blob.arrayBuffer());
}

function safeTarget(step: Step): string {
  const meta = step.elementMeta;
  return (
    meta?.ariaLabel ||
    meta?.placeholder ||
    meta?.textContent ||
    meta?.name ||
    meta?.role ||
    meta?.tag ||
    ''
  ).slice(0, 100);
}

function safeDescription(step: Step): string {
  if (!step.inputValue) return step.description;
  return step.description.split(step.inputValue).join('[redacted]');
}

function parseProposal(
  text: string,
  guide: Guide,
  eligible: Step[],
  screenshotsSent: number,
): GuideImprovementProposal {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  const parsed = JSON.parse(cleaned) as { title?: unknown; descriptions?: unknown };
  const eligibleById = new Map(eligible.map((step) => [step.id, step]));
  const descriptions: GuideImprovementProposal['descriptions'] = [];
  if (Array.isArray(parsed.descriptions)) {
    for (const item of parsed.descriptions) {
      if (!item || typeof item !== 'object') continue;
      const id = (item as { stepId?: unknown }).stepId;
      const proposed = (item as { proposed?: unknown }).proposed;
      if (typeof id !== 'string' || typeof proposed !== 'string') continue;
      const step = eligibleById.get(id);
      const trimmed = proposed.trim();
      if (step && trimmed && trimmed !== step.description)
        descriptions.push({ stepId: id, original: step.description, proposed: trimmed.slice(0, 500) });
    }
  }
  const title = typeof parsed.title === 'string' ? parsed.title.trim().slice(0, 70) : '';
  if (!title && descriptions.length === 0) throw new Error('AI returned no usable improvements');
  return {
    baselineTitle: guide.title,
    proposedTitle: title && title !== guide.title ? title : undefined,
    descriptions,
    screenshotsSent,
  };
}

export async function improveGuide(
  guide: Guide,
  steps: Step[],
  screenshots: Map<string, Screenshot>,
  settings: ImproveSettings,
  includeScreenshots: boolean,
): Promise<GuideImprovementProposal> {
  const contextSteps = selectTextSteps(steps);
  const eligible = steps.filter(
    (step) => (step.kind ?? 'captured') === 'captured' && isSimpleUnformattedDocument(step.richDescription),
  );
  const formatted = contextSteps
    .map(
      (step) =>
        `${step.index + 1}. id=${step.id} host=${hostname(step.url) || 'none'} action=${step.action} target=${JSON.stringify(safeTarget(step))} description=${JSON.stringify(safeDescription(step))}`,
    )
    .join('\n');
  const prompt = `Improve this browser workflow guide. Propose a specific task-focused title under 60 characters and concise imperative descriptions only for eligible captured steps. Do not merely repeat a hostname. Return strict JSON: {"title":"...","descriptions":[{"stepId":"...","proposed":"..."}]}.\n\nSteps:\n${formatted}${getLanguageSuffix(settings.language || 'en')}`;
  const visualSteps = includeScreenshots ? selectRepresentativeSteps(steps, screenshots) : [];
  const content: Array<{ type: 'text'; text: string } | { type: 'image'; image: Uint8Array; mediaType: 'image/jpeg' }> =
    [{ type: 'text', text: prompt }];
  for (const step of visualSteps) {
    content.push({ type: 'text', text: `Screenshot for step ${step.index + 1}: ${safeDescription(step)}` });
    content.push({ type: 'image', image: await imagePart(screenshots.get(step.id)!), mediaType: 'image/jpeg' });
  }
  const { text } = await generateText({
    model: createModel(
      settings.provider,
      settings.model || getDefaultAIModel(settings.provider),
      settings.apiKey,
      settings.baseUrl,
    ),
    messages: [{ role: 'user', content }],
    maxOutputTokens: Math.min(2000, 150 + eligible.length * 45),
  });
  return parseProposal(text, guide, eligible, visualSteps.length);
}
