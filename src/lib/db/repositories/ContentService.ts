/**
 * Unified Content Service
 * 
 * Single entry point for all content retrieval
 * Provides consistent API across prompts, patterns, and learning resources
 */

import { promptRepository } from './PromptRepository';
import { patternRepository } from './PatternRepository';
import { learningResourceRepository } from './LearningResourceRepository';

/**
 * Content Type Enum
 */
export type ContentType = 'prompts' | 'patterns' | 'learning';

/**
 * Unified Content Service
 * Provides a single interface for all content types
 */
export class ContentService {
  /**
   * Get repository for content type
   */
  private getRepository(type: ContentType) {
    switch (type) {
      case 'prompts':
        return promptRepository;
      case 'patterns':
        return patternRepository;
      case 'learning':
        return learningResourceRepository;
      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  }

  /**
   * Get all content of a type
   */
  async getAll<T>(type: ContentType): Promise<T[]> {
    const repository = this.getRepository(type);
    return repository.getAll() as Promise<T[]>;
  }

  /**
   * Get content by ID
   */
  async getById<T>(type: ContentType, id: string): Promise<T | null> {
    const repository = this.getRepository(type);
    return repository.getById(id) as Promise<T | null>;
  }

  /**
   * Get content by slug
   */
  async getBySlug<T>(type: ContentType, slug: string): Promise<T | null> {
    const repository = this.getRepository(type);
    return repository.getBySlug(slug) as Promise<T | null>;
  }

  /**
   * Count content
   */
  async count(type: ContentType): Promise<number> {
    const repository = this.getRepository(type);
    return repository.count();
  }

  /**
   * Search content
   */
  async search<T>(type: ContentType, query: string): Promise<T[]> {
    const repository = this.getRepository(type);
    return repository.search(query) as Promise<T[]>;
  }

  /**
   * Get stats for all content types
   */
  async getStats() {
    const [prompts, patterns, learning] = await Promise.all([
      promptRepository.count(),
      patternRepository.count(),
      learningResourceRepository.count(),
    ]);

    return {
      prompts,
      patterns,
      learning,
      total: prompts + patterns + learning,
    };
  }
}

// Export singleton instance
export const contentService = new ContentService();

// Export individual repositories for direct access when needed
export { promptRepository, patternRepository, learningResourceRepository };
