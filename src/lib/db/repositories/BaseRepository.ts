/**
 * Unified Content Repository System
 *
 * DRY principle: Single source of truth for content retrieval
 * All content types (prompts, patterns, learning resources) use this base
 *
 * Architecture:
 * - BaseRepository: MongoDB connection & common operations
 * - ContentRepository: Content-specific retrieval logic
 * - ContentService: Business logic & formatting
 *
 * Separation of Concerns:
 * 1. Retrieval: Raw data from MongoDB
 * 2. Processing: Transform, filter, enrich
 * 3. Formatting: Shape for UI/API consumption
 *
 * Enterprise Compliance:
 * - Uses singleton MongoDB connection from @/lib/mongodb
 * - Proper error handling with logger
 * - Follows BaseService pattern from @/lib/services/BaseService
 * - Multi-tenant support ready (organizationId can be added in filters)
 */

import { getDb } from '@/lib/mongodb';
import type { Db, Collection, Filter, FindOptions } from 'mongodb';
import { logger } from '@/lib/logging/logger';

/**
 * Base Repository - Handles MongoDB connection
 * Single connection instance shared across all repositories
 */
export abstract class BaseRepository<T> {
  protected collectionName: string;
  protected dbName: string = 'engify';

  constructor(collectionName: string, dbName: string = 'engify') {
    this.collectionName = collectionName;
    this.dbName = dbName;
  }

  /**
   * Get MongoDB database instance (singleton)
   * All repositories share the same connection
   */
  protected async getDb(): Promise<Db> {
    return getDb(this.dbName);
  }

  /**
   * Get collection (lazy, only when needed)
   */
  protected async getCollection(): Promise<Collection<T>> {
    const db = await this.getDb();
    return db.collection<T>(this.collectionName);
  }

  /**
   * Find documents with optional filter and options
   * Returns ALL fields from MongoDB (no projection)
   *
   * CRITICAL: This ensures all DB fields are available for processing
   * No field filtering - repositories handle field selection in processors
   *
   * Query timeout: 15 seconds (for getAll operations)
   */
  protected async find(
    filter: Filter<T> = {},
    options?: FindOptions<T>
  ): Promise<T[]> {
    try {
      const collection = await this.getCollection();
      // Remove any projection to ensure ALL fields are returned
      const { projection: _projection, ...restOptions } = options || {};
      // Add query timeout to prevent build timeouts
      const queryOptions = {
        ...restOptions,
        maxTimeMS: 15000, // 15 second timeout for queries that return multiple docs
      } as FindOptions<T>;
      return collection.find(filter, queryOptions).toArray();
    } catch (error) {
      logger.error(`Error finding documents in ${this.collectionName}`, {
        error,
      });
      throw error;
    }
  }

  /**
   * Find single document
   * Returns ALL fields from MongoDB (no projection)
   *
   * CRITICAL: This ensures all DB fields are available for processing
   * No field filtering - repositories handle field selection in processors
   *
   * Query timeout: 5 seconds (critical for build performance - prevent timeouts)
   */
  protected async findOne(
    filter: Filter<T>,
    options?: FindOptions<T>
  ): Promise<T | null> {
    try {
      const collection = await this.getCollection();
      // Remove any projection to ensure ALL fields are returned
      const { projection: _projection, ...restOptions } = options || {};
      // Add aggressive query timeout to prevent build timeouts
      const queryOptions = {
        ...restOptions,
        maxTimeMS: 5000, // 5 second timeout (critical for build)
      } as FindOptions<T>;
      return collection.findOne(filter, queryOptions);
    } catch (error) {
      logger.error(`Error finding document in ${this.collectionName}`, {
        error,
      });
      // Return null on timeout to prevent build failures
      if (error instanceof Error && error.message.includes('timeout')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Count documents
   */
  protected async countDocuments(filter: Filter<T> = {}): Promise<number> {
    try {
      const collection = await this.getCollection();
      return collection.countDocuments(filter);
    } catch (error) {
      logger.error(`Error counting documents in ${this.collectionName}`, {
        error,
      });
      return 0; // Return 0 on error to prevent app crashes
    }
  }

  /**
   * Count documents (alias for countDocuments for consistency)
   */
  protected async count(filter: Filter<T> = {}): Promise<number> {
    return this.countDocuments(filter);
  }

  /**
   * Aggregate pipeline
   */
  protected async aggregate<TResult = T>(
    pipeline: unknown[]
  ): Promise<TResult[]> {
    try {
      const collection = await this.getCollection();
      return collection.aggregate<TResult>(pipeline).toArray();
    } catch (error) {
      logger.error(`Error aggregating in ${this.collectionName}`, { error });
      throw error;
    }
  }
}

/**
 * Content Repository Interface
 * Defines common content operations
 */
export interface ContentRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  getBySlug(slug: string): Promise<T | null>;
  count(): Promise<number>;
  search(query: string): Promise<T[]>;
}

/**
 * Content Processing Interface
 * Transforms raw MongoDB documents into typed entities
 */
export interface ContentProcessor<TInput, TOutput> {
  process(raw: TInput): TOutput;
  processMany(raw: TInput[]): TOutput[];
}

/**
 * Content Formatter Interface
 * Formats entities for UI/API consumption
 */
export interface ContentFormatter<TInput, TOutput> {
  format(entity: TInput): TOutput;
  formatMany(entities: TInput[]): TOutput[];
}
