#!/usr/bin/env tsx

/**
 * Remove Codeium from Database
 * 
 * Codeium has been merged into Windsurf (formerly Codeium Editor).
 * Windsurf is the primary product now, so Codeium should be removed
 * from the AI tools directory as it's essentially the same as Windsurf.
 * 
 * Run with: tsx scripts/db/remove-codeium.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { logger } from '@/lib/logging/logger';
import * as fs from 'fs';
import * as path from 'path';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('🗑️  Removing Codeium from database...\n');
    console.log('Reason: Codeium has been merged into Windsurf');
    console.log('        - Windsurf (formerly Codeium Editor) is the primary product');
    console.log('        - Codeium standalone tool is essentially the same as Windsurf');
    console.log('        - To avoid duplication, removing Codeium\n');

    // Create backup
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `codeium-removal-backup-${timestamp}.json`);
    
    const codeium = await collection.findOne({ id: 'codeium' });
    if (codeium) {
      fs.writeFileSync(backupFile, JSON.stringify(codeium, null, 2));
      console.log(`✅ Backup created: ${backupFile}\n`);
    } else {
      console.log('ℹ️  Codeium not found in database - nothing to remove\n');
      return;
    }

    // Remove Codeium
    const result = await collection.deleteOne({ id: 'codeium' });

    if (result.deletedCount === 0) {
      console.log('⚠️  Codeium not found in database');
    } else {
      console.log('✅ Removed: Codeium');
      console.log(`   - Backup: ${backupFile}`);
      console.log(`   - Entry removed from database`);
      console.log(`   - Note: Windsurf is still available as the primary product\n`);
      
      console.log('💡 To restore (if needed), run:');
      console.log(`   mongoimport --uri="$MONGODB_URI" --collection=ai_tools --file="${backupFile}" --jsonArray\n`);
    }

  } catch (error) {
    logger.error('Failed to remove Codeium', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Removal failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }

  process.exit(0);
}

main();

