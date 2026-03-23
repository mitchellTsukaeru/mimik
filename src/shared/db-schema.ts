import Dexie, { type EntityTable } from 'dexie';
import type { Guide, Step, Screenshot } from './types';

export class MimikDB extends Dexie {
  guides!: EntityTable<Guide, 'id'>;
  steps!: EntityTable<Step, 'id'>;
  screenshots!: EntityTable<Screenshot, 'id'>;

  constructor() {
    super('mimik');
    this.version(1).stores({
      guides: 'id, createdAt, updatedAt',
      steps: 'id, guideId, index',
      screenshots: 'id, stepId',
    });
  }
}

export const db = new MimikDB();
