#!/usr/bin/env tsx
/**
 * Test News Aggregator
 * 
 * Tests the news aggregator functionality:
 * 1. Seed feed configurations
 * 2. Test feed fetching
 * 3. Test feed syncing
 */

import { seedFeedConfigs } from './db/seed-feed-configs';
import { newsAggregatorService } from '@/lib/services/NewsAggregatorService';
import { FeedConfigRepository } from '@/lib/repositories/FeedConfigRepository';
import { logger } from '@/lib/logging/logger';

async function testNewsAggregator() {
  console.log('🧪 Testing News Aggregator...\n');

  // Step 1: Seed feed configurations
  console.log('1️⃣ Seeding feed configurations...');
  try {
    const seedResult = await seedFeedConfigs();
    console.log(`   ✅ Seeded ${seedResult.created} new feeds, updated ${seedResult.updated} existing\n`);
  } catch (error) {
    console.error('   ❌ Error seeding feeds:', error);
    return;
  }

  // Step 2: List all feeds
  console.log('2️⃣ Listing all feeds...');
  try {
    const repository = new FeedConfigRepository();
    const feeds = await repository.findEnabled();
    console.log(`   ✅ Found ${feeds.length} enabled feeds:`);
    feeds.forEach((feed) => {
      console.log(`      - ${feed.name || feed.url} (${feed.feedType})`);
    });
    console.log('');
  } catch (error) {
    console.error('   ❌ Error listing feeds:', error);
    return;
  }

  // Step 3: Test fetching a single feed
  console.log('3️⃣ Testing feed fetching...');
  try {
    const testFeed = 'https://cursor.sh/rss.xml';
    const feed = await newsAggregatorService.fetchFeed(testFeed);
    if (feed && feed.items) {
      console.log(`   ✅ Successfully fetched feed: ${feed.title || testFeed}`);
      console.log(`      Items: ${feed.items.length}`);
      if (feed.items.length > 0) {
        console.log(`      Latest: ${feed.items[0]?.title || 'N/A'}`);
      }
    } else {
      console.log('   ⚠️  Feed fetched but no items found');
    }
    console.log('');
  } catch (error) {
    console.error('   ❌ Error fetching feed:', error);
    return;
  }

  // Step 4: Test syncing all feeds (limited to first feed for testing)
  console.log('4️⃣ Testing feed sync (first feed only)...');
  try {
    const repository = new FeedConfigRepository();
    const feeds = await repository.findEnabled();
    
    if (feeds.length === 0) {
      console.log('   ⚠️  No feeds to sync');
      return;
    }

    // Sync just the first feed for testing
    const firstFeed = feeds[0];
    const config = {
      url: firstFeed.url,
      source: firstFeed.source,
      toolId: firstFeed.toolId,
      modelId: firstFeed.modelId,
      type: firstFeed.type,
      feedType: firstFeed.feedType || 'rss',
      apiConfig: firstFeed.apiConfig,
    };

    const result = await newsAggregatorService.syncFeed(config);
    console.log(`   ✅ Sync complete for ${firstFeed.name || firstFeed.url}:`);
    console.log(`      Created: ${result.created}`);
    console.log(`      Updated: ${result.updated}`);
    console.log(`      Errors: ${result.errors}`);
    console.log(`      Models triggered: ${result.modelsTriggered.length}`);
    console.log('');
  } catch (error) {
    console.error('   ❌ Error syncing feed:', error);
    return;
  }

  console.log('✅ All tests completed successfully!');
}

// Run if called directly
if (require.main === module) {
  testNewsAggregator()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testNewsAggregator };

