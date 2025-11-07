#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Ensure Unique Slug Index
 * Creates a unique index on the slug field to prevent duplicate slugs
 * 
 * This is critical for:
 * - Preventing redirect conflicts
 * - Ensuring sitemap validity
 * - Maintaining URL uniqueness
 * 
 * Usage:
 *   tsx scripts/admin/ensure-slug-unique-index.ts
 */

import { getDb } from '@/lib/mongodb';

async function ensureSlugUniqueIndex() {
  console.log('🔍 Ensuring unique slug index...\n');

  try {
    const db = await getDb();
    const promptsCollection = db.collection('prompts');
    
    // Check for existing unique index on slug
    const indexes = await promptsCollection.indexes();
    const existingSlugIndex = indexes.find(
      (idx: any) => idx.key?.slug === 1 && idx.unique === true
    );

    if (existingSlugIndex) {
      console.log(`✅ Unique slug index already exists: ${existingSlugIndex.name}\n`);
    } else {
      // Create unique index on slug
      console.log('Creating unique index on slug field...');
      try {
        await promptsCollection.createIndex(
          { slug: 1 },
          { 
            unique: true,
            name: 'prompts_slug_unique',
            // Partial index: only index non-null slugs (allows null/empty slugs)
            partialFilterExpression: { slug: { $exists: true, $ne: null, $ne: '' } }
          }
        );
        console.log('✅ Unique slug index created!\n');
      } catch (error: any) {
        if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
          console.log('ℹ️  Slug index already exists (skipping)\n');
        } else if (error.code === 11000 || error.codeName === 'DuplicateKey') {
          console.error('❌ Error: Duplicate slugs found in database!');
          console.error('   Please fix duplicate slugs before creating unique index.\n');
          console.error('   Run: tsx scripts/admin/find-duplicate-slugs.ts');
          throw error;
        } else {
          throw error;
        }
      }
    }

    // Verify index
    const finalIndexes = await promptsCollection.indexes();
    const slugIndex = finalIndexes.find(
      (idx: any) => idx.key?.slug === 1 && idx.unique === true
    );
    
    if (slugIndex) {
      console.log('📋 Index details:');
      console.log(`   Name: ${slugIndex.name}`);
      console.log(`   Unique: ${slugIndex.unique}`);
      console.log(`   Partial Filter: ${slugIndex.partialFilterExpression ? 'Yes' : 'No'}`);
    }

    console.log('\n✅ Slug uniqueness enforced!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ensuring slug unique index:', error);
    process.exit(1);
  }
}

ensureSlugUniqueIndex();

