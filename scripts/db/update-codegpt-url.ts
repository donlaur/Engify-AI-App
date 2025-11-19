#!/usr/bin/env tsx

/**
 * Update CodeGPT URL and Pricing
 * 
 * Updates CodeGPT in the database:
 * - websiteUrl: https://www.codegpt.co/ (was codegpt.ai)
 * - pricing: $8/mo BYOK Pro (was $10/mo Pro)
 * 
 * Run with: tsx scripts/db/update-codegpt-url.ts
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

    console.log('📝 Updating CodeGPT URL and pricing...\n');

    // Create backup
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `codegpt-backup-${timestamp}.json`);
    
    const codegpt = await collection.findOne({ id: 'codegpt' });
    if (codegpt) {
      fs.writeFileSync(backupFile, JSON.stringify(codegpt, null, 2));
      console.log(`✅ Backup created: ${backupFile}\n`);
    }

    // Update CodeGPT
    const result = await collection.updateOne(
      { id: 'codegpt' },
      {
        $set: {
          websiteUrl: 'https://www.codegpt.co/',
          pricing: {
            free: true,
            paid: {
              monthly: 8,
              tier: 'BYOK Pro',
            },
          },
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      console.log('⚠️  CodeGPT not found in database');
      console.log('💡 Run the seed script to add it: tsx scripts/db/seed-additional-ai-tools.ts\n');
    } else if (result.modifiedCount > 0) {
      console.log('✅ Updated: CodeGPT');
      console.log('   - websiteUrl: https://www.codegpt.co/');
      console.log('   - Pricing: Free tier + $8/mo (BYOK Pro)');
      console.log(`   - Backup: ${backupFile}\n`);
    } else {
      console.log('✓ CodeGPT already has correct URL and pricing');
    }

  } catch (error) {
    logger.error('Failed to update CodeGPT', {
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

