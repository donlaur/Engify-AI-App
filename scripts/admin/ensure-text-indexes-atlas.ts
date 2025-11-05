#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Ensure Text Indexes for MongoDB Atlas (with cleanup)
 * Creates text indexes on collections for full-text search
 * 
 * Handles existing indexes by dropping old ones first
 * 
 * Usage:
 *   tsx scripts/admin/ensure-text-indexes-atlas.ts <MONGODB_URI>
 *   OR set MONGODB_URI environment variable
 */

import { MongoClient } from 'mongodb';

async function ensureTextIndexes(mongoUri: string) {
  console.log('🔍 Connecting to MongoDB Atlas...\n');

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = client.db();
    const dbName = db.databaseName;
    console.log(`📦 Database: ${dbName}\n`);

    // Helper to drop old text indexes and create new one
    async function ensureTextIndex(
      collectionName: string,
      indexName: string,
      indexDefinition: Record<string, string>,
      indexOptions: Record<string, unknown>
    ) {
      const collection = db.collection(collectionName);
      
      // Get all existing indexes
      const indexes = await collection.indexes();
      
      // Find any existing text indexes (MongoDB only allows one per collection)
      const existingTextIndex = indexes.find(
        (idx) => idx.textIndexVersion !== undefined
      );
      
      if (existingTextIndex) {
        if (existingTextIndex.name === indexName) {
          console.log(`ℹ️  ${collectionName}: ${indexName} already exists (skipping)\n`);
          return;
        } else {
          console.log(`⚠️  ${collectionName}: Dropping old text index: ${existingTextIndex.name}`);
          await collection.dropIndex(existingTextIndex.name);
          console.log(`✅ Dropped old text index\n`);
        }
      }
      
      // Create new index
      try {
        await collection.createIndex(indexDefinition, {
          ...indexOptions,
          name: indexName,
        });
        console.log(`✅ ${collectionName}: ${indexName} created\n`);
      } catch (error: any) {
        if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
          console.log(`ℹ️  ${collectionName}: ${indexName} already exists (skipping)\n`);
        } else {
          throw error;
        }
      }
    }

    // 1. Prompts collection - for RAG chat search
    // Includes enriched fields: caseStudies, whatIs, whyUse, examples, useCases, bestPractices, seoKeywords
    console.log('Ensuring text index on prompts collection...');
    await ensureTextIndex(
      'prompts',
      'prompts_text_search',
      {
        title: 'text',
        description: 'text',
        content: 'text',
        tags: 'text',
        // Enriched fields for better RAG search
        whatIs: 'text',
        whyUse: 'text',
        metaDescription: 'text',
        seoKeywords: 'text',
        caseStudies: 'text',
        examples: 'text',
        useCases: 'text',
        bestPractices: 'text',
        whenNotToUse: 'text',
        // Flattened text fields for better searchability
        caseStudiesText: 'text',
        examplesText: 'text',
      },
      {
        weights: {
          title: 10,
          description: 8,
          content: 5,
          whatIs: 6,
          whyUse: 5,
          metaDescription: 4,
          seoKeywords: 3,
          caseStudies: 4,
          examples: 4,
          useCases: 5,
          bestPractices: 4,
          whenNotToUse: 3,
          // Flattened text fields (higher weight since they're pre-processed)
          caseStudiesText: 5,
          examplesText: 5,
          tags: 2,
        },
        default_language: 'english',
      }
    );

    // 2. Patterns collection - for pattern search
    console.log('Ensuring text index on patterns collection...');
    await ensureTextIndex(
      'patterns',
      'patterns_text_search',
      {
        title: 'text',
        description: 'text',
        useCases: 'text',
        tags: 'text',
      },
      {
        weights: {
          title: 10,
          description: 5,
          useCases: 3,
          tags: 2,
        },
        default_language: 'english',
      }
    );

    // 3. Web content collection - for general search
    console.log('Ensuring text index on web_content collection...');
    await ensureTextIndex(
      'web_content',
      'web_content_text_search',
      {
        title: 'text',
        content: 'text',
        excerpt: 'text',
        tags: 'text',
      },
      {
        weights: {
          title: 10,
          excerpt: 5,
          content: 3,
          tags: 2,
        },
        default_language: 'english',
      }
    );

    // List all indexes
    console.log('📋 Current indexes:');
    const collections = ['prompts', 'patterns', 'web_content'];
    for (const collName of collections) {
      const indexes = await db.collection(collName).indexes();
      console.log(`\n${collName}:`);
      indexes.forEach((index) => {
        const isTextIndex = index.textIndexVersion !== undefined;
        console.log(`  ${isTextIndex ? '🔍' : '📌'} ${index.name}`);
      });
    }

    console.log('\n✅ All text indexes ensured!');
  } catch (error) {
    console.error('❌ Error ensuring text indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

// Get MongoDB URI from command line or environment
const mongoUri = process.argv[2] || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ Error: MongoDB URI not provided');
  console.error('\nUsage:');
  console.error('  tsx scripts/admin/ensure-text-indexes-atlas.ts "mongodb+srv://..."');
  console.error('  OR set MONGODB_URI environment variable');
  process.exit(1);
}

ensureTextIndexes(mongoUri);
