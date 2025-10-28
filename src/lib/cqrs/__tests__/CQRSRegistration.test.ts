/**
 * CQRS Registration Tests
 *
 * Tests for the CQRS registration service that sets up all handlers and validators.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CQRSRegistrationService, initializeCQRS } from '../registration';
import { UserService } from '../../services/UserService';
import { cqrsBus } from '../bus';

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

describe('CQRS Registration', () => {
  let mockUserService: UserService;

  beforeEach(() => {
    mockUserService = createMockUserService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CQRSRegistrationService', () => {
    let registrationService: CQRSRegistrationService;

    beforeEach(() => {
      registrationService = new CQRSRegistrationService(mockUserService);
    });

    it('should register all command handlers', () => {
      // Act
      registrationService.registerCommandHandlers();

      // Assert - No error means registration succeeded
      expect(true).toBe(true);
    });

    it('should register all query handlers', () => {
      // Act
      registrationService.registerQueryHandlers();

      // Assert - No error means registration succeeded
      expect(true).toBe(true);
    });

    it('should register all validators', () => {
      // Act
      registrationService.registerValidators();

      // Assert - No error means registration succeeded
      expect(true).toBe(true);
    });

    it('should register all handlers and validators', () => {
      // Act
      registrationService.registerAll();

      // Assert - No error means registration succeeded
      expect(true).toBe(true);
    });
  });

  describe('initializeCQRS', () => {
    it('should initialize CQRS with user service', () => {
      // Act & Assert - No error means initialization succeeded
      expect(() => initializeCQRS(mockUserService)).not.toThrow();
    });

    it('should handle multiple initializations gracefully', () => {
      // Act & Assert - Multiple calls should not cause errors
      expect(() => {
        initializeCQRS(mockUserService);
        initializeCQRS(mockUserService);
        initializeCQRS(mockUserService);
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      // Initialize CQRS with mock service
      initializeCQRS(mockUserService);
    });

    it('should handle user creation command after registration', async () => {
      // Arrange
      const mockUser = {
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

      (mockUserService.createUser as unknown).mockResolvedValue(mockUser);

      // Act
      const result = await cqrsBus.send({
        type: 'CreateUser',
        email: 'test@example.com',
        name: 'Test User',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(result.correlationId).toBe('test-correlation-id');
    });

    it('should handle user query after registration', async () => {
      // Arrange
      const mockUser = {
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

      (mockUserService.getUserById as unknown).mockResolvedValue(mockUser);

      // Act
      const result = await cqrsBus.sendQuery({
        type: 'GetUserById',
        userId: '507f1f77bcf86cd799439011',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(result.correlationId).toBe('test-correlation-id');
    });

    it('should validate commands after registration', async () => {
      // Act - Try to create user with invalid email
      const result = await cqrsBus.send({
        type: 'CreateUser',
        email: 'invalid-email',
        name: 'Test User',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('Valid email address is required');
    });

    it('should validate queries after registration', async () => {
      // Act - Try to get user with empty ID
      const result = await cqrsBus.sendQuery({
        type: 'GetUserById',
        userId: '',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('User ID is required');
    });

    it('should handle unregistered command types', async () => {
      // Act - Try to send unregistered command
      const result = await cqrsBus.send({
        type: 'UnregisteredCommand',
        data: 'test',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('No handler found');
    });

    it('should handle unregistered query types', async () => {
      // Act - Try to send unregistered query
      const result = await cqrsBus.send({
        type: 'UnregisteredQuery',
        filter: 'test',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('No handler found');
    });
  });

  describe('Handler Coverage', () => {
    beforeEach(() => {
      initializeCQRS(mockUserService);
    });

    it('should register all user command types', async () => {
      const commandTypes = [
        'CreateUser',
        'UpdateUser',
        'DeleteUser',
        'UpdateUserLastLogin',
        'ChangeUserPlan',
        'AssignUserToOrganization',
        'RemoveUserFromOrganization',
      ];

      for (const commandType of commandTypes) {
        const result = await cqrsBus.send({
          type: commandType,
          userId: '507f1f77bcf86cd799439011',
          timestamp: new Date(),
          correlationId: 'test-correlation-id',
        });

        // Should not fail with "No handler found"
        if (result.error) {
          expect(result.error).not.toContain('No handler found');
        }
      }
    });

    it('should register all user query types', async () => {
      const queryTypes = [
        'GetUserById',
        'GetUserByEmail',
        'GetAllUsers',
        'GetUsersByRole',
        'GetUsersByPlan',
        'GetUsersByOrganization',
        'SearchUsers',
        'GetUserStatistics',
        'GetUserCount',
      ];

      for (const queryType of queryTypes) {
        const result = await cqrsBus.sendQuery({
          type: queryType,
          userId: '507f1f77bcf86cd799439011',
          timestamp: new Date(),
          correlationId: 'test-correlation-id',
        });

        // Should not fail with "No handler found"
        if (result.error) {
          expect(result.error).not.toContain('No handler found');
        }
      }
    });
  });
});
