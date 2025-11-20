/**
 * Feed Item Transformer
 * 
 * Transforms RSS feed items to AIToolUpdate objects
 * Follows Single Responsibility Principle
 */

import Parser from 'rss-parser';
import { AIToolUpdate, AIToolUpdateSchema } from '@/lib/db/schemas/ai-tool-update';
import { FeedConfig as SchemaFeedConfig } from '@/lib/db/schemas/feed-config';
import { logger } from '@/lib/logging/logger';
// Note: extractKeywords not used in transformer - feature extraction uses pattern matching

// Use schema FeedConfig type for consistency
export type FeedConfig = Pick<SchemaFeedConfig, 'url' | 'source' | 'toolId' | 'modelId' | 'type' | 'feedType'>;

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

    // Parse published date - handle both string and object
    const publishedAt = this.parseDate(
      typeof item.pubDate === 'string' 
        ? item.pubDate 
        : (item.pubDate as any)?.toString?.() || undefined
    );

    // Extract categories - handle objects with $ term property
    const categories = this.extractCategories(item.categories);

    // Extract author - handle objects with name property
    const author = this.extractAuthor(
      item.creator || (item as any).author
    );

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
      author,
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
   * Handles both string arrays and objects with $ term property (Atom feeds)
   */
  private extractCategories(categories: string | string[] | any[] | undefined): string[] {
    if (!categories) return [];
    
    if (Array.isArray(categories)) {
      return categories
        .map(cat => {
          // Handle object format: { $: { term: "Category Name" } }
          if (typeof cat === 'object' && cat !== null) {
            if (cat.$?.term) {
              return String(cat.$.term);
            }
            // Handle array format: { name: ["Category"] }
            if (Array.isArray(cat.name) && cat.name.length > 0) {
              return String(cat.name[0]);
            }
            // Fallback: try to stringify
            return String(cat);
          }
          return String(cat);
        })
        .filter(Boolean);
    }
    
    if (typeof categories === 'string') {
      return [categories];
    }
    
    // Handle single object
    if (typeof categories === 'object' && categories !== null) {
      if ((categories as any).$?.term) {
        return [String((categories as any).$.term)];
      }
      if (Array.isArray((categories as any).name) && (categories as any).name.length > 0) {
        return [String((categories as any).name[0])];
      }
    }
    
    return [];
  }

  /**
   * Extract author from feed item
   * Handles both strings and objects with name property (Atom feeds)
   */
  private extractAuthor(author: string | any | undefined): string | undefined {
    if (!author) return undefined;
    
    if (typeof author === 'string') {
      return author;
    }
    
    // Handle object format: { name: ["Author Name"], title: ["Title"], ... }
    if (typeof author === 'object' && author !== null) {
      // Try name array first (most common in Atom feeds)
      if (Array.isArray(author.name) && author.name.length > 0) {
        return String(author.name[0]);
      }
      // Try name as string
      if (typeof author.name === 'string') {
        return author.name;
      }
      // Try to stringify the object
      if (author.toString && typeof author.toString === 'function') {
        const str = author.toString();
        if (str !== '[object Object]') {
          return str;
        }
      }
    }
    
    return undefined;
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

