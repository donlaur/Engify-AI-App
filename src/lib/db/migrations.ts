import { getMongoDb } from './mongodb';

export interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export class MigrationRunner {
  async run(migrations: Migration[]) {
    const db = await getMongoDb();
    
    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`);
      await migration.up();
      
      await db.collection('migrations').insertOne({
        version: migration.version,
        name: migration.name,
        appliedAt: new Date(),
      });
    }
  }
}
