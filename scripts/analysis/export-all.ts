/**
 * Export all data from MongoDB to JSON backups
 * Run: pnpm tsx scripts/export-all.ts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import fs from 'fs';
import path from 'path';

async function exportCollection(collectionName: string, filename: string) {
  const db = await getMongoDb();
  // Using collection name directly for backup script - acceptable for utilities
  const data = await db.collection(collectionName).find().toArray();

  const backupPath = path.join(process.cwd(), 'src/data/backup', filename);
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));

  return data.length;
}

async function exportAll() {
  try {
    console.log('🚀 Starting full data export...\n');

    const collections = [
      { name: 'prompts', file: 'prompts-backup.json' },
      { name: 'learning_resources', file: 'learning-resources-backup.json' },
      { name: 'patterns', file: 'patterns-backup.json' },
    ];

    for (const collection of collections) {
      console.log(`Exporting ${collection.name}...`);
      const count = await exportCollection(collection.name, collection.file);
      console.log(`✅ Exported ${count} documents from ${collection.name}\n`);
    }

    console.log('✅ All exports complete!');
    console.log('Backups saved to: src/data/backup/');

    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportAll();
