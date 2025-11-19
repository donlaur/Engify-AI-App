#!/usr/bin/env tsx

/**
 * Update OpenHands URL
 * 
 * Updates OpenHands websiteUrl from https://www.openhands.ai/ to https://openhands.dev/
 * 
 * Run with: tsx scripts/db/update-openhands-url.ts
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

    console.log('📝 Updating OpenHands URL...\n');

    // Create backup
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `openhands-backup-${timestamp}.json`);
    
    const openhands = await collection.findOne({ id: 'openhands' });
    if (openhands) {
      fs.writeFileSync(backupFile, JSON.stringify(openhands, null, 2));
      console.log(`✅ Backup created: ${backupFile}\n`);
    }

    // Update OpenHands
    const result = await collection.updateOne(
      { id: 'openhands' },
      {
        $set: {
          websiteUrl: 'https://openhands.dev/',
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      console.log('⚠️  OpenHands not found in database');
      console.log('💡 Run the seed script to add it: tsx scripts/db/update-cline-and-clones.ts\n');
    } else if (result.modifiedCount > 0) {
      console.log('✅ Updated: OpenHands');
      console.log('   - websiteUrl: https://openhands.dev/');
      console.log(`   - Backup: ${backupFile}\n`);
    } else {
      console.log('✓ OpenHands already has correct URL (https://openhands.dev/)');
    }

  } catch (error) {
    logger.error('Failed to update OpenHands', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }

  process.exit(0);
}

main();

