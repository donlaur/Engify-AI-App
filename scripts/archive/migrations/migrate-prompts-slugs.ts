#!/usr/bin/env tsx

/**
 * Migration Script: Prompt Slug Management
 * 
 * Consolidated script replacing:
 * - scripts/migrate-prompts-slugs.ts (backfill slugs)
 * - scripts/migrate-prompts-clean-slugs.ts (clean slugs)
 * 
 * This script:
 * 1. Backfills slugs for prompts missing slugs
 * 2. Cleans existing slugs (removes IDs from slugs for better SEO)
 * 3. Ensures slugs are unique (handles duplicates)
 * 
 * Usage:
 *   tsx scripts/migrate-prompts-slugs.ts                    # Backfill only
 *   tsx scripts/migrate-prompts-slugs.ts --clean             # Clean slugs only
 *   tsx scripts/migrate-prompts-slugs.ts --all               # Backfill + clean
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getDb } from '@/lib/mongodb';
import { generateSlug } from '@/lib/utils/slug';

async function migratePromptsSlugs(options: { clean?: boolean; all?: boolean }) {
  const mode = options.all ? 'all' : options.clean ? 'clean' : 'backfill';
  
  console.log(`🚀 Starting slug migration for prompts (mode: ${mode})...\n`);

  try {
    const db = await getDb();
    const collection = db.collection('prompts');

    // Fetch all prompts
    const prompts = await collection.find({}).toArray();
    console.log(`📊 Found ${prompts.length} prompts to process\n`);

    let updated = 0;
    let skipped = 0;
    const slugMap = new Map<string, number>(); // Track slug usage for uniqueness
    const updates: Array<{ _id: unknown; newSlug: string; oldSlug: string; title: string }> = [];

    // First pass: Generate slugs and check for duplicates
    for (const prompt of prompts) {
      const promptId = prompt._id?.toString() || prompt.id;
      const title = prompt.title || '';
      const oldSlug = prompt.slug || '';

      if (!title) {
        console.warn(`⚠️  Skipping prompt ${promptId}: missing title`);
        skipped++;
        continue;
      }

      let finalSlug: string;

      if (mode === 'clean' || mode === 'all') {
        // Clean mode: Generate clean slug from title (no ID)
        finalSlug = generateSlug(title);
      } else {
        // Backfill mode: Use existing slug or generate from title
        finalSlug = oldSlug || generateSlug(title);
      }

      // Ensure slug uniqueness (add number suffix if duplicate)
      let uniqueSlug = finalSlug;
      let suffix = 1;
      while (slugMap.has(uniqueSlug)) {
        uniqueSlug = `${finalSlug}-${suffix}`;
        suffix++;
      }
      slugMap.set(uniqueSlug, 1);

      // Only update if slug changed
      if (oldSlug !== uniqueSlug) {
        updates.push({
          _id: prompt._id,
          newSlug: uniqueSlug,
          oldSlug,
          title,
        });
      } else {
        skipped++;
      }
    }

    console.log(`📝 Prepared ${updates.length} slug updates\n`);

    if (updates.length === 0) {
      console.log('✅ No updates needed - all slugs are correct!\n');
      return;
    }

    // Show examples
    if (updates.length > 0) {
      console.log('📋 Example changes:');
      updates.slice(0, 5).forEach(u => {
        console.log(`   "${u.title}"`);
        console.log(`   ${u.oldSlug || '(no slug)'} → ${u.newSlug}\n`);
      });
    }

    // Second pass: Apply updates
    for (const update of updates) {
      try {
        await collection.updateOne(
          { _id: update._id },
          {
            $set: {
              slug: update.newSlug,
              updatedAt: new Date(),
            },
          }
        );
        updated++;
      } catch (error) {
        console.error(`❌ Failed to update prompt ${update._id}:`, error);
      }
    }

    console.log(`\n✨ Migration complete!`);
    console.log(`   - Updated: ${updated} prompts`);
    console.log(`   - Skipped: ${skipped} prompts (already had correct slugs)`);
    console.log(`   - Total: ${prompts.length} prompts\n`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  clean: args.includes('--clean'),
  all: args.includes('--all'),
};

// Run migration
migratePromptsSlugs(options)
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
