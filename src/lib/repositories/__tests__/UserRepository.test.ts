/**
 * UserRepository Tests
 *
 * Tests the MongoDB implementation of IUserRepository.
 * These tests demonstrate:
 * - Repository pattern implementation correctness
 * - Database operation handling
 * - Error handling and edge cases
 * - Type safety with MongoDB operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Collection, Db, ObjectId } from 'mongodb';
import { UserRepository } from '../mongodb/UserRepository';
import { connectDB } from '@/lib/db/mongodb';
import type { User } from '@/lib/db/schema';

// Mock the MongoDB connection
vi.mock('@/lib/db/mongodb', () => ({
  connectDB: vi.fn(),
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockCollection: Collection<User>;
  let mockDb: Db;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock collection
    mockCollection = {
      findOne: vi.fn(),
      find: vi.fn(),
      insertOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
      deleteOne: vi.fn(),
      countDocuments: vi.fn(),
      updateOne: vi.fn(),
    } as unknown as Collection<User>;

    // Create mock database
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    } as unknown as Db;

    // Mock connectDB to return our mock database
    vi.mocked(connectDB).mockResolvedValue(mockDb);

    // Create repository instance
    userRepository = new UserRepository();
  });

  describe('findById', () => {
    it('should find user by ID successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const expectedUser: User = {
        _id: new ObjectId(userId),
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

      mockCollection.findOne.mockResolvedValue(expectedUser);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      mockCollection.findOne.mockResolvedValue(null);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const error = new Error('Database connection failed');
      mockCollection.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(userRepository.findById(userId)).rejects.toThrow(
        'Failed to find user by ID'
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const expectedUser: User = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
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

      mockCollection.findOne.mockResolvedValue(expectedUser);

      // Act
      const result = await userRepository.findByEmail(email);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ email });
    });

    it('should return null when user not found by email', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockCollection.findOne.mockResolvedValue(null);

      // Act
      const result = await userRepository.findByEmail(email);

      // Assert
      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = {
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

      const expectedUser: User = {
        ...userData,
        _id: new ObjectId('507f1f77bcf86cd799439011'),
      };

      mockCollection.insertOne.mockResolvedValue({
        insertedId: expectedUser._id as unknown as ObjectId,
      } as unknown as { insertedId: ObjectId });

      // Act
      const result = await userRepository.create(userData);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          ...userData,
          _id: expect.any(Object),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          ...userData,
          _id: expect.any(Object),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should handle creation errors', async () => {
      // Arrange
      const userData = {
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

      const error = new Error('Duplicate key error');
      mockCollection.insertOne.mockRejectedValue(error);

      // Act & Assert
      await expect(userRepository.create(userData)).rejects.toThrow(
        'Failed to create user'
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Name' };
      const updatedUser: User = {
        _id: new ObjectId(userId),
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

      mockCollection.findOneAndUpdate.mockResolvedValue(updatedUser);

      // Act
      const result = await userRepository.update(userId, updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        {
          $set: expect.objectContaining({
            ...updateData,
            updatedAt: expect.any(Date),
          }),
        },
        { returnDocument: 'after' }
      );
    });

    it('should return null when user not found for update', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Name' };
      mockCollection.findOneAndUpdate.mockResolvedValue(null);

      // Act
      const result = await userRepository.update(userId, updateData);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      // Act
      const result = await userRepository.delete(userId);

      // Assert
      expect(result).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
      });
    });

    it('should return false when user not found for deletion', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      // Act
      const result = await userRepository.delete(userId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('findByRole', () => {
    it('should find users by role successfully', async () => {
      // Arrange
      const role = 'admin';
      const expectedUsers: User[] = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          email: 'admin1@example.com',
          name: 'Admin User 1',
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

      mockCollection.find.mockReturnValue({
        toArray: vi.fn().mockResolvedValue(expectedUsers),
      });

      // Act
      const result = await userRepository.findByRole(role);

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(mockCollection.find).toHaveBeenCalledWith({ role });
    });
  });

  describe('count', () => {
    it('should return user count successfully', async () => {
      // Arrange
      const expectedCount = 42;
      mockCollection.countDocuments.mockResolvedValue(expectedCount);

      // Act
      const result = await userRepository.count();

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith();
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      // Act
      await userRepository.updateLastLogin(userId);

      // Assert
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        {
          $set: {
            lastLoginAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        }
      );
    });
  });
});
