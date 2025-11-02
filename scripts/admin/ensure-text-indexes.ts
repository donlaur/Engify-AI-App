#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Ensure Text Indexes for Search
 * Creates text indexes on collections for full-text search
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getDb } from '@/lib/mongodb';

async function ensureTextIndexes() {
  console.log('🔍 Ensuring text indexes for search...\n');

  try {
    const db = await getDb();

    // 1. Prompts collection - for RAG chat search
    console.log('Creating text index on prompts collection...');
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

    // 2. Patterns collection - for pattern search
    console.log('Creating text index on patterns collection...');
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

    // 3. Web content collection - for general search
    console.log('Creating text index on web_content collection...');
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
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ensuring text indexes:', error);
    process.exit(1);
  }
}

ensureTextIndexes();
