import Dexie, { type EntityTable } from 'dexie';
import type { Guide, Screenshot, Step } from './types';

export class MimikDB extends Dexie {
  guides!: EntityTable<Guide, 'id'>;
  steps!: EntityTable<Step, 'id'>;
  screenshots!: EntityTable<Screenshot, 'id'>;

  constructor() {
    super('mimik');
    this.version(1).stores({
      guides: 'id, createdAt, updatedAt, starred, deletedAt',
      steps: 'id, guideId, index',
      screenshots: 'id, stepId',
    });
  }
}

export const db = new MimikDB();
