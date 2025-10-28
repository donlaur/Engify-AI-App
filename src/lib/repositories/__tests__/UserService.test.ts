/**
 * UserService Tests
 * 
 * Demonstrates the testability benefits of the Repository Pattern.
 * These tests show:
 * - Easy mocking of dependencies
 * - Isolated unit testing
 * - Clear separation of concerns
 * - Business logic validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserService } from '../../services/UserService';
import { IUserRepository } from '../interfaces/IRepository';
import type { User } from '@/lib/db/schema';

// Mock repository implementation
const createMockUserRepository = (): IUserRepository => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  findByEmail: vi.fn(),
  findByProvider: vi.fn(),
  findByRole: vi.fn(),
  findByOrganization: vi.fn(),
  updateLastLogin: vi.fn(),
});

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: IUserRepository;

  beforeEach(() => {
    mockRepository = createMockUserRepository();
    userService = new UserService(mockRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
      };

      const expectedUser: User = {
        _id: '507f1f77bcf86cd799439011',
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

      (mockRepository.findByEmail as any).mockResolvedValue(null);
      (mockRepository.create as any).mockResolvedValue(expectedUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          plan: 'free',
        })
      );
    });

    it('should throw error if email is missing', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        role: 'user',
        plan: 'free',
      } as any;

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        'Email is required'
      );
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const existingUser: User = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Existing User',
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

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const expectedUser: User = {
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

      mockRepository.findById.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should return null if user not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error if ID is missing', async () => {
      // Act & Assert
      await expect(userService.getUserById('')).rejects.toThrow(
        'User ID is required'
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const updateData = {
        name: 'Updated Name',
        role: 'admin',
      };

      const existingUser: User = {
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

      const updatedUser: User = {
        ...existingUser,
        name: 'Updated Name',
        role: 'admin',
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(existingUser);
      mockRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await userService.updateUser(userId, updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockRepository.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Name' };

      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      // Arrange
      const users: User[] = [
        {
          _id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          role: 'user',
          plan: 'free',
          organizationId: null,
          emailVerified: null,
          image: null,
          password: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        },
        {
          _id: '2',
          email: 'user2@example.com',
          name: 'User 2',
          role: 'admin',
          plan: 'pro',
          organizationId: null,
          emailVerified: null,
          image: null,
          password: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findAll.mockResolvedValue(users);

      // Act
      const result = await userService.getUserStats();

      // Assert
      expect(result).toEqual({
        totalUsers: 2,
        usersByRole: { user: 1, admin: 1 },
        usersByPlan: { free: 1, pro: 1 },
        recentUsers: expect.any(Array),
      });
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });
});
