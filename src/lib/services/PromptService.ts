/**
 * Prompt Service
 */

import { ObjectId } from 'mongodb';
import { BaseService } from './BaseService';
import { PromptTemplate, PromptTemplateSchema } from '@/lib/db/schema';

export class PromptService extends BaseService<PromptTemplate> {
  constructor() {
    super('prompt_templates', PromptTemplateSchema);
  }

  async findByCategory(category: string): Promise<PromptTemplate[]> {
    return this.find({ category, isPublic: true } as any);
  }

  async findByRole(role: string): Promise<PromptTemplate[]> {
    return this.find({ role, isPublic: true } as any);
  }

  async findFeatured(): Promise<PromptTemplate[]> {
    return this.find({ isFeatured: true, isPublic: true } as any);
  }

  async search(query: string): Promise<PromptTemplate[]> {
    const collection = await this.getCollection();
    return collection
      .find({
        isPublic: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      } as any)
      .toArray();
  }

  async incrementViews(promptId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(promptId) } as any,
      { $inc: { 'stats.views': 1 } }
    );
  }

  async incrementUses(promptId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(promptId) } as any,
      { $inc: { 'stats.uses': 1 } }
    );
  }
}

export const promptService = new PromptService();
