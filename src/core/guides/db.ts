import Dexie, { type EntityTable } from 'dexie';
import type { Guide, Screenshot, Step, TranslationJob } from './types';

export class TaskStitchDB extends Dexie {
  guides!: EntityTable<Guide, 'id'>;
  steps!: EntityTable<Step, 'id'>;
  screenshots!: EntityTable<Screenshot, 'id'>;
  translationJobs!: EntityTable<TranslationJob, 'id'>;

  constructor() {
    // Keep the original database name so existing Mimik/TaskStitch guides remain readable after rebranding.
    super('mimik');
    this.version(1).stores({
      guides: 'id, createdAt, updatedAt, starred, deletedAt',
      steps: 'id, guideId, index',
      screenshots: 'id, stepId',
    });
    this.version(2).stores({
      guides: 'id, createdAt, updatedAt, starred, deletedAt, sourceGuideId, language',
      steps: 'id, guideId, index, screenshotId',
      screenshots: 'id, stepId',
      translationJobs: 'id, status, targetLanguage, createdAt, updatedAt',
    });
  }
}

export const db = new TaskStitchDB();
