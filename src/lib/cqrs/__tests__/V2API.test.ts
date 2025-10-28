/**
 * V2 Users API CQRS Integration Tests
 *
 * Tests for the v2 users API that uses CQRS pattern.
 * Covers both command and query operations through HTTP endpoints.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../../app/api/v2/users/route';
import { getUserService } from '../../di/Container';
import { UserService } from '../../services/UserService';
import type { User } from '@/lib/db/schema';

// Mock the DI container
vi.mock('../../di/Container', () => ({
  getUserService: vi.fn(),
}));

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

describe('/api/v2/users CQRS Integration', () => {
  let mockUserService: UserService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    mockUserService = createMockUserService();
    (getUserService as unknown).mockReturnValue(mockUserService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v2/users', () => {
    it('should get all users using CQRS query', async () => {
      // Arrange
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

      const request = new NextRequest('http://localhost:3000/api/v2/users');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(expectedUsers);
      expect(data.totalCount).toBe(2);
      expect(data.correlationId).toBeDefined();
    });

    it('should get users by role using CQRS query', async () => {
      // Arrange
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

      const request = new NextRequest(
        'http://localhost:3000/api/v2/users?role=admin'
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(expectedUsers);
      expect(data.totalCount).toBe(1);
      expect(data.correlationId).toBeDefined();
    });

    it('should get users by plan using CQRS query', async () => {
      // Arrange
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

      const request = new NextRequest(
        'http://localhost:3000/api/v2/users?plan=pro'
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(expectedUsers);
      expect(data.totalCount).toBe(1);
      expect(data.correlationId).toBeDefined();
    });

    it('should get users by organization using CQRS query', async () => {
      // Arrange
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

      const request = new NextRequest(
        'http://localhost:3000/api/v2/users?organizationId=org-123'
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(expectedUsers);
      expect(data.totalCount).toBe(1);
      expect(data.correlationId).toBeDefined();
    });

    it('should search users using CQRS query', async () => {
      // Arrange
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

      const request = new NextRequest(
        'http://localhost:3000/api/v2/users?search=test'
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]?.name).toBe('Test User');
      expect(data.correlationId).toBeDefined();
    });

    it('should get user statistics using CQRS query', async () => {
      // Arrange
      const expectedStats = {
        totalUsers: 100,
        usersByRole: { user: 80, admin: 20 },
        usersByPlan: { free: 60, pro: 30, enterprise: 10 },
        activeUsers: 85,
      };

      (mockUserService.getUserStats as unknown).mockResolvedValue(
        expectedStats
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v2/users?stats=true'
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(expectedStats);
      expect(data.correlationId).toBeDefined();
    });

    it('should handle query errors gracefully', async () => {
      // Arrange
      (mockUserService.getAllUsers as unknown).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/v2/users');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to get users');
    });
  });

  describe('POST /api/v2/users', () => {
    it('should create user using CQRS command', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
        plan: 'free',
      };

      const createdUser: User = {
        _id: '507f1f77bcf86cd799439011',
        email: 'newuser@example.com',
        name: 'New User',
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

      (mockUserService.createUser as unknown).mockResolvedValue(createdUser);

      const request = new NextRequest('http://localhost:3000/api/v2/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(createdUser);
      expect(data.message).toBe('User created successfully');
      expect(data.correlationId).toBeDefined();
    });

    it('should validate request body', async () => {
      // Arrange
      const invalidData = {
        email: 'invalid-email',
        name: '',
      };

      const request = new NextRequest('http://localhost:3000/api/v2/users', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should handle user creation errors', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      (mockUserService.createUser as unknown).mockRejectedValue(
        new Error('Email already exists')
      );

      const request = new NextRequest('http://localhost:3000/api/v2/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create user');
    });

    it('should handle duplicate email errors', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        name: 'Test User',
      };

      (mockUserService.createUser as unknown).mockRejectedValue(
        new Error('User with this email already exists')
      );

      const request = new NextRequest('http://localhost:3000/api/v2/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User already exists');
    });

    it('should handle malformed JSON', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/v2/users', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create user');
    });
  });

  describe('CQRS Integration Features', () => {
    it('should include correlation IDs in responses', async () => {
      // Arrange
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
      ];

      (mockUserService.getAllUsers as unknown).mockResolvedValue(expectedUsers);

      const request = new NextRequest('http://localhost:3000/api/v2/users');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(data.correlationId).toBeDefined();
      expect(data.correlationId).toMatch(/^all-\d+$/);
    });

    it('should maintain backward compatibility', async () => {
      // Arrange
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
      ];

      (mockUserService.getAllUsers as unknown).mockResolvedValue(expectedUsers);

      const request = new NextRequest('http://localhost:3000/api/v2/users');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert - Should still return the same structure as before CQRS
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.totalCount).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});
