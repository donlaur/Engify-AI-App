/**
 * Export prompts from MongoDB to JSON backup
 * Run: pnpm tsx scripts/export-prompts.ts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import fs from 'fs';
import path from 'path';

async function exportPrompts() {
  try {
    console.log('Connecting to MongoDB...');
    const db = await getMongoDb();

    console.log('Fetching prompts...');
    // Using collection name directly for backup script - acceptable for utilities
    const prompts = await db.collection('prompts').find().toArray();

    console.log(`Found ${prompts.length} prompts`);

    const backupPath = path.join(
      process.cwd(),
      'src/data/backup/prompts-backup.json'
    );

    console.log(`Writing to ${backupPath}...`);
    fs.writeFileSync(backupPath, JSON.stringify(prompts, null, 2));

    console.log('✅ Export complete!');
    console.log(`Exported ${prompts.length} prompts to ${backupPath}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportPrompts();
