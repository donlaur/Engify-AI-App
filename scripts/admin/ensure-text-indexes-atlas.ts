#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Ensure Text Indexes for MongoDB Atlas
 * Creates text indexes on collections for full-text search
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

    // 1. Prompts collection - for RAG chat search
    console.log('Creating text index on prompts collection...');
    try {
      await db.collection('prompts').createIndex(
        {
          title: 'text',
          description: 'text',
          content: 'text',
          tags: 'text',
        },
        {
          name: 'prompts_text_search',
          weights: {
            title: 10,
            description: 5,
            content: 3,
            tags: 2,
          },
          default_language: 'english',
        }
      );
      console.log('✅ Prompts text index created\n');
    } catch (error: any) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('ℹ️  Prompts text index already exists (skipping)\n');
      } else {
        throw error;
      }
    }

    // 2. Patterns collection - for pattern search
    console.log('Creating text index on patterns collection...');
    try {
      await db.collection('patterns').createIndex(
        {
          title: 'text',
          description: 'text',
          useCases: 'text',
          tags: 'text',
        },
        {
          name: 'patterns_text_search',
          weights: {
            title: 10,
            description: 5,
            useCases: 3,
            tags: 2,
          },
          default_language: 'english',
        }
      );
      console.log('✅ Patterns text index created\n');
    } catch (error: any) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('ℹ️  Patterns text index already exists (skipping)\n');
      } else {
        throw error;
      }
    }

    // 3. Web content collection - for general search
    console.log('Creating text index on web_content collection...');
    try {
      await db.collection('web_content').createIndex(
        {
          title: 'text',
          content: 'text',
          excerpt: 'text',
          tags: 'text',
        },
        {
          name: 'web_content_text_search',
          weights: {
            title: 10,
            excerpt: 5,
            content: 3,
            tags: 2,
          },
          default_language: 'english',
        }
      );
      console.log('✅ Web content text index created\n');
    } catch (error: any) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('ℹ️  Web content text index already exists (skipping)\n');
      } else {
        throw error;
      }
    }

    // List all indexes
    console.log('📋 Current indexes:');
    const collections = ['prompts', 'patterns', 'web_content'];
    for (const collName of collections) {
      const indexes = await db.collection(collName).indexes();
      console.log(`\n${collName}:`);
      indexes.forEach((index) => {
        console.log(`  - ${index.name}`);
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

