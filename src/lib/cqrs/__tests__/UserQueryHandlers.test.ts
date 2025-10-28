/**
 * User Query Handlers Tests
 *
 * Tests for user query handlers in the CQRS pattern.
 * Covers all user read operations and validation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GetUserByIdQueryHandler,
  GetUserByEmailQueryHandler,
  GetAllUsersQueryHandler,
  GetUsersByRoleQueryHandler,
  GetUsersByPlanQueryHandler,
  GetUsersByOrganizationQueryHandler,
  SearchUsersQueryHandler,
  GetUserStatisticsQueryHandler,
  GetUserCountQueryHandler,
  GetUserByIdQueryValidator,
} from '../handlers/UserQueryHandlers';
import { UserService } from '../../services/UserService';
import { UserQueries } from '../queries/UserQueries';
import type { User } from '@/lib/db/schema';

// Mock UserService
const createMockUserService = (): UserService =>
  ({
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    updateLastLogin: vi.fn(),
    getUserById: vi.fn(),
    getAllUsers: vi.fn(),
    getUsersByRole: vi.fn(),
    getUsersByPlan: vi.fn(),
    getUsersByOrganization: vi.fn(),
    getUserStats: vi.fn(),
    getUserCount: vi.fn(),
    findUserByEmail: vi.fn(),
    findUserByProvider: vi.fn(),
    findUserByRole: vi.fn(),
    findUserByOrganization: vi.fn(),
  }) as unknown as UserService;

describe('User Query Handlers', () => {
  let mockUserService: UserService;

  beforeEach(() => {
    mockUserService = createMockUserService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GetUserByIdQueryHandler', () => {
    let handler: GetUserByIdQueryHandler;

    beforeEach(() => {
      handler = new GetUserByIdQueryHandler(mockUserService);
    });

    it('should get user by ID successfully', async () => {
      // Arrange
      const query = UserQueries.getById({
        userId: '507f1f77bcf86cd799439011',
        correlationId: 'test-correlation-id',
      });

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

      (mockUserService.getUserById as unknown).mockResolvedValue(expectedUser);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedUser);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.getUserById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
    });

    it('should handle user not found', async () => {
      // Arrange
      const query = UserQueries.getById({
        userId: '507f1f77bcf86cd799439011',
        correlationId: 'test-correlation-id',
      });

      (mockUserService.getUserById as unknown).mockResolvedValue(null);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.correlationId).toBe('test-correlation-id');
    });

    it('should handle service errors', async () => {
      // Arrange
      const query = UserQueries.getById({
        userId: '507f1f77bcf86cd799439011',
        correlationId: 'test-correlation-id',
      });

      (mockUserService.getUserById as unknown).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.correlationId).toBe('test-correlation-id');
    });
  });

  describe('GetUserByEmailQueryHandler', () => {
    let handler: GetUserByEmailQueryHandler;

    beforeEach(() => {
      handler = new GetUserByEmailQueryHandler(mockUserService);
    });

    it('should get user by email successfully', async () => {
      // Arrange
      const query = UserQueries.getByEmail({
        email: 'test@example.com',
        correlationId: 'test-correlation-id',
      });

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

      (mockUserService.findUserByEmail as unknown).mockResolvedValue(
        expectedUser
      );

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedUser);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
    });
  });

  describe('GetAllUsersQueryHandler', () => {
    let handler: GetAllUsersQueryHandler;

    beforeEach(() => {
      handler = new GetAllUsersQueryHandler(mockUserService);
    });

    it('should get all users successfully', async () => {
      // Arrange
      const query = UserQueries.getAll({
        correlationId: 'test-correlation-id',
      });

      const expectedUsers: User[] = [
        {
          _id: '507f1f77bcf86cd799439011',
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '507f1f77bcf86cd799439012',
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockUserService.getAllUsers as unknown).mockResolvedValue(expectedUsers);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedUsers);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(2);
      expect(result.correlationId).toBe('test-correlation-id');
    });
  });

  describe('GetUsersByRoleQueryHandler', () => {
    let handler: GetUsersByRoleQueryHandler;

    beforeEach(() => {
      handler = new GetUsersByRoleQueryHandler(mockUserService);
    });

    it('should get users by role successfully', async () => {
      // Arrange
      const query = UserQueries.getByRole({
        role: 'admin',
        correlationId: 'test-correlation-id',
      });

      const expectedUsers: User[] = [
        {
          _id: '507f1f77bcf86cd799439011',
          email: 'admin@example.com',
          name: 'Admin User',
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

      (mockUserService.getUsersByRole as unknown).mockResolvedValue(
        expectedUsers
      );

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedUsers);
      expect(result.totalCount).toBe(1);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.getUsersByRole).toHaveBeenCalledWith('admin');
    });
  });

  describe('GetUsersByPlanQueryHandler', () => {
    let handler: GetUsersByPlanQueryHandler;

    beforeEach(() => {
      handler = new GetUsersByPlanQueryHandler(mockUserService);
    });

    it('should get users by plan successfully', async () => {
      // Arrange
      const query = UserQueries.getByPlan({
        plan: 'pro',
        correlationId: 'test-correlation-id',
      });

      const expectedUsers: User[] = [
        {
          _id: '507f1f77bcf86cd799439011',
          email: 'pro@example.com',
          name: 'Pro User',
          role: 'user',
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

      (mockUserService.getUsersByPlan as unknown).mockResolvedValue(
        expectedUsers
      );

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedUsers);
      expect(result.totalCount).toBe(1);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.getUsersByPlan).toHaveBeenCalledWith('pro');
    });
  });

  describe('GetUsersByOrganizationQueryHandler', () => {
    let handler: GetUsersByOrganizationQueryHandler;

    beforeEach(() => {
      handler = new GetUsersByOrganizationQueryHandler(mockUserService);
    });

    it('should get users by organization successfully', async () => {
      // Arrange
      const query = UserQueries.getByOrganization({
        organizationId: 'org-123',
        correlationId: 'test-correlation-id',
      });

      const expectedUsers: User[] = [
        {
          _id: '507f1f77bcf86cd799439011',
          email: 'org@example.com',
          name: 'Org User',
          role: 'user',
          plan: 'free',
          organizationId: 'org-123',
          emailVerified: null,
          image: null,
          password: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockUserService.getUsersByOrganization as unknown).mockResolvedValue(
        expectedUsers
      );

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedUsers);
      expect(result.totalCount).toBe(1);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.getUsersByOrganization).toHaveBeenCalledWith(
        'org-123'
      );
    });
  });

  describe('SearchUsersQueryHandler', () => {
    let handler: SearchUsersQueryHandler;

    beforeEach(() => {
      handler = new SearchUsersQueryHandler(mockUserService);
    });

    it('should search users successfully', async () => {
      // Arrange
      const query = UserQueries.search({
        searchTerm: 'test',
        filters: { role: 'user' },
        correlationId: 'test-correlation-id',
      });

      const allUsers: User[] = [
        {
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
        },
        {
          _id: '507f1f77bcf86cd799439012',
          email: 'admin@example.com',
          name: 'Admin User',
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

      (mockUserService.getAllUsers as unknown).mockResolvedValue(allUsers);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].name).toBe('Test User');
      expect(result.totalCount).toBe(1);
      expect(result.correlationId).toBe('test-correlation-id');
    });

    it('should handle search with no results', async () => {
      // Arrange
      const query = UserQueries.search({
        searchTerm: 'nonexistent',
        correlationId: 'test-correlation-id',
      });

      (mockUserService.getAllUsers as unknown).mockResolvedValue([]);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.correlationId).toBe('test-correlation-id');
    });
  });

  describe('GetUserStatisticsQueryHandler', () => {
    let handler: GetUserStatisticsQueryHandler;

    beforeEach(() => {
      handler = new GetUserStatisticsQueryHandler(mockUserService);
    });

    it('should get user statistics successfully', async () => {
      // Arrange
      const query = UserQueries.getStatistics({
        correlationId: 'test-correlation-id',
      });

      const expectedStats = {
        totalUsers: 100,
        usersByRole: { user: 80, admin: 20 },
        usersByPlan: { free: 60, pro: 30, enterprise: 10 },
        activeUsers: 85,
      };

      (mockUserService.getUserStats as unknown).mockResolvedValue(
        expectedStats
      );

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedStats);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.getUserStats).toHaveBeenCalled();
    });
  });

  describe('GetUserCountQueryHandler', () => {
    let handler: GetUserCountQueryHandler;

    beforeEach(() => {
      handler = new GetUserCountQueryHandler(mockUserService);
    });

    it('should get user count successfully', async () => {
      // Arrange
      const query = UserQueries.getCount({
        correlationId: 'test-correlation-id',
      });

      (mockUserService.getUserCount as unknown).mockResolvedValue(100);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(100);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.getUserCount).toHaveBeenCalled();
    });
  });

  describe('GetUserByIdQueryValidator', () => {
    let validator: GetUserByIdQueryValidator;

    beforeEach(() => {
      validator = new GetUserByIdQueryValidator();
    });

    it('should validate valid query', async () => {
      // Arrange
      const query = UserQueries.getById({
        userId: '507f1f77bcf86cd799439011',
        correlationId: 'test-correlation-id',
      });

      // Act
      const result = await validator.validate(query);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty user ID', async () => {
      // Arrange
      const query = UserQueries.getById({
        userId: '',
        correlationId: 'test-correlation-id',
      });

      // Act
      const result = await validator.validate(query);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe('userId');
      expect(result.errors[0]?.code).toBe('REQUIRED_USER_ID');
    });

    it('should reject null user ID', async () => {
      // Arrange
      const query = UserQueries.getById({
        userId: '',
        correlationId: 'test-correlation-id',
      });

      // Act
      const result = await validator.validate(query);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe('userId');
      expect(result.errors[0]?.code).toBe('REQUIRED_USER_ID');
    });
  });
});
