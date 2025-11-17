/**
 * UserAPIKeyService Tests
 *
 * Tests for the UserAPIKeyService.
 * Covers:
 * - API key creation
 * - Key listing (all and active)
 * - Key revocation
 * - Key rotation (atomic with transaction)
 * - Key verification
 * - Usage tracking
 * - Statistics
 * - Maintenance operations
 * - Audit logging
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ObjectId } from 'mongodb';
import { UserAPIKeyService } from '../UserAPIKeyService';
import { APIKeyRepository, type APIKey } from '@/lib/repositories/APIKeyRepository';
import { loggingProvider } from '@/lib/providers/LoggingProvider';
import { dbProvider } from '@/lib/providers/DatabaseProvider';

// Mock dependencies
vi.mock('@/lib/repositories/APIKeyRepository');
vi.mock('@/lib/providers/LoggingProvider');
vi.mock('@/lib/providers/DatabaseProvider');
vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn(() => Buffer.from('test-random-bytes-123456789012')),
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => 'hashed-key'),
    })),
  },
}));

describe('UserAPIKeyService', () => {
  let service: UserAPIKeyService;
  let mockRepository: any;
  let mockLoggingProvider: any;
  let mockDbProvider: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock repository
    mockRepository = {
      create: vi.fn(),
      findByUserId: vi.fn(),
      findActiveByUserId: vi.fn(),
      findByIdAndUserId: vi.fn(),
      revoke: vi.fn(),
      findByHash: vi.fn(),
      recordUsage: vi.fn(),
      getUserKeyStats: vi.fn(),
      deactivateExpired: vi.fn(),
      cleanupOldRevokedKeys: vi.fn(),
    };

    // Create mock logging provider
    mockLoggingProvider = {
      child: vi.fn().mockReturnThis(),
      info: vi.fn(),
      error: vi.fn(),
      audit: vi.fn().mockResolvedValue(undefined),
    };

    // Create mock database provider
    mockDbProvider = {
      withTransaction: vi.fn(),
    };

    // Set up mocks
    vi.mocked(APIKeyRepository).mockImplementation(() => mockRepository);
    vi.mocked(loggingProvider.child).mockReturnValue(mockLoggingProvider);
    vi.mocked(loggingProvider.error).mockImplementation(mockLoggingProvider.error);
    vi.mocked(dbProvider.withTransaction).mockImplementation(mockDbProvider.withTransaction);

    // Create service instance
    service = new UserAPIKeyService();
  });

  describe('Dependency Injection', () => {
    it('should use injected repository', () => {
      // Arrange
      const customRepository = new APIKeyRepository();

      // Act
      const customService = new UserAPIKeyService(customRepository);

      // Assert
      expect(customService).toBeDefined();
    });

    it('should create default repository when not provided', () => {
      // Act
      const defaultService = new UserAPIKeyService();

      // Assert
      expect(defaultService).toBeDefined();
    });
  });

  describe('createKey', () => {
    it('should create API key successfully', async () => {
      // Arrange
      const input = {
        name: 'Test API Key',
        expiresIn: 30,
      };

      const createdKey: APIKey = {
        _id: new ObjectId(),
        userId: 'user-123',
        name: 'Test API Key',
        keyHash: 'hashed-key',
        lastFour: '1234',
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(createdKey);

      // Act
      const result = await service.createKey('user-123', input, 'admin-123');

      // Assert
      expect(result).toHaveProperty('plainKey');
      expect(result.plainKey).toMatch(/^sk_/);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          name: 'Test API Key',
          keyHash: expect.any(String),
          lastFour: expect.any(String),
          isActive: true,
          usageCount: 0,
        })
      );
      expect(mockLoggingProvider.info).toHaveBeenCalled();
      expect(mockLoggingProvider.audit).toHaveBeenCalledWith('api_key_created', expect.any(Object));
    });

    it('should create key without expiration', async () => {
      // Arrange
      const input = { name: 'Permanent Key' };
      mockRepository.create.mockResolvedValue({
        _id: new ObjectId(),
        userId: 'user-123',
        name: 'Permanent Key',
        keyHash: 'hashed',
        lastFour: '1234',
        isActive: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.createKey('user-123', input);

      // Assert
      expect(result.expiresAt).toBeUndefined();
    });

    it('should handle creation errors', async () => {
      // Arrange
      const input = { name: 'Test Key' };
      mockRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.createKey('user-123', input)).rejects.toThrow('Database error');
      expect(mockLoggingProvider.error).toHaveBeenCalled();
    });
  });

  describe('listKeys', () => {
    it('should list all keys for user', async () => {
      // Arrange
      const keys: APIKey[] = [
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
      ];
      mockRepository.findByUserId.mockResolvedValue(keys);

      // Act
      const result = await service.listKeys('user-123');

      // Assert
      expect(result).toEqual(keys);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should handle list errors', async () => {
      // Arrange
      mockRepository.findByUserId.mockRejectedValue(new Error('List failed'));

      // Act & Assert
      await expect(service.listKeys('user-123')).rejects.toThrow('List failed');
      expect(mockLoggingProvider.error).toHaveBeenCalled();
    });
  });

  describe('listActiveKeys', () => {
    it('should list only active keys', async () => {
      // Arrange
      const activeKeys: APIKey[] = [
        {
          _id: new ObjectId(),
          userId: 'user-123',
          name: 'Active Key',
          keyHash: 'hash',
          lastFour: '1111',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockRepository.findActiveByUserId.mockResolvedValue(activeKeys);

      // Act
      const result = await service.listActiveKeys('user-123');

      // Assert
      expect(result).toEqual(activeKeys);
    });
  });

  describe('getKey', () => {
    it('should get key with ownership verification', async () => {
      // Arrange
      const key: APIKey = {
        _id: new ObjectId(),
        userId: 'user-123',
        name: 'Test Key',
        keyHash: 'hash',
        lastFour: '1234',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findByIdAndUserId.mockResolvedValue(key);

      // Act
      const result = await service.getKey('user-123', key._id!.toString());

      // Assert
      expect(result).toEqual(key);
    });

    it('should throw error when key not found or wrong owner', async () => {
      // Arrange
      mockRepository.findByIdAndUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getKey('user-123', 'key-456')).rejects.toThrow('not found or does not belong');
    });
  });

  describe('revokeKey', () => {
    it('should revoke key successfully', async () => {
      // Arrange
      const keyId = new ObjectId();
      const key: APIKey = {
        _id: keyId,
        userId: 'user-123',
        name: 'Test Key',
        keyHash: 'hash',
        lastFour: '1234',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByIdAndUserId.mockResolvedValue(key);
      mockRepository.revoke.mockResolvedValue(true);

      // Act
      await service.revokeKey('user-123', keyId.toString(), 'admin-123');

      // Assert
      expect(mockRepository.revoke).toHaveBeenCalledWith(keyId.toString(), 'admin-123');
      expect(mockLoggingProvider.info).toHaveBeenCalled();
      expect(mockLoggingProvider.audit).toHaveBeenCalledWith(
        'api_key_revoked',
        expect.objectContaining({ severity: 'warning' })
      );
    });

    it('should throw error when revocation fails', async () => {
      // Arrange
      const keyId = new ObjectId();
      const key: APIKey = {
        _id: keyId,
        userId: 'user-123',
        name: 'Test Key',
        keyHash: 'hash',
        lastFour: '1234',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByIdAndUserId.mockResolvedValue(key);
      mockRepository.revoke.mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.revokeKey('user-123', keyId.toString(), 'admin-123')
      ).rejects.toThrow('Failed to revoke');
    });

    it('should audit log revocation failure', async () => {
      // Arrange
      const error = new Error('Revoke failed');
      mockRepository.findByIdAndUserId.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.revokeKey('user-123', 'key-456', 'admin-123')
      ).rejects.toThrow('Revoke failed');

      expect(mockLoggingProvider.audit).toHaveBeenCalledWith(
        'api_key_revoke_failed',
        expect.any(Object)
      );
    });
  });

  describe('rotateKey', () => {
    it('should rotate key atomically with transaction', async () => {
      // Arrange
      const keyId = new ObjectId();
      const existingKey: APIKey = {
        _id: keyId,
        userId: 'user-123',
        name: 'Test Key',
        keyHash: 'hashed-key', // Must match hashed version of oldKey
        lastFour: '1234',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newKeyId = new ObjectId();
      const newKey: APIKey = {
        _id: newKeyId,
        userId: 'user-123',
        name: 'Test Key',
        keyHash: 'new-hash',
        lastFour: '5678',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByIdAndUserId.mockResolvedValue(existingKey);
      mockRepository.create.mockResolvedValue(newKey);
      mockRepository.revoke.mockResolvedValue(true);
      mockDbProvider.withTransaction.mockImplementation((fn: any) =>
        fn({}).then(() => ({ ...newKey, plainKey: 'sk_new_key' }))
      );

      // Act
      const result = await service.rotateKey(
        'user-123',
        keyId.toString(),
        'old-key-plain-text',
        'admin-123'
      );

      // Assert
      expect(mockDbProvider.withTransaction).toHaveBeenCalled();
      expect(result).toHaveProperty('plainKey');
      expect(mockLoggingProvider.info).toHaveBeenCalled();
      expect(mockLoggingProvider.audit).toHaveBeenCalledWith('api_key_rotated', expect.any(Object));
    });

    it('should throw error when old key is invalid', async () => {
      // Arrange
      const keyId = new ObjectId();
      const existingKey: APIKey = {
        _id: keyId,
        userId: 'user-123',
        name: 'Test Key',
        keyHash: 'different-hash',
        lastFour: '1234',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByIdAndUserId.mockResolvedValue(existingKey);

      // Act & Assert
      await expect(
        service.rotateKey('user-123', keyId.toString(), 'wrong-key', 'admin-123')
      ).rejects.toThrow('Invalid API key provided');
    });

    it('should audit log rotation failure', async () => {
      // Arrange
      const error = new Error('Rotation failed');
      mockRepository.findByIdAndUserId.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.rotateKey('user-123', 'key-456', 'old-key', 'admin-123')
      ).rejects.toThrow('Rotation failed');

      expect(mockLoggingProvider.audit).toHaveBeenCalledWith(
        'api_key_rotate_failed',
        expect.any(Object)
      );
    });
  });

  describe('verifyKey', () => {
    it('should verify valid active key', async () => {
      // Arrange
      const apiKey: APIKey = {
        _id: new ObjectId(),
        userId: 'user-123',
        name: 'Valid Key',
        keyHash: 'hashed-key',
        lastFour: '1234',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByHash.mockResolvedValue(apiKey);
      mockRepository.recordUsage.mockResolvedValue(undefined);

      // Act
      const result = await service.verifyKey('plain-key');

      // Assert
      expect(result).toEqual(apiKey);
      expect(mockRepository.findByHash).toHaveBeenCalledWith('hashed-key');
    });

    it('should return null for inactive key', async () => {
      // Arrange
      const inactiveKey: APIKey = {
        _id: new ObjectId(),
        userId: 'user-123',
        name: 'Inactive Key',
        keyHash: 'hash',
        lastFour: '1234',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByHash.mockResolvedValue(inactiveKey);

      // Act
      const result = await service.verifyKey('plain-key');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for expired key', async () => {
      // Arrange
      const expiredKey: APIKey = {
        _id: new ObjectId(),
        userId: 'user-123',
        name: 'Expired Key',
        keyHash: 'hash',
        lastFour: '1234',
        isActive: true,
        expiresAt: new Date(Date.now() - 86400000), // Yesterday
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByHash.mockResolvedValue(expiredKey);

      // Act
      const result = await service.verifyKey('plain-key');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for non-existent key', async () => {
      // Arrange
      mockRepository.findByHash.mockResolvedValue(null);

      // Act
      const result = await service.verifyKey('plain-key');

      // Assert
      expect(result).toBeNull();
    });

    it('should record usage for valid key (non-blocking)', async () => {
      // Arrange
      const apiKey: APIKey = {
        _id: new ObjectId(),
        userId: 'user-123',
        name: 'Valid Key',
        keyHash: 'hash',
        lastFour: '1234',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByHash.mockResolvedValue(apiKey);

      // Act
      await service.verifyKey('plain-key');

      // Assert - recordUsage is called but doesn't block
      expect(mockRepository.recordUsage).toHaveBeenCalled();
    });
  });

  describe('getKeyStats', () => {
    it('should return key statistics', async () => {
      // Arrange
      const stats = {
        total: 10,
        active: 5,
        revoked: 3,
        expired: 2,
        totalUsage: 1000,
      };
      mockRepository.getUserKeyStats.mockResolvedValue(stats);

      // Act
      const result = await service.getKeyStats('user-123');

      // Assert
      expect(result).toEqual(stats);
    });

    it('should handle stats errors', async () => {
      // Arrange
      mockRepository.getUserKeyStats.mockRejectedValue(new Error('Stats failed'));

      // Act & Assert
      await expect(service.getKeyStats('user-123')).rejects.toThrow('Stats failed');
      expect(mockLoggingProvider.error).toHaveBeenCalled();
    });
  });

  describe('deactivateExpiredKeys', () => {
    it('should deactivate expired keys', async () => {
      // Arrange
      mockRepository.deactivateExpired.mockResolvedValue(5);

      // Act
      const result = await service.deactivateExpiredKeys();

      // Assert
      expect(result).toBe(5);
      expect(mockLoggingProvider.info).toHaveBeenCalledWith(
        'Deactivated expired API keys',
        { count: 5 }
      );
    });

    it('should handle deactivation errors', async () => {
      // Arrange
      mockRepository.deactivateExpired.mockRejectedValue(new Error('Deactivate failed'));

      // Act & Assert
      await expect(service.deactivateExpiredKeys()).rejects.toThrow('Deactivate failed');
      expect(mockLoggingProvider.error).toHaveBeenCalled();
    });
  });

  describe('cleanupOldRevokedKeys', () => {
    it('should cleanup old revoked keys', async () => {
      // Arrange
      mockRepository.cleanupOldRevokedKeys.mockResolvedValue(10);

      // Act
      const result = await service.cleanupOldRevokedKeys(90);

      // Assert
      expect(result).toBe(10);
      expect(mockRepository.cleanupOldRevokedKeys).toHaveBeenCalledWith(90);
      expect(mockLoggingProvider.info).toHaveBeenCalledWith(
        'Cleaned up old revoked API keys',
        { count: 10, retentionDays: 90 }
      );
    });

    it('should use default retention period', async () => {
      // Arrange
      mockRepository.cleanupOldRevokedKeys.mockResolvedValue(5);

      // Act
      await service.cleanupOldRevokedKeys();

      // Assert
      expect(mockRepository.cleanupOldRevokedKeys).toHaveBeenCalledWith(90);
    });
  });
});
