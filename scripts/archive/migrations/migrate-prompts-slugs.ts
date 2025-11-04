#!/usr/bin/env tsx

/**
 * Migration Script: Backfill Prompts with Slugs
 *
 * This script:
 * 1. Fetches all prompts from MongoDB
 * 2. Generates slugs for prompts missing slugs
 * 3. Updates prompt documents with slug field
 * 4. Ensures slugs are unique (handles duplicates)
 *
 * Usage:
 *   tsx scripts/migrate-prompts-slugs.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getDb } from '@/lib/mongodb';
import { generateSlug } from '@/lib/utils/slug';

async function migratePromptsSlugs() {
  console.log('🚀 Starting slug migration for prompts...\n');

  try {
    const db = await getDb();
    const collection = db.collection('prompts');

    // Fetch all prompts
    const prompts = await collection.find({}).toArray();
    console.log(`📊 Found ${prompts.length} prompts to process\n`);

    let updated = 0;
    let skipped = 0;
    const slugMap = new Map<string, number>(); // Track slug usage for uniqueness

    for (const prompt of prompts) {
      const promptId = prompt._id?.toString() || prompt.id;
      const title = prompt.title || '';

      if (!title) {
        console.warn(`⚠️  Skipping prompt ${promptId}: missing title`);
        skipped++;
        continue;
      }

      // Generate slug from title if missing
      let slug = prompt.slug;

      if (!slug || typeof slug !== 'string') {
        slug = generateSlug(title);
      }

      // Ensure slug uniqueness (add number suffix if duplicate)
      let finalSlug = slug;
      let suffix = 1;
      while (slugMap.has(finalSlug)) {
        finalSlug = `${slug}-${suffix}`;
        suffix++;
      }
      slugMap.set(finalSlug, 1);

      // Only update if slug changed or was missing
      if (prompt.slug !== finalSlug) {
        await collection.updateOne(
          { _id: prompt._id },
          {
            $set: {
              slug: finalSlug,
              updatedAt: new Date(),
            },
          }
        );
        updated++;
        console.log(`✅ Updated: "${title}" → slug: "${finalSlug}"`);
      } else {
        skipped++;
      }
    }

    console.log(`\n✨ Migration complete!`);
    console.log(`   - Updated: ${updated} prompts`);
    console.log(`   - Skipped: ${skipped} prompts (already had slugs)`);
    console.log(`   - Total: ${prompts.length} prompts\n`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migratePromptsSlugs()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
