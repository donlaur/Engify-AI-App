/**
 * Content Review Service (SOLID - Dependency Inversion Principle)
 *
 * Wraps the multi-agent review system with the IContentReviewer interface.
 * Depends on abstractions, not concrete implementations.
 */

import {
  ContentReviewService as MultiAgentReview,
  type ContentReviewPipeline,
} from '@/lib/content/multi-agent-review';
import {
  IContentReviewer,
  ReviewParams,
  ReviewResult,
} from '../interfaces/IContentReviewer';

export class ContentReviewService implements IContentReviewer {
  private reviewService: MultiAgentReview;

  constructor(organizationId: string) {
    this.reviewService = new MultiAgentReview(organizationId);
  }

  getName(): string {
    return 'MultiAgentReviewService';
  }

  async review(params: ReviewParams): Promise<ReviewResult> {
    const pipeline = await this.reviewService.reviewContent(params.content, {
      autoRevise: params.autoRevise ?? false,
      maxIterations: params.maxIterations ?? 1,
      minScore: params.minScore ?? 7.0,
    });

    return this.mapPipelineToResult(pipeline);
  }

  generateReport(result: ReviewResult): string {
    // Map back to pipeline format for report generation
    const pipeline: ContentReviewPipeline = {
      originalContent: result.originalContent,
      currentContent: result.revisedContent,
      reviews: result.reviews.map((r) => ({
        agentRole: r.agentRole,
        pass: r.pass,
        score: r.score,
        strengths: r.strengths,
        weaknesses: r.weaknesses,
        improvements: r.improvements,
        revisedContent: undefined,
        reasoning: r.reasoning,
        timestamp: r.timestamp,
      })),
      finalScore: result.finalScore,
      approved: result.approved,
      iterations: result.iterations,
    };

    return this.reviewService.generateReport(pipeline);
  }

  private mapPipelineToResult(pipeline: ContentReviewPipeline): ReviewResult {
    return {
      originalContent: pipeline.originalContent,
      revisedContent: pipeline.currentContent,
      reviews: pipeline.reviews.map((r) => ({
        agentRole: r.agentRole,
        agentName: this.getAgentName(r.agentRole),
        pass: r.pass,
        score: r.score,
        strengths: r.strengths,
        weaknesses: r.weaknesses,
        improvements: r.improvements,
        reasoning: r.reasoning,
        timestamp: r.timestamp,
      })),
      finalScore: pipeline.finalScore,
      approved: pipeline.approved,
      iterations: pipeline.iterations,
    };
  }

  private getAgentName(role: string): string {
    const nameMap: Record<string, string> = {
      tech_genius: 'Technical Genius',
      cutting_edge_developer: 'Cutting Edge Developer',
      tech_writer: 'Technical Writer',
      tech_editor: 'Tech Editor',
      sme_expert: 'Subject Matter Expert',
    };

    return nameMap[role] || role;
  }
}
