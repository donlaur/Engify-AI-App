/**
 * Feed Configuration Repository
 * 
 * Repository pattern for managing feed configurations
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { FeedConfig, FeedConfigSchema } from '@/lib/db/schemas/feed-config';
import { logger } from '@/lib/logging/logger';
import { Collection } from 'mongodb';

export class FeedConfigRepository {
  private readonly collectionName = 'feed_configs';

  /**
   * Get collection
   */
  private async getCollection(): Promise<Collection<FeedConfig>> {
    const db = await getMongoDb();
    return db.collection<FeedConfig>(this.collectionName);
  }

  /**
   * Create index on URL for uniqueness
   */
  async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection();
    await collection.createIndex({ url: 1 }, { unique: true });
    await collection.createIndex({ enabled: 1 });
    await collection.createIndex({ source: 1 });
  }

  /**
   * Find all enabled feeds
   */
  async findEnabled(): Promise<FeedConfig[]> {
    const collection = await this.getCollection();
    return collection.find({ enabled: true }).toArray();
  }

  /**
   * Find all feeds (including disabled)
   */
  async findAll(): Promise<FeedConfig[]> {
    const collection = await this.getCollection();
    return collection.find({}).toArray();
  }

  /**
   * Find feed by ID
   */
  async findById(id: string): Promise<FeedConfig | null> {
    const collection = await this.getCollection();
    return collection.findOne({ id });
  }

  /**
   * Find feed by URL
   */
  async findByUrl(url: string): Promise<FeedConfig | null> {
    const collection = await this.getCollection();
    return collection.findOne({ url });
  }

  /**
   * Create a new feed configuration
   */
  async create(config: FeedConfig): Promise<FeedConfig> {
    const collection = await this.getCollection();
    const now = new Date();
    
    const document = {
      ...config,
      createdAt: now,
      updatedAt: now,
    };

    // Validate with Zod
    const validated = FeedConfigSchema.parse(document);
    
    await collection.insertOne(validated);
    logger.debug('Created feed config', { id: config.id, url: config.url });
    return validated;
  }

  /**
   * Update existing feed configuration
   */
  async update(id: string, updates: Partial<FeedConfig>): Promise<void> {
    const collection = await this.getCollection();
    
    await collection.updateOne(
      { id },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );
    
    logger.debug('Updated feed config', { id });
  }

  /**
   * Upsert feed configuration (create or update)
   */
  async upsert(config: FeedConfig): Promise<{ created: boolean; updated: boolean }> {
    const existing = await this.findByUrl(config.url);

    if (existing) {
      await this.update(existing.id, config);
      return { created: false, updated: true };
    } else {
      await this.create(config);
      return { created: true, updated: false };
    }
  }

  /**
   * Delete feed configuration
   */
  async delete(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ id });
    logger.debug('Deleted feed config', { id });
  }

  /**
   * Enable/disable feed
   */
  async setEnabled(id: string, enabled: boolean): Promise<void> {
    await this.update(id, { enabled });
  }

  /**
   * Update last sync time and clear errors
   */
  async recordSync(id: string, success: boolean, error?: string): Promise<void> {
    const updates: Partial<FeedConfig> = {
      lastSyncedAt: new Date(),
    };

    if (success) {
      updates.errorCount = 0;
      updates.lastError = undefined;
    } else {
      const existing = await this.findById(id);
      updates.errorCount = (existing?.errorCount || 0) + 1;
      updates.lastError = error;
    }

    await this.update(id, updates);
  }
}

