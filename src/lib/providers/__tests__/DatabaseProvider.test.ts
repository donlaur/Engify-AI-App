/**
 * DatabaseProvider Tests
 *
 * Tests for the DatabaseProvider singleton.
 * Covers:
 * - Singleton behavior
 * - Database connection management
 * - Collection access
 * - Transaction support
 * - Error handling
 * - Health checks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Db, MongoClient, Collection, ClientSession } from 'mongodb';
import { DatabaseProvider } from '../DatabaseProvider';
import { getDb, getClient } from '@/lib/mongodb';

// Mock MongoDB functions
vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
  getClient: vi.fn(),
}));

describe('DatabaseProvider', () => {
  let databaseProvider: DatabaseProvider;
  let mockDb: Db;
  let mockClient: MongoClient;
  let mockCollection: Collection;
  let mockSession: ClientSession;

  beforeEach(() => {
    // Reset singleton
    DatabaseProvider.resetInstance();
    databaseProvider = DatabaseProvider.getInstance();

    // Create mocks
    mockCollection = {
      findOne: vi.fn(),
      insertOne: vi.fn(),
    } as unknown as Collection;

    mockSession = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    } as unknown as ClientSession;

    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
      databaseName: 'test-db',
      listCollections: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([{ name: 'users' }, { name: 'api_keys' }]),
      }),
      admin: vi.fn().mockReturnValue({
        ping: vi.fn().mockResolvedValue({}),
      }),
    } as unknown as Db;

    mockClient = {
      startSession: vi.fn().mockReturnValue(mockSession),
      db: vi.fn().mockReturnValue(mockDb),
    } as unknown as MongoClient;

    // Setup default mocks
    vi.mocked(getDb).mockResolvedValue(mockDb);
    vi.mocked(getClient).mockResolvedValue(mockClient);

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    DatabaseProvider.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      // Arrange & Act
      const instance1 = DatabaseProvider.getInstance();
      const instance2 = DatabaseProvider.getInstance();

      // Assert
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      // Arrange
      const instance1 = DatabaseProvider.getInstance();

      // Act
      DatabaseProvider.resetInstance();
      const instance2 = DatabaseProvider.getInstance();

      // Assert
      expect(instance1).not.toBe(instance2);
    });

    it('should clear cache on reset', () => {
      // Arrange
      const instance = DatabaseProvider.getInstance();
      instance.clearCache();

      // Act
      DatabaseProvider.resetInstance();

      // Assert
      expect(() => DatabaseProvider.getInstance()).not.toThrow();
    });
  });

  describe('getDb', () => {
    it('should return database instance', async () => {
      // Act
      const db = await databaseProvider.getDb();

      // Assert
      expect(db).toBe(mockDb);
      expect(getDb).toHaveBeenCalledTimes(1);
    });

    it('should cache database instance', async () => {
      // Act
      const db1 = await databaseProvider.getDb();
      const db2 = await databaseProvider.getDb();

      // Assert
      expect(db1).toBe(db2);
      expect(getDb).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should throw error on database connection failure', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(getDb).mockRejectedValue(new Error('Connection failed'));

      // Act & Assert
      await expect(databaseProvider.getDb()).rejects.toThrow('Database connection failed');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should throw BUILD_MODE error without wrapping', async () => {
      // Arrange
      const buildError = new Error('BUILD_MODE: Cannot connect during build');
      vi.mocked(getDb).mockRejectedValue(buildError);

      // Act & Assert
      await expect(databaseProvider.getDb()).rejects.toThrow('BUILD_MODE');
    });
  });

  describe('getClient', () => {
    it('should return client instance', async () => {
      // Act
      const client = await databaseProvider.getClient();

      // Assert
      expect(client).toBe(mockClient);
      expect(getClient).toHaveBeenCalledTimes(1);
    });

    it('should cache client instance', async () => {
      // Act
      const client1 = await databaseProvider.getClient();
      const client2 = await databaseProvider.getClient();

      // Assert
      expect(client1).toBe(client2);
      expect(getClient).toHaveBeenCalledTimes(1);
    });

    it('should throw error on client connection failure', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(getClient).mockRejectedValue(new Error('Connection failed'));

      // Act & Assert
      await expect(databaseProvider.getClient()).rejects.toThrow(
        'Database client connection failed'
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCollection', () => {
    it('should return collection by name', async () => {
      // Act
      const collection = await databaseProvider.getCollection('users');

      // Assert
      expect(collection).toBe(mockCollection);
      expect(mockDb.collection).toHaveBeenCalledWith('users');
    });

    it('should return type-safe collection', async () => {
      // Act
      const collection = await databaseProvider.getCollection<{ name: string }>('users');

      // Assert
      expect(collection).toBe(mockCollection);
    });
  });

  describe('startSession', () => {
    it('should start a new database session', async () => {
      // Act
      const session = await databaseProvider.startSession();

      // Assert
      expect(session).toBe(mockSession);
      expect(mockClient.startSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('withTransaction', () => {
    it('should execute operation within transaction and commit', async () => {
      // Arrange
      const operation = vi.fn().mockResolvedValue('success');

      // Act
      const result = await databaseProvider.withTransaction(operation);

      // Assert
      expect(result).toBe('success');
      expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
      expect(operation).toHaveBeenCalledWith(mockSession);
      expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      expect(mockSession.abortTransaction).not.toHaveBeenCalled();
    });

    it('should abort transaction on error', async () => {
      // Arrange
      const error = new Error('Operation failed');
      const operation = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(databaseProvider.withTransaction(operation)).rejects.toThrow(
        'Operation failed'
      );
      expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
      expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it('should end session even if commit fails', async () => {
      // Arrange
      const operation = vi.fn().mockResolvedValue('success');
      vi.mocked(mockSession.commitTransaction).mockRejectedValue(new Error('Commit failed'));

      // Act & Assert
      await expect(databaseProvider.withTransaction(operation)).rejects.toThrow('Commit failed');
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it('should return operation result', async () => {
      // Arrange
      const expectedResult = { id: '123', name: 'Test' };
      const operation = vi.fn().mockResolvedValue(expectedResult);

      // Act
      const result = await databaseProvider.withTransaction(operation);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });

  describe('isConnected', () => {
    it('should return true when connected', async () => {
      // Act
      const isConnected = await databaseProvider.isConnected();

      // Assert
      expect(isConnected).toBe(true);
    });

    it('should return false when ping fails', async () => {
      // Arrange
      const mockAdminDb = {
        ping: vi.fn().mockRejectedValue(new Error('Ping failed')),
      };
      vi.mocked(mockClient.db).mockReturnValue({
        admin: () => mockAdminDb,
      } as unknown as Db);

      // Act
      const isConnected = await databaseProvider.isConnected();

      // Assert
      expect(isConnected).toBe(false);
    });

    it('should return false when client fails', async () => {
      // Arrange
      vi.mocked(getClient).mockRejectedValue(new Error('Client failed'));

      // Act
      const isConnected = await databaseProvider.isConnected();

      // Assert
      expect(isConnected).toBe(false);
    });
  });

  describe('getHealthStatus', () => {
    it('should return health status when connected', async () => {
      // Act
      const health = await databaseProvider.getHealthStatus();

      // Assert
      expect(health).toEqual({
        connected: true,
        database: 'test-db',
        collections: 2,
      });
    });

    it('should return error status when not connected', async () => {
      // Arrange
      vi.mocked(getDb).mockRejectedValue(new Error('Connection failed'));

      // Act
      const health = await databaseProvider.getHealthStatus();

      // Assert
      expect(health).toEqual({
        connected: false,
        database: 'unknown',
        collections: 0,
      });
    });

    it('should handle listCollections error', async () => {
      // Arrange
      vi.mocked(mockDb.listCollections).mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('List failed')),
      } as any);

      // Act
      const health = await databaseProvider.getHealthStatus();

      // Assert
      expect(health).toEqual({
        connected: false,
        database: 'unknown',
        collections: 0,
      });
    });
  });

  describe('clearCache', () => {
    it('should clear database and client cache', async () => {
      // Arrange
      await databaseProvider.getDb();
      await databaseProvider.getClient();
      vi.clearAllMocks();

      // Act
      databaseProvider.clearCache();
      await databaseProvider.getDb();
      await databaseProvider.getClient();

      // Assert
      expect(getDb).toHaveBeenCalledTimes(1);
      expect(getClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent getDb calls', async () => {
      // Act
      const promises = Array.from({ length: 10 }, () => databaseProvider.getDb());
      const results = await Promise.all(promises);

      // Assert
      results.forEach((result) => {
        expect(result).toBe(mockDb);
      });
      expect(getDb).toHaveBeenCalledTimes(1); // Cached
    });

    it('should handle concurrent transactions', async () => {
      // Arrange
      const operation1 = vi.fn().mockResolvedValue('result1');
      const operation2 = vi.fn().mockResolvedValue('result2');

      const mockSession1 = { ...mockSession };
      const mockSession2 = { ...mockSession };

      vi.mocked(mockClient.startSession)
        .mockReturnValueOnce(mockSession1 as any)
        .mockReturnValueOnce(mockSession2 as any);

      // Act
      const [result1, result2] = await Promise.all([
        databaseProvider.withTransaction(operation1),
        databaseProvider.withTransaction(operation2),
      ]);

      // Assert
      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
      expect(mockClient.startSession).toHaveBeenCalledTimes(2);
    });
  });
});
