#!/usr/bin/env tsx
/**
 * Migration Script: JSON to Database
 * 
 * Migrates recommendations and pain points from JSON files to MongoDB
 * 
 * Usage:
 *   tsx scripts/migrate-json-to-db.ts
 *   tsx scripts/migrate-json-to-db.ts --dry-run  # Preview without saving
 */

// Allow database operations in migration scripts
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.ALLOW_DB_OPERATIONS = 'true';

import { getMongoDb } from '@/lib/db/mongodb';
import { loadRecommendationsFromJson } from '@/lib/workflows/load-recommendations-from-json';
import { loadPainPointsFromJson } from '@/lib/workflows/load-pain-points-from-json';
import { RecommendationSchema } from '@/lib/workflows/recommendation-schema';
import { PainPointSchema } from '@/lib/workflows/pain-point-schema';
import { logger } from '@/lib/logging/logger';

const DRY_RUN = process.argv.includes('--dry-run');

async function migrateRecommendations() {
  logger.info('Starting recommendations migration...');
  
  try {
    // Load from JSON
    const recommendations = await loadRecommendationsFromJson();
    logger.info(`Loaded ${recommendations.length} recommendations from JSON`);

    if (recommendations.length === 0) {
      logger.warn('No recommendations found in JSON file');
      return { created: 0, updated: 0, skipped: 0 };
    }

    if (DRY_RUN) {
      logger.info('DRY RUN: Would migrate the following recommendations:');
      recommendations.forEach((rec, idx) => {
        logger.info(`  ${idx + 1}. ${rec.id} - ${rec.title} (status: ${rec.status})`);
      });
      return { created: recommendations.length, updated: 0, skipped: 0 };
    }

    // Get database
    const db = await getMongoDb();
    const collection = db.collection('recommendations');

    // Ensure indexes
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ updatedAt: -1 });

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ id: string; error: string }> = [];

    // Migrate each recommendation
    for (const rec of recommendations) {
      try {
        // Validate with schema
        const validated = RecommendationSchema.parse(rec);
        
        // Prepare document with timestamps
        // Note: Schema doesn't include createdAt/updatedAt, but API expects them
        const now = new Date();
        const document: any = {
          ...validated,
          createdAt: now,
          updatedAt: now,
        };

        // Upsert by id
        const existing = await collection.findOne({ id: validated.id });
        
        if (existing) {
          await collection.updateOne(
            { id: validated.id },
            {
              $set: {
                ...document,
                updatedAt: now,
              },
            }
          );
          updated++;
          logger.debug(`Updated recommendation: ${validated.id}`);
        } else {
          await collection.insertOne(document);
          created++;
          logger.debug(`Created recommendation: ${validated.id}`);
        }
      } catch (error) {
        skipped++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({ id: rec.id || 'unknown', error: errorMsg });
        logger.error(`Failed to migrate recommendation ${rec.id}:`, errorMsg);
      }
    }

    logger.info('Recommendations migration complete', {
      created,
      updated,
      skipped,
      errors: errors.length,
    });

    if (errors.length > 0) {
      logger.warn('Recommendations with errors:', errors);
    }

    return { created, updated, skipped };
  } catch (error) {
    logger.error('Failed to migrate recommendations:', error);
    throw error;
  }
}

async function migratePainPoints() {
  logger.info('Starting pain points migration...');
  
  try {
    // Load from JSON
    const painPoints = await loadPainPointsFromJson();
    logger.info(`Loaded ${painPoints.length} pain points from JSON`);

    if (painPoints.length === 0) {
      logger.warn('No pain points found in JSON file');
      return { created: 0, updated: 0, skipped: 0 };
    }

    if (DRY_RUN) {
      logger.info('DRY RUN: Would migrate the following pain points:');
      painPoints.forEach((pp, idx) => {
        logger.info(`  ${idx + 1}. ${pp.id} - ${pp.title} (status: ${pp.status})`);
      });
      return { created: painPoints.length, updated: 0, skipped: 0 };
    }

    // Get database
    const db = await getMongoDb();
    const collection = db.collection('pain_points');

    // Ensure indexes
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ updatedAt: -1 });

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ id: string; error: string }> = [];

    // Migrate each pain point
    for (const pp of painPoints) {
      try {
        // Validate with schema
        const validated = PainPointSchema.parse(pp);
        
        // Prepare document with timestamps
        // Note: Schema doesn't include createdAt/updatedAt, but API expects them
        const now = new Date();
        const document: any = {
          ...validated,
          createdAt: now,
          updatedAt: now,
        };

        // Upsert by id
        const existing = await collection.findOne({ id: validated.id });
        
        if (existing) {
          await collection.updateOne(
            { id: validated.id },
            {
              $set: {
                ...document,
                updatedAt: now,
              },
            }
          );
          updated++;
          logger.debug(`Updated pain point: ${validated.id}`);
        } else {
          await collection.insertOne(document);
          created++;
          logger.debug(`Created pain point: ${validated.id}`);
        }
      } catch (error) {
        skipped++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({ id: pp.id || 'unknown', error: errorMsg });
        logger.error(`Failed to migrate pain point ${pp.id}:`, errorMsg);
      }
    }

    logger.info('Pain points migration complete', {
      created,
      updated,
      skipped,
      errors: errors.length,
    });

    if (errors.length > 0) {
      logger.warn('Pain points with errors:', errors);
    }

    return { created, updated, skipped };
  } catch (error) {
    logger.error('Failed to migrate pain points:', error);
    throw error;
  }
}

async function main() {
  try {
    logger.info('Starting JSON to Database migration...');
    logger.info(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be saved)' : 'LIVE (changes will be saved)'}`);

    const [recResults, ppResults] = await Promise.all([
      migrateRecommendations(),
      migratePainPoints(),
    ]);

    logger.info('Migration complete!', {
      recommendations: recResults,
      painPoints: ppResults,
    });

    const totalCreated = recResults.created + ppResults.created;
    const totalUpdated = recResults.updated + ppResults.updated;
    const totalSkipped = recResults.skipped + ppResults.skipped;

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Created: ${totalCreated} items`);
    console.log(`  🔄 Updated: ${totalUpdated} items`);
    console.log(`  ⚠️  Skipped: ${totalSkipped} items`);
    console.log(`\n  Recommendations: ${recResults.created} created, ${recResults.updated} updated`);
    console.log(`  Pain Points: ${ppResults.created} created, ${ppResults.updated} updated`);

    if (DRY_RUN) {
      console.log('\n⚠️  This was a DRY RUN. No changes were saved.');
      console.log('   Run without --dry-run to actually migrate the data.');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();

