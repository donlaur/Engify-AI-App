/**
 * Prompt Service
 */

import { ObjectId } from 'mongodb';
import { BaseService } from './BaseService';
import { PromptTemplate, PromptTemplateSchema } from '@/lib/db/schema';

export class PromptService extends BaseService<PromptTemplate> {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super('prompt_templates', PromptTemplateSchema as any); // Zod schema type mismatch
  }

  async findByCategory(category: string): Promise<PromptTemplate[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.find({ category, isPublic: true } as any); // MongoDB filter type
  }

  async findByRole(role: string): Promise<PromptTemplate[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.find({ role, isPublic: true } as any); // MongoDB filter type
  }

  async search(query: string): Promise<PromptTemplate[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { // MongoDB query operators
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [query] } },
      ],
      isPublic: true,
    };
    return this.find(filter);
  }

  async incrementViews(id: string): Promise<void> {
    const collection = await this.getCollection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { _id: new ObjectId(id) }; // MongoDB filter type
    await collection.updateOne(filter, { $inc: { 'stats.views': 1 } });
  }

  async updateRating(id: string, rating: number): Promise<void> {
    const collection = await this.getCollection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { _id: new ObjectId(id) }; // MongoDB filter type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: any = { $push: { 'stats.ratings': rating } }; // MongoDB update operators
    await collection.updateOne(filter, update);
  }
}

export const promptService = new PromptService();
