#!/usr/bin/env tsx
/**
 * Ensure All AI Models Have Slugs
 * 
 * Script to ensure all AI models in the database have slug fields
 * for SEO-friendly URLs. Generates slugs for models missing them.
 * 
 * Usage:
 *   tsx scripts/db/ensure-ai-model-slugs.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { generateSlug } from '@/lib/utils/slug';
import { logger } from '@/lib/logging/logger';

async function ensureAIModelSlugs() {
  console.log('🔍 Ensuring all AI models have slugs...\n');

  try {
    const db = await getMongoDb();
    const modelsCollection = db.collection('ai_models');

    // Find all models
    const models = await modelsCollection.find({}).toArray();
    console.log(`📊 Found ${models.length} models in database\n`);

    let updated = 0;
    let skipped = 0;
    const missingSlugs: Array<{ id: string; name: string; displayName: string }> = [];

    for (const model of models) {
      const id = model.id || model._id?.toString();
      const name = model.name || model.displayName || model.id || 'unknown';
      const displayName = model.displayName || model.name || id;

      // Check if slug exists and is valid
      if (model.slug && typeof model.slug === 'string' && model.slug.trim().length > 0) {
        skipped++;
        continue;
      }

      // Generate slug from name or displayName
      const slug = generateSlug(name || displayName);
      
      if (!slug || slug === 'untitled') {
        console.log(`⚠️  Could not generate slug for: ${name} (${id})`);
        missingSlugs.push({ id: id || '', name, displayName });
        continue;
      }

      // Check for duplicate slugs
      const existingWithSlug = await modelsCollection.findOne({ 
        slug,
        id: { $ne: id } // Different model
      });

      if (existingWithSlug) {
        // Generate unique slug by appending suffix
        let uniqueSlug = slug;
        let suffix = 2;
        while (await modelsCollection.findOne({ slug: uniqueSlug, id: { $ne: id } })) {
          uniqueSlug = `${slug}-${suffix}`;
          suffix++;
        }
        
        console.log(`   ✅ Generated unique slug: ${name} → ${uniqueSlug} (suffix added due to duplicate)`);
        
        await modelsCollection.updateOne(
          { id },
          { $set: { slug: uniqueSlug, updatedAt: new Date() } }
        );
        updated++;
      } else {
        console.log(`   ✅ Generated slug: ${name} → ${slug}`);
        
        await modelsCollection.updateOne(
          { id },
          { $set: { slug, updatedAt: new Date() } }
        );
        updated++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} models`);
    console.log(`   ⏭️  Skipped: ${skipped} models (already have slugs)`);
    if (missingSlugs.length > 0) {
      console.log(`   ⚠️  Failed: ${missingSlugs.length} models (could not generate slug)`);
      console.log(`\n⚠️  Models without slugs:`);
      missingSlugs.forEach((m) => {
        console.log(`   - ${m.displayName} (${m.id})`);
      });
    }

    // Verify all models have slugs now
    const modelsWithSlugs = await modelsCollection.countDocuments({ 
      slug: { $exists: true, $ne: null, $ne: '' } 
    });
    const modelsWithoutSlugs = await modelsCollection.countDocuments({ 
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });

    console.log(`\n✅ Verification:`);
    console.log(`   Models with slugs: ${modelsWithSlugs}/${models.length}`);
    console.log(`   Models without slugs: ${modelsWithoutSlugs}`);

    if (modelsWithoutSlugs === 0) {
      console.log(`\n✨ All models have slugs!`);
    } else {
      console.log(`\n⚠️  ${modelsWithoutSlugs} models still missing slugs`);
    }

    process.exit(0);
  } catch (error) {
    logger.error('Failed to ensure AI model slugs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

ensureAIModelSlugs();

