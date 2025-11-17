/**
 * EnhancedUserService Tests
 *
 * Tests for the EnhancedUserService.
 * Covers:
 * - User creation with validation
 * - User retrieval
 * - User updates
 * - User deletion with transactions
 * - Role management
 * - Statistics and search
 * - Audit logging
 * - Dependency injection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ObjectId } from 'mongodb';
import { EnhancedUserService } from '../EnhancedUserService';
import { EnhancedUserRepository } from '@/lib/repositories/EnhancedUserRepository';
import { loggingProvider } from '@/lib/providers/LoggingProvider';
import { dbProvider } from '@/lib/providers/DatabaseProvider';
import type { User } from '@/lib/db/schema';

// Mock dependencies
vi.mock('@/lib/repositories/EnhancedUserRepository');
vi.mock('@/lib/providers/LoggingProvider');
vi.mock('@/lib/providers/DatabaseProvider');

describe('EnhancedUserService', () => {
  let service: EnhancedUserService;
  let mockRepository: any;
  let mockLoggingProvider: any;
  let mockDbProvider: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock repository
    mockRepository = {
      isEmailTaken: vi.fn(),
      create: vi.fn(),
      findByIdOrFail: vi.fn(),
      findByEmail: vi.fn(),
      updateOne: vi.fn(),
      deleteOne: vi.fn(),
      findPaginated: vi.fn(),
      search: vi.fn(),
      getStats: vi.fn(),
      updateLastLogin: vi.fn(),
    };

    // Create mock logging provider
    mockLoggingProvider = {
      child: vi.fn().mockReturnThis(),
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      audit: vi.fn().mockResolvedValue(undefined),
    };

    // Create mock database provider
    mockDbProvider = {
      withTransaction: vi.fn(),
    };

    // Set up mocks
    vi.mocked(EnhancedUserRepository).mockImplementation(() => mockRepository);
    vi.mocked(loggingProvider.child).mockReturnValue(mockLoggingProvider);
    vi.mocked(loggingProvider.error).mockImplementation(mockLoggingProvider.error);
    vi.mocked(loggingProvider.debug).mockImplementation(mockLoggingProvider.debug);
    vi.mocked(dbProvider.withTransaction).mockImplementation(mockDbProvider.withTransaction);

    // Create service instance
    service = new EnhancedUserService();
  });

  describe('Dependency Injection', () => {
    it('should use injected repository', () => {
      // Arrange
      const customRepository = new EnhancedUserRepository();

      // Act
      const customService = new EnhancedUserService(customRepository);

      // Assert
      expect(customService).toBeDefined();
    });

    it('should create default repository when not provided', () => {
      // Act
      const defaultService = new EnhancedUserService();

      // Assert
      expect(defaultService).toBeDefined();
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      const createdUser: User = {
        _id: new ObjectId(),
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
        organizationId: null,
        emailVerified: null,
        image: null,
        password: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.isEmailTaken.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(createdUser);

      // Act
      const result = await service.createUser(input, 'admin-123');

      // Assert
      expect(result).toEqual(createdUser);
      expect(mockRepository.isEmailTaken).toHaveBeenCalledWith('test@example.com');
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockLoggingProvider.info).toHaveBeenCalled();
      expect(mockLoggingProvider.audit).toHaveBeenCalledWith('user_signup', expect.any(Object));
    });

    it('should throw error when email is taken', async () => {
      // Arrange
      const input = {
        email: 'taken@example.com',
        name: 'Test User',
      };
      mockRepository.isEmailTaken.mockResolvedValue(true);

      // Act & Assert
      await expect(service.createUser(input)).rejects.toThrow('Email taken@example.com is already in use');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should use default values for optional fields', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
      };

      mockRepository.isEmailTaken.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({
        _id: new ObjectId(),
        email: 'test@example.com',
        role: 'user',
        plan: 'free',
      } as User);

      // Act
      await service.createUser(input);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          role: 'user',
          plan: 'free',
        })
      );
    });

    it('should handle creation errors', async () => {
      // Arrange
      const input = { email: 'test@example.com' };
      const error = new Error('Database error');
      mockRepository.isEmailTaken.mockResolvedValue(false);
      mockRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(service.createUser(input)).rejects.toThrow('Database error');
      expect(mockLoggingProvider.error).toHaveBeenCalled();
    });

    it('should handle organization ID', async () => {
      // Arrange
      const orgId = new ObjectId();
      const input = {
        email: 'test@example.com',
        organizationId: orgId.toString(),
      };

      mockRepository.isEmailTaken.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({ _id: new ObjectId() } as User);

      // Act
      await service.createUser(input);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: expect.any(ObjectId),
        })
      );
    });
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      // Arrange
      const userId = new ObjectId();
      const user: User = {
        _id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
        organizationId: null,
        emailVerified: null,
        image: null,
        password: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findByIdOrFail.mockResolvedValue(user);

      // Act
      const result = await service.getUserById(userId.toString());

      // Assert
      expect(result).toEqual(user);
      expect(mockRepository.findByIdOrFail).toHaveBeenCalledWith(userId.toString());
    });

    it('should handle not found error', async () => {
      // Arrange
      const error = new Error('User not found');
      mockRepository.findByIdOrFail.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getUserById('nonexistent')).rejects.toThrow('User not found');
      expect(mockLoggingProvider.error).toHaveBeenCalled();
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email', async () => {
      // Arrange
      const user: User = {
        _id: new ObjectId(),
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
        organizationId: null,
        emailVerified: null,
        image: null,
        password: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findByEmail.mockResolvedValue(user);

      // Act
      const result = await service.getUserByEmail('test@example.com');

      // Assert
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.getUserByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = new ObjectId();
      const input = { name: 'Updated Name' };
      const updatedUser: User = {
        _id: userId,
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'user',
        plan: 'free',
        organizationId: null,
        emailVerified: null,
        image: null,
        password: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.updateOne.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateUser(userId.toString(), input, 'admin-123');

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockRepository.updateOne).toHaveBeenCalledWith(userId.toString(), input);
      expect(mockLoggingProvider.info).toHaveBeenCalled();
      expect(mockLoggingProvider.audit).toHaveBeenCalledWith('user_update', expect.any(Object));
    });

    it('should check email availability when updating email', async () => {
      // Arrange
      const userId = new ObjectId();
      const input = { email: 'newemail@example.com' };

      mockRepository.isEmailTaken.mockResolvedValue(false);
      mockRepository.updateOne.mockResolvedValue({ _id: userId } as User);

      // Act
      await service.updateUser(userId.toString(), input);

      // Assert
      expect(mockRepository.isEmailTaken).toHaveBeenCalledWith(
        'newemail@example.com',
        userId.toString()
      );
    });

    it('should throw error when new email is taken', async () => {
      // Arrange
      const input = { email: 'taken@example.com' };
      mockRepository.isEmailTaken.mockResolvedValue(true);

      // Act & Assert
      await expect(
        service.updateUser(new ObjectId().toString(), input)
      ).rejects.toThrow('Email taken@example.com is already in use');
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = new ObjectId();
      mockRepository.updateOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateUser(userId.toString(), { name: 'Test' })
      ).rejects.toThrow(`User ${userId} not found`);
    });
  });

  describe('deleteUser', () => {
    it('should delete user within transaction', async () => {
      // Arrange
      const userId = new ObjectId();
      mockRepository.deleteOne.mockResolvedValue(true);
      mockDbProvider.withTransaction.mockImplementation((fn: any) => fn({}));

      // Act
      await service.deleteUser(userId.toString(), 'admin-123');

      // Assert
      expect(mockDbProvider.withTransaction).toHaveBeenCalled();
      expect(mockRepository.deleteOne).toHaveBeenCalledWith(userId.toString(), {});
      expect(mockLoggingProvider.info).toHaveBeenCalled();
      expect(mockLoggingProvider.audit).toHaveBeenCalledWith('user_delete', expect.any(Object));
    });

    it('should throw error when user not found for deletion', async () => {
      // Arrange
      const userId = new ObjectId();
      mockRepository.deleteOne.mockResolvedValue(false);
      mockDbProvider.withTransaction.mockImplementation((fn: any) => fn({}));

      // Act & Assert
      await expect(
        service.deleteUser(userId.toString())
      ).rejects.toThrow(`User ${userId} not found`);
    });

    it('should handle transaction errors', async () => {
      // Arrange
      const error = new Error('Transaction failed');
      mockDbProvider.withTransaction.mockRejectedValue(error);

      // Act & Assert
      await expect(service.deleteUser('123')).rejects.toThrow('Transaction failed');
      expect(mockLoggingProvider.error).toHaveBeenCalled();
    });
  });

  describe('listUsers', () => {
    it('should list users with pagination', async () => {
      // Arrange
      const paginatedResult = {
        data: [],
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      };
      mockRepository.findPaginated.mockResolvedValue(paginatedResult);

      // Act
      const result = await service.listUsers({ page: 1, limit: 20 });

      // Assert
      expect(result).toEqual(paginatedResult);
      expect(mockRepository.findPaginated).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          page: 1,
          limit: 20,
          sort: { field: 'createdAt', order: 'desc' },
        })
      );
    });

    it('should filter by role', async () => {
      // Arrange
      mockRepository.findPaginated.mockResolvedValue({ data: [] });

      // Act
      await service.listUsers({ role: 'admin' });

      // Assert
      expect(mockRepository.findPaginated).toHaveBeenCalledWith(
        { role: 'admin' },
        expect.any(Object)
      );
    });

    it('should filter by organization ID', async () => {
      // Arrange
      const orgId = new ObjectId();
      mockRepository.findPaginated.mockResolvedValue({ data: [] });

      // Act
      await service.listUsers({ organizationId: orgId.toString() });

      // Assert
      expect(mockRepository.findPaginated).toHaveBeenCalledWith(
        { organizationId: expect.any(ObjectId) },
        expect.any(Object)
      );
    });
  });

  describe('searchUsers', () => {
    it('should search users', async () => {
      // Arrange
      const users: User[] = [];
      mockRepository.search.mockResolvedValue(users);

      // Act
      const result = await service.searchUsers('john', { limit: 10 });

      // Assert
      expect(result).toEqual(users);
      expect(mockRepository.search).toHaveBeenCalledWith('john', { limit: 10 });
    });

    it('should handle search errors', async () => {
      // Arrange
      mockRepository.search.mockRejectedValue(new Error('Search failed'));

      // Act & Assert
      await expect(service.searchUsers('test')).rejects.toThrow('Search failed');
      expect(mockLoggingProvider.error).toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    it('should get user statistics', async () => {
      // Arrange
      const stats = {
        total: 100,
        byRole: { admin: 5, user: 95 },
        byPlan: { free: 80, pro: 20 },
        recentSignups: 15,
      };
      mockRepository.getStats.mockResolvedValue(stats);

      // Act
      const result = await service.getUserStats();

      // Assert
      expect(result).toEqual(stats);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      // Arrange
      mockRepository.updateLastLogin.mockResolvedValue(undefined);

      // Act
      await service.updateLastLogin('user-123');

      // Assert
      expect(mockRepository.updateLastLogin).toHaveBeenCalledWith('user-123');
      expect(mockLoggingProvider.debug).toHaveBeenCalled();
    });

    it('should not throw on error (non-critical)', async () => {
      // Arrange
      mockRepository.updateLastLogin.mockRejectedValue(new Error('Update failed'));

      // Act & Assert - Should not throw
      await service.updateLastLogin('user-123');
      expect(mockLoggingProvider.error).toHaveBeenCalled();
    });
  });

  describe('changeUserRole', () => {
    it('should change user role successfully', async () => {
      // Arrange
      const userId = new ObjectId();
      const updatedUser: User = {
        _id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        plan: 'free',
        organizationId: null,
        emailVerified: null,
        image: null,
        password: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.updateOne.mockResolvedValue(updatedUser);

      // Act
      const result = await service.changeUserRole(userId.toString(), 'admin', 'super-admin-123');

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockRepository.updateOne).toHaveBeenCalledWith(userId.toString(), { role: 'admin' });
      expect(mockLoggingProvider.audit).toHaveBeenCalledWith(
        'user_update',
        expect.objectContaining({
          severity: 'warning', // Role changes are security-sensitive
        })
      );
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockRepository.updateOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.changeUserRole('123', 'admin', 'admin-456')
      ).rejects.toThrow('User 123 not found');
    });
  });
});
