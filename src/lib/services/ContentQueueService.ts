/**
 * Content Queue Service
 * Manages the content generation queue
 */

import { getDb } from '@/lib/db/mongodb';
import { ContentQueueItem, ContentQueueBatch } from '@/lib/db/schemas/content-queue';
import { ObjectId } from 'mongodb';

export class ContentQueueService {
  private async getCollection() {
    const db = await getDb();
    return db.collection<ContentQueueItem>('content_queue');
  }

  private async getBatchCollection() {
    const db = await getDb();
    return db.collection<ContentQueueBatch>('content_queue_batches');
  }

  /**
   * Add item to queue
   */
  async addToQueue(item: Omit<ContentQueueItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ContentQueueItem> {
    const collection = await this.getCollection();
    const id = new ObjectId().toString();
    
    const queueItem: ContentQueueItem = {
      ...item,
      id,
      status: 'queued',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(queueItem as any);
    return queueItem;
  }

  /**
   * Add multiple items to queue
   */
  async addBatchToQueue(
    items: Omit<ContentQueueItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>[],
    batchName?: string
  ): Promise<{ items: ContentQueueItem[]; batchId?: string }> {
    const collection = await this.getCollection();
    const batchCollection = await this.getBatchCollection();
    
    const queueItems: ContentQueueItem[] = items.map(item => ({
      ...item,
      id: new ObjectId().toString(),
      status: 'queued' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await collection.insertMany(queueItems as any);

    // Create batch if name provided
    let batchId: string | undefined;
    if (batchName) {
      batchId = new ObjectId().toString();
      const batch: ContentQueueBatch = {
        id: batchId,
        name: batchName,
        itemIds: queueItems.map(i => i.id),
        status: 'pending',
        createdBy: items[0].createdBy,
        createdAt: new Date(),
      };
      await batchCollection.insertOne(batch as any);
    }

    return { items: queueItems, batchId };
  }

  /**
   * Get all queue items
   */
  async getQueue(filters?: {
    status?: ContentQueueItem['status'];
    priority?: ContentQueueItem['priority'];
    contentType?: ContentQueueItem['contentType'];
    batch?: string;
  }): Promise<ContentQueueItem[]> {
    const collection = await this.getCollection();
    const query: any = {};
    
    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;
    if (filters?.contentType) query.contentType = filters.contentType;
    if (filters?.batch) query.batch = filters.batch;

    const items = await collection.find(query).sort({ priority: -1, createdAt: 1 }).toArray();
    return items as ContentQueueItem[];
  }

  /**
   * Get queue stats
   */
  async getQueueStats() {
    const collection = await this.getCollection();
    
    const [total, byStatus, byPriority, byType] = await Promise.all([
      collection.countDocuments(),
      collection.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      collection.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]).toArray(),
      collection.aggregate([
        { $group: { _id: '$contentType', count: { $sum: 1 } } }
      ]).toArray(),
    ]);

    return {
      total,
      byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
      byPriority: Object.fromEntries(byPriority.map(p => [p._id, p.count])),
      byType: Object.fromEntries(byType.map(t => [t._id, t.count])),
    };
  }

  /**
   * Update queue item
   */
  async updateQueueItem(id: string, updates: Partial<ContentQueueItem>): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { id },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  /**
   * Delete queue item
   */
  async deleteQueueItem(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ id });
  }

  /**
   * Get next items to generate
   */
  async getNextToGenerate(limit: number = 10): Promise<ContentQueueItem[]> {
    const collection = await this.getCollection();
    const items = await collection
      .find({ status: 'queued' })
      .sort({ priority: -1, createdAt: 1 })
      .limit(limit)
      .toArray();
    
    return items as ContentQueueItem[];
  }

  /**
   * Mark items as generating
   */
  async markAsGenerating(ids: string[], jobId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateMany(
      { id: { $in: ids } },
      { 
        $set: { 
          status: 'generating',
          generationJobId: jobId,
          updatedAt: new Date()
        } 
      }
    );
  }

  /**
   * Mark item as completed
   */
  async markAsCompleted(id: string, contentId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { id },
      { 
        $set: { 
          status: 'completed',
          generatedContentId: contentId,
          generatedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
  }

  /**
   * Mark item as failed
   */
  async markAsFailed(id: string, error: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { id },
      { 
        $set: { 
          status: 'failed',
          generationError: error,
          updatedAt: new Date()
        } 
      }
    );
  }
}

export const contentQueueService = new ContentQueueService();
