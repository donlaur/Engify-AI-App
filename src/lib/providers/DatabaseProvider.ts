/**
 * Database Provider
 *
 * Singleton provider for MongoDB database access.
 * Provides centralized database connection management with:
 * - Connection pooling
 * - Transaction support
 * - Error handling
 * - Build-time safety
 *
 * Usage:
 * ```typescript
 * const dbProvider = DatabaseProvider.getInstance();
 * const db = await dbProvider.getDb();
 * const collection = await dbProvider.getCollection('users');
 * ```
 *
 * @module DatabaseProvider
 */

import { Db, Collection, MongoClient, ClientSession, Document } from 'mongodb';
import { getDb, getClient } from '@/lib/mongodb';

export class DatabaseProvider {
  private static instance: DatabaseProvider;
  private dbCache: Db | null = null;
  private clientCache: MongoClient | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseProvider {
    if (!DatabaseProvider.instance) {
      DatabaseProvider.instance = new DatabaseProvider();
    }
    return DatabaseProvider.instance;
  }

  /**
   * Get MongoDB database instance
   * Cached for performance
   */
  public async getDb(): Promise<Db> {
    try {
      if (!this.dbCache) {
        this.dbCache = await getDb();
      }
      return this.dbCache;
    } catch (error) {
      // During build, throw a more specific error
      if (error instanceof Error && error.message.includes('BUILD_MODE')) {
        throw error;
      }
      console.error('DatabaseProvider: Failed to get database', error);
      throw new Error('Database connection failed');
    }
  }

  /**
   * Get MongoDB client instance
   */
  public async getClient(): Promise<MongoClient> {
    try {
      if (!this.clientCache) {
        this.clientCache = await getClient();
      }
      return this.clientCache;
    } catch (error) {
      console.error('DatabaseProvider: Failed to get client', error);
      throw new Error('Database client connection failed');
    }
  }

  /**
   * Get collection by name
   * Type-safe collection access
   */
  public async getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
    const db = await this.getDb();
    return db.collection<T>(name);
  }

  /**
   * Start a new database session for transactions
   */
  public async startSession(): Promise<ClientSession> {
    const client = await this.getClient();
    return client.startSession();
  }

  /**
   * Execute operations within a transaction
   * Automatically handles commit/abort and session cleanup
   *
   * @example
   * ```typescript
   * await dbProvider.withTransaction(async (session) => {
   *   const users = db.collection('users');
   *   await users.insertOne({ name: 'John' }, { session });
   *   await users.updateOne({ name: 'Jane' }, { $set: { active: true } }, { session });
   * });
   * ```
   */
  public async withTransaction<T>(
    operation: (session: ClientSession) => Promise<T>
  ): Promise<T> {
    const session = await this.startSession();

    try {
      session.startTransaction();
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Check if database is connected
   */
  public async isConnected(): Promise<boolean> {
    try {
      const client = await this.getClient();
      await client.db().admin().ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get database health status
   */
  public async getHealthStatus(): Promise<{
    connected: boolean;
    database: string;
    collections: number;
  }> {
    try {
      const db = await this.getDb();
      const collections = await db.listCollections().toArray();

      return {
        connected: true,
        database: db.databaseName,
        collections: collections.length,
      };
    } catch (error) {
      return {
        connected: false,
        database: 'unknown',
        collections: 0,
      };
    }
  }

  /**
   * Clear cache (useful for testing or connection reset)
   */
  public clearCache(): void {
    this.dbCache = null;
    this.clientCache = null;
  }

  /**
   * For testing: reset singleton instance
   */
  public static resetInstance(): void {
    if (DatabaseProvider.instance) {
      DatabaseProvider.instance.clearCache();
      DatabaseProvider.instance = null as any;
    }
  }
}

/**
 * Convenience export for quick access
 */
export const dbProvider = DatabaseProvider.getInstance();
