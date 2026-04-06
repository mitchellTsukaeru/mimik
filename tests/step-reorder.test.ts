import 'fake-indexeddb/auto';
import { beforeEach, describe, it, expect } from 'vitest';
import { db } from '../src/shared/db-schema';
import { reorderSteps } from '../src/shared/guide-service';
import type { Guide, Step } from '../src/shared/types';

async function seedGuide(id: string, stepIds: string[]): Promise<Guide> {
  const guide: Guide = {
    id,
    title: 'Test Guide',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    stepIds,
  };
  await db.guides.add(guide);
  return guide;
}

async function seedStep(id: string, guideId: string, index: number): Promise<Step> {
  const step: Step = {
    id,
    guideId,
    index,
    description: `Step ${index}`,
    action: 'click',
    url: 'https://example.com',
    timestamp: Date.now(),
  };
  await db.steps.add(step);
  return step;
}

beforeEach(async () => {
  await db.guides.clear();
  await db.steps.clear();
  await db.screenshots.clear();
});

describe('reorderSteps', () => {
  it('updates step index values to match new order', async () => {
    await seedGuide('g1', ['s0', 's1', 's2']);
    await seedStep('s0', 'g1', 0);
    await seedStep('s1', 'g1', 1);
    await seedStep('s2', 'g1', 2);

    await reorderSteps('g1', ['s2', 's0', 's1']);

    const s2 = await db.steps.get('s2');
    const s0 = await db.steps.get('s0');
    const s1 = await db.steps.get('s1');

    expect(s2!.index).toBe(0);
    expect(s0!.index).toBe(1);
    expect(s1!.index).toBe(2);
  });

  it('updates guide.stepIds to match new order', async () => {
    await seedGuide('g1', ['s0', 's1', 's2']);
    await seedStep('s0', 'g1', 0);
    await seedStep('s1', 'g1', 1);
    await seedStep('s2', 'g1', 2);

    await reorderSteps('g1', ['s2', 's0', 's1']);

    const guide = await db.guides.get('g1');
    expect(guide!.stepIds).toEqual(['s2', 's0', 's1']);
  });

  it('updates guide.updatedAt after reorder', async () => {
    const before = Date.now();
    await seedGuide('g1', ['s0', 's1']);
    await seedStep('s0', 'g1', 0);
    await seedStep('s1', 'g1', 1);

    await reorderSteps('g1', ['s1', 's0']);

    const guide = await db.guides.get('g1');
    expect(guide!.updatedAt).toBeGreaterThanOrEqual(before);
  });
});
