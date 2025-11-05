#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Fix Duplicate Slugs
 * Automatically fixes duplicate slugs by appending numeric suffixes
 * 
 * Usage:
 *   tsx scripts/admin/fix-duplicate-slugs.ts
 *   tsx scripts/admin/fix-duplicate-slugs.ts --dry-run  # Preview changes
 */

import { getDb } from '@/lib/mongodb';
import { generateUniqueSlug } from '@/lib/utils/slug';

async function fixDuplicateSlugs(dryRun: boolean = false) {
  console.log('🔧 Fixing duplicate slugs...\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (will update database)'}\n`);

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
                _id: '$_id',
                title: '$title',
                slug: '$slug'
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

    let fixed = 0;
    
    for (const dup of duplicates) {
      console.log(`Slug: "${dup._id}" (used ${dup.count} times)`);
      
      // Keep first prompt with the slug, fix others
      const promptsToFix = dup.prompts.slice(1); // Skip first one
      
      // Get all existing slugs to ensure uniqueness
      const allSlugs = new Set<string>();
      const allPrompts = await promptsCollection.find({}).toArray();
      allPrompts.forEach((p: any) => {
        if (p.slug && p.slug !== dup._id) {
          allSlugs.add(p.slug);
        }
      });
      
      for (const prompt of promptsToFix) {
        const promptTitle = prompt.title || 'Untitled';
        const newSlug = generateUniqueSlug(promptTitle, allSlugs);
        
        console.log(`  Fixing: ${prompt.id || prompt._id}`);
        console.log(`    Title: ${promptTitle}`);
        console.log(`    Old slug: ${prompt.slug}`);
        console.log(`    New slug: ${newSlug}`);
        
        if (!dryRun) {
          await promptsCollection.updateOne(
            { _id: prompt._id },
            { 
              $set: {
                slug: newSlug,
                updatedAt: new Date()
              }
            }
          );
          allSlugs.add(newSlug); // Track new slug for next iteration
          fixed++;
        }
        console.log('');
      }
    }
    
    if (dryRun) {
      console.log(`\n📊 Summary:`);
      console.log(`  Would fix: ${fixed} prompts`);
      console.log(`\n💡 Run without --dry-run to apply changes`);
    } else {
      console.log(`\n✅ Fixed ${fixed} duplicate slug(s)!`);
      console.log(`\n💡 Next step: Run tsx scripts/admin/ensure-slug-unique-index.ts to create unique index`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing duplicate slugs:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('--dryrun');

fixDuplicateSlugs(dryRun);

