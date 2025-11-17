/**
 * Database Mocking Utilities
 *
 * Advanced mocks for MongoDB operations with in-memory storage
 */

import { vi } from 'vitest';

/**
 * In-memory database store for testing
 */
export class InMemoryDatabase {
  private collections: Map<string, Map<string, any>> = new Map();

  /**
   * Get or create a collection
   */
  private getCollection(name: string): Map<string, any> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name)!;
  }

  /**
   * Insert a document
   */
  insertOne(collection: string, doc: any): any {
    const coll = this.getCollection(collection);
    const id = doc._id || this.generateId();
    const docWithId = { ...doc, _id: id };
    coll.set(id, docWithId);
    return { insertedId: id, acknowledged: true };
  }

  /**
   * Insert multiple documents
   */
  insertMany(collection: string, docs: any[]): any {
    const insertedIds = docs.map((doc) => {
      const result = this.insertOne(collection, doc);
      return result.insertedId;
    });
    return { insertedIds, insertedCount: docs.length, acknowledged: true };
  }

  /**
   * Find one document
   */
  findOne(collection: string, query: any): any | null {
    const coll = this.getCollection(collection);
    for (const [, doc] of coll.entries()) {
      if (this.matchesQuery(doc, query)) {
        return doc;
      }
    }
    return null;
  }

  /**
   * Find multiple documents
   */
  find(collection: string, query: any = {}): any[] {
    const coll = this.getCollection(collection);
    const results: any[] = [];
    for (const [, doc] of coll.entries()) {
      if (this.matchesQuery(doc, query)) {
        results.push(doc);
      }
    }
    return results;
  }

  /**
   * Update one document
   */
  updateOne(collection: string, query: any, update: any): any {
    const coll = this.getCollection(collection);
    for (const [id, doc] of coll.entries()) {
      if (this.matchesQuery(doc, query)) {
        const updated = this.applyUpdate(doc, update);
        coll.set(id, updated);
        return { modifiedCount: 1, matchedCount: 1, acknowledged: true };
      }
    }
    return { modifiedCount: 0, matchedCount: 0, acknowledged: true };
  }

  /**
   * Update multiple documents
   */
  updateMany(collection: string, query: any, update: any): any {
    const coll = this.getCollection(collection);
    let modifiedCount = 0;
    for (const [id, doc] of coll.entries()) {
      if (this.matchesQuery(doc, query)) {
        const updated = this.applyUpdate(doc, update);
        coll.set(id, updated);
        modifiedCount++;
      }
    }
    return {
      modifiedCount,
      matchedCount: modifiedCount,
      acknowledged: true,
    };
  }

  /**
   * Delete one document
   */
  deleteOne(collection: string, query: any): any {
    const coll = this.getCollection(collection);
    for (const [id, doc] of coll.entries()) {
      if (this.matchesQuery(doc, query)) {
        coll.delete(id);
        return { deletedCount: 1, acknowledged: true };
      }
    }
    return { deletedCount: 0, acknowledged: true };
  }

  /**
   * Delete multiple documents
   */
  deleteMany(collection: string, query: any = {}): any {
    const coll = this.getCollection(collection);
    let deletedCount = 0;
    const toDelete: string[] = [];
    for (const [id, doc] of coll.entries()) {
      if (this.matchesQuery(doc, query)) {
        toDelete.push(id);
        deletedCount++;
      }
    }
    toDelete.forEach((id) => coll.delete(id));
    return { deletedCount, acknowledged: true };
  }

  /**
   * Count documents
   */
  countDocuments(collection: string, query: any = {}): number {
    return this.find(collection, query).length;
  }

  /**
   * Aggregate pipeline (basic implementation)
   */
  aggregate(collection: string, pipeline: any[]): any[] {
    let results = this.find(collection, {});

    for (const stage of pipeline) {
      if (stage.$match) {
        results = results.filter((doc) =>
          this.matchesQuery(doc, stage.$match)
        );
      }

      if (stage.$sort) {
        const [field, order] = Object.entries(stage.$sort)[0];
        results.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return (order as number) === 1 ? comparison : -comparison;
        });
      }

      if (stage.$limit) {
        results = results.slice(0, stage.$limit);
      }

      if (stage.$skip) {
        results = results.slice(stage.$skip);
      }

      if (stage.$project) {
        results = results.map((doc) => {
          const projected: any = {};
          for (const [field, include] of Object.entries(stage.$project)) {
            if (include) {
              projected[field] = doc[field];
            }
          }
          return projected;
        });
      }
    }

    return results;
  }

  /**
   * Clear a collection
   */
  clearCollection(name: string): void {
    this.collections.delete(name);
  }

  /**
   * Clear all collections
   */
  clearAll(): void {
    this.collections.clear();
  }

  /**
   * Seed a collection with data
   */
  seed(collection: string, data: any[]): void {
    this.clearCollection(collection);
    data.forEach((doc) => this.insertOne(collection, doc));
  }

  /**
   * Helper: Check if document matches query
   */
  private matchesQuery(doc: any, query: any): boolean {
    if (Object.keys(query).length === 0) return true;

    return Object.entries(query).every(([key, value]) => {
      // Handle operators
      if (key.startsWith('$')) {
        switch (key) {
          case '$or':
            return (value as any[]).some((q) => this.matchesQuery(doc, q));
          case '$and':
            return (value as any[]).every((q) => this.matchesQuery(doc, q));
          default:
            return false;
        }
      }

      const docValue = doc[key];

      // Handle nested operators
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const operators = Object.keys(value).filter((k) => k.startsWith('$'));
        if (operators.length > 0) {
          return operators.every((op) => {
            switch (op) {
              case '$eq':
                return docValue === value[op];
              case '$ne':
                return docValue !== value[op];
              case '$gt':
                return docValue > value[op];
              case '$gte':
                return docValue >= value[op];
              case '$lt':
                return docValue < value[op];
              case '$lte':
                return docValue <= value[op];
              case '$in':
                return (value[op] as any[]).includes(docValue);
              case '$nin':
                return !(value[op] as any[]).includes(docValue);
              default:
                return false;
            }
          });
        }
      }

      return docValue === value;
    });
  }

  /**
   * Helper: Apply update operators
   */
  private applyUpdate(doc: any, update: any): any {
    const updated = { ...doc };

    if (update.$set) {
      Object.assign(updated, update.$set);
    }

    if (update.$unset) {
      Object.keys(update.$unset).forEach((key) => {
        delete updated[key];
      });
    }

    if (update.$inc) {
      Object.entries(update.$inc).forEach(([key, value]) => {
        updated[key] = (updated[key] || 0) + (value as number);
      });
    }

    if (update.$push) {
      Object.entries(update.$push).forEach(([key, value]) => {
        if (!Array.isArray(updated[key])) {
          updated[key] = [];
        }
        updated[key].push(value);
      });
    }

    if (update.$pull) {
      Object.entries(update.$pull).forEach(([key, value]) => {
        if (Array.isArray(updated[key])) {
          updated[key] = updated[key].filter((item: any) => item !== value);
        }
      });
    }

    return updated;
  }

  /**
   * Helper: Generate a MongoDB-style ObjectId
   */
  private generateId(): string {
    return Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

/**
 * Create a mock MongoDB collection
 */
export function createMockCollection(db: InMemoryDatabase, name: string) {
  return {
    findOne: vi.fn((query: any) => Promise.resolve(db.findOne(name, query))),
    find: vi.fn((query: any = {}) => ({
      toArray: vi.fn(() => Promise.resolve(db.find(name, query))),
      sort: vi.fn(function (this: any) {
        return this;
      }),
      limit: vi.fn(function (this: any) {
        return this;
      }),
      skip: vi.fn(function (this: any) {
        return this;
      }),
    })),
    insertOne: vi.fn((doc: any) => Promise.resolve(db.insertOne(name, doc))),
    insertMany: vi.fn((docs: any[]) =>
      Promise.resolve(db.insertMany(name, docs))
    ),
    updateOne: vi.fn((query: any, update: any) =>
      Promise.resolve(db.updateOne(name, query, update))
    ),
    updateMany: vi.fn((query: any, update: any) =>
      Promise.resolve(db.updateMany(name, query, update))
    ),
    deleteOne: vi.fn((query: any) =>
      Promise.resolve(db.deleteOne(name, query))
    ),
    deleteMany: vi.fn((query: any = {}) =>
      Promise.resolve(db.deleteMany(name, query))
    ),
    countDocuments: vi.fn((query: any = {}) =>
      Promise.resolve(db.countDocuments(name, query))
    ),
    aggregate: vi.fn((pipeline: any[]) => ({
      toArray: vi.fn(() => Promise.resolve(db.aggregate(name, pipeline))),
    })),
  };
}

/**
 * Create a mock database instance
 */
export function createMockDatabase() {
  const db = new InMemoryDatabase();

  return {
    db,
    collection: vi.fn((name: string) => createMockCollection(db, name)),
    clearAll: () => db.clearAll(),
    seed: (collection: string, data: any[]) => db.seed(collection, data),
  };
}
