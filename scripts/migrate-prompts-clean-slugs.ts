#!/usr/bin/env tsx

/**
 * Migration Script: Clean Up Prompt Slugs
 * 
 * Removes IDs from existing slugs to improve SEO and readability
 * 
 * BEFORE: "unit-test-generator-test-001"
 * AFTER:  "unit-test-generator"
 * 
 * Handles duplicates by appending numeric suffix (not ID)
 * 
 * Usage:
 *   tsx scripts/migrate-prompts-clean-slugs.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getDb } from '@/lib/mongodb';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';

async function migratePromptsCleanSlugs() {
  console.log('🚀 Starting clean slug migration for prompts...\n');
  console.log('📋 This will remove IDs from slugs (e.g., "unit-test-generator-test-001" → "unit-test-generator")\n');

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

    // First pass: Generate clean slugs and check for duplicates
    for (const prompt of prompts) {
      const promptId = prompt._id?.toString() || prompt.id;
      const title = prompt.title || '';
      const oldSlug = prompt.slug || '';

      if (!title) {
        console.warn(`⚠️  Skipping prompt ${promptId}: missing title`);
        skipped++;
        continue;
      }

      // Generate clean slug from title (no ID)
      const baseSlug = generateSlug(title);
      
      // Check if slug already exists (track for uniqueness)
      let finalSlug = baseSlug;
      if (slugMap.has(finalSlug)) {
        // Append numeric suffix if duplicate (not ID)
        let suffix = 2;
        finalSlug = `${baseSlug}-${suffix}`;
        while (slugMap.has(finalSlug)) {
          suffix++;
          finalSlug = `${baseSlug}-${suffix}`;
        }
      }
      slugMap.set(finalSlug, 1);

      // Only update if slug changed
      if (oldSlug !== finalSlug) {
        updates.push({
          _id: prompt._id,
          newSlug: finalSlug,
          oldSlug,
          title,
        });
      } else {
        skipped++;
      }
    }

    console.log(`📝 Prepared ${updates.length} slug updates\n`);

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
        console.log(`✅ "${update.title}"`);
        console.log(`   ${update.oldSlug} → ${update.newSlug}`);
      } catch (error) {
        console.error(`❌ Failed to update prompt ${update._id}:`, error);
      }
    }

    console.log(`\n✨ Migration complete!`);
    console.log(`   - Updated: ${updated} prompts`);
    console.log(`   - Skipped: ${skipped} prompts (already had clean slugs)`);
    console.log(`   - Total: ${prompts.length} prompts\n`);
    
    // Show examples
    if (updates.length > 0) {
      console.log('📋 Example changes:');
      updates.slice(0, 5).forEach(u => {
        console.log(`   "${u.title}"`);
        console.log(`   ${u.oldSlug} → ${u.newSlug}\n`);
      });
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migratePromptsCleanSlugs()
  .then(() => {
    console.log('✅ Clean slug migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Clean slug migration failed:', error);
    process.exit(1);
  });

