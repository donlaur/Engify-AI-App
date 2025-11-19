/**
 * Feed Parser Factory
 * 
 * Factory pattern for creating feed parsers
 * Follows Open/Closed Principle - easy to extend with new feed types
 */

import Parser from 'rss-parser';
import { logger } from '@/lib/logging/logger';

export interface FeedParser {
  parse(url: string): Promise<Parser.Output<Parser.Item> | null>;
}

/**
 * RSS/Atom Feed Parser
 */
class RSSFeedParser implements FeedParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      maxRedirects: 5,
      customFields: {
        item: [
          ['content:encoded', 'content'],
          ['description', 'description'],
          ['pubDate', 'pubDate'],
          ['guid', 'guid'],
          ['category', 'categories', { keepArray: true }],
        ],
      },
    });
  }

  async parse(url: string): Promise<Parser.Output<Parser.Item> | null> {
    try {
      logger.info('Parsing RSS/Atom feed', { url });
      const feed = await this.parser.parseURL(url);
      logger.info('Feed parsed successfully', {
        url,
        itemCount: feed.items?.length || 0,
      });
      return feed;
    } catch (error) {
      logger.error('Failed to parse RSS/Atom feed', {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}

/**
 * API Feed Parser
 */
class APIFeedParser implements FeedParser {
  constructor(
    private endpoint: string,
    private headers?: Record<string, string>,
    private transform?: (data: any) => Parser.Item[]
  ) {}

  async parse(url: string): Promise<Parser.Output<Parser.Item> | null> {
    try {
      logger.info('Parsing API feed', { url, endpoint: this.endpoint });
      
      const response = await fetch(this.endpoint, {
        headers: this.headers || {},
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const items = this.transform ? this.transform(data) : [];

      return {
        title: 'API Feed',
        link: this.endpoint,
        items,
      };
    } catch (error) {
      logger.error('Failed to parse API feed', {
        url,
        endpoint: this.endpoint,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}

/**
 * Feed Parser Factory
 */
export class FeedParserFactory {
  /**
   * Create RSS/Atom parser
   */
  static createRSSParser(): FeedParser {
    return new RSSFeedParser();
  }

  /**
   * Create API parser
   */
  static createAPIParser(
    endpoint: string,
    headers?: Record<string, string>,
    transform?: (data: any) => Parser.Item[]
  ): FeedParser {
    return new APIFeedParser(endpoint, headers, transform);
  }

  /**
   * Create parser based on feed type
   */
  static create(
    type: 'rss' | 'atom' | 'api',
    config?: {
      endpoint?: string;
      headers?: Record<string, string>;
      transform?: (data: any) => Parser.Item[];
    }
  ): FeedParser {
    switch (type) {
      case 'rss':
      case 'atom':
        return FeedParserFactory.createRSSParser();
      case 'api':
        if (!config?.endpoint) {
          throw new Error('API parser requires endpoint');
        }
        return FeedParserFactory.createAPIParser(
          config.endpoint,
          config.headers,
          config.transform
        );
      default:
        throw new Error(`Unknown feed type: ${type}`);
    }
  }
}

