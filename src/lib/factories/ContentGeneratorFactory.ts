/**
 * Content Generator Factory (SOLID - Dependency Inversion & Open/Closed Principles)
 *
 * Factory for creating content generation, review, and publishing services.
 * Allows adding new implementations without modifying existing code.
 */

import { IContentGenerator } from '@/lib/services/content/interfaces/IContentGenerator';
import { IContentReviewer } from '@/lib/services/content/interfaces/IContentReviewer';
import { IContentPublisher } from '@/lib/services/content/interfaces/IContentPublisher';

import { SingleAgentContentGenerator } from '@/lib/services/content/implementations/SingleAgentContentGenerator';
import { MultiAgentContentGenerator } from '@/lib/services/content/implementations/MultiAgentContentGenerator';
import { ContentReviewService } from '@/lib/services/content/implementations/ContentReviewService';
import { ContentPublishingServiceAdapter } from '@/lib/services/content/implementations/ContentPublishingServiceAdapter';

/**
 * Configuration for content generator creation
 */
export interface GeneratorConfig {
  organizationId: string;
  budgetLimit?: number;
  allowedProviders?: string[];
}

/**
 * Generator types supported by the factory
 */
export type GeneratorType = 'single-agent' | 'multi-agent';
export type ReviewerType = 'multi-agent';
export type PublisherType = 'multi-agent';

/**
 * ContentGeneratorFactory - Creates instances of content services
 *
 * This factory follows the Dependency Inversion Principle by returning
 * interfaces rather than concrete implementations.
 */
export class ContentGeneratorFactory {
  /**
   * Create a content generator instance
   *
   * @param type - Type of generator to create
   * @param config - Configuration for the generator
   * @returns IContentGenerator instance
   */
  static createGenerator(
    type: GeneratorType,
    config: GeneratorConfig
  ): IContentGenerator {
    switch (type) {
      case 'single-agent':
        return new SingleAgentContentGenerator();

      case 'multi-agent':
        return new MultiAgentContentGenerator(config.organizationId);

      default:
        throw new Error(`Unknown generator type: ${type}`);
    }
  }

  /**
   * Create a content reviewer instance
   *
   * @param type - Type of reviewer to create
   * @param config - Configuration for the reviewer
   * @returns IContentReviewer instance
   */
  static createReviewer(
    type: ReviewerType,
    config: GeneratorConfig
  ): IContentReviewer {
    switch (type) {
      case 'multi-agent':
        return new ContentReviewService(config.organizationId);

      default:
        throw new Error(`Unknown reviewer type: ${type}`);
    }
  }

  /**
   * Create a content publisher instance
   *
   * @param type - Type of publisher to create
   * @param config - Configuration for the publisher
   * @returns IContentPublisher instance
   */
  static createPublisher(
    type: PublisherType,
    config: GeneratorConfig
  ): IContentPublisher {
    switch (type) {
      case 'multi-agent':
        return new ContentPublishingServiceAdapter(config.organizationId);

      default:
        throw new Error(`Unknown publisher type: ${type}`);
    }
  }

  /**
   * Get available generator types
   */
  static getAvailableGenerators(): GeneratorType[] {
    return ['single-agent', 'multi-agent'];
  }

  /**
   * Get available reviewer types
   */
  static getAvailableReviewers(): ReviewerType[] {
    return ['multi-agent'];
  }

  /**
   * Get available publisher types
   */
  static getAvailablePublishers(): PublisherType[] {
    return ['multi-agent'];
  }

  /**
   * Get recommended generator based on content requirements
   *
   * @param requirements - Content requirements
   * @returns Recommended generator type
   */
  static getRecommendedGenerator(requirements: {
    wordCount?: number;
    quality?: 'draft' | 'production';
    budget?: 'low' | 'medium' | 'high';
  }): GeneratorType {
    const { wordCount = 800, quality = 'draft', budget = 'medium' } = requirements;

    // Use single agent for drafts, low budget, or short content
    if (quality === 'draft' || budget === 'low' || wordCount < 500) {
      return 'single-agent';
    }

    // Use multi-agent for production content
    return 'multi-agent';
  }
}
