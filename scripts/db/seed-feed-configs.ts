#!/usr/bin/env tsx
/**
 * Seed Initial Feed Configurations
 * 
 * Seeds the database with initial RSS/Atom feed configurations
 */

import { FeedConfigRepository } from '@/lib/repositories/FeedConfigRepository';
import { FeedConfig } from '@/lib/db/schemas/feed-config';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/logging/logger';

const DEFAULT_FEEDS: Omit<FeedConfig, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Cursor
  {
    url: 'https://cursor.sh/rss.xml',
    source: 'cursor-blog',
    toolId: 'cursor',
    type: 'blog-post',
    feedType: 'rss',
    name: 'Cursor Blog',
    description: 'Cursor AI coding assistant blog posts and updates',
    enabled: true,
  },
  {
    url: 'https://status.cursor.com/history.rss',
    source: 'cursor-status',
    toolId: 'cursor',
    type: 'status-incident',
    feedType: 'rss',
    name: 'Cursor Status',
    description: 'Cursor service status and incident reports',
    enabled: true,
  },
  // Windsurf / Codeium
  {
    url: 'https://windsurf.com/changelog/feed.xml',
    source: 'windsurf-changelog',
    toolId: 'windsurf',
    type: 'changelog',
    feedType: 'rss',
    name: 'Windsurf Changelog',
    description: 'Windsurf IDE changelog and feature updates',
    enabled: true,
  },
  {
    url: 'https://status.codeium.com/history.rss',
    source: 'codeium-status',
    toolId: 'windsurf',
    type: 'status-incident',
    feedType: 'rss',
    name: 'Codeium Status',
    description: 'Codeium service status and incidents',
    enabled: true,
  },
  // OpenRouter
  {
    url: 'https://status.openrouter.ai/history.atom',
    source: 'openrouter-status',
    type: 'status-incident',
    feedType: 'atom',
    name: 'OpenRouter Status',
    description: 'OpenRouter API status and incidents',
    enabled: true,
  },
  // Hugging Face
  {
    url: 'https://huggingface.co/blog/feed.xml',
    source: 'huggingface-blog',
    type: 'blog-post',
    feedType: 'rss',
    name: 'Hugging Face Blog',
    description: 'Hugging Face blog posts about AI models and tools',
    enabled: true,
  },
  // Warp
  {
    url: 'https://www.warp.dev/blog/feed.xml',
    source: 'warp-blog',
    toolId: 'warp',
    type: 'blog-post',
    feedType: 'rss',
    name: 'Warp Blog',
    description: 'Warp terminal blog posts and feature announcements',
    enabled: true,
  },
];

async function seedFeedConfigs() {
  const repository = new FeedConfigRepository();
  
  // Ensure indexes
  await repository.ensureIndexes();
  
  logger.info('Seeding feed configurations', { count: DEFAULT_FEEDS.length });

  let created = 0;
  let updated = 0;

  for (const feed of DEFAULT_FEEDS) {
    try {
      const feedConfig: FeedConfig = {
        ...feed,
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await repository.upsert(feedConfig);
      if (result.created) {
        created++;
        logger.info('Created feed config', { url: feed.url, name: feed.name });
      } else {
        updated++;
        logger.info('Updated feed config', { url: feed.url, name: feed.name });
      }
    } catch (error) {
      logger.error('Error seeding feed config', {
        url: feed.url,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info('Feed configuration seeding complete', { created, updated });
  return { created, updated };
}

// Run if called directly
if (require.main === module) {
  seedFeedConfigs()
    .then(({ created, updated }) => {
      console.log(`✅ Seeded ${created} new feeds, updated ${updated} existing feeds`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding feeds:', error);
      process.exit(1);
    });
}

export { seedFeedConfigs };

