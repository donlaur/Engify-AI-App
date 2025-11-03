#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Verify Text Indexes
 * Checks if text indexes exist on collections
 * 
 * Usage:
 *   tsx scripts/admin/verify-text-indexes.ts
 */

// Load environment variables FIRST before any imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Try multiple env file locations
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Now import MongoDB after env is loaded
import { getDb } from '@/lib/mongodb';

async function verifyTextIndexes() {
  console.log('🔍 Verifying text indexes...\n');

  try {
    const db = await getDb();
    const dbName = db.databaseName;
    console.log(`📦 Database: ${dbName}\n`);

    const collections = [
      { name: 'prompts', indexName: 'prompts_text_search' },
      { name: 'patterns', indexName: 'patterns_text_search' },
      { name: 'web_content', indexName: 'web_content_text_search' },
    ];

    let allExist = true;

    for (const coll of collections) {
      const indexes = await db.collection(coll.name).indexes();
      const indexExists = indexes.some((idx) => idx.name === coll.indexName);

      if (indexExists) {
        console.log(`✅ ${coll.name}: ${coll.indexName} exists`);
      } else {
        console.log(`❌ ${coll.name}: ${coll.indexName} MISSING`);
        allExist = false;
      }
    }

    console.log('\n📋 All indexes:');
    for (const coll of collections) {
      const indexes = await db.collection(coll.name).indexes();
      console.log(`\n${coll.name}:`);
      indexes.forEach((index) => {
        const isTextIndex = index.textIndexVersion !== undefined;
        console.log(`  ${isTextIndex ? '🔍' : '📌'} ${index.name}`);
      });
    }

    if (allExist) {
      console.log('\n✅ All text indexes verified!');
      process.exit(0);
    } else {
      console.log('\n❌ Some text indexes are missing!');
      console.log('Run: tsx scripts/admin/ensure-text-indexes.ts');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error verifying text indexes:', error);
    process.exit(1);
  }
}

verifyTextIndexes();

