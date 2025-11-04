#!/usr/bin/env tsx

/**
 * Reset Mock Metrics - Remove all fake views, ratings, and favorites
 * 
 * Sets all prompts to honest 0 values:
 * - views: 0
 * - favorites: 0 (or remove field)
 * - rating: 0
 * - ratingCount: 0
 * - shares: 0 (or remove field)
 * 
 * Usage:
 *   tsx scripts/db/reset-mock-metrics.ts
 * 
 * This script respects ADR-009: Zero Mock Data policy
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getDb } from '@/lib/mongodb';
import { logger } from '@/lib/logging/logger';

async function resetMockMetrics() {
  console.log('🚀 Starting mock metrics reset...\n');
  console.log('📋 This will set all prompts to honest 0 values:\n');
  console.log('   - views: 0');
  console.log('   - favorites: 0');
  console.log('   - rating: 0');
  console.log('   - ratingCount: 0');
  console.log('   - shares: 0\n');

  try {
    const db = await getDb();
    const collection = db.collection('prompts');

    // Find prompts with mock metrics (> 0)
    const promptsWithMockData = await collection.find({
      $or: [
        { views: { $gt: 0 } },
        { favorites: { $gt: 0 } },
        { rating: { $gt: 0 } },
        { ratingCount: { $gt: 0 } },
        { shares: { $gt: 0 } },
      ],
    }).toArray();

    console.log(`📊 Found ${promptsWithMockData.length} prompts with mock metrics\n`);

    if (promptsWithMockData.length === 0) {
      console.log('✅ No mock metrics found - all prompts already have honest 0 values!\n');
      return;
    }

    // Show examples
    console.log('📋 Examples of prompts with mock data:');
    promptsWithMockData.slice(0, 5).forEach((p) => {
      console.log(`   - "${p.title}"`);
      console.log(`     views: ${p.views || 0}, rating: ${p.rating || 0}, ratingCount: ${p.ratingCount || 0}`);
    });
    console.log('');

    // Reset all metrics to 0
    const result = await collection.updateMany(
      {
        $or: [
          { views: { $gt: 0 } },
          { favorites: { $gt: 0 } },
          { rating: { $gt: 0 } },
          { ratingCount: { $gt: 0 } },
          { shares: { $gt: 0 } },
        ],
      },
      {
        $set: {
          views: 0,
          favorites: 0,
          rating: 0,
          ratingCount: 0,
          shares: 0,
          updatedAt: new Date(),
        },
      }
    );

    console.log(`✨ Reset complete!`);
    console.log(`   - Updated: ${result.modifiedCount} prompts`);
    console.log(`   - Matched: ${result.matchedCount} prompts\n`);

    // Verify
    const remainingMockData = await collection.find({
      $or: [
        { views: { $gt: 0 } },
        { favorites: { $gt: 0 } },
        { rating: { $gt: 0 } },
        { ratingCount: { $gt: 0 } },
        { shares: { $gt: 0 } },
      ],
    }).count();

    if (remainingMockData === 0) {
      console.log('✅ Verification passed - all metrics reset to 0!\n');
    } else {
      console.warn(`⚠️  Warning: ${remainingMockData} prompts still have mock metrics\n`);
    }
  } catch (error) {
    logger.error('Failed to reset mock metrics', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

// Run reset
resetMockMetrics()
  .then(() => {
    console.log('✅ Mock metrics reset completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Mock metrics reset failed:', error);
    process.exit(1);
  });

