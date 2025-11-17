/**
 * Content Generation Service (SOLID - Facade Pattern)
 *
 * Provides a unified, high-level interface for all content operations.
 * Simplifies complex subsystems by providing a single entry point.
 *
 * This is the main service that clients should use instead of directly
 * accessing generators, reviewers, or publishers.
 */

import { ContentGeneratorFactory, GeneratorType } from '@/lib/factories/ContentGeneratorFactory';
import {
  IContentGenerator,
  ContentGenerationParams,
  GeneratedContent,
} from './interfaces/IContentGenerator';
import {
  IContentReviewer,
  ReviewParams,
  ReviewResult,
} from './interfaces/IContentReviewer';
import {
  IContentPublisher,
  PublishParams,
  PublishResult,
} from './interfaces/IContentPublisher';

/**
 * Complete content workflow result
 */
export interface ContentWorkflowResult {
  content: GeneratedContent;
  review?: ReviewResult;
  publish?: PublishResult;
  totalCost: number;
  totalTime: number;
}

/**
 * ContentGenerationService - Facade for all content operations
 *
 * Benefits:
 * - Single entry point for content operations
 * - Encapsulates complexity of multiple services
 * - Provides common workflows (generate + review + publish)
 * - Centralizes error handling and logging
 */
export class ContentGenerationService {
  private generator: IContentGenerator;
  private reviewer?: IContentReviewer;
  private publisher?: IContentPublisher;
  private organizationId: string;

  constructor(
    organizationId: string,
    generatorType: GeneratorType = 'single-agent'
  ) {
    this.organizationId = organizationId;

    // Create generator using factory
    this.generator = ContentGeneratorFactory.createGenerator(generatorType, {
      organizationId,
    });

    // Optionally create reviewer and publisher for multi-agent workflows
    if (generatorType === 'multi-agent') {
      this.reviewer = ContentGeneratorFactory.createReviewer('multi-agent', {
        organizationId,
      });
      this.publisher = ContentGeneratorFactory.createPublisher('multi-agent', {
        organizationId,
      });
    }
  }

  /**
   * Generate content only (no review or publishing)
   */
  async generate(params: ContentGenerationParams): Promise<GeneratedContent> {
    return this.generator.generate(params);
  }

  /**
   * Review existing content
   */
  async review(params: ReviewParams): Promise<ReviewResult> {
    if (!this.reviewer) {
      throw new Error('Reviewer not available for this generator type');
    }

    return this.reviewer.review(params);
  }

  /**
   * Publish content (generate + review + publish)
   */
  async publish(params: PublishParams): Promise<PublishResult> {
    if (!this.publisher) {
      throw new Error('Publisher not available for this generator type');
    }

    return this.publisher.publish(params);
  }

  /**
   * Complete workflow: Generate → Review → Publish
   *
   * This is the recommended method for production content.
   */
  async generateAndPublish(
    params: ContentGenerationParams & { autoRevise?: boolean }
  ): Promise<ContentWorkflowResult> {
    const startTime = Date.now();
    let totalCost = 0;

    // Step 1: Generate
    const generatedContent = await this.generator.generate(params);
    totalCost += generatedContent.metadata.costUSD;

    // Step 2: Review (if reviewer available)
    let reviewResult: ReviewResult | undefined;
    if (this.reviewer) {
      reviewResult = await this.reviewer.review({
        content: generatedContent.content,
        topic: params.topic,
        keywords: params.keywords,
        autoRevise: params.autoRevise ?? false,
        maxIterations: 2,
        minScore: 7.0,
      });
    }

    // Step 3: Publish (if publisher available)
    let publishResult: PublishResult | undefined;
    if (this.publisher) {
      const contentToPublish = reviewResult?.revisedContent || generatedContent.content;

      publishResult = await this.publisher.publish({
        content: contentToPublish,
        topic: params.topic,
        category: params.category,
        keywords: params.keywords,
        tone: params.tone,
      });
    }

    const totalTime = Date.now() - startTime;

    return {
      content: generatedContent,
      review: reviewResult,
      publish: publishResult,
      totalCost,
      totalTime,
    };
  }

  /**
   * Quick draft workflow: Generate only, fast and cheap
   */
  async quickDraft(params: ContentGenerationParams): Promise<GeneratedContent> {
    // Force single-agent for quick drafts
    const quickGenerator = ContentGeneratorFactory.createGenerator('single-agent', {
      organizationId: this.organizationId,
    });

    return quickGenerator.generate(params);
  }

  /**
   * Production workflow: Multi-agent generation with full review
   */
  static createProductionService(organizationId: string): ContentGenerationService {
    return new ContentGenerationService(organizationId, 'multi-agent');
  }

  /**
   * Draft workflow: Single-agent generation for quick drafts
   */
  static createDraftService(organizationId: string): ContentGenerationService {
    return new ContentGenerationService(organizationId, 'single-agent');
  }
}
