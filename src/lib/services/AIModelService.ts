/**
 * AI Model Service
 *
 * Manages AI model registry in MongoDB
 * Provides CRUD operations and sync functionality
 */

import { BaseService } from './BaseService';
import { AIModelSchema, AIModel } from '@/lib/db/schemas/ai-model';

export class AIModelService extends BaseService<AIModel> {
  constructor() {
    super('ai_models', AIModelSchema);
  }

  /**
   * Find model by ID or slug (custom ID, not MongoDB _id)
   */
  async findById(idOrSlug: string): Promise<AIModel | null> {
    const collection = await this.getCollection();
    const model = await collection.findOne({
      $or: [{ id: idOrSlug }, { slug: idOrSlug }],
    });
    return model as AIModel | null;
  }

  /**
   * Find model by slug
   */
  async findBySlug(slug: string): Promise<AIModel | null> {
    const collection = await this.getCollection();
    const model = await collection.findOne({ slug });
    return model as AIModel | null;
  }

  /**
   * Find all active models
   */
  async findActive(): Promise<AIModel[]> {
    return this.find({ status: 'active', isAllowed: true });
  }

  /**
   * Find models by provider
   */
  async findByProvider(provider: AIModel['provider']): Promise<AIModel[]> {
    return this.find({ provider, isAllowed: true });
  }

  /**
   * Find allowed models (isAllowed: true)
   */
  async findAllowed(): Promise<AIModel[]> {
    return this.find({ isAllowed: true });
  }

  /**
   * Mark model as deprecated
   */
  async deprecate(
    id: string,
    replacementModel?: string,
    sunsetDate?: Date
  ): Promise<AIModel | null> {
    const update: Partial<AIModel> = {
      status: 'deprecated',
      deprecationDate: new Date(),
    };

    if (replacementModel) {
      update.replacementModel = replacementModel;
    }

    if (sunsetDate) {
      update.sunsetDate = sunsetDate;
    }

    // Find by custom ID
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return result as AIModel | null;
  }

  /**
   * Toggle model allowance
   */
  async setAllowed(id: string, allowed: boolean): Promise<AIModel | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { isAllowed: allowed, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return result as AIModel | null;
  }

  /**
   * Update last verified date
   */
  async updateLastVerified(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { id },
      { $set: { lastVerified: new Date(), updatedAt: new Date() } }
    );
  }

  /**
   * Upsert model (create or update)
   */
  async upsert(model: AIModel): Promise<AIModel> {
    const collection = await this.getCollection();

    const existing = await collection.findOne({ id: model.id });

    if (existing) {
      // Update existing
      const result = await collection.findOneAndUpdate(
        { id: model.id },
        {
          $set: {
            ...model,
            updatedAt: new Date(),
            // Preserve _id if exists
            _id: existing._id,
          },
        },
        { returnDocument: 'after' }
      );
      return result as AIModel;
    } else {
      // Insert new
      const result = await collection.insertOne({
        ...model,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as AIModel);

      return {
        ...model,
        _id: result.insertedId.toString(),
      } as AIModel;
    }
  }

  /**
   * Bulk upsert models (for provider sync)
   */
  async bulkUpsert(
    models: AIModel[]
  ): Promise<{ created: number; updated: number }> {
    const collection = await this.getCollection();
    let created = 0;
    let updated = 0;

    for (const model of models) {
      const existing = await collection.findOne({ id: model.id });

      if (existing) {
        await collection.updateOne(
          { id: model.id },
          {
            $set: {
              ...model,
              updatedAt: new Date(),
              _id: existing._id,
            },
          }
        );
        updated++;
      } else {
        await collection.insertOne({
          ...model,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as AIModel);
        created++;
      }
    }

    return { created, updated };
  }
}

// Singleton instance
export const aiModelService = new AIModelService();
