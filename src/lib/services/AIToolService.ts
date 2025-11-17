/**
 * AI Tool Service
 *
 * Manages AI development tools registry in MongoDB
 */

import { BaseService } from './BaseService';
import { AIToolSchema, AITool } from '@/lib/db/schemas/ai-tool';

export class AIToolService extends BaseService<any> {
  constructor() {
    super('ai_tools', AIToolSchema);
  }

  /**
   * Find tool by ID or slug
   */
  async findById(idOrSlug: string): Promise<AITool | null> {
    const collection = await this.getCollection();
    const tool = await collection.findOne({
      $or: [{ id: idOrSlug }, { slug: idOrSlug }],
    });
    return tool as AITool | null;
  }

  /**
   * Find tool by slug
   */
  async findBySlug(slug: string): Promise<AITool | null> {
    const collection = await this.getCollection();
    const tool = await collection.findOne({ slug });
    return tool as AITool | null;
  }

  /**
   * Find all active tools
   */
  async findActive(): Promise<AITool[]> {
    return this.find({ status: 'active' });
  }

  /**
   * Find tools by category
   */
  async findByCategory(category: AITool['category']): Promise<AITool[]> {
    return this.find({ category, status: 'active' });
  }

  /**
   * Find tools with affiliate links
   */
  async findWithAffiliates(): Promise<AITool[]> {
    const collection = await this.getCollection();
    const tools = await collection
      .find({
        affiliateLink: { $exists: true, $ne: null },
        status: 'active',
      })
      .toArray();
    return tools as AITool[];
  }

  /**
   * Upsert tool (create or update)
   */
  async upsert(tool: AITool): Promise<AITool> {
    const collection = await this.getCollection();

    const existing = await collection.findOne({ id: tool.id });

    if (existing) {
      // Update existing
      const result = await collection.findOneAndUpdate(
        { id: tool.id },
        {
          $set: {
            ...tool,
            updatedAt: new Date(),
            _id: existing._id,
          },
        },
        { returnDocument: 'after' }
      );
      return result as AITool;
    } else {
      // Create new
      const result = await collection.insertOne({
        ...tool,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as AITool);
      return {
        ...tool,
        _id: result.insertedId.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as AITool;
    }
  }
}

// Singleton instance
export const aiToolService = new AIToolService();
