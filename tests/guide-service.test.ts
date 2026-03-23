import 'fake-indexeddb/auto';
import { beforeEach, describe, it, expect } from 'vitest';
import { db } from '../src/shared/db-schema';
import {
  getGuides,
  getGuide,
  deleteGuide,
  updateGuideTitle,
  updateStepDescription,
  deleteStep,
} from '../src/shared/guide-service';
import type { Guide, Step, Screenshot } from '../src/shared/types';

async function seedGuide(overrides: Partial<Guide> = {}): Promise<Guide> {
  const guide: Guide = {
    id: overrides.id ?? `guide-${Date.now()}-${Math.random()}`,
    title: overrides.title ?? 'Test Guide',
    createdAt: overrides.createdAt ?? Date.now(),
    updatedAt: overrides.updatedAt ?? Date.now(),
    stepIds: overrides.stepIds ?? [],
  };
  await db.guides.add(guide);
  return guide;
}

async function seedStep(guideId: string, overrides: Partial<Step> = {}): Promise<Step> {
  const step: Step = {
    id: overrides.id ?? `step-${Date.now()}-${Math.random()}`,
    guideId,
    index: overrides.index ?? 0,
    description: overrides.description ?? 'A test step',
    action: overrides.action ?? 'click',
    url: overrides.url ?? 'https://example.com',
    timestamp: overrides.timestamp ?? Date.now(),
    screenshotId: overrides.screenshotId,
  };
  await db.steps.add(step);
  return step;
}

async function seedScreenshot(stepId: string, id?: string): Promise<Screenshot> {
  const screenshot: Screenshot = {
    id: id ?? `screenshot-${Date.now()}-${Math.random()}`,
    stepId,
    blob: new Blob(['fake'], { type: 'image/png' }),
    mimeType: 'image/png',
    width: 800,
    height: 600,
  };
  await db.screenshots.add(screenshot);
  return screenshot;
}

beforeEach(async () => {
  await db.guides.clear();
  await db.steps.clear();
  await db.screenshots.clear();
  await db.rrwebEvents.clear();
});

describe('getGuides', () => {
  it('returns guides sorted by updatedAt descending', async () => {
    const older = await seedGuide({ id: 'g1', updatedAt: 1000 });
    const newer = await seedGuide({ id: 'g2', updatedAt: 2000 });

    const guides = await getGuides();
    expect(guides[0].id).toBe(newer.id);
    expect(guides[1].id).toBe(older.id);
  });

  it('returns empty array when no guides exist', async () => {
    const guides = await getGuides();
    expect(guides).toHaveLength(0);
  });
});

describe('getGuide', () => {
  it('returns guide with steps sorted by index and screenshots map', async () => {
    const guide = await seedGuide({ id: 'g1', stepIds: ['s1', 's2'] });
    const step1 = await seedStep('g1', { id: 's1', index: 0 });
    const step2 = await seedStep('g1', { id: 's2', index: 1 });
    const screenshot = await seedScreenshot('s1', 'sc1');
    await db.steps.update('s1', { screenshotId: 'sc1' });

    const result = await getGuide('g1');
    expect(result).not.toBeNull();
    expect(result!.guide.id).toBe(guide.id);
    expect(result!.steps[0].id).toBe(step1.id);
    expect(result!.steps[1].id).toBe(step2.id);
    expect(result!.screenshots.get('s1')).toBeDefined();
    expect(result!.screenshots.get('s1')!.id).toBe(screenshot.id);
  });

  it('returns null for nonexistent guide ID', async () => {
    const result = await getGuide('nonexistent-id');
    expect(result).toBeNull();
  });
});

describe('deleteGuide', () => {
  it('removes guide, its steps, screenshots, and rrwebEvents', async () => {
    const guide = await seedGuide({ id: 'g1', stepIds: ['s1'] });
    const step = await seedStep('g1', { id: 's1', index: 0 });
    const screenshot = await seedScreenshot('s1', 'sc1');
    await db.steps.update('s1', { screenshotId: 'sc1' });
    await db.rrwebEvents.add({ id: 'ev1', guideId: 'g1', events: [], timestamp: Date.now() });

    await deleteGuide('g1');

    expect(await db.guides.get('g1')).toBeUndefined();
    expect(await db.steps.get('s1')).toBeUndefined();
    expect(await db.screenshots.get('sc1')).toBeUndefined();
    expect(await db.rrwebEvents.get('ev1')).toBeUndefined();
  });
});

describe('updateGuideTitle', () => {
  it('changes title and updates updatedAt', async () => {
    const before = Date.now();
    await seedGuide({ id: 'g1', title: 'Old Title', updatedAt: 1000 });

    await updateGuideTitle('g1', 'New Title');

    const updated = await db.guides.get('g1');
    expect(updated!.title).toBe('New Title');
    expect(updated!.updatedAt).toBeGreaterThanOrEqual(before);
  });
});

describe('updateStepDescription', () => {
  it('changes step description', async () => {
    await seedGuide({ id: 'g1' });
    await seedStep('g1', { id: 's1', description: 'Old description' });

    await updateStepDescription('s1', 'New description');

    const updated = await db.steps.get('s1');
    expect(updated!.description).toBe('New description');
  });
});

describe('deleteStep', () => {
  it('removes step, its screenshot, updates guide.stepIds, and re-indexes remaining steps', async () => {
    await seedGuide({ id: 'g1', stepIds: ['s1', 's2', 's3'] });
    await seedStep('g1', { id: 's1', index: 0 });
    const step2 = await seedStep('g1', { id: 's2', index: 1, screenshotId: 'sc2' });
    await seedStep('g1', { id: 's3', index: 2 });
    await seedScreenshot('s2', 'sc2');

    await deleteStep('g1', 's2');

    expect(await db.steps.get('s2')).toBeUndefined();
    expect(await db.screenshots.get('sc2')).toBeUndefined();
    const updatedGuide = await db.guides.get('g1');
    expect(updatedGuide!.stepIds).toEqual(['s1', 's3']);
    const s3 = await db.steps.get('s3');
    expect(s3!.index).toBe(1);
  });
});
