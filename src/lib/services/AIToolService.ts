/**
 * AI Tool Service
 *
 * Manages AI development tools registry in MongoDB
 */

import { BaseService } from './BaseService';
import { AIToolSchema, AITool } from '@/lib/db/schemas/ai-tool';

export class AIToolService extends BaseService<AITool> {
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
}

// Singleton instance
export const aiToolService = new AIToolService();
