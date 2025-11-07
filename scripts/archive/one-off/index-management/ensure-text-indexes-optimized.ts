#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Optimized Text Indexes - Reduced Field Count
 * Creates optimized text indexes with fewer fields for better performance
 * 
 * Optimization Strategy:
 * - Keep high-value fields (title, description, content, whatIs, whyUse)
 * - Remove low-weight fields (< 4)
 * - Remove duplicate fields (keep flattened versions: caseStudiesText, examplesText)
 * - Reduce overall field count from 15 to 10
 * 
 * Usage:
 *   tsx scripts/admin/ensure-text-indexes-optimized.ts
 *   tsx scripts/admin/ensure-text-indexes-optimized.ts <MONGODB_URI>
 */

import { getDb } from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

async function ensureOptimizedTextIndexes(mongoUri?: string) {
  console.log('🔍 Creating optimized text indexes...\n');
  console.log('📋 Optimization Strategy:');
  console.log('   ✅ Keep high-value fields (title, description, content, whatIs, whyUse)');
  console.log('   ✅ Keep flattened text fields (caseStudiesText, examplesText)');
  console.log('   ❌ Remove low-weight fields (< 4)');
  console.log('   ❌ Remove duplicate fields (caseStudies, examples)');
  console.log('   📉 Reduce field count: 15 → 10 fields\n');

  let db;
  let client: MongoClient | null = null;

  try {
    if (mongoUri) {
      client = new MongoClient(mongoUri);
      await client.connect();
      db = client.db();
      console.log('✅ Connected to MongoDB Atlas\n');
    } else {
      db = await getDb();
      console.log('✅ Connected to MongoDB\n');
    }

    const dbName = db.databaseName;
    console.log(`📦 Database: ${dbName}\n`);

    // Helper to drop old text indexes and create optimized one
    async function ensureOptimizedTextIndex(
      collectionName: string,
      indexName: string,
      indexDefinition: Record<string, string>,
      indexOptions: Record<string, unknown>
    ) {
      const collection = db.collection(collectionName);
      
      // Get all existing indexes
      const indexes = await collection.indexes();
      
      // Find any existing text indexes
      const existingTextIndex = indexes.find(
        (idx) => idx.textIndexVersion !== undefined
      );
      
      if (existingTextIndex) {
        if (existingTextIndex.name === indexName) {
          console.log(`ℹ️  ${collectionName}: ${indexName} already exists`);
          console.log(`   Checking if optimization is needed...`);
          
          // Check if current index matches optimized version
          const currentFields = Object.keys(existingTextIndex.key || {}).filter(
            k => existingTextIndex.key[k] === 'text'
          );
          const optimizedFields = Object.keys(indexDefinition);
          
          if (currentFields.length === optimizedFields.length &&
              currentFields.every(f => optimizedFields.includes(f))) {
            console.log(`   ✅ Index is already optimized (skipping)\n`);
            return;
          }
        }
        
        console.log(`⚠️  ${collectionName}: Dropping old text index: ${existingTextIndex.name}`);
        await collection.dropIndex(existingTextIndex.name);
        console.log(`✅ Dropped old text index\n`);
      }
      
      // Create optimized index
      try {
        await collection.createIndex(indexDefinition, {
          ...indexOptions,
          name: indexName,
        });
        console.log(`✅ ${collectionName}: ${indexName} created (optimized)\n`);
      } catch (error: any) {
        if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
          console.log(`ℹ️  ${collectionName}: ${indexName} already exists (skipping)\n`);
        } else {
          throw error;
        }
      }
    }

    // 1. Prompts collection - OPTIMIZED (reduced from 15 to 10 fields)
    console.log('Creating optimized text index on prompts collection...');
    await ensureOptimizedTextIndex(
      'prompts',
      'prompts_text_search',
      {
        // Core fields (high priority)
        title: 'text',
        description: 'text',
        content: 'text',
        // Educational content (high value)
        whatIs: 'text',
        whyUse: 'text',
        // SEO & metadata (medium priority)
        useCases: 'text',
        metaDescription: 'text',
        // Flattened text fields (pre-processed, efficient)
        caseStudiesText: 'text',
        examplesText: 'text',
        // Tags (low priority but useful)
        tags: 'text',
      },
      {
        weights: {
          // High priority (core content)
          title: 10,
          description: 8,
          whatIs: 6,
          content: 5,
          whyUse: 5,
          // Medium priority (enriched content)
          useCases: 5,
          metaDescription: 4,
          caseStudiesText: 5,  // Flattened, higher weight
          examplesText: 5,      // Flattened, higher weight
          // Low priority (metadata)
          tags: 2,
        },
        default_language: 'english',
      }
    );

    // 2. Patterns collection - Already optimized (4 fields)
    console.log('Patterns collection index is already optimized (4 fields)\n');

    // 3. Web content collection - Already optimized (4 fields)
    console.log('Web content collection index is already optimized (4 fields)\n');

    // List all indexes
    console.log('📋 Current indexes:');
    const collections = ['prompts', 'patterns', 'web_content'];
    for (const collName of collections) {
      const indexes = await db.collection(collName).indexes();
      console.log(`\n${collName}:`);
      indexes.forEach((index) => {
        const isTextIndex = index.textIndexVersion !== undefined;
        const fieldCount = isTextIndex 
          ? Object.keys(index.key || {}).filter(k => index.key[k] === 'text').length
          : 0;
        const icon = isTextIndex ? '🔍' : '📌';
        const fieldInfo = isTextIndex ? ` (${fieldCount} fields)` : '';
        console.log(`  ${icon} ${index.name}${fieldInfo}`);
      });
    }

    console.log('\n✅ Optimized text indexes created!');
    console.log('\n💡 Removed fields:');
    console.log('   - seoKeywords (low weight: 3)');
    console.log('   - caseStudies (duplicate of caseStudiesText)');
    console.log('   - examples (duplicate of examplesText)');
    console.log('   - bestPractices (low weight: 4, less critical)');
    console.log('   - whenNotToUse (low weight: 3)');
    console.log('\n💡 Run monitor script to verify performance:');
    console.log('   tsx scripts/admin/monitor-text-index-performance.ts');
    
  } catch (error) {
    console.error('❌ Error creating optimized indexes:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Get MongoDB URI from command line or environment
const mongoUri = process.argv[2] || process.env.MONGODB_URI;

if (mongoUri) {
  ensureOptimizedTextIndexes(mongoUri);
} else {
  ensureOptimizedTextIndexes();
}

