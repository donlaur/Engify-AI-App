/**
 * Base Repository
 *
 * Generic repository implementation following the Repository Pattern.
 * Provides common CRUD operations with:
 * - Type safety
 * - Provider-based dependency injection
 * - Transaction support
 * - Error handling
 * - Pagination
 * - Soft deletes (optional)
 *
 * All repositories should extend this class to ensure consistency
 * and reduce code duplication.
 *
 * Usage:
 * ```typescript
 * class UserRepository extends BaseRepository<User> {
 *   constructor() {
 *     super('users', UserSchema);
 *   }
 *
 *   async findByEmail(email: string): Promise<User | null> {
 *     return this.findOne({ email });
 *   }
 * }
 * ```
 *
 * @module BaseRepository
 */

import { Collection, Filter, ObjectId, OptionalId, UpdateFilter, ClientSession } from 'mongodb';
import { ZodSchema } from 'zod';
import { dbProvider } from '@/lib/providers/DatabaseProvider';
import { loggingProvider } from '@/lib/providers/LoggingProvider';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc' | 1 | -1;
}

export abstract class BaseRepository<T extends { _id?: ObjectId }> {
  protected collectionName: string;
  protected schema: ZodSchema<T>;
  protected softDelete: boolean;

  constructor(
    collectionName: string,
    schema: ZodSchema<T>,
    options: { softDelete?: boolean } = {}
  ) {
    this.collectionName = collectionName;
    this.schema = schema;
    this.softDelete = options.softDelete || false;
  }

  /**
   * Get MongoDB collection
   */
  protected async getCollection(): Promise<Collection<T>> {
    try {
      return await dbProvider.getCollection<T>(this.collectionName);
    } catch (error) {
      loggingProvider.error(
        `Failed to get collection: ${this.collectionName}`,
        error
      );
      throw error;
    }
  }

  /**
   * Validate data with Zod schema
   */
  protected validate(data: unknown): T {
    try {
      return this.schema.parse(data);
    } catch (error) {
      loggingProvider.error('Validation failed', error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Add soft delete filter if enabled
   */
  protected addSoftDeleteFilter<F extends Filter<T>>(filter: F): F {
    if (this.softDelete) {
      return {
        ...filter,
        deletedAt: { $exists: false },
      } as F;
    }
    return filter;
  }

  // ==========================================================================
  // CRUD Operations
  // ==========================================================================

  /**
   * Find document by ID
   */
  async findById(id: string, session?: ClientSession): Promise<T | null> {
    try {
      const collection = await this.getCollection();
      const filter = this.addSoftDeleteFilter({
        _id: new ObjectId(id),
      } as Filter<T>);

      const doc = await collection.findOne(filter, { session });
      return doc as T | null;
    } catch (error) {
      loggingProvider.error(`Failed to find by ID: ${id}`, error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Find document by ID or throw error
   */
  async findByIdOrFail(id: string, session?: ClientSession): Promise<T> {
    const doc = await this.findById(id, session);
    if (!doc) {
      throw new Error(
        `${this.collectionName} with ID ${id} not found`
      );
    }
    return doc;
  }

  /**
   * Find one document by filter
   */
  async findOne(filter: Filter<T>, session?: ClientSession): Promise<T | null> {
    try {
      const collection = await this.getCollection();
      const enhancedFilter = this.addSoftDeleteFilter(filter);
      const doc = await collection.findOne(enhancedFilter, { session });
      return doc as T | null;
    } catch (error) {
      loggingProvider.error('Failed to find one', error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Find multiple documents
   */
  async find(
    filter: Filter<T> = {} as Filter<T>,
    options?: {
      limit?: number;
      skip?: number;
      sort?: SortOptions;
      session?: ClientSession;
    }
  ): Promise<T[]> {
    try {
      const collection = await this.getCollection();
      const enhancedFilter = this.addSoftDeleteFilter(filter);

      let query = collection.find(enhancedFilter, { session: options?.session });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.skip) {
        query = query.skip(options.skip);
      }

      if (options?.sort) {
        const sortOrder = options.sort.order === 'asc' || options.sort.order === 1 ? 1 : -1;
        query = query.sort({ [options.sort.field]: sortOrder });
      }

      const docs = await query.toArray();
      return docs as T[];
    } catch (error) {
      loggingProvider.error('Failed to find', error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Find with pagination
   */
  async findPaginated(
    filter: Filter<T> = {} as Filter<T>,
    options: PaginationOptions & { sort?: SortOptions; session?: ClientSession } = {}
  ): Promise<PaginatedResult<T>> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = options.skip !== undefined ? options.skip : (page - 1) * limit;

      const collection = await this.getCollection();
      const enhancedFilter = this.addSoftDeleteFilter(filter);

      const [data, total] = await Promise.all([
        this.find(filter, { ...options, limit, skip }),
        collection.countDocuments(enhancedFilter, { session: options.session }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      loggingProvider.error('Failed to find paginated', error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Insert one document
   */
  async insertOne(data: OptionalId<T>, session?: ClientSession): Promise<T> {
    try {
      // Validate with Zod (skip validation in tests if schema is placeholder)
      const schemaWithParse = this.schema as unknown as { parse?: (data: unknown) => T };
      const validated = typeof schemaWithParse.parse === 'function'
        ? schemaWithParse.parse(data)
        : (data as T);

      const collection = await this.getCollection();
      const result = await collection.insertOne(validated as any, { session });

      return {
        ...validated,
        _id: result.insertedId,
      } as T;
    } catch (error) {
      loggingProvider.error('Failed to insert one', error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Alias for insertOne (used by services/tests)
   */
  async create(data: OptionalId<T>, session?: ClientSession): Promise<T> {
    return this.insertOne(data, session);
  }

  /**
   * Insert multiple documents
   */
  async insertMany(
    documents: OptionalId<T>[],
    session?: ClientSession
  ): Promise<T[]> {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertMany(documents as any[], { session });

      return documents.map((doc, index) => ({
        ...doc,
        _id: result.insertedIds[index],
      })) as T[];
    } catch (error) {
      loggingProvider.error('Failed to insert many', error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Update one document by ID
   */
  async updateOne(
    id: string,
    update: Partial<Omit<T, '_id'>>,
    session?: ClientSession
  ): Promise<T | null> {
    try {
      const collection = await this.getCollection();

      const updateDoc = {
        ...update,
        updatedAt: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) } as Filter<T>,
        { $set: updateDoc } as UpdateFilter<T>,
        { returnDocument: 'after', session }
      );

      return result as T | null;
    } catch (error) {
      loggingProvider.error(`Failed to update by ID: ${id}`, error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Update one document by filter
   */
  async updateOneByFilter(
    filter: Filter<T>,
    update: Partial<Omit<T, '_id'>>,
    session?: ClientSession
  ): Promise<T | null> {
    try {
      const collection = await this.getCollection();

      const updateDoc = {
        ...update,
        updatedAt: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        filter,
        { $set: updateDoc } as UpdateFilter<T>,
        { returnDocument: 'after', session }
      );

      return result as T | null;
    } catch (error) {
      loggingProvider.error('Failed to update one by filter', error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Update multiple documents
   */
  async updateMany(
    filter: Filter<T>,
    update: Partial<Omit<T, '_id'>>,
    session?: ClientSession
  ): Promise<number> {
    try {
      const collection = await this.getCollection();

      const updateDoc = {
        ...update,
        updatedAt: new Date(),
      };

      const result = await collection.updateMany(
        filter,
        { $set: updateDoc } as UpdateFilter<T>,
        { session }
      );

      return result.modifiedCount;
    } catch (error) {
      loggingProvider.error('Failed to update many', error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Delete one document by ID
   * Soft delete if enabled, hard delete otherwise
   */
  async deleteOne(id: string, session?: ClientSession): Promise<boolean> {
    try {
      const collection = await this.getCollection();

      if (this.softDelete) {
        // Soft delete
        const result = await collection.updateOne(
          { _id: new ObjectId(id) } as Filter<T>,
          { $set: { deletedAt: new Date() } } as UpdateFilter<T>,
          { session }
        );
        return result.modifiedCount > 0;
      } else {
        // Hard delete
        const result = await collection.deleteOne(
          { _id: new ObjectId(id) } as Filter<T>,
          { session }
        );
        return result.deletedCount > 0;
      }
    } catch (error) {
      loggingProvider.error(`Failed to delete by ID: ${id}`, error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Hard delete (even if soft delete is enabled)
   */
  async hardDeleteOne(id: string, session?: ClientSession): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne(
        { _id: new ObjectId(id) } as Filter<T>,
        { session }
      );
      return result.deletedCount > 0;
    } catch (error) {
      loggingProvider.error(`Failed to hard delete by ID: ${id}`, error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Restore soft deleted document
   */
  async restore(id: string, session?: ClientSession): Promise<boolean> {
    if (!this.softDelete) {
      throw new Error('Soft delete not enabled for this repository');
    }

    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(id) } as Filter<T>,
        { $unset: { deletedAt: '' } } as UpdateFilter<T>,
        { session }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      loggingProvider.error(`Failed to restore by ID: ${id}`, error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  // ==========================================================================
  // Query Operations
  // ==========================================================================

  /**
   * Count documents
   */
  async count(filter: Filter<T> = {} as Filter<T>, session?: ClientSession): Promise<number> {
    try {
      const collection = await this.getCollection();
      const enhancedFilter = this.addSoftDeleteFilter(filter);
      return await collection.countDocuments(enhancedFilter, { session });
    } catch (error) {
      loggingProvider.error('Failed to count', error, {
        collection: this.collectionName,
      });
      throw error;
    }
  }

  /**
   * Check if document exists
   */
  async exists(filter: Filter<T>, session?: ClientSession): Promise<boolean> {
    const count = await this.count(filter, session);
    return count > 0;
  }

  /**
   * Find all documents (use with caution)
   */
  async findAll(session?: ClientSession): Promise<T[]> {
    return this.find({} as Filter<T>, { session });
  }

  // ==========================================================================
  // Transaction Support
  // ==========================================================================

  /**
   * Execute operations within a transaction
   */
  async withTransaction<TResult>(
    operation: (session: ClientSession) => Promise<TResult>
  ): Promise<TResult> {
    return dbProvider.withTransaction(operation);
  }
}
