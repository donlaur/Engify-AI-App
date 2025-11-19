/**
 * AI Tool Update Repository
 * 
 * Repository pattern for AI tool/model updates
 * Follows SOLID principles - Single Responsibility
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { AIToolUpdate } from '@/lib/db/schemas/ai-tool-update';
import { logger } from '@/lib/logging/logger';

export class AIToolUpdateRepository {
  private readonly collectionName = 'ai_tool_updates';

  /**
   * Get collection
   */
  private async getCollection() {
    const db = await getMongoDb();
    return db.collection<AIToolUpdate>(this.collectionName);
  }

  /**
   * Find update by ID, GUID, or link
   */
  async findByUniqueIdentifier(
    identifier: { id?: string; guid?: string; link?: string }
  ): Promise<AIToolUpdate | null> {
    const collection = await this.getCollection();
    
    const query: any = {};
    if (identifier.id) query.id = identifier.id;
    if (identifier.guid) query.guid = identifier.guid;
    if (identifier.link) query.link = identifier.link;

    return await collection.findOne({
      $or: Object.entries(query).map(([key, value]) => ({ [key]: value })),
    });
  }

  /**
   * Create a new update
   */
  async create(update: AIToolUpdate): Promise<AIToolUpdate> {
    const collection = await this.getCollection();
    const now = new Date();
    
    const document = {
      ...update,
      createdAt: now,
      syncedAt: now,
    };

    await collection.insertOne(document);
    logger.debug('Created update', { id: update.id, title: update.title });
    return document;
  }

  /**
   * Update existing update
   */
  async update(
    existingId: string,
    update: Partial<AIToolUpdate>
  ): Promise<void> {
    const collection = await this.getCollection();
    
    await collection.updateOne(
      { _id: existingId },
      {
        $set: {
          ...update,
          updatedAt: new Date(),
          syncedAt: new Date(),
        },
      }
    );
    
    logger.debug('Updated update', { id: existingId });
  }

  /**
   * Upsert update (create or update)
   */
  async upsert(update: AIToolUpdate): Promise<{ created: boolean; updated: boolean }> {
    const existing = await this.findByUniqueIdentifier({
      guid: update.guid,
      link: update.link,
      id: update.id,
    });

    if (existing) {
      await this.update(existing._id!, update);
      return { created: false, updated: true };
    } else {
      await this.create(update);
      return { created: true, updated: false };
    }
  }

  /**
   * Bulk upsert updates
   */
  async bulkUpsert(updates: AIToolUpdate[]): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    for (const update of updates) {
      const result = await this.upsert(update);
      if (result.created) created++;
      if (result.updated) updated++;
    }

    return { created, updated };
  }

  /**
   * Find updates by tool ID
   */
  async findByToolId(toolId: string, limit: number = 10): Promise<AIToolUpdate[]> {
    const collection = await this.getCollection();
    
    return await collection
      .find({
        toolId,
        status: 'active',
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Find updates by model ID
   */
  async findByModelId(modelId: string, limit: number = 10): Promise<AIToolUpdate[]> {
    const collection = await this.getCollection();
    
    return await collection
      .find({
        modelId,
        status: 'active',
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Find updates by multiple criteria
   */
  async find(query: {
    toolId?: string;
    modelId?: string;
    type?: AIToolUpdate['type'];
    source?: AIToolUpdate['source'];
    limit?: number;
  }): Promise<AIToolUpdate[]> {
    const collection = await this.getCollection();
    
    const mongoQuery: any = {
      status: 'active',
    };
    
    if (query.toolId) mongoQuery.toolId = query.toolId;
    if (query.modelId) mongoQuery.modelId = query.modelId;
    if (query.type) mongoQuery.type = query.type;
    if (query.source) mongoQuery.source = query.source;

    return await collection
      .find(mongoQuery)
      .sort({ publishedAt: -1 })
      .limit(query.limit || 10)
      .toArray();
  }
}

