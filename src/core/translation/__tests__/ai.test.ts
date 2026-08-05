import { describe, expect, it } from 'vitest';
import { TRANSLATION_BATCH_SIZE, takeTranslationBatch } from '../ai';

describe('translation batching', () => {
  it('limits each request so long guides can persist progress between calls', () => {
    const items = Array.from({ length: 25 }, (_, index) => ({ id: String(index), text: `Step ${index}` }));

    const first = takeTranslationBatch(items, 0);
    const second = takeTranslationBatch(items, first.length);

    expect(first).toHaveLength(TRANSLATION_BATCH_SIZE);
    expect(second[0].id).toBe(String(TRANSLATION_BATCH_SIZE));
  });

  it('keeps oversized text in a batch instead of stalling the job', () => {
    const batch = takeTranslationBatch([{ id: 'large', text: 'x'.repeat(7_000) }], 0);
    expect(batch.map((item) => item.id)).toEqual(['large']);
  });
});
