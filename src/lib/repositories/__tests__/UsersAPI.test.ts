/**
 * v2 Users API Route Tests
 * 
 * Tests the API routes using the Repository Pattern.
 * These tests demonstrate:
 * - API route functionality with service layer
 * - Request validation and error handling
 * - HTTP status codes and response formats
 * - Integration with dependency injection
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../../../app/api/v2/users/route';
import { getUserService } from '../../../di/Container';
import type { User } from '@/lib/db/schema';

// Mock the DI container
jest.mock('../../../di/Container', () => ({
  getUserService: jest.fn(),
}));

describe('/api/v2/users', () => {
  let mockUserService: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock user service
    mockUserService = {
      getAllUsers: jest.fn(),
      getUsersByRole: jest.fn(),
      getUsersByPlan: jest.fn(),
      getUsersByOrganization: jest.fn(),
      getUserStats: jest.fn(),
      createUser: jest.fn(),
    };

    // Mock the DI container
    (getUserService as jest.Mock).mockReturnValue(mockUserService);
  });

  describe('GET /api/v2/users', () => {
    it('should return all users successfully', async () => {
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

      mockUserService.getAllUsers.mockResolvedValue(expectedUsers);

      const request = new NextRequest('http://localhost:3000/api/v2/users');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: expectedUsers,
        count: 2,
      });
      expect(mockUserService.getAllUsers).toHaveBeenCalled();
    });

    it('should filter users by role', async () => {
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

      mockUserService.getUsersByRole.mockResolvedValue(expectedUsers);

      const request = new NextRequest('http://localhost:3000/api/v2/users?role=admin');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: expectedUsers,
        count: 1,
      });
      expect(mockUserService.getUsersByRole).toHaveBeenCalledWith('admin');
    });

    it('should filter users by plan', async () => {
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

      mockUserService.getUsersByPlan.mockResolvedValue(expectedUsers);

      const request = new NextRequest('http://localhost:3000/api/v2/users?plan=pro');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: expectedUsers,
        count: 1,
      });
      expect(mockUserService.getUsersByPlan).toHaveBeenCalledWith('pro');
    });

    it('should return user statistics when requested', async () => {
      // Arrange
      const expectedStats = {
        totalUsers: 100,
        usersByRole: { user: 80, admin: 20 },
        usersByPlan: { free: 60, pro: 40 },
        recentUsers: [],
      };

      mockUserService.getUserStats.mockResolvedValue(expectedStats);

      const request = new NextRequest('http://localhost:3000/api/v2/users?stats=true');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: expectedStats,
      });
      expect(mockUserService.getUserStats).toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockUserService.getAllUsers.mockRejectedValue(error);

      const request = new NextRequest('http://localhost:3000/api/v2/users');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Failed to get users',
        message: 'Database connection failed',
      });
    });
  });

  describe('POST /api/v2/users', () => {
    it('should create user successfully', async () => {
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

      mockUserService.createUser.mockResolvedValue(createdUser);

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
      expect(data).toEqual({
        success: true,
        data: createdUser,
        message: 'User created successfully',
      });
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidUserData = {
        email: 'invalid-email', // Invalid email
        name: 'Test User',
      };

      const request = new NextRequest('http://localhost:3000/api/v2/users', {
        method: 'POST',
        body: JSON.stringify(invalidUserData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Validation failed',
        details: expect.any(Array),
      });
    });

    it('should handle duplicate email error', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        name: 'Test User',
      };

      const error = new Error('User with this email already exists');
      mockUserService.createUser.mockRejectedValue(error);

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
      expect(data).toEqual({
        success: false,
        error: 'User already exists',
        message: 'User with this email already exists',
      });
    });

    it('should handle general service errors', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const error = new Error('Unexpected service error');
      mockUserService.createUser.mockRejectedValue(error);

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
      expect(data).toEqual({
        success: false,
        error: 'Failed to create user',
        message: 'Unexpected service error',
      });
    });
  });
});
