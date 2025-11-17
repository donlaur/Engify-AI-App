/**
 * Content Reviewer Interface (SOLID - Interface Segregation Principle)
 *
 * Defines the contract for content review services.
 * Separates review concerns from generation concerns.
 */

export interface ReviewParams {
  content: string;
  topic: string;
  keywords?: string[];
  autoRevise?: boolean;
  maxIterations?: number;
  minScore?: number;
}

export interface AgentReview {
  agentRole: string;
  agentName: string;
  pass: boolean;
  score: number; // 1-10
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  reasoning: string;
  timestamp: Date;
}

export interface ReviewResult {
  originalContent: string;
  revisedContent: string;
  reviews: AgentReview[];
  finalScore: number;
  approved: boolean;
  iterations: number;
  seoMetadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    slug?: string;
  };
}

/**
 * IContentReviewer - Core interface for content review
 *
 * Implementations:
 * - MultiAgentReviewService (5-agent review system)
 * - SingleAgentReviewService (quick review)
 */
export interface IContentReviewer {
  /**
   * Review content and optionally revise it
   */
  review(params: ReviewParams): Promise<ReviewResult>;

  /**
   * Generate a detailed report of the review
   */
  generateReport(result: ReviewResult): string;

  /**
   * Get the name/type of this reviewer for logging
   */
  getName(): string;
}
