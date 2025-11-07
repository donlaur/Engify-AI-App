#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Safe Text Index Update
 * 
 * Safely updates text indexes by:
 * 1. Checking if index exists and is healthy
 * 2. Only recreating if necessary (schema changes)
 * 3. Providing fallback during index recreation
 * 
 * Usage:
 *   tsx scripts/admin/safe-update-text-indexes.ts
 *   tsx scripts/admin/safe-update-text-indexes.ts --check-only  # Just check health
 *   tsx scripts/admin/safe-update-text-indexes.ts --force  # Force recreate even if healthy
 */

import { getDb } from '@/lib/mongodb';

interface IndexInfo {
  name: string;
  exists: boolean;
  isTextIndex: boolean;
  fields: string[];
  healthy: boolean;
  error?: string;
}

async function checkIndexHealth(collection: any, indexName: string): Promise<IndexInfo> {
  try {
    const indexes = await collection.indexes();
    const index = indexes.find((idx: any) => idx.name === indexName);
    
    if (!index) {
      return {
        name: indexName,
        exists: false,
        isTextIndex: false,
        fields: [],
        healthy: false,
        error: 'Index does not exist'
      };
    }
    
    const isTextIndex = index.textIndexVersion !== undefined;
    const fields = isTextIndex 
      ? Object.keys(index.key).filter(k => index.key[k] === 'text')
      : Object.keys(index.key);
    
    // Try a simple text search to verify index is working
    let healthy = true;
    let error: string | undefined;
    
    if (isTextIndex) {
      try {
        // Test query - should not throw error
        await collection.findOne({ $text: { $search: 'test' } });
      } catch (e: any) {
        healthy = false;
        error = e.message || 'Index query failed';
      }
    }
    
    return {
      name: indexName,
      exists: true,
      isTextIndex,
      fields,
      healthy,
      error
    };
  } catch (error: any) {
    return {
      name: indexName,
      exists: false,
      isTextIndex: false,
      fields: [],
      healthy: false,
      error: error.message || 'Unknown error'
    };
  }
}

async function safeUpdateTextIndexes(options: { checkOnly?: boolean; force?: boolean } = {}) {
  const { checkOnly = false, force = false } = options;
  
  console.log('🔍 Checking text index health...\n');
  
  if (checkOnly) {
    console.log('Mode: CHECK ONLY (no changes will be made)\n');
  } else if (force) {
    console.log('Mode: FORCE UPDATE (will recreate indexes even if healthy)\n');
  } else {
    console.log('Mode: SAFE UPDATE (will only recreate if unhealthy)\n');
  }

  try {
    const db = await getDb();
    
    // Check prompts text index
    const promptsCollection = db.collection('prompts');
    const promptsIndexInfo = await checkIndexHealth(promptsCollection, 'prompts_text_search');
    
    console.log('📋 Prompts Index Status:');
    console.log(`   Name: ${promptsIndexInfo.name}`);
    console.log(`   Exists: ${promptsIndexInfo.exists ? '✅' : '❌'}`);
    console.log(`   Type: ${promptsIndexInfo.isTextIndex ? 'Text Index' : 'Regular Index'}`);
    console.log(`   Health: ${promptsIndexInfo.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    if (promptsIndexInfo.fields.length > 0) {
      console.log(`   Fields: ${promptsIndexInfo.fields.join(', ')}`);
    }
    if (promptsIndexInfo.error) {
      console.log(`   Error: ${promptsIndexInfo.error}`);
    }
    console.log('');
    
    // Check patterns text index
    const patternsCollection = db.collection('patterns');
    const patternsIndexInfo = await checkIndexHealth(patternsCollection, 'patterns_text_search');
    
    console.log('📋 Patterns Index Status:');
    console.log(`   Name: ${patternsIndexInfo.name}`);
    console.log(`   Exists: ${patternsIndexInfo.exists ? '✅' : '❌'}`);
    console.log(`   Type: ${patternsIndexInfo.isTextIndex ? 'Text Index' : 'Regular Index'}`);
    console.log(`   Health: ${patternsIndexInfo.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    if (patternsIndexInfo.fields.length > 0) {
      console.log(`   Fields: ${patternsIndexInfo.fields.join(', ')}`);
    }
    if (patternsIndexInfo.error) {
      console.log(`   Error: ${patternsIndexInfo.error}`);
    }
    console.log('');
    
    if (checkOnly) {
      console.log('✅ Health check complete. No changes made.');
      process.exit(0);
    }
    
    // Determine if updates are needed
    const needsUpdate = force || 
                       !promptsIndexInfo.exists || 
                       !promptsIndexInfo.healthy ||
                       !patternsIndexInfo.exists || 
                       !patternsIndexInfo.healthy;
    
    if (!needsUpdate) {
      console.log('✅ All indexes are healthy. No updates needed.');
      console.log('💡 Use --force to recreate indexes anyway');
      process.exit(0);
    }
    
    // Import the index creation script
    console.log('🔄 Updating indexes...\n');
    const { ensureTextIndexes } = await import('./ensure-text-indexes-atlas');
    
    // Note: This requires MongoDB URI, so we'll use the local version
    console.log('⚠️  Note: Index recreation will cause brief downtime.');
    console.log('   Lambda handler will automatically use fallback regex search during this time.\n');
    
    const { getMongoDb } = await import('@/lib/db/mongodb');
    const mongoDb = await getMongoDb();
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment');
      process.exit(1);
    }
    
    // Use the Atlas script for safe updates
    console.log('📝 Recreating indexes (this may take a few minutes)...\n');
    
    // Run the ensure-text-indexes script
    // Note: This will drop and recreate indexes
    await import('./ensure-text-indexes-atlas');
    
    console.log('\n✅ Index update complete!');
    console.log('💡 Lambda handler will automatically fall back to regex search during index recreation');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating indexes:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const checkOnly = args.includes('--check-only') || args.includes('--check');
const force = args.includes('--force');

safeUpdateTextIndexes({ checkOnly, force });

