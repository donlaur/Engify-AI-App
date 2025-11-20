/**
 * News Aggregator Service
 * 
 * Orchestrates feed fetching, parsing, and entity matching
 * Follows SOLID principles:
 * - Single Responsibility: Orchestrates other services
 * - Dependency Inversion: Depends on abstractions (repositories, factories)
 * - Open/Closed: Easy to extend with new feed types via factory
 */

import { AIToolUpdate } from '@/lib/db/schemas/ai-tool-update';
import { logger } from '@/lib/logging/logger';
import { FeedParserFactory } from '@/lib/factories/FeedParserFactory';
import { AIToolUpdateRepository } from '@/lib/repositories/AIToolUpdateRepository';
import { EntityMatcherService } from '@/lib/services/EntityMatcherService';
import { FeedItemTransformer } from '@/lib/services/FeedItemTransformer';
import { FeedConfigRepository } from '@/lib/repositories/FeedConfigRepository';
import { FeedConfig, FeedConfigSchema } from '@/lib/db/schemas/feed-config';
import Parser from 'rss-parser';

/**
 * News Aggregator Service
 * 
 * Orchestrates the news aggregation pipeline:
 * 1. Fetch feeds (via FeedParserFactory)
 * 2. Transform items (via FeedItemTransformer)
 * 3. Match entities (via EntityMatcherService)
 * 4. Store updates (via AIToolUpdateRepository)
 */
export class NewsAggregatorService {
  private readonly repository: AIToolUpdateRepository;
  private readonly matcher: EntityMatcherService;
  private readonly transformer: FeedItemTransformer;
  private readonly feedConfigRepository: FeedConfigRepository;

  constructor(
    repository?: AIToolUpdateRepository,
    matcher?: EntityMatcherService,
    transformer?: FeedItemTransformer,
    feedConfigRepository?: FeedConfigRepository
  ) {
    // Dependency injection - allows for testing with mocks
    this.repository = repository || new AIToolUpdateRepository();
    this.matcher = matcher || new EntityMatcherService();
    this.transformer = transformer || new FeedItemTransformer();
    this.feedConfigRepository = feedConfigRepository || new FeedConfigRepository();
  }

  /**
   * Fetch and parse a feed using the appropriate parser
   */
  async fetchFeed(
    feedUrl: string,
    config?: Pick<FeedConfig, 'url' | 'source' | 'type' | 'feedType' | 'toolId' | 'modelId' | 'apiConfig'>
  ): Promise<Parser.Output<Parser.Item> | null> {
    try {
      logger.info('Fetching feed', { feedUrl, feedType: config?.feedType || 'rss' });

      // Use factory to create appropriate parser
      const feedType = config?.feedType || 'rss';
      const parser = FeedParserFactory.create(feedType, {
        endpoint: config?.apiConfig?.endpoint,
        headers: config?.apiConfig?.headers,
        // Note: transform is stored as string in DB schema but FeedParserFactory expects function
        // For now, we don't support transform functions from DB (would need eval/parsing)
        transform: undefined,
      });

      return await parser.parse(feedUrl);
    } catch (error) {
      logger.error('Failed to fetch feed', {
        feedUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Sync a single feed and store updates in database
   */
  async syncFeed(
    config: Pick<FeedConfig, 'url' | 'source' | 'type' | 'feedType' | 'toolId' | 'modelId' | 'apiConfig'>
  ): Promise<{ created: number; updated: number; errors: number; modelsTriggered: string[] }> {
    const feed = await this.fetchFeed(config.url, config);
    if (!feed || !feed.items) {
      return { created: 0, updated: 0, errors: 1, modelsTriggered: [] };
    }

    const updates: AIToolUpdate[] = [];
    const modelsTriggered = new Set<string>();
    let errors = 0;

    // Transform feed items to updates
    for (const item of feed.items) {
      try {
        const update = this.transformer.transform(item, config);
        if (!update) {
          errors++;
          continue;
        }

        // Detect model and tool mentions
        const content = `${update.title} ${update.description || ''} ${update.content || ''}`;

        // Detect models using unified matcher
        const modelMatches = await this.matcher.matchModels(content, 0.4);
        if (modelMatches.length > 0) {
          const primaryModel = modelMatches[0];
          update.modelId = primaryModel.modelId;
          update.matchConfidence = primaryModel.confidence;
          update.relatedModels = modelMatches.slice(1).map((m) => m.modelId);
          modelMatches.forEach((match) => modelsTriggered.add(match.modelId));
        }

        // Detect tools using unified matcher
        const toolMatches = await this.matcher.matchTools(content, 0.4);
        if (toolMatches.length > 0) {
          if (!update.toolId) {
            const primaryTool = toolMatches[0];
            update.toolId = primaryTool.toolId;
            update.matchConfidence = update.matchConfidence || primaryTool.confidence;
            update.relatedTools = toolMatches.slice(1).map((m) => m.toolId);
          } else {
            update.relatedTools = toolMatches.map((m) => m.toolId);
          }
        }

        updates.push(update);
      } catch (error) {
        logger.error('Error processing feed item', {
          feedUrl: config.url,
          error: error instanceof Error ? error.message : String(error),
        });
        errors++;
      }
    }

    // Bulk upsert updates
    const result = await this.repository.bulkUpsert(updates);

    logger.info('Feed sync complete', {
      feedUrl: config.url,
      created: result.created,
      updated: result.updated,
      errors,
      modelsTriggered: Array.from(modelsTriggered),
    });

    return {
      created: result.created,
      updated: result.updated,
      errors,
      modelsTriggered: Array.from(modelsTriggered),
    };
  }

  /**
   * Sync all configured feeds (loads from database)
   */
  async syncAllFeeds(): Promise<{
    totalCreated: number;
    totalUpdated: number;
    totalErrors: number;
    modelsTriggered: string[];
    feedResults: Array<{
      url: string;
      created: number;
      updated: number;
      errors: number;
      modelsTriggered: string[];
    }>;
  }> {
    // Load enabled feeds from database
    const feedConfigs = await this.feedConfigRepository.findEnabled();
    logger.info('Starting feed sync for all feeds', { feedCount: feedConfigs.length });

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    const allModelsTriggered = new Set<string>();
    const feedResults: Array<{
      url: string;
      created: number;
      updated: number;
      errors: number;
      modelsTriggered: string[];
    }> = [];

    for (const dbConfig of feedConfigs) {
      try {
        // Convert database config to FeedConfig format for syncFeed
        const config = {
          url: dbConfig.url,
          source: dbConfig.source,
          toolId: dbConfig.toolId,
          modelId: dbConfig.modelId,
          type: dbConfig.type,
          feedType: dbConfig.feedType || 'rss',
          apiConfig: dbConfig.apiConfig ? {
            endpoint: dbConfig.apiConfig.endpoint,
            headers: dbConfig.apiConfig.headers,
          } : undefined,
        };

        const result = await this.syncFeed(config);
        totalCreated += result.created;
        totalUpdated += result.updated;
        totalErrors += result.errors;
        result.modelsTriggered.forEach((modelId) => allModelsTriggered.add(modelId));
        feedResults.push({
          url: config.url,
          ...result,
        });

        // Record successful sync
        await this.feedConfigRepository.recordSync(dbConfig.id, true);
      } catch (error) {
        logger.error('Error syncing feed', {
          url: dbConfig.url,
          error: error instanceof Error ? error.message : String(error),
        });
        totalErrors++;
        feedResults.push({
          url: dbConfig.url,
          created: 0,
          updated: 0,
          errors: 1,
          modelsTriggered: [],
        });

        // Record failed sync
        await this.feedConfigRepository.recordSync(
          dbConfig.id,
          false,
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    logger.info('All feeds synced', {
      totalCreated,
      totalUpdated,
      totalErrors,
      modelsTriggered: Array.from(allModelsTriggered),
    });

    return {
      totalCreated,
      totalUpdated,
      totalErrors,
      modelsTriggered: Array.from(allModelsTriggered),
      feedResults,
    };
  }

  /**
   * Get updates for a specific tool
   */
  async getToolUpdates(toolId: string, limit: number = 10): Promise<AIToolUpdate[]> {
    return await this.repository.findByToolId(toolId, limit);
  }

  /**
   * Get updates for a specific model
   */
  async getModelUpdates(modelId: string, limit: number = 10): Promise<AIToolUpdate[]> {
    return await this.repository.findByModelId(modelId, limit);
  }

  /**
   * Add a custom feed configuration (deprecated - use FeedConfigRepository directly)
   * @deprecated Use FeedConfigRepository.create() or POST /api/admin/news/feeds instead
   */
  async addFeedConfig(config: Omit<FeedConfig, 'id' | 'errorCount' | 'enabled' | 'createdAt' | 'updatedAt' | 'lastSyncedAt' | 'lastError'> & { id?: string }): Promise<void> {
    const { randomUUID } = await import('crypto');
    const feedConfig = FeedConfigSchema.parse({
      ...config,
      id: config.id || randomUUID(),
      enabled: true,
      errorCount: 0,
    });
    await this.feedConfigRepository.upsert(feedConfig);
  }
}

// Export singleton instance
export const newsAggregatorService = new NewsAggregatorService();
