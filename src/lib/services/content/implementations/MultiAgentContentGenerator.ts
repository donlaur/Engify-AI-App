/**
 * Multi-Agent Content Generator (SOLID - Open/Closed Principle)
 *
 * Uses the 7-agent publishing pipeline for high-quality, SEO-optimized content.
 * Best for: Production articles, pillar content, high-stakes publishing.
 */

import { ContentPublishingService } from '@/lib/content/content-publishing-pipeline';
import {
  IContentGenerator,
  ContentGenerationParams,
  GeneratedContent,
  ValidationResult,
} from '../interfaces/IContentGenerator';
import { countWords } from '@/lib/content/quality';
import { calculateReadability, getReadabilityScore } from '@/lib/content/readability-calculator';

export class MultiAgentContentGenerator implements IContentGenerator {
  private service: ContentPublishingService;

  constructor(organizationId: string) {
    this.service = new ContentPublishingService(organizationId);
  }

  getName(): string {
    return 'MultiAgentContentGenerator';
  }

  async generate(params: ContentGenerationParams): Promise<GeneratedContent> {
    const result = await this.service.generateArticle(params.topic, {
      category: params.category,
      targetKeywords: params.keywords,
      tone: params.tone || 'intermediate',
    });

    if (!result.publishReady) {
      console.warn('Content generated but not publish-ready. Quality improvements needed.');
    }

    // Calculate readability
    const readability = calculateReadability(result.finalContent);
    const readabilityScore = getReadabilityScore(readability);

    // Extract cost from reviews (if available)
    let totalCost = 0;
    let totalTokens = 0;

    // Cost estimation based on content length
    // GPT-4o: ~$0.01/1K tokens, Claude Sonnet: ~$0.015/1K tokens
    const estimatedTokens = Math.ceil(result.finalContent.length / 4);
    const estimatedCost = (estimatedTokens / 1000) * 0.012; // Average cost

    return {
      content: result.finalContent,
      metadata: {
        wordCount: countWords(result.finalContent),
        tokensUsed: totalTokens || estimatedTokens,
        costUSD: totalCost || estimatedCost,
        model: 'multi-agent-pipeline',
        provider: 'mixed',
        generatedAt: new Date(),
        qualityScore: readabilityScore,
      },
    };
  }

  async validate(content: GeneratedContent): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Minimum word count check (stricter for multi-agent)
    if (content.metadata.wordCount < 500) {
      errors.push('Content is too short for multi-agent generation (minimum 500 words)');
    }

    // Quality score check (stricter for multi-agent)
    const qualityScore = content.metadata.qualityScore || 0;
    if (qualityScore < 7) {
      errors.push('Quality score is too low for multi-agent pipeline (minimum 7/10)');
    } else if (qualityScore < 8) {
      warnings.push('Quality score should be 8+ for multi-agent content');
    }

    // AI slop detection (stricter)
    const slopPhrases = ['delve', 'leverage', 'utilize', 'robust', 'seamless', 'comprehensive'];
    const contentLower = content.content.toLowerCase();
    const foundSlop = slopPhrases.filter((phrase) => contentLower.includes(phrase));

    if (foundSlop.length > 2) {
      errors.push(`Too much AI slop detected: ${foundSlop.join(', ')}`);
    } else if (foundSlop.length > 0) {
      warnings.push(`Some AI slop detected: ${foundSlop.join(', ')}`);
    }

    // Check for markdown formatting
    if (!content.content.includes('#') && !content.content.includes('##')) {
      warnings.push('Content lacks proper markdown headings');
    }

    // Check for code blocks (for technical content)
    if (content.content.includes('```')) {
      // Good - has code examples
    } else {
      warnings.push('Technical content should include code examples');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      qualityScore,
    };
  }
}
