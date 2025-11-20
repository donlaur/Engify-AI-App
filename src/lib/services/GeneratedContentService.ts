/**
 * Generated Content Service
 * Manages AI-generated content for review and publishing
 */

import { getDb } from '@/lib/db/mongodb';
import { GeneratedContent } from '@/lib/db/schemas/generated-content';
import { ObjectId } from 'mongodb';

export class GeneratedContentService {
  private async getCollection() {
    const db = await getDb();
    return db.collection<GeneratedContent>('generated_content');
  }

  /**
   * Save generated content for review
   */
  async save(content: Omit<GeneratedContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<GeneratedContent> {
    const collection = await this.getCollection();
    const id = new ObjectId().toString();
    
    const item: GeneratedContent = {
      ...content,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(item as any);
    return item;
  }

  /**
   * Get all generated content
   */
  async getAll(filters?: {
    status?: GeneratedContent['status'];
    contentType?: GeneratedContent['contentType'];
    createdBy?: string;
  }): Promise<GeneratedContent[]> {
    const collection = await this.getCollection();
    const query: any = {};
    
    if (filters?.status) query.status = filters.status;
    if (filters?.contentType) query.contentType = filters.contentType;
    if (filters?.createdBy) query.createdBy = filters.createdBy;

    const items = await collection.find(query).sort({ createdAt: -1 }).toArray();
    return items as GeneratedContent[];
  }

  /**
   * Get by ID
   */
  async getById(id: string): Promise<GeneratedContent | null> {
    const collection = await this.getCollection();
    const item = await collection.findOne({ id });
    return item as GeneratedContent | null;
  }

  /**
   * Update content
   */
  async update(id: string, updates: Partial<GeneratedContent>): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { id },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  /**
   * Approve content
   */
  async approve(id: string, reviewedBy: string, notes?: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { id },
      { 
        $set: { 
          status: 'approved',
          reviewedBy,
          reviewNotes: notes,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        } 
      }
    );
  }

  /**
   * Reject content
   */
  async reject(id: string, reviewedBy: string, notes: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { id },
      { 
        $set: { 
          status: 'rejected',
          reviewedBy,
          reviewNotes: notes,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        } 
      }
    );
  }

  /**
   * Mark as published
   */
  async markPublished(id: string, url: string, slug: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { id },
      { 
        $set: { 
          status: 'published',
          publishedUrl: url,
          slug,
          publishedAt: new Date(),
          updatedAt: new Date(),
        } 
      }
    );
  }

  /**
   * Delete content
   */
  async delete(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ id });
  }

  /**
   * Get stats
   */
  async getStats() {
    const collection = await this.getCollection();
    
    const [total, byStatus, byType] = await Promise.all([
      collection.countDocuments(),
      collection.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      collection.aggregate([
        { $group: { _id: '$contentType', count: { $sum: 1 } } }
      ]).toArray(),
    ]);

    return {
      total,
      byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
      byType: Object.fromEntries(byType.map(t => [t._id, t.count])),
    };
  }
}

export const generatedContentService = new GeneratedContentService();
