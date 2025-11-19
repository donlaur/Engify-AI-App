/**
 * Entity Matcher Service
 * 
 * Unified service for matching entities (models/tools) in text
 * Follows DRY principle - eliminates duplication between model/tool detection
 * Follows Strategy pattern - different matching strategies
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { calculateSimilarity, extractKeywords } from '@/lib/utils/text-matching';

export interface MatchResult {
  id: string;
  confidence: number;
  reason: string;
}

export interface EntityMetadata {
  id: string;
  name?: string;
  displayName?: string;
  slug?: string;
  tags?: string[];
  provider?: string;
  category?: string;
  tagline?: string;
}

export interface MatchingStrategy {
  calculateConfidence(
    text: string,
    entity: EntityMetadata,
    keywords: string[]
  ): { confidence: number; reason: string };
}

/**
 * Exact and Fuzzy Matching Strategy
 */
class ExactFuzzyStrategy implements MatchingStrategy {
  calculateSimilarity(str1: string, str2: string): number {
    return calculateSimilarity(str1, str2);
  }

  calculateConfidence(
    text: string,
    entity: EntityMetadata,
    _keywords: string[] // Not used in exact/fuzzy matching
  ): { confidence: number; reason: string } {
    const lowerText = text.toLowerCase();
    let maxConfidence = 0;
    let bestReason = '';

    // Build patterns with weights
    const patterns = this.buildPatterns(entity);

    // Check exact matches
    for (const pattern of patterns) {
      if (!pattern.text) continue;

      // Exact match
      if (lowerText.includes(pattern.text)) {
        if (pattern.weight > maxConfidence) {
          maxConfidence = pattern.weight;
          bestReason = `Exact ${pattern.type} match: "${pattern.text}"`;
        }
      }

      // Fuzzy match
      const similarity = calculateSimilarity(text, pattern.text);
      if (similarity > 0.5) {
        const confidence = pattern.weight * similarity;
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          bestReason = `Similar ${pattern.type} match: "${pattern.text}" (${Math.round(similarity * 100)}% similar)`;
        }
      }
    }

    return { confidence: maxConfidence, reason: bestReason };
  }

  private buildPatterns(entity: EntityMetadata): Array<{ text: string; weight: number; type: string }> {
    const patterns: Array<{ text: string; weight: number; type: string }> = [
      { text: entity.id.toLowerCase(), weight: 1.0, type: 'id' },
      { text: entity.name?.toLowerCase() || '', weight: 0.9, type: 'name' },
      { text: entity.displayName?.toLowerCase() || '', weight: 0.95, type: 'displayName' },
      { text: entity.slug?.toLowerCase() || '', weight: 0.8, type: 'slug' },
      // Variations
      { text: entity.id.replace(/-/g, ' ').toLowerCase(), weight: 0.7, type: 'id-variation' },
      { text: entity.displayName?.replace(/\s+/g, '-').toLowerCase() || '', weight: 0.7, type: 'displayName-variation' },
    ];

    // Add provider-specific patterns for models
    if (entity.provider && entity.displayName) {
      patterns.push({
        text: `${entity.provider} ${entity.displayName.toLowerCase()}`.trim(),
        weight: 0.6,
        type: 'provider-model',
      });
    }

    // Add tagline for tools
    if (entity.tagline) {
      patterns.push({
        text: entity.tagline.toLowerCase(),
        weight: 0.6,
        type: 'tagline',
      });
    }

    return patterns.filter(p => p.text);
  }
}

/**
 * Keyword Matching Strategy
 */
class KeywordStrategy implements MatchingStrategy {

  calculateConfidence(
    _text: string, // Not used in keyword matching
    entity: EntityMetadata,
    keywords: string[]
  ): { confidence: number; reason: string } {
    const entityKeywords = [
      ...extractKeywords(entity.displayName || entity.name || ''),
      ...(entity.tags || []).map(t => t.toLowerCase()),
      ...(entity.category ? [entity.category.toLowerCase()] : []),
    ].filter(Boolean);

    const matchingKeywords = entityKeywords.filter(kw =>
      keywords.some(textKw => textKw.includes(kw) || kw.includes(textKw))
    );

    if (matchingKeywords.length === 0) {
      return { confidence: 0, reason: '' };
    }

    const confidence = Math.min(0.5, matchingKeywords.length * 0.15);
    return {
      confidence,
      reason: `Keyword match: ${matchingKeywords.join(', ')}`,
    };
  }
}

/**
 * Entity Matcher Service
 * 
 * Unified service for matching entities in text using multiple strategies
 */
export class EntityMatcherService {
  private exactFuzzyStrategy: ExactFuzzyStrategy;
  private keywordStrategy: KeywordStrategy;

  constructor() {
    this.exactFuzzyStrategy = new ExactFuzzyStrategy();
    this.keywordStrategy = new KeywordStrategy();
  }

  /**
   * Match entities in text using multiple strategies
   */
  async matchEntities<T extends EntityMetadata>(
    text: string,
    entities: T[],
    minConfidence: number = 0.3
  ): Promise<Array<MatchResult & { entity: T }>> {
    const keywords = extractKeywords(text);
    const matches: Array<MatchResult & { entity: T }> = [];

    for (const entity of entities) {
      // Try exact/fuzzy matching first
      const exactFuzzyResult = this.exactFuzzyStrategy.calculateConfidence(
        text,
        entity,
        keywords
      );

      // Try keyword matching
      const keywordResult = this.keywordStrategy.calculateConfidence(
        text,
        entity,
        keywords
      );

      // Use the highest confidence
      const bestResult =
        exactFuzzyResult.confidence > keywordResult.confidence
          ? exactFuzzyResult
          : keywordResult;

      if (bestResult.confidence >= minConfidence) {
        matches.push({
          id: entity.id,
          confidence: bestResult.confidence,
          reason: bestResult.reason,
          entity,
        });
      }
    }

    // Sort by confidence and return top matches
    return matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Match models in text
   */
  async matchModels(
    text: string,
    minConfidence: number = 0.3
  ): Promise<Array<{ modelId: string; confidence: number; reason: string }>> {
    // Implementation uses matchEntities internally
    const db = await getMongoDb();
    const models = await db
      .collection('ai_models')
      .find({ status: 'active' })
      .project({
        id: 1,
        name: 1,
        displayName: 1,
        slug: 1,
        tags: 1,
        provider: 1,
      })
      .toArray();

    const entities: EntityMetadata[] = models.map((m: any) => ({
      id: m.id,
      name: m.name,
      displayName: m.displayName,
      slug: m.slug,
      tags: m.tags,
      provider: m.provider,
    }));

    const matches = await this.matchEntities(text, entities, minConfidence);

    return matches.map(m => ({
      modelId: m.id,
      confidence: m.confidence,
      reason: m.reason,
    }));
  }

  /**
   * Match tools in text
   */
  async matchTools(
    text: string,
    minConfidence: number = 0.3
  ): Promise<Array<{ toolId: string; confidence: number; reason: string }>> {
    const db = await getMongoDb();
    const tools = await db
      .collection('ai_tools')
      .find({ status: 'active' })
      .project({
        id: 1,
        name: 1,
        slug: 1,
        tagline: 1,
        tags: 1,
        category: 1,
      })
      .toArray();

    const entities: EntityMetadata[] = tools.map((t: any) => ({
      id: t.id,
      name: t.name,
      displayName: t.name,
      slug: t.slug,
      tagline: t.tagline,
      tags: t.tags,
      category: t.category,
    }));

    const matches = await this.matchEntities(text, entities, minConfidence);

    return matches.map(m => ({
      toolId: m.id,
      confidence: m.confidence,
      reason: m.reason,
    }));
  }
}

