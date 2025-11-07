#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Find Duplicate Slugs
 * Identifies prompts with duplicate slugs that need to be fixed
 * 
 * Run this before creating unique index if index creation fails with duplicate key error
 * 
 * Usage:
 *   tsx scripts/admin/find-duplicate-slugs.ts
 */

import { getDb } from '@/lib/mongodb';

async function findDuplicateSlugs() {
  console.log('🔍 Finding duplicate slugs...\n');

  try {
    const db = await getDb();
    const promptsCollection = db.collection('prompts');
    
    // Find duplicates using aggregation
    const duplicates = await promptsCollection
      .aggregate([
        {
          $match: {
            slug: { $exists: true, $ne: null, $ne: '' }
          }
        },
        {
          $group: {
            _id: '$slug',
            count: { $sum: 1 },
            prompts: {
              $push: {
                id: '$id',
                title: '$title',
                _id: '$_id'
              }
            }
          }
        },
        {
          $match: {
            count: { $gt: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
      .toArray();

    if (duplicates.length === 0) {
      console.log('✅ No duplicate slugs found!\n');
      process.exit(0);
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate slug(s):\n`);

    for (const dup of duplicates) {
      console.log(`Slug: "${dup._id}" (used ${dup.count} times)`);
      dup.prompts.forEach((prompt: any, idx: number) => {
        console.log(`  ${idx + 1}. ID: ${prompt.id || prompt._id}`);
        console.log(`     Title: ${prompt.title || 'N/A'}`);
      });
      console.log('');
    }

    console.log('\n💡 To fix duplicates:');
    console.log('   1. Update slugs manually in database');
    console.log('   2. Or run: tsx scripts/admin/fix-duplicate-slugs.ts');
    console.log('   3. Then run: tsx scripts/admin/ensure-slug-unique-index.ts');

    process.exit(1);
  } catch (error) {
    console.error('❌ Error finding duplicate slugs:', error);
    process.exit(1);
  }
}

findDuplicateSlugs();

