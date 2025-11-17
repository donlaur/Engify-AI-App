/**
 * BaseRepository Tests
 *
 * Tests for the generic BaseRepository class.
 * Covers:
 * - CRUD operations (create, read, update, delete)
 * - Pagination
 * - Soft delete functionality
 * - Transaction support
 * - Query operations
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Collection, Db, ObjectId, ClientSession } from 'mongodb';
import { z } from 'zod';
import { BaseRepository } from '../BaseRepository';
import { dbProvider } from '@/lib/providers/DatabaseProvider';
import { loggingProvider } from '@/lib/providers/LoggingProvider';

// Mock providers
vi.mock('@/lib/providers/DatabaseProvider');
vi.mock('@/lib/providers/LoggingProvider');

// Test entity type
interface TestEntity {
  _id?: ObjectId;
  name: string;
  email: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// Test schema
const TestSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string(),
  email: z.string().email(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
}) as z.ZodSchema<TestEntity>;

// Concrete implementation for testing
class TestRepository extends BaseRepository<TestEntity> {
  constructor(softDelete = false) {
    super('test_collection', TestSchema, { softDelete });
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let mockCollection: Collection<TestEntity>;
  let mockDb: Db;
  let mockSession: ClientSession;
  let mockDbProvider: any;
  let mockLoggingProvider: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock collection
    mockCollection = {
      findOne: vi.fn(),
      find: vi.fn(),
      insertOne: vi.fn(),
      insertMany: vi.fn(),
      findOneAndUpdate: vi.fn(),
      updateOne: vi.fn(),
      updateMany: vi.fn(),
      deleteOne: vi.fn(),
      countDocuments: vi.fn(),
    } as unknown as Collection<TestEntity>;

    // Create mock session
    mockSession = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    } as unknown as ClientSession;

    // Mock dbProvider
    mockDbProvider = {
      getCollection: vi.fn().mockResolvedValue(mockCollection),
      withTransaction: vi.fn(),
    };
    vi.mocked(dbProvider.getCollection).mockImplementation(mockDbProvider.getCollection);
    vi.mocked(dbProvider.withTransaction).mockImplementation(mockDbProvider.withTransaction);

    // Mock loggingProvider
    mockLoggingProvider = {
      error: vi.fn(),
    };
    vi.mocked(loggingProvider.error).mockImplementation(mockLoggingProvider.error);

    // Create repository instance
    repository = new TestRepository();
  });

  describe('findById', () => {
    it('should find entity by ID', async () => {
      // Arrange
      const id = new ObjectId();
      const entity: TestEntity = {
        _id: id,
        name: 'Test',
        email: 'test@example.com',
      };
      vi.mocked(mockCollection.findOne).mockResolvedValue(entity as any);

      // Act
      const result = await repository.findById(id.toString());

      // Assert
      expect(result).toEqual(entity);
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should return null when entity not found', async () => {
      // Arrange
      vi.mocked(mockCollection.findOne).mockResolvedValue(null);

      // Act
      const result = await repository.findById(new ObjectId().toString());

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('DB error');
      vi.mocked(mockCollection.findOne).mockRejectedValue(error);

      // Act & Assert
      await expect(repository.findById(new ObjectId().toString())).rejects.toThrow();
      expect(mockLoggingProvider.error).toHaveBeenCalled();
    });

    it('should exclude soft deleted items', async () => {
      // Arrange
      const repositoryWithSoftDelete = new TestRepository(true);
      vi.mocked(mockCollection.findOne).mockResolvedValue(null);

      // Act
      await repositoryWithSoftDelete.findById(new ObjectId().toString());

      // Assert
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
        deletedAt: { $exists: false },
      });
    });
  });

  describe('findByIdOrFail', () => {
    it('should return entity when found', async () => {
      // Arrange
      const id = new ObjectId();
      const entity: TestEntity = { _id: id, name: 'Test', email: 'test@example.com' };
      vi.mocked(mockCollection.findOne).mockResolvedValue(entity as any);

      // Act
      const result = await repository.findByIdOrFail(id.toString());

      // Assert
      expect(result).toEqual(entity);
    });

    it('should throw error when not found', async () => {
      // Arrange
      vi.mocked(mockCollection.findOne).mockResolvedValue(null);

      // Act & Assert
      await expect(
        repository.findByIdOrFail(new ObjectId().toString())
      ).rejects.toThrow('test_collection');
    });
  });

  describe('findOne', () => {
    it('should find one entity by filter', async () => {
      // Arrange
      const entity: TestEntity = { name: 'Test', email: 'test@example.com' };
      vi.mocked(mockCollection.findOne).mockResolvedValue(entity as any);

      // Act
      const result = await repository.findOne({ email: 'test@example.com' });

      // Assert
      expect(result).toEqual(entity);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'test@example.com' }, { session: undefined });
    });

    it('should return null when not found', async () => {
      // Arrange
      vi.mocked(mockCollection.findOne).mockResolvedValue(null);

      // Act
      const result = await repository.findOne({ email: 'nonexistent@example.com' });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('find', () => {
    it('should find multiple entities', async () => {
      // Arrange
      const entities: TestEntity[] = [
        { name: 'Test1', email: 'test1@example.com' },
        { name: 'Test2', email: 'test2@example.com' },
      ];

      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(entities),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      const result = await repository.find({});

      // Assert
      expect(result).toEqual(entities);
    });

    it('should apply limit and skip', async () => {
      // Arrange
      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      await repository.find({}, { limit: 10, skip: 20 });

      // Assert
      expect(mockCursor.limit).toHaveBeenCalledWith(10);
      expect(mockCursor.skip).toHaveBeenCalledWith(20);
    });

    it('should apply sorting', async () => {
      // Arrange
      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      await repository.find({}, { sort: { field: 'name', order: 'asc' } });

      // Assert
      expect(mockCursor.sort).toHaveBeenCalledWith({ name: 1 });
    });
  });

  describe('findPaginated', () => {
    it('should return paginated results', async () => {
      // Arrange
      const entities: TestEntity[] = [{ name: 'Test', email: 'test@example.com' }];

      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(entities),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(100);

      // Act
      const result = await repository.findPaginated({}, { page: 2, limit: 10 });

      // Assert
      expect(result).toEqual({
        data: entities,
        total: 100,
        page: 2,
        limit: 10,
        totalPages: 10,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should handle first page', async () => {
      // Arrange
      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(100);

      // Act
      const result = await repository.findPaginated({}, { page: 1, limit: 20 });

      // Assert
      expect(result.hasPrev).toBe(false);
      expect(result.hasNext).toBe(true);
    });

    it('should handle last page', async () => {
      // Arrange
      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(100);

      // Act
      const result = await repository.findPaginated({}, { page: 5, limit: 20 });

      // Assert
      expect(result.hasPrev).toBe(true);
      expect(result.hasNext).toBe(false);
    });
  });

  describe('insertOne (create)', () => {
    it('should insert one entity', async () => {
      // Arrange
      const id = new ObjectId();
      const entity: TestEntity = { name: 'Test', email: 'test@example.com' };
      vi.mocked(mockCollection.insertOne).mockResolvedValue({
        insertedId: id,
      } as any);

      // Act
      const result = await repository.insertOne(entity);

      // Assert
      expect(result).toEqual({ ...entity, _id: id });
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });

    it('should handle insert errors', async () => {
      // Arrange
      const entity: TestEntity = { name: 'Test', email: 'test@example.com' };
      vi.mocked(mockCollection.insertOne).mockRejectedValue(new Error('Insert failed'));

      // Act & Assert
      await expect(repository.insertOne(entity)).rejects.toThrow();
      expect(mockLoggingProvider.error).toHaveBeenCalled();
    });
  });

  describe('updateOne', () => {
    it('should update entity by ID', async () => {
      // Arrange
      const id = new ObjectId();
      const updated: TestEntity = {
        _id: id,
        name: 'Updated',
        email: 'test@example.com',
        updatedAt: new Date(),
      };
      vi.mocked(mockCollection.findOneAndUpdate).mockResolvedValue(updated as any);

      // Act
      const result = await repository.updateOne(id.toString(), { name: 'Updated' });

      // Assert
      expect(result).toEqual(updated);
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: expect.objectContaining({ name: 'Updated', updatedAt: expect.any(Date) }) },
        { returnDocument: 'after', session: undefined }
      );
    });

    it('should return null when entity not found', async () => {
      // Arrange
      vi.mocked(mockCollection.findOneAndUpdate).mockResolvedValue(null);

      // Act
      const result = await repository.updateOne(new ObjectId().toString(), { name: 'Updated' });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deleteOne', () => {
    it('should hard delete when soft delete disabled', async () => {
      // Arrange
      vi.mocked(mockCollection.deleteOne).mockResolvedValue({ deletedCount: 1 } as any);

      // Act
      const result = await repository.deleteOne(new ObjectId().toString());

      // Assert
      expect(result).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalled();
    });

    it('should soft delete when soft delete enabled', async () => {
      // Arrange
      const repositoryWithSoftDelete = new TestRepository(true);
      vi.mocked(mockCollection.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);

      // Act
      const result = await repositoryWithSoftDelete.deleteOne(new ObjectId().toString());

      // Assert
      expect(result).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: { deletedAt: expect.any(Date) } },
        { session: undefined }
      );
    });

    it('should return false when entity not found', async () => {
      // Arrange
      vi.mocked(mockCollection.deleteOne).mockResolvedValue({ deletedCount: 0 } as any);

      // Act
      const result = await repository.deleteOne(new ObjectId().toString());

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hardDeleteOne', () => {
    it('should always hard delete even with soft delete enabled', async () => {
      // Arrange
      const repositoryWithSoftDelete = new TestRepository(true);
      vi.mocked(mockCollection.deleteOne).mockResolvedValue({ deletedCount: 1 } as any);

      // Act
      const result = await repositoryWithSoftDelete.hardDeleteOne(new ObjectId().toString());

      // Assert
      expect(result).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore soft deleted entity', async () => {
      // Arrange
      const repositoryWithSoftDelete = new TestRepository(true);
      vi.mocked(mockCollection.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);

      // Act
      const result = await repositoryWithSoftDelete.restore(new ObjectId().toString());

      // Assert
      expect(result).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $unset: { deletedAt: '' } },
        { session: undefined }
      );
    });

    it('should throw error when soft delete not enabled', async () => {
      // Act & Assert
      await expect(repository.restore(new ObjectId().toString())).rejects.toThrow(
        'Soft delete not enabled'
      );
    });
  });

  describe('count', () => {
    it('should count documents', async () => {
      // Arrange
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(42);

      // Act
      const result = await repository.count({});

      // Assert
      expect(result).toBe(42);
    });

    it('should exclude soft deleted when soft delete enabled', async () => {
      // Arrange
      const repositoryWithSoftDelete = new TestRepository(true);
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(10);

      // Act
      await repositoryWithSoftDelete.count({});

      // Assert
      expect(mockCollection.countDocuments).toHaveBeenCalledWith(
        { deletedAt: { $exists: false } },
        { session: undefined }
      );
    });
  });

  describe('exists', () => {
    it('should return true when entity exists', async () => {
      // Arrange
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(1);

      // Act
      const result = await repository.exists({ email: 'test@example.com' });

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when entity does not exist', async () => {
      // Arrange
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(0);

      // Act
      const result = await repository.exists({ email: 'nonexistent@example.com' });

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('withTransaction', () => {
    it('should execute operation within transaction', async () => {
      // Arrange
      const operation = vi.fn().mockResolvedValue('success');
      mockDbProvider.withTransaction.mockImplementation((op: any) => op(mockSession));

      // Act
      const result = await repository.withTransaction(operation);

      // Assert
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledWith(mockSession);
    });

    it('should propagate transaction errors', async () => {
      // Arrange
      const error = new Error('Transaction failed');
      const operation = vi.fn().mockRejectedValue(error);
      mockDbProvider.withTransaction.mockImplementation((op: any) => op(mockSession));

      // Act & Assert
      await expect(repository.withTransaction(operation)).rejects.toThrow('Transaction failed');
    });
  });
});
