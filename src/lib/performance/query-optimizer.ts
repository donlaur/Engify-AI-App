/**
 * MongoDB Query Optimizer
 *
 * Analyzes queries, suggests indexes, and provides optimization recommendations
 * for MongoDB collections.
 */

import { Collection, Document, IndexDescription } from 'mongodb';
import { getMongoDb } from '@/lib/mongodb';

/**
 * Index recommendation
 */
export interface IndexRecommendation {
  collection: string;
  keys: Record<string, 1 | -1>;
  options?: {
    name?: string;
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
  };
  reason: string;
  impact: 'high' | 'medium' | 'low';
  estimatedImprovement?: string;
}

/**
 * Query analysis result
 */
export interface QueryAnalysis {
  query: string;
  collection: string;
  executionTimeMs: number;
  docsExamined: number;
  docsReturned: number;
  indexUsed?: string;
  stage: string;
  recommendations: IndexRecommendation[];
  score: number; // 0-100, higher is better
}

/**
 * Collection statistics
 */
export interface CollectionStats {
  collection: string;
  documentCount: number;
  avgDocumentSize: number;
  totalSize: number;
  indexes: Array<{
    name: string;
    keys: Record<string, unknown>;
    size: number;
  }>;
  slowQueries: number;
  missingIndexes: number;
}

/**
 * Query Optimizer
 * Analyzes MongoDB queries and suggests optimizations
 */
export class QueryOptimizer {
  /**
   * Analyze a query and provide recommendations
   */
  async analyzeQuery<T extends Document>(
    collection: Collection<T>,
    filter: Document,
    options?: { sort?: Document; limit?: number }
  ): Promise<QueryAnalysis> {
    // Get explain plan
    const explain = await collection
      .find(filter, options)
      .explain('executionStats');

    const executionStats = explain.executionStats || {};
    const stage = executionStats.executionStages?.stage || 'unknown';

    const analysis: QueryAnalysis = {
      query: JSON.stringify(filter),
      collection: collection.collectionName,
      executionTimeMs: executionStats.executionTimeMillis || 0,
      docsExamined: executionStats.totalDocsExamined || 0,
      docsReturned: executionStats.nReturned || 0,
      indexUsed: executionStats.executionStages?.indexName,
      stage,
      recommendations: [],
      score: 100,
    };

    // Analyze and score
    let score = 100;

    // Check if using index
    if (stage === 'COLLSCAN') {
      score -= 30;
      analysis.recommendations.push(
        this.createIndexRecommendation(
          collection.collectionName,
          filter,
          'No index used - collection scan detected',
          'high'
        )
      );
    }

    // Check selectivity
    if (analysis.docsReturned > 0 && analysis.docsExamined > 0) {
      const selectivity = analysis.docsReturned / analysis.docsExamined;
      if (selectivity < 0.1) {
        score -= 20;
        analysis.recommendations.push({
          collection: collection.collectionName,
          keys: this.extractIndexKeys(filter),
          reason: `Poor index selectivity: ${(selectivity * 100).toFixed(1)}%`,
          impact: 'medium',
          estimatedImprovement: 'Consider adding a more selective index',
        });
      }
    }

    // Check if too many docs examined
    if (analysis.docsExamined > 1000) {
      score -= 15;
    }

    // Check execution time
    if (analysis.executionTimeMs > 100) {
      score -= 10;
    }

    // Check for sort without index
    if (options?.sort && stage === 'SORT') {
      score -= 25;
      const sortKeys = this.extractIndexKeys(options.sort);
      analysis.recommendations.push({
        collection: collection.collectionName,
        keys: { ...this.extractIndexKeys(filter), ...sortKeys },
        reason: 'Sort operation without index support',
        impact: 'high',
        estimatedImprovement: 'Create compound index with sort fields',
      });
    }

    analysis.score = Math.max(0, score);

    return analysis;
  }

  /**
   * Create index recommendation from filter
   */
  private createIndexRecommendation(
    collection: string,
    filter: Document,
    reason: string,
    impact: 'high' | 'medium' | 'low'
  ): IndexRecommendation {
    return {
      collection,
      keys: this.extractIndexKeys(filter),
      reason,
      impact,
      estimatedImprovement: 'Should significantly improve query performance',
    };
  }

  /**
   * Extract index keys from query filter
   */
  private extractIndexKeys(filter: Document): Record<string, 1 | -1> {
    const keys: Record<string, 1 | -1> = {};

    Object.keys(filter).forEach((key) => {
      if (key.startsWith('$')) return; // Skip operators

      // Handle nested fields
      if (typeof filter[key] === 'object' && filter[key] !== null) {
        // Check if it's a query operator
        const operators = Object.keys(filter[key]);
        if (operators.some((op) => op.startsWith('$'))) {
          keys[key] = 1;
        }
      } else {
        keys[key] = 1;
      }
    });

    return keys;
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(
    collectionName: string
  ): Promise<CollectionStats> {
    const db = await getMongoDb();
    const collection = db.collection(collectionName);

    const stats = await collection.stats();
    const indexes = await collection.indexes();

    return {
      collection: collectionName,
      documentCount: stats.count || 0,
      avgDocumentSize: stats.avgObjSize || 0,
      totalSize: stats.size || 0,
      indexes: indexes.map((idx) => ({
        name: idx.name || 'unknown',
        keys: idx.key || {},
        size: 0, // Would need to calculate
      })),
      slowQueries: 0, // Would need query monitoring
      missingIndexes: 0, // Would need analysis
    };
  }

  /**
   * Suggest indexes for a collection based on common query patterns
   */
  async suggestIndexes(
    collectionName: string
  ): Promise<IndexRecommendation[]> {
    const recommendations: IndexRecommendation[] = [];

    // Common patterns for the Engify app
    if (collectionName === 'prompts') {
      recommendations.push({
        collection: collectionName,
        keys: { category: 1, active: 1, createdAt: -1 },
        options: {
          name: 'category_active_createdAt_idx',
          background: true,
        },
        reason: 'Common query pattern: category + active filter with time sorting',
        impact: 'high',
        estimatedImprovement: 'Speeds up category browsing by 5-10x',
      });

      recommendations.push({
        collection: collectionName,
        keys: { pattern: 1, active: 1 },
        options: {
          name: 'pattern_active_idx',
          background: true,
        },
        reason: 'Common query pattern: pattern filtering',
        impact: 'high',
        estimatedImprovement: 'Speeds up pattern-based queries by 5-10x',
      });

      recommendations.push({
        collection: collectionName,
        keys: { active: 1, favorites: -1 },
        options: {
          name: 'active_favorites_idx',
          background: true,
        },
        reason: 'Popular prompts query',
        impact: 'medium',
        estimatedImprovement: 'Speeds up popular prompts listing',
      });

      // Text search index if not exists
      recommendations.push({
        collection: collectionName,
        keys: { title: 'text' as unknown as 1, description: 'text' as unknown as 1 },
        options: {
          name: 'text_search_idx',
          background: true,
        },
        reason: 'Full-text search support',
        impact: 'high',
        estimatedImprovement: 'Enables fast text search',
      });
    }

    if (collectionName === 'users') {
      recommendations.push({
        collection: collectionName,
        keys: { email: 1 },
        options: {
          name: 'email_unique_idx',
          unique: true,
          background: true,
        },
        reason: 'User lookup by email',
        impact: 'high',
        estimatedImprovement: 'Fast user authentication',
      });
    }

    if (collectionName === 'patterns') {
      recommendations.push({
        collection: collectionName,
        keys: { slug: 1 },
        options: {
          name: 'slug_unique_idx',
          unique: true,
          background: true,
        },
        reason: 'Pattern lookup by slug',
        impact: 'high',
        estimatedImprovement: 'Fast pattern page loading',
      });
    }

    return recommendations;
  }

  /**
   * Create recommended indexes
   */
  async createRecommendedIndexes(
    collectionName: string,
    recommendations: IndexRecommendation[],
    dryRun = true
  ): Promise<{
    created: string[];
    skipped: string[];
    errors: Array<{ index: string; error: string }>;
  }> {
    const db = await getMongoDb();
    const collection = db.collection(collectionName);

    const created: string[] = [];
    const skipped: string[] = [];
    const errors: Array<{ index: string; error: string }> = [];

    // Get existing indexes
    const existingIndexes = await collection.indexes();
    const existingIndexNames = new Set(existingIndexes.map((idx) => idx.name));

    for (const recommendation of recommendations) {
      const indexName = recommendation.options?.name || this.generateIndexName(recommendation.keys);

      // Skip if exists
      if (existingIndexNames.has(indexName)) {
        skipped.push(indexName);
        continue;
      }

      if (dryRun) {
        console.log(`[DRY RUN] Would create index: ${indexName}`);
        console.log(`  Keys: ${JSON.stringify(recommendation.keys)}`);
        console.log(`  Reason: ${recommendation.reason}`);
        created.push(indexName);
      } else {
        try {
          await collection.createIndex(recommendation.keys, {
            ...recommendation.options,
            name: indexName,
          });
          console.log(`[IndexCreation] Created index: ${indexName}`);
          created.push(indexName);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[IndexCreation] Failed to create index ${indexName}:`, errorMessage);
          errors.push({ index: indexName, error: errorMessage });
        }
      }
    }

    return { created, skipped, errors };
  }

  /**
   * Generate index name from keys
   */
  private generateIndexName(keys: Record<string, unknown>): string {
    return Object.entries(keys)
      .map(([key, direction]) => `${key}_${direction}`)
      .join('_');
  }

  /**
   * Analyze all collections and provide report
   */
  async analyzeAllCollections(): Promise<{
    collections: CollectionStats[];
    recommendations: IndexRecommendation[];
    summary: {
      totalCollections: number;
      totalIndexes: number;
      totalRecommendations: number;
      estimatedImpact: string;
    };
  }> {
    const db = await getMongoDb();
    const collections = await db.listCollections().toArray();

    const collectionStats: CollectionStats[] = [];
    const allRecommendations: IndexRecommendation[] = [];

    for (const collectionInfo of collections) {
      const name = collectionInfo.name;

      try {
        const stats = await this.getCollectionStats(name);
        collectionStats.push(stats);

        const recommendations = await this.suggestIndexes(name);
        allRecommendations.push(...recommendations);
      } catch (error) {
        console.error(`Failed to analyze collection ${name}:`, error);
      }
    }

    const highImpact = allRecommendations.filter((r) => r.impact === 'high').length;
    const mediumImpact = allRecommendations.filter((r) => r.impact === 'medium').length;

    return {
      collections: collectionStats,
      recommendations: allRecommendations,
      summary: {
        totalCollections: collections.length,
        totalIndexes: collectionStats.reduce(
          (sum, c) => sum + c.indexes.length,
          0
        ),
        totalRecommendations: allRecommendations.length,
        estimatedImpact: `${highImpact} high impact, ${mediumImpact} medium impact recommendations`,
      },
    };
  }

  /**
   * Print optimization report
   */
  printReport(analysis: QueryAnalysis): void {
    console.log('\n=== Query Analysis Report ===');
    console.log(`Collection: ${analysis.collection}`);
    console.log(`Query: ${analysis.query.substring(0, 100)}...`);
    console.log(`Execution Time: ${analysis.executionTimeMs}ms`);
    console.log(`Documents Examined: ${analysis.docsExamined}`);
    console.log(`Documents Returned: ${analysis.docsReturned}`);
    console.log(`Index Used: ${analysis.indexUsed || 'None (COLLSCAN)'}`);
    console.log(`Stage: ${analysis.stage}`);
    console.log(`Performance Score: ${analysis.score}/100`);

    if (analysis.recommendations.length > 0) {
      console.log('\nRecommendations:');
      analysis.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.impact.toUpperCase()}] ${rec.reason}`);
        console.log(`   Suggested Index: ${JSON.stringify(rec.keys)}`);
        if (rec.estimatedImprovement) {
          console.log(`   Expected Impact: ${rec.estimatedImprovement}`);
        }
      });
    }
  }
}

/**
 * Query pattern detector
 * Identifies common query patterns for optimization
 */
export class QueryPatternDetector {
  private patterns: Map<string, number> = new Map();

  /**
   * Record a query pattern
   */
  recordPattern(collection: string, filter: Document, sort?: Document): void {
    const pattern = this.createPatternSignature(collection, filter, sort);
    this.patterns.set(pattern, (this.patterns.get(pattern) || 0) + 1);
  }

  /**
   * Create a pattern signature
   */
  private createPatternSignature(
    collection: string,
    filter: Document,
    sort?: Document
  ): string {
    const filterKeys = Object.keys(filter).sort().join(',');
    const sortKeys = sort ? Object.keys(sort).sort().join(',') : '';
    return `${collection}:${filterKeys}:${sortKeys}`;
  }

  /**
   * Get most common patterns
   */
  getMostCommonPatterns(limit = 10): Array<{ pattern: string; count: number }> {
    return Array.from(this.patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([pattern, count]) => ({ pattern, count }));
  }

  /**
   * Suggest indexes based on patterns
   */
  suggestIndexesFromPatterns(): IndexRecommendation[] {
    const recommendations: IndexRecommendation[] = [];
    const patterns = this.getMostCommonPatterns(20);

    patterns.forEach((pattern) => {
      const [collection, filterKeys, sortKeys] = pattern.pattern.split(':');

      if (pattern.count > 10) {
        // Only recommend for patterns used more than 10 times
        const keys: Record<string, 1 | -1> = {};

        // Add filter keys
        filterKeys.split(',').forEach((key) => {
          if (key) keys[key] = 1;
        });

        // Add sort keys
        sortKeys.split(',').forEach((key) => {
          if (key) keys[key] = -1;
        });

        if (Object.keys(keys).length > 0) {
          recommendations.push({
            collection,
            keys,
            reason: `Frequently used pattern (${pattern.count} times)`,
            impact: pattern.count > 100 ? 'high' : 'medium',
            estimatedImprovement: `Used ${pattern.count} times, likely to improve performance`,
          });
        }
      }
    });

    return recommendations;
  }

  /**
   * Clear recorded patterns
   */
  clear(): void {
    this.patterns.clear();
  }
}

/**
 * Global query optimizer instance
 */
export const globalQueryOptimizer = new QueryOptimizer();

/**
 * Global pattern detector instance
 */
export const globalPatternDetector = new QueryPatternDetector();
