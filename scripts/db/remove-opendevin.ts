#!/usr/bin/env tsx

/**
 * Remove OpenDevin from Database
 * 
 * OpenDevin was found to be non-existent/fake - links point to OpenHands.
 * This script removes OpenDevin from the database.
 * 
 * Run with: tsx scripts/db/remove-opendevin.ts
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

    console.log('🗑️  Removing OpenDevin from database...\n');
    console.log('Reason: OpenDevin was found to be non-existent/fake');
    console.log('        - URL links point to OpenHands');
    console.log('        - Tool does not actually exist\n');

    // Create backup
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `opendevin-removal-backup-${timestamp}.json`);
    
    const opendevin = await collection.findOne({ id: 'opendevin' });
    if (opendevin) {
      fs.writeFileSync(backupFile, JSON.stringify(opendevin, null, 2));
      console.log(`✅ Backup created: ${backupFile}\n`);
    } else {
      console.log('ℹ️  OpenDevin not found in database - nothing to remove\n');
      return;
    }

    // Remove OpenDevin
    const result = await collection.deleteOne({ id: 'opendevin' });

    if (result.deletedCount === 0) {
      console.log('⚠️  OpenDevin not found in database');
    } else {
      console.log('✅ Removed: OpenDevin');
      console.log(`   - Backup: ${backupFile}`);
      console.log(`   - Entry removed from database\n`);
      
      console.log('💡 To restore (if needed), run:');
      console.log(`   mongoimport --uri="$MONGODB_URI" --collection=ai_tools --file="${backupFile}" --jsonArray\n`);
    }

  } catch (error) {
    logger.error('Failed to remove OpenDevin', {
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

