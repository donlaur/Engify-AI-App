/**
 * EnhancedUserRepository Tests
 *
 * Tests for the EnhancedUserRepository.
 * Covers:
 * - User-specific query methods
 * - Email lookup
 * - Role-based queries
 * - Organization queries
 * - User statistics
 * - Search functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Collection, ObjectId } from 'mongodb';
import { EnhancedUserRepository } from '../EnhancedUserRepository';
import { dbProvider } from '@/lib/providers/DatabaseProvider';
import type { User } from '@/lib/db/schema';

// Mock providers
vi.mock('@/lib/providers/DatabaseProvider');
vi.mock('@/lib/providers/LoggingProvider', () => ({
  loggingProvider: {
    error: vi.fn(),
  },
}));

describe('EnhancedUserRepository', () => {
  let repository: EnhancedUserRepository;
  let mockCollection: Collection<User>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock collection
    mockCollection = {
      findOne: vi.fn(),
      find: vi.fn(),
      insertOne: vi.fn(),
      updateOne: vi.fn(),
      countDocuments: vi.fn(),
      aggregate: vi.fn(),
    } as unknown as Collection<User>;

    // Mock dbProvider
    vi.mocked(dbProvider.getCollection).mockResolvedValue(mockCollection);

    // Create repository instance
    repository = new EnhancedUserRepository();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
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
      vi.mocked(mockCollection.findOne).mockResolvedValue(user as any);

      // Act
      const result = await repository.findByEmail('test@example.com');

      // Assert
      expect(result).toEqual(user);
      expect(mockCollection.findOne).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        { session: undefined }
      );
    });

    it('should return null when user not found', async () => {
      // Arrange
      vi.mocked(mockCollection.findOne).mockResolvedValue(null);

      // Act
      const result = await repository.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByEmailOrFail', () => {
    it('should return user when found', async () => {
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
      vi.mocked(mockCollection.findOne).mockResolvedValue(user as any);

      // Act
      const result = await repository.findByEmailOrFail('test@example.com');

      // Assert
      expect(result).toEqual(user);
    });

    it('should throw error when not found', async () => {
      // Arrange
      vi.mocked(mockCollection.findOne).mockResolvedValue(null);

      // Act & Assert
      await expect(
        repository.findByEmailOrFail('nonexistent@example.com')
      ).rejects.toThrow('User with email nonexistent@example.com not found');
    });
  });

  describe('findByRole', () => {
    it('should find users by role', async () => {
      // Arrange
      const users: User[] = [
        {
          _id: new ObjectId(),
          email: 'admin1@example.com',
          name: 'Admin 1',
          role: 'admin',
          plan: 'pro',
          organizationId: null,
          emailVerified: null,
          image: null,
          password: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(users),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      const result = await repository.findByRole('admin');

      // Assert
      expect(result).toEqual(users);
      expect(mockCollection.find).toHaveBeenCalledWith({ role: 'admin' }, { session: undefined });
    });
  });

  describe('findByOrganization', () => {
    it('should find users by organization ID', async () => {
      // Arrange
      const orgId = new ObjectId();
      const users: User[] = [
        {
          _id: new ObjectId(),
          email: 'user@org.com',
          name: 'Org User',
          role: 'user',
          plan: 'enterprise',
          organizationId: orgId,
          emailVerified: null,
          image: null,
          password: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(users),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      const result = await repository.findByOrganization(orgId.toString());

      // Assert
      expect(result).toEqual(users);
      expect(mockCollection.find).toHaveBeenCalledWith(
        { organizationId: expect.any(ObjectId) },
        { session: undefined }
      );
    });
  });

  describe('findByPlan', () => {
    it('should find users by plan', async () => {
      // Arrange
      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      await repository.findByPlan('pro');

      // Assert
      expect(mockCollection.find).toHaveBeenCalledWith({ plan: 'pro' }, { session: undefined });
    });
  });

  describe('findByDateRange', () => {
    it('should find users created within date range', async () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      await repository.findByDateRange(startDate, endDate);

      // Assert
      expect(mockCollection.find).toHaveBeenCalledWith(
        {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
        { session: undefined }
      );
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      // Arrange
      const userId = new ObjectId();
      vi.mocked(mockCollection.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);

      // Act
      await repository.updateLastLogin(userId.toString());

      // Assert
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        {
          $set: {
            lastLoginAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        },
        { session: undefined }
      );
    });
  });

  describe('isEmailTaken', () => {
    it('should return true when email is taken', async () => {
      // Arrange
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(1);

      // Act
      const result = await repository.isEmailTaken('taken@example.com');

      // Assert
      expect(result).toBe(true);
      expect(mockCollection.countDocuments).toHaveBeenCalled();
    });

    it('should return false when email is not taken', async () => {
      // Arrange
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(0);

      // Act
      const result = await repository.isEmailTaken('available@example.com');

      // Assert
      expect(result).toBe(false);
    });

    it('should exclude specific user ID from check', async () => {
      // Arrange
      const userId = new ObjectId();
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(0);

      // Act
      await repository.isEmailTaken('test@example.com', userId.toString());

      // Assert
      expect(mockCollection.countDocuments).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      // Arrange
      const roleStats = [
        { _id: 'admin', count: 5 },
        { _id: 'user', count: 95 },
      ];
      const planStats = [
        { _id: 'free', count: 80 },
        { _id: 'pro', count: 20 },
      ];

      const mockAggregate = vi.fn().mockReturnValue({
        toArray: vi.fn()
          .mockResolvedValueOnce(roleStats)
          .mockResolvedValueOnce(planStats),
      });

      vi.mocked(mockCollection.aggregate).mockImplementation(mockAggregate);
      vi.mocked(mockCollection.countDocuments)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(15); // recent signups

      // Act
      const stats = await repository.getStats();

      // Assert
      expect(stats).toEqual({
        total: 100,
        byRole: { admin: 5, user: 95 },
        byPlan: { free: 80, pro: 20 },
        recentSignups: 15,
      });
    });

    it('should handle empty statistics', async () => {
      // Arrange
      const mockAggregate = vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      });

      vi.mocked(mockCollection.aggregate).mockImplementation(mockAggregate);
      vi.mocked(mockCollection.countDocuments).mockResolvedValue(0);

      // Act
      const stats = await repository.getStats();

      // Assert
      expect(stats.total).toBe(0);
      expect(stats.byRole).toEqual({});
      expect(stats.byPlan).toEqual({});
    });
  });

  describe('search', () => {
    it('should search users by name or email', async () => {
      // Arrange
      const query = 'john';
      const users: User[] = [
        {
          _id: new ObjectId(),
          email: 'john@example.com',
          name: 'John Doe',
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
        },
      ];

      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(users),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      const result = await repository.search(query);

      // Assert
      expect(result).toEqual(users);
      expect(mockCollection.find).toHaveBeenCalledWith(
        {
          $or: [
            { email: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } },
          ],
        },
        undefined
      );
    });

    it('should apply limit and skip to search', async () => {
      // Arrange
      const mockCursor = {
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(mockCollection.find).mockReturnValue(mockCursor as any);

      // Act
      await repository.search('test', { limit: 10, skip: 20 });

      // Assert
      expect(mockCursor.limit).toHaveBeenCalledWith(10);
      expect(mockCursor.skip).toHaveBeenCalledWith(20);
    });
  });

  describe('findByProvider', () => {
    it('should find user by OAuth provider', async () => {
      // Arrange
      const user: User = {
        _id: new ObjectId(),
        email: 'oauth@example.com',
        name: 'OAuth User',
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
      vi.mocked(mockCollection.findOne).mockResolvedValue(user as any);

      // Act
      const result = await repository.findByProvider('google', 'google-123');

      // Assert
      expect(result).toEqual(user);
      expect(mockCollection.findOne).toHaveBeenCalledWith(
        {
          'accounts.google.providerId': 'google-123',
        },
        { session: undefined }
      );
    });
  });
});
