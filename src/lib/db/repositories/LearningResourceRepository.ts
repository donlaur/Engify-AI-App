/**
 * Learning Resource Repository
 * 
 * Retrieval: Raw MongoDB documents
 * Processing: Transform to LearningResource schema
 * Formatting: Shape for UI/API
 */

import { BaseRepository } from './BaseRepository';
import type { ContentRepository, ContentProcessor } from './BaseRepository';
import type { LearningResource } from '@/lib/learning/mongodb-learning';

interface LearningResourceDocument {
  _id?: unknown;
  id?: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'course' | 'tutorial' | 'guide' | 'interactive';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  tags?: string[];
  author?: string;
  source?: string;
  featured?: boolean;
  status: 'active' | 'inactive';
  contentHtml?: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    slug: string;
    canonicalUrl: string;
    ogImage?: string;
  };
  views?: number;
  shares?: number;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // Include ALL possible fields from MongoDB
  [key: string]: unknown;
}

/**
 * Learning Resource Processor
 * Transforms MongoDB documents to LearningResource entities
 */
class LearningResourceProcessor
  implements ContentProcessor<LearningResourceDocument, LearningResource>
{
  process(raw: LearningResourceDocument): LearningResource {
    return {
      id: raw.id || (raw._id ? String(raw._id) : ''),
      title: raw.title,
      description: raw.description,
      category: raw.category,
      type: raw.type,
      level: raw.level,
      duration: raw.duration,
      tags: raw.tags || [],
      author: raw.author,
      source: raw.source,
      featured: raw.featured || false,
      status: raw.status || 'active',
      contentHtml: raw.contentHtml,
      seo: raw.seo || {
        metaTitle: raw.title,
        metaDescription: raw.description,
        keywords: [],
        slug: '',
        canonicalUrl: '',
      },
      views: raw.views || 0,
      shares: raw.shares || 0,
      publishedAt: raw.publishedAt,
      createdAt: raw.createdAt || new Date(),
      updatedAt: raw.updatedAt || new Date(),
    };
  }

  processMany(raw: LearningResourceDocument[]): LearningResource[] {
    return raw.map((doc) => this.process(doc));
  }
}

/**
 * Learning Resource Repository
 * Unified retrieval using BaseRepository pattern
 */
export class LearningResourceRepository
  extends BaseRepository<LearningResourceDocument>
  implements ContentRepository<LearningResource>
{
  private processor: LearningResourceProcessor;

  constructor() {
    super('learning_resources');
    this.processor = new LearningResourceProcessor();
  }

  /**
   * Get all active learning resources
   */
  async getAll(): Promise<LearningResource[]> {
    const documents = await this.find(
      { status: 'active' },
      { sort: { featured: -1, publishedAt: -1 } }
    );
    return this.processor.processMany(documents);
  }

  /**
   * Get learning resource by ID
   */
  async getById(id: string): Promise<LearningResource | null> {
    const document = await this.findOne({
      $or: [{ id }, { _id: id as any }],
      status: 'active',
    });
    return document ? this.processor.process(document) : null;
  }

  /**
   * Get learning resource by slug
   * Public query - learning content is intentionally accessible to all users (not organization-scoped)
   */
  async getBySlug(slug: string): Promise<LearningResource | null> {
    const document = await this.findOne({
      'seo.slug': slug,
      status: 'active',
      organizationId: null, // Public content - intentionally null for all users
    });
    return document ? this.processor.process(document) : null;
  }

  /**
   * Count active learning resources
   */
  async count(): Promise<number> {
    return this.countDocuments({ status: 'active' });
  }

  /**
   * Search learning resources
   */
  async search(query: string): Promise<LearningResource[]> {
    const documents = await this.find({
      status: 'active',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get learning resources by category
   * Public query - learning content is intentionally accessible to all users (not organization-scoped)
   */
  async getByCategory(category: string): Promise<LearningResource[]> {
    const documents = await this.find({
      category,
      status: 'active',
      organizationId: null, // Public content - intentionally null for all users
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get learning resources by level
   * Public query - learning content is intentionally accessible to all users (not organization-scoped)
   */
  async getByLevel(level: string): Promise<LearningResource[]> {
    const documents = await this.find({
      level: level as LearningResource['level'],
      status: 'active',
      organizationId: null, // Public content - intentionally null for all users
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get featured learning resources
   */
  async getFeatured(): Promise<LearningResource[]> {
    const documents = await this.find(
      {
        featured: true,
        status: 'active',
      },
      { sort: { publishedAt: -1 }, limit: 10 }
    );
    return this.processor.processMany(documents);
  }

  /**
   * Increment view count for a learning resource
   * Public query - learning content is intentionally accessible to all users (not organization-scoped)
   * Uses timeout to prevent hanging on M0 tier connection pool exhaustion
   */
  async incrementViews(slug: string): Promise<void> {
    try {
      // Add timeout to prevent hanging on connection pool exhaustion
      const collectionPromise = this.getCollection();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 1500)
      );

      const collection = await Promise.race([collectionPromise, timeoutPromise]);
      
      const updatePromise = collection.updateOne(
        {
          'seo.slug': slug,
          organizationId: null, // Public content - intentionally null for all users
        },
        { $inc: { views: 1 } } as any
      );

      // Add timeout for the update operation too
      await Promise.race([
        updatePromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Update operation timeout')), 1000)
        ),
      ]);
    } catch (error) {
      // Silently fail - view counting is non-critical and shouldn't break the page
      // Log at debug level to avoid noise in production logs
      if (process.env.NODE_ENV === 'development') {
        console.debug('View increment skipped (non-critical):', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }
}

// Export singleton instance
export const learningResourceRepository = new LearningResourceRepository();
