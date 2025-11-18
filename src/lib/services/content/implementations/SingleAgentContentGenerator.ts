/**
 * Single Agent Content Generator (SOLID - Single Responsibility Principle)
 *
 * Uses CreatorAgent for fast, cost-effective content generation.
 * Best for: Quick drafts, simple content, budget-conscious generation.
 */

import { CreatorAgent } from '@/lib/agents/CreatorAgent';
import {
  IContentGenerator,
  ContentGenerationParams,
  GeneratedContent,
  ValidationResult,
} from '../interfaces/IContentGenerator';
import { countWords } from '@/lib/content/quality';
import { calculateReadability, getReadabilityScore } from '@/lib/content/readability-calculator';
import { getDb } from '@/lib/db/client';
import { Collections } from '@/lib/db/schema';
import { ObjectId } from 'mongodb';

export class SingleAgentContentGenerator implements IContentGenerator {
  private agent: CreatorAgent;

  constructor() {
    this.agent = new CreatorAgent();
  }

  getName(): string {
    return 'SingleAgentContentGenerator';
  }

  async generate(params: ContentGenerationParams): Promise<GeneratedContent> {
    const result = await this.agent.createContent({
      topic: params.topic,
      category: params.category,
      targetWordCount: params.targetWordCount || 800,
      tags: params.keywords || [],
    });

    if (!result.success) {
      throw new Error(result.error || 'Content generation failed');
    }

    // Fetch generated content from database
    // Using static import
    const db = await getDb();
    const contentDoc = await db
      .collection(Collections.WEB_CONTENT)
      .findOne({ _id: new ObjectId(result.contentId) });

    if (!contentDoc) {
      throw new Error('Generated content not found in database');
    }

    // Calculate quality score
    const readability = calculateReadability(contentDoc.content);
    const readabilityScore = getReadabilityScore(readability);

    return {
      content: contentDoc.content,
      metadata: {
        wordCount: result.wordCount || countWords(contentDoc.content),
        tokensUsed: result.tokensUsed || 0,
        costUSD: result.costUSD || 0,
        model: contentDoc.metadata?.model || 'unknown',
        provider: contentDoc.metadata?.provider || 'unknown',
        generatedAt: new Date(),
        qualityScore: readabilityScore,
      },
    };
  }

  async validate(content: GeneratedContent): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Minimum word count check
    if (content.metadata.wordCount < 100) {
      errors.push('Content is too short (minimum 100 words)');
    }

    // Maximum cost check
    if (content.metadata.costUSD > 1.0) {
      warnings.push(`Generation cost ($${content.metadata.costUSD.toFixed(2)}) is high`);
    }

    // Quality score check
    const qualityScore = content.metadata.qualityScore || 0;
    if (qualityScore < 5) {
      errors.push('Quality score is too low (minimum 5/10)');
    } else if (qualityScore < 7) {
      warnings.push('Quality score could be improved');
    }

    // AI slop detection
    const slopPhrases = ['delve', 'leverage', 'utilize', 'robust', 'seamless'];
    const contentLower = content.content.toLowerCase();
    const foundSlop = slopPhrases.filter((phrase) => contentLower.includes(phrase));

    if (foundSlop.length > 0) {
      warnings.push(`AI slop detected: ${foundSlop.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      qualityScore,
    };
  }
}
