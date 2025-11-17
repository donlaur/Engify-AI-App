/**
 * Content Publisher Interface (SOLID - Interface Segregation Principle)
 *
 * Defines the contract for content publishing services.
 * Handles the final publishing workflow including SEO optimization.
 */

export interface PublishParams {
  content: string;
  topic: string;
  category: string;
  keywords?: string[];
  tone?: 'beginner' | 'intermediate' | 'advanced';
}

export interface PublishingReview {
  agentName: string;
  approved: boolean;
  score: number;
  feedback: string;
  improvements: string[];
  revisedContent?: string;
  seoMetadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    slug?: string;
  };
  timestamp: Date;
}

export interface PublishResult {
  topic: string;
  originalDraft: string;
  finalContent: string;
  reviews: PublishingReview[];
  seoMetadata: {
    title: string;
    description: string;
    keywords: string[];
    slug: string;
  };
  readabilityScore: number;
  approved: boolean;
  publishReady: boolean;
  slopDetection?: {
    hasSlopPhrases: boolean;
    slopPhrases: string[];
    qualityScore: number;
  };
}

/**
 * IContentPublisher - Core interface for content publishing
 *
 * Implementations:
 * - ContentPublishingService (7-agent pipeline)
 */
export interface IContentPublisher {
  /**
   * Process content through publishing pipeline
   */
  publish(params: PublishParams): Promise<PublishResult>;

  /**
   * Generate a detailed publishing report
   */
  generateReport(result: PublishResult): string;

  /**
   * Get the name/type of this publisher for logging
   */
  getName(): string;
}
