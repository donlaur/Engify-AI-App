/**
 * Content Publishing Service Adapter (SOLID - Adapter Pattern)
 *
 * Adapts the existing ContentPublishingService to the IContentPublisher interface.
 * Allows us to swap implementations without changing consumers.
 */

import {
  ContentPublishingService,
  type ContentPublishingResult,
} from '@/lib/content/content-publishing-pipeline';
import {
  IContentPublisher,
  PublishParams,
  PublishResult,
  PublishingReview,
} from '../interfaces/IContentPublisher';

export class ContentPublishingServiceAdapter implements IContentPublisher {
  private publishingService: ContentPublishingService;

  constructor(organizationId: string) {
    this.publishingService = new ContentPublishingService(organizationId);
  }

  getName(): string {
    return 'ContentPublishingService';
  }

  async publish(params: PublishParams): Promise<PublishResult> {
    const result = await this.publishingService.generateArticle(params.topic, {
      category: params.category,
      targetKeywords: params.keywords,
      tone: params.tone || 'intermediate',
    });

    return this.mapToPublishResult(result);
  }

  generateReport(result: PublishResult): string {
    // Map back to ContentPublishingResult format
    const publishingResult: ContentPublishingResult = {
      topic: result.topic,
      originalDraft: result.originalDraft,
      finalContent: result.finalContent,
      reviews: result.reviews,
      seoMetadata: result.seoMetadata,
      readabilityScore: result.readabilityScore,
      approved: result.approved,
      publishReady: result.publishReady,
      slopDetection: result.slopDetection,
    };

    return this.publishingService.generateReport(publishingResult);
  }

  private mapToPublishResult(
    result: ContentPublishingResult
  ): PublishResult {
    return {
      topic: result.topic,
      originalDraft: result.originalDraft,
      finalContent: result.finalContent,
      reviews: result.reviews,
      seoMetadata: result.seoMetadata,
      readabilityScore: result.readabilityScore,
      approved: result.approved,
      publishReady: result.publishReady,
      slopDetection: result.slopDetection,
    };
  }
}
