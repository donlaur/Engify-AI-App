/**
 * Unified Content Service
 * 
 * Single entry point for all content retrieval
 * Provides consistent API across prompts, patterns, and learning resources
 */

import { promptRepository } from './PromptRepository';
import { patternRepository } from './PatternRepository';
import { learningResourceRepository } from './LearningResourceRepository';
import { workflowRepository } from './WorkflowRepository';

/**
 * Content Type Enum
 */
export type ContentType = 'prompts' | 'patterns' | 'learning' | 'workflows';

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
      case 'workflows':
        return workflowRepository;
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
    const [prompts, patterns, learning, workflows] = await Promise.all([
      promptRepository.count(),
      patternRepository.count(),
      learningResourceRepository.count(),
      workflowRepository.count(),
    ]);

    return {
      prompts,
      patterns,
      learning,
      workflows,
      total: prompts + patterns + learning + workflows,
    };
  }
}

// Export singleton instance
export const contentService = new ContentService();

// Export individual repositories for direct access when needed
export { promptRepository, patternRepository, learningResourceRepository, workflowRepository };
