/**
 * Restore Prompts from Backup
 * 
 * Restores prompts from a backup JSON file to MongoDB
 * Uses upsert to avoid duplicates
 * 
 * Usage: pnpm tsx scripts/db/restore-prompts-from-backup.ts backups/prompts_2025-11-05_00-39-03.json
 */

import { getMongoDb } from '@/lib/db/mongodb';
import fs from 'fs';
import path from 'path';

async function restorePrompts(backupPath: string) {
  try {
    console.log(`📂 Reading backup from: ${backupPath}`);
    
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup file not found: ${backupPath}`);
      process.exit(1);
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    const prompts = Array.isArray(backupData) ? backupData : [];
    
    console.log(`📊 Found ${prompts.length} prompts in backup`);
    
    if (prompts.length === 0) {
      console.error('❌ No prompts found in backup file');
      process.exit(1);
    }
    
    console.log('🔌 Connecting to MongoDB...');
    const db = await getMongoDb();
    const promptsCollection = db.collection('prompts');
    
    console.log(`📊 Current prompts in DB: ${await promptsCollection.countDocuments({})}`);
    
    // Upsert all prompts (update if exists by id, insert if new)
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    
    console.log('\n📥 Restoring prompts...');
    
    for (const prompt of prompts) {
      try {
        // Normalize prompt data - remove _id completely as it's immutable
        const { _id, ...promptWithoutId } = prompt;
        const normalizedPrompt = {
          ...promptWithoutId,
          // Ensure id field exists
          id: prompt.id || prompt._id?.toString() || `restored-${Date.now()}-${Math.random()}`,
          // Ensure timestamps
          createdAt: prompt.createdAt ? new Date(prompt.createdAt) : new Date(),
          updatedAt: new Date(),
        };
        
        // Use id field for upsert (not _id)
        const result = await promptsCollection.updateOne(
          { id: normalizedPrompt.id },
          { $set: normalizedPrompt },
          { upsert: true }
        );
        
        if (result.upsertedCount > 0) {
          inserted++;
        } else if (result.modifiedCount > 0) {
          updated++;
        }
      } catch (error) {
        console.error(`❌ Error restoring prompt ${prompt.id || prompt._id}:`, error);
        errors++;
      }
    }
    
    const finalCount = await promptsCollection.countDocuments({});
    
    console.log('\n✅ Restoration complete!');
    console.log(`   📥 Inserted: ${inserted} new prompts`);
    console.log(`   🔄 Updated: ${updated} existing prompts`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total prompts in DB: ${finalCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error restoring prompts:', error);
    process.exit(1);
  }
}

// Get backup file path from command line args
const backupPath = process.argv[2];

if (!backupPath) {
  console.error('❌ Usage: pnpm tsx scripts/db/restore-prompts-from-backup.ts <backup-file-path>');
  console.log('\nAvailable backups:');
  const backupsDir = path.join(process.cwd(), 'backups');
  if (fs.existsSync(backupsDir)) {
    const files = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith('prompts_') && f.endsWith('.json'))
      .sort()
      .reverse();
    files.forEach(f => console.log(`   - backups/${f}`));
  }
  process.exit(1);
}

restorePrompts(backupPath);
