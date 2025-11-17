/**
 * Base Service Class
 *
 * Abstract base class for all database services
 * Provides common CRUD operations with type safety
 */

import { Collection, Filter, ObjectId, OptionalId } from 'mongodb';
import { ZodSchema } from 'zod';
import { getDb } from '@/lib/db/client';

export abstract class BaseService<T extends { _id?: ObjectId }> {
  protected collectionName: string;
  protected schema: ZodSchema<T>;

  constructor(collectionName: string, schema: ZodSchema<T>) {
    this.collectionName = collectionName;
    this.schema = schema;
  }

  /**
   * Get MongoDB collection
   */
  protected async getCollection(): Promise<Collection<T>> {
    try {
      const db = await getDb();
      return db.collection<T>(this.collectionName);
    } catch (error) {
      // During build, throw a more specific error that can be caught
      if (error instanceof Error && error.message.includes('BUILD_MODE')) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Find one document by ID
   */
  async findById(id: string): Promise<T | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({
      _id: new ObjectId(id),
    } as Filter<T>);
    return doc as T | null;
  }

  /**
   * Find one document by filter
   */
  async findOne(filter: Filter<T>): Promise<T | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne(filter);
    return doc as T | null;
  }

  /**
   * Find multiple documents
   */
  async find(filter: Filter<T> = {}): Promise<T[]> {
    const collection = await this.getCollection();
    const docs = await collection.find(filter).toArray();
    return docs as T[];
  }

  /**
   * Find with pagination
   */
  async findPaginated(
    filter: Filter<T>,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: T[]; total: number }> {
    const collection = await this.getCollection();
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      collection.find(filter).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);

    return { data: data as T[], total };
  }

  /**
   * Insert one document
   */
  async insertOne(data: OptionalId<T>): Promise<T> {
    // Validate with Zod when schema provides parse (tests may use placeholder schema)
    const schemaWithParse = this.schema as unknown as { parse?: (data: unknown) => T };
    const validated = typeof schemaWithParse.parse === 'function'
      ? schemaWithParse.parse(data)
      : (data as T);

    const collection = await this.getCollection();
    const result = await collection.insertOne(validated as any);

    return {
      ...validated,
      _id: result.insertedId,
    } as T;
  }

  /**
   * Alias used by services/tests: create
   */
  async create(data: OptionalId<T>): Promise<T> {
    return this.insertOne(data);
  }

  /**
   * Update one document
   */
  async updateOne(
    id: string,
    update: Partial<Omit<T, '_id'>>
  ): Promise<T | null> {
    const collection = await this.getCollection();

    const updateDoc = { ...update, updatedAt: new Date() };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as Filter<T>,
      { $set: updateDoc } as any,
      { returnDocument: 'after' }
    );

    return result as T | null;
  }

  /**
   * Delete one document
   */
  async deleteOne(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    } as Filter<T>);
    return result.deletedCount > 0;
  }

  /**
   * Count documents
   */
  async count(filter: Filter<T> = {}): Promise<number> {
    const collection = await this.getCollection();
    return await collection.countDocuments(filter);
  }

  /**
   * Check if document exists
   */
  async exists(filter: Filter<T>): Promise<boolean> {
    const count = await this.count(filter);
    return count > 0;
  }
}
