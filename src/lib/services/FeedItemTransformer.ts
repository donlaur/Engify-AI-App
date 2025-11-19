/**
 * Feed Item Transformer
 * 
 * Transforms RSS feed items to AIToolUpdate objects
 * Follows Single Responsibility Principle
 */

import Parser from 'rss-parser';
import { AIToolUpdate, AIToolUpdateSchema } from '@/lib/db/schemas/ai-tool-update';
import { logger } from '@/lib/logging/logger';
// Note: extractKeywords not used in transformer - feature extraction uses pattern matching

export interface FeedConfig {
  url: string;
  source: AIToolUpdate['source'];
  toolId?: string;
  modelId?: string;
  type: AIToolUpdate['type'];
  feedType?: 'rss' | 'atom' | 'api';
  apiConfig?: {
    endpoint: string;
    headers?: Record<string, string>;
    transform?: (data: any) => Parser.Item[];
  };
}

/**
 * Feature extraction patterns
 */
const FEATURE_PATTERNS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /full terminal use/i, name: 'Full Terminal Use' },
  { pattern: /\/plan|plan feature/i, name: '/plan' },
  { pattern: /interactive code review/i, name: 'Interactive Code Review' },
  { pattern: /spec-driven development/i, name: 'Spec-Driven Development' },
];

/**
 * Feed Item Transformer
 */
export class FeedItemTransformer {
  /**
   * Transform RSS feed item to AIToolUpdate
   */
  transform(item: Parser.Item, config: FeedConfig): AIToolUpdate | null {
    if (!item.title || !item.link) {
      logger.warn('Feed item missing required fields', { item });
      return null;
    }

    // Generate ID from GUID or link
    const id = item.guid || item.link || `update-${Date.now()}-${Math.random()}`;

    // Parse published date
    const publishedAt = this.parseDate(item.pubDate);

    // Extract categories
    const categories = this.extractCategories(item.categories);

    // Extract features
    const features = this.extractFeatures(
      item.title,
      item.contentSnippet || (item as any).description || ''
    );

    const update: AIToolUpdate = {
      id,
      toolId: config.toolId,
      modelId: config.modelId,
      type: config.type,
      title: item.title,
      description: item.contentSnippet || (item as any).description || undefined,
      content: (item as any).content || item.contentSnippet || (item as any).description || undefined,
      link: item.link,
      author: item.creator || (item as any).author || undefined,
      publishedAt,
      feedUrl: config.url,
      guid: item.guid,
      categories,
      imageUrl: item.enclosure?.url || (item as any).image?.url || undefined,
      source: config.source,
      features,
      status: 'active',
      relatedTools: [],
      relatedModels: [],
      syncedAt: new Date(),
    };

    // Validate with Zod
    const result = AIToolUpdateSchema.safeParse(update);
    if (!result.success) {
      logger.warn('Invalid update data', {
        errors: result.error.errors,
        update,
      });
      return null;
    }

    return result.data;
  }

  /**
   * Parse date from string
   */
  private parseDate(dateString?: string): Date {
    if (!dateString) return new Date();
    
    const parsed = new Date(dateString);
    return !isNaN(parsed.getTime()) ? parsed : new Date();
  }

  /**
   * Extract categories from feed item
   */
  private extractCategories(categories: string | string[] | undefined): string[] {
    if (!categories) return [];
    
    if (Array.isArray(categories)) {
      return categories;
    }
    
    if (typeof categories === 'string') {
      return [categories];
    }
    
    return [];
  }

  /**
   * Extract features from text
   */
  private extractFeatures(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const features: string[] = [];

    for (const { pattern, name } of FEATURE_PATTERNS) {
      if (pattern.test(text)) {
        features.push(name);
      }
    }

    return features;
  }
}

