/**
 * Prompt Repository
 *
 * Retrieval: Raw MongoDB documents
 * Processing: Transform to Prompt schema
 * Formatting: Shape for UI/API
 */

import { BaseRepository } from './BaseRepository';
import type { ContentRepository, ContentProcessor } from './BaseRepository';
import type { Prompt } from '@/lib/schemas/prompt';

interface PromptDocument {
  _id?: unknown;
  id?: string;
  slug?: string;
  title: string;
  description: string;
  content: string;
  category: string;
  role?: string;
  pattern?: string;
  tags?: string[];
  isFeatured?: boolean;
  isPublic?: boolean;
  active?: boolean;
  views?: number;
  rating?: number;
  ratingCount?: number;
  stats?: {
    averageRating?: number;
    totalRatings?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
  // Include ALL possible fields from MongoDB
  [key: string]: unknown;
}

/**
 * Prompt Processor
 * Transforms MongoDB documents to Prompt entities
 */
class PromptProcessor implements ContentProcessor<PromptDocument, Prompt> {
  process(raw: PromptDocument): Prompt {
    return {
      id: raw.id || (raw._id ? String(raw._id) : ''),
      slug: raw.slug,
      title: raw.title,
      description: raw.description,
      content: raw.content,
      category: raw.category as Prompt['category'],
      role: raw.role as Prompt['role'],
      pattern: raw.pattern as Prompt['pattern'],
      tags: raw.tags || [],
      isFeatured: raw.isFeatured || false,
      views: raw.views || 0,
      rating: raw.rating || raw.stats?.averageRating || 0,
      ratingCount: raw.ratingCount || raw.stats?.totalRatings || 0,
      createdAt: raw.createdAt || new Date(),
      updatedAt: raw.updatedAt || new Date(),
      isPublic: raw.isPublic !== false,
      active: raw.active !== false,
    };
  }

  processMany(raw: PromptDocument[]): Prompt[] {
    return raw.map((doc) => this.process(doc));
  }
}

/**
 * Prompt Repository
 * Unified retrieval using BaseRepository pattern
 */
export class PromptRepository
  extends BaseRepository<PromptDocument>
  implements ContentRepository<Prompt>
{
  private processor: PromptProcessor;

  constructor() {
    super('prompts');
    this.processor = new PromptProcessor();
  }

  /**
   * Get all active, public prompts
   * Query timeout: 15 seconds (handled by BaseRepository.find)
   */
  async getAll(): Promise<Prompt[]> {
    const documents = await this.find({
      isPublic: true,
      active: { $ne: false },
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get prompt by ID or slug
   */
  async getById(idOrSlug: string): Promise<Prompt | null> {
    const document = await this.findOne({
      $or: [{ id: idOrSlug }, { slug: idOrSlug }, { _id: idOrSlug }],
      isPublic: true,
      active: { $ne: false },
    });
    return document ? this.processor.process(document) : null;
  }

  /**
   * Get prompt by slug
   */
  async getBySlug(slug: string): Promise<Prompt | null> {
    return this.getById(slug);
  }

  /**
   * Count active prompts
   */
  async count(): Promise<number> {
    return this.countDocuments({ active: { $ne: false } });
  }

  /**
   * Search prompts by title/description
   */
  async search(query: string): Promise<Prompt[]> {
    const documents = await this.find({
      $text: { $search: query },
      isPublic: true,
      active: { $ne: false },
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get prompts by category
   */
  async getByCategory(category: string): Promise<Prompt[]> {
    const documents = await this.find({
      category: category.toLowerCase(),
      isPublic: true,
      active: { $ne: false },
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get prompts by role
   */
  async getByRole(role: string): Promise<Prompt[]> {
    const documents = await this.find({
      role: role.toLowerCase(),
      isPublic: true,
      active: { $ne: false },
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get prompts by pattern ID
   */
  async getByPattern(patternId: string): Promise<Prompt[]> {
    const documents = await this.find({
      pattern: patternId,
      isPublic: true,
      active: { $ne: false },
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get unique categories
   */
  async getUniqueCategories(): Promise<string[]> {
    const categories = await this.aggregate<string>([
      { $match: { active: { $ne: false } } },
      { $group: { _id: '$category' } },
      { $project: { _id: 0, category: '$_id' } },
    ]);
    return categories.map((c) => c.category).filter(Boolean);
  }

  /**
   * Get unique roles
   */
  async getUniqueRoles(): Promise<string[]> {
    const roles = await this.aggregate<string>([
      { $match: { active: { $ne: false } } },
      { $group: { _id: '$role' } },
      { $project: { _id: 0, role: '$_id' } },
    ]);
    return roles.map((r) => r.role).filter(Boolean);
  }
}

// Export singleton instance
export const promptRepository = new PromptRepository();
