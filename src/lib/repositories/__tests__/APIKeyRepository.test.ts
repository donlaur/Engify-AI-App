/**
 * APIKeyRepository Tests
 *
 * Tests for the APIKeyRepository.
 * Covers:
 * - API key lookups
 * - User key queries
 * - Key revocation
 * - Usage tracking
 * - Expiration handling
 * - Statistics
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Collection, ObjectId } from 'mongodb';
import { APIKeyRepository, type APIKey } from '../APIKeyRepository';
import { dbProvider } from '@/lib/providers/DatabaseProvider';

// Mock providers
vi.mock('@/lib/providers/DatabaseProvider');
vi.mock('@/lib/providers/LoggingProvider', () => ({
  loggingProvider: {
    error: vi.fn(),
  },
}));

describe('APIKeyRepository', () => {
  let repository: APIKeyRepository;
  let mockCollection: Collection<APIKey>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock collection
    mockCollection = {
      findOne: vi.fn(),
      find: vi.fn(),
      insertOne: vi.fn(),
      updateOne: vi.fn(),
      deleteMany: vi.fn(),
      countDocuments: vi.fn(),
    } as unknown as Collection<APIKey>;

    // Mock dbProvider
    vi.mocked(dbProvider.getCollection).mockResolvedValue(mockCollection);

    // Create repository instance
    repository = new APIKeyRepository();
  });

  describe('findByHash', () => {
    it('should find API key by hash', async () => {
      // Arrange
      const apiKey: APIKey = {
        _id: new ObjectId(),
        userId: 'user-123',
        name: 'Test Key',
        keyHash: 'hash123',
        lastFour: '1234',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(mockCollection.findOne).mockResolvedValue(apiKey as any);

      // Act
      const result = await repository.findByHash('hash123');

      // Assert
      expect(result).toEqual(apiKey);
      expect(mockCollection.findOne).toHaveBeenCalledWith(
        { keyHash: 'hash123' },
        { session: undefined }
      );
    });

    it('should return null when key not found', async () => {
      // Arrange
      vi.mocked(mockCollection.findOne).mockResolvedValue(null);

      // Act
      const result = await repository.findByHash('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all keys for a user', async () => {
      // Arrange
      const apiKeys: APIKey[] = [
        {
          _id: new ObjectId(),
          userId: 'user-123',
          name: 'Key 1',
          keyHash: 'hash1',
          lastFour: '1111',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new ObjectId(),
          userId: 'user-123',
          name: 'Key 2',
          keyHash: 'hash2',
          lastFour: '2222',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(apiKeys),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      const result = await repository.findByUserId('user-123');

      // Assert
      expect(result).toEqual(apiKeys);
      expect(mockCursor.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe('findActiveByUserId', () => {
    it('should find only active non-expired keys', async () => {
      // Arrange
      const activeKeys: APIKey[] = [
        {
          _id: new ObjectId(),
          userId: 'user-123',
          name: 'Active Key',
          keyHash: 'hash1',
          lastFour: '1111',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(activeKeys),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      const result = await repository.findActiveByUserId('user-123');

      // Assert
      expect(result).toEqual(activeKeys);
      expect(mockCollection.find).toHaveBeenCalledWith(
        {
          userId: 'user-123',
          isActive: true,
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: expect.any(Date) } },
          ],
        },
        expect.any(Object)
      );
    });
  });

  describe('findByIdAndUserId', () => {
    it('should find key by ID and verify ownership', async () => {
      // Arrange
      const keyId = new ObjectId();
      const apiKey: APIKey = {
        _id: keyId,
        userId: 'user-123',
        name: 'Test Key',
        keyHash: 'hash',
        lastFour: '1234',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(mockCollection.findOne).mockResolvedValue(apiKey as any);

      // Act
      const result = await repository.findByIdAndUserId(keyId.toString(), 'user-123');

      // Assert
      expect(result).toEqual(apiKey);
      expect(mockCollection.findOne).toHaveBeenCalledWith(
        {
          _id: expect.any(ObjectId),
          userId: 'user-123',
        },
        { session: undefined }
      );
    });

    it('should return null when ownership does not match', async () => {
      // Arrange
      vi.mocked(mockCollection.findOne).mockResolvedValue(null);

      // Act
      const result = await repository.findByIdAndUserId(
        new ObjectId().toString(),
        'wrong-user'
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('revoke', () => {
    it('should revoke API key', async () => {
      // Arrange
      const keyId = new ObjectId();
      const revokedKey: APIKey = {
        _id: keyId,
        userId: 'user-123',
        name: 'Revoked Key',
        keyHash: 'hash',
        lastFour: '1234',
        isActive: false,
        revokedAt: new Date(),
        revokedBy: 'admin-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(mockCollection.findOneAndUpdate).mockResolvedValue(revokedKey as any);

      // Act
      const result = await repository.revoke(keyId.toString(), 'admin-123');

      // Assert
      expect(result).toBe(true);
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should return false when key not found', async () => {
      // Arrange
      vi.mocked(mockCollection.findOneAndUpdate).mockResolvedValue(null);

      // Act
      const result = await repository.revoke(new ObjectId().toString(), 'admin-123');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('recordUsage', () => {
    it('should update last used timestamp and increment count', async () => {
      // Arrange
      const keyId = new ObjectId();
      vi.mocked(mockCollection.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);

      // Act
      await repository.recordUsage(keyId.toString());

      // Assert
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        {
          $set: { lastUsedAt: expect.any(Date), updatedAt: expect.any(Date) },
          $inc: { usageCount: 1 },
        },
        { session: undefined }
      );
    });
  });

  describe('countActiveByUserId', () => {
    it('should count active keys for user', async () => {
      // Arrange
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(5);

      // Act
      const result = await repository.countActiveByUserId('user-123');

      // Assert
      expect(result).toBe(5);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith(
        {
          userId: 'user-123',
          isActive: true,
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: expect.any(Date) } },
          ],
        },
        { session: undefined }
      );
    });
  });

  describe('findExpired', () => {
    it('should find expired but still active keys', async () => {
      // Arrange
      const expiredKeys: APIKey[] = [
        {
          _id: new ObjectId(),
          userId: 'user-123',
          name: 'Expired Key',
          keyHash: 'hash',
          lastFour: '1234',
          isActive: true,
          expiresAt: new Date(Date.now() - 86400000), // Yesterday
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(expiredKeys),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      const result = await repository.findExpired();

      // Assert
      expect(result).toEqual(expiredKeys);
      expect(mockCollection.find).toHaveBeenCalledWith(
        {
          expiresAt: { $lte: expect.any(Date) },
          isActive: true,
        },
        { session: undefined }
      );
    });
  });

  describe('deactivateExpired', () => {
    it('should deactivate all expired keys', async () => {
      // Arrange
      vi.mocked(mockCollection.updateMany).mockResolvedValue({ modifiedCount: 3 } as any);

      // Act
      const result = await repository.deactivateExpired();

      // Assert
      expect(result).toBe(3);
      expect(mockCollection.updateMany).toHaveBeenCalled();
    });
  });

  describe('getUserKeyStats', () => {
    it('should return comprehensive user key statistics', async () => {
      // Arrange
      const now = new Date();
      const keys: APIKey[] = [
        {
          _id: new ObjectId(),
          userId: 'user-123',
          name: 'Active Key',
          keyHash: 'hash1',
          lastFour: '1111',
          isActive: true,
          usageCount: 100,
          createdAt: now,
          updatedAt: now,
        },
        {
          _id: new ObjectId(),
          userId: 'user-123',
          name: 'Revoked Key',
          keyHash: 'hash2',
          lastFour: '2222',
          isActive: false,
          revokedAt: new Date(),
          usageCount: 50,
          createdAt: now,
          updatedAt: now,
        },
        {
          _id: new ObjectId(),
          userId: 'user-123',
          name: 'Expired Key',
          keyHash: 'hash3',
          lastFour: '3333',
          isActive: true,
          expiresAt: new Date(Date.now() - 86400000),
          usageCount: 25,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(keys),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      const stats = await repository.getUserKeyStats('user-123');

      // Assert
      expect(stats).toEqual({
        total: 3,
        active: 1,
        revoked: 1,
        expired: 1,
        totalUsage: 175,
      });
    });

    it('should handle empty key list', async () => {
      // Arrange
      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      const stats = await repository.getUserKeyStats('user-123');

      // Assert
      expect(stats).toEqual({
        total: 0,
        active: 0,
        revoked: 0,
        expired: 0,
        totalUsage: 0,
      });
    });
  });

  describe('cleanupOldRevokedKeys', () => {
    it('should delete old revoked keys', async () => {
      // Arrange
      vi.mocked(mockCollection.deleteMany).mockResolvedValue({ deletedCount: 5 } as any);

      // Act
      const result = await repository.cleanupOldRevokedKeys(90);

      // Assert
      expect(result).toBe(5);
      expect(mockCollection.deleteMany).toHaveBeenCalledWith(
        {
          isActive: false,
          revokedAt: { $lte: expect.any(Date) },
        },
        { session: undefined }
      );
    });

    it('should use default retention period', async () => {
      // Arrange
      vi.mocked(mockCollection.deleteMany).mockResolvedValue({ deletedCount: 2 } as any);

      // Act
      const result = await repository.cleanupOldRevokedKeys();

      // Assert
      expect(result).toBe(2);
    });
  });
});
