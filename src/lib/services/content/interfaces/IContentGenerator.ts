/**
 * Content Generator Interface (SOLID - Interface Segregation Principle)
 *
 * Defines the contract for content generation services.
 * Each implementation can have different strategies (single agent, multi-agent, etc.)
 */

export interface ContentGenerationParams {
  topic: string;
  category: string;
  targetWordCount?: number;
  keywords?: string[];
  tone?: 'beginner' | 'intermediate' | 'advanced';
  sectionId?: string; // For section-specific generation
  context?: string; // Additional context for regeneration
}

export interface GeneratedContent {
  content: string;
  metadata: {
    wordCount: number;
    tokensUsed: number;
    costUSD: number;
    model: string;
    provider: string;
    generatedAt: Date;
    qualityScore?: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  qualityScore: number;
}

/**
 * IContentGenerator - Core interface for content generation
 *
 * Implementations:
 * - SingleAgentContentGenerator (uses CreatorAgent)
 * - MultiAgentContentGenerator (uses 7-agent pipeline)
 * - SectionContentGenerator (regenerates specific sections)
 */
export interface IContentGenerator {
  /**
   * Generate content based on provided parameters
   */
  generate(params: ContentGenerationParams): Promise<GeneratedContent>;

  /**
   * Validate generated content against quality standards
   */
  validate(content: GeneratedContent): Promise<ValidationResult>;

  /**
   * Get the name/type of this generator for logging
   */
  getName(): string;
}
