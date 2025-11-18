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
      slopDetection: result.slopDetection
        ? {
            aiProbability: 0,
            qualityScore: result.slopDetection.qualityScore,
            flags: [],
            recommendations: [],
            metrics: {
              wordCount: 0,
              slopCount: result.slopDetection.metrics?.slopPhrases?.length ?? 0,
              slopPhrases: result.slopDetection.metrics?.slopPhrases ?? [],
              emDashCount: 0,
              emDashRatio: 0,
              sentenceCount: 0,
              avgSentenceLength: 0,
              sentenceStdDev: 0,
              hedgeCount: 0,
              hedgeRatio: 0,
              vagueCount: 0,
              personalCount: 0,
              hasCode: false,
              hasNumbers: false,
              hasLinks: false,
            },
          }
        : undefined,
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
      slopDetection: result.slopDetection
        ? {
            aiProbability: result.slopDetection.aiProbability,
            qualityScore: result.slopDetection.qualityScore,
            flags: result.slopDetection.flags,
            recommendations: result.slopDetection.recommendations,
            metrics: result.slopDetection.metrics,
          }
        : undefined,
    };
  }
}
