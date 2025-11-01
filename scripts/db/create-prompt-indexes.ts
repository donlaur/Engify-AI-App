#!/usr/bin/env tsx
/**
 * Create MongoDB Indexes for Prompts Collection
 * 
 * Creates indexes for:
 * - Tags array (for filtering by tags)
 * - Category + tags (compound index)
 * - Role + tags (compound index)
 * - Other performance indexes
 * 
 * Usage:
 *   pnpm exec tsx scripts/db/create-prompt-indexes.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';

async function createIndexes() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.error('   Please set MONGODB_URI in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('engify');
    const collection = db.collection('prompts');

    console.log('📊 Creating indexes for prompts collection...\n');

    // Single field indexes
    const singleIndexes: Array<{ key: Record<string, number>; name: string; unique?: boolean }> = [
      { key: { tags: 1 }, name: 'tags_1' },
      { key: { category: 1 }, name: 'category_1' },
      { key: { role: 1 }, name: 'role_1' },
      { key: { pattern: 1 }, name: 'pattern_1' },
      { key: { isPublic: 1 }, name: 'isPublic_1' },
      { key: { isFeatured: 1 }, name: 'isFeatured_1' },
      { key: { createdAt: -1 }, name: 'createdAt_-1' },
      { key: { views: -1 }, name: 'views_-1' },
      { key: { rating: -1 }, name: 'rating_-1' },
      { key: { slug: 1 }, unique: true, name: 'slug_1' },
      { key: { id: 1 }, name: 'id_1' },
    ];

    // Compound indexes for common queries
    const compoundIndexes: Array<{ key: Record<string, number>; name: string }> = [
      { key: { tags: 1, category: 1 }, name: 'tags_1_category_1' },
      { key: { tags: 1, role: 1 }, name: 'tags_1_role_1' },
      { key: { category: 1, role: 1 }, name: 'category_1_role_1' },
      { key: { isPublic: 1, isFeatured: 1 }, name: 'isPublic_1_isFeatured_1' },
      { key: { isPublic: 1, category: 1 }, name: 'isPublic_1_category_1' },
      { key: { isPublic: 1, tags: 1 }, name: 'isPublic_1_tags_1' },
    ];

    // Text search index
    const textIndex: { key: Record<string, string | number>; name: string; weights: Record<string, number> } = {
      key: { title: 'text', description: 'text', content: 'text' },
      name: 'title_text_description_text_content_text',
      weights: { title: 10, description: 5, content: 1 },
    };

    const allIndexes = [...singleIndexes, ...compoundIndexes, textIndex];

    console.log(`Creating ${allIndexes.length} indexes...\n`);

    const results = await Promise.allSettled(
      allIndexes.map(async (indexSpec) => {
        try {
          const options: any = {
            name: indexSpec.name,
            unique: indexSpec.unique || false,
            background: true, // Don't block operations
          };
          
          // Only add weights if provided
          if (indexSpec.weights) {
            options.weights = indexSpec.weights;
          }

          await collection.createIndex(indexSpec.key, options);
          return { name: indexSpec.name, status: 'created' };
        } catch (error: any) {
          if (error.code === 85) {
            // Index already exists with different options
            return { name: indexSpec.name, status: 'exists' };
          }
          if (error.code === 86) {
            // Index already exists with same options
            return { name: indexSpec.name, status: 'exists' };
          }
          throw error;
        }
      })
    );

    // Report results
    const created = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'created').length;
    const exists = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'exists').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log('✅ Index creation complete!\n');
    console.log(`   Created: ${created}`);
    console.log(`   Already exists: ${exists}`);
    if (failed > 0) {
      console.log(`   Failed: ${failed}`);
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`   ❌ ${allIndexes[i].name}: ${r.reason}`);
        }
      });
    }

    // List all indexes
    console.log('\n📋 Current indexes on prompts collection:');
    const indexes = await collection.listIndexes().toArray();
    indexes.forEach((idx) => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n✅ Indexes ready for tag filtering!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

createIndexes().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

