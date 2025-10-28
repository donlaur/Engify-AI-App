/**
 * User Command Handlers Tests
 *
 * Tests for user command handlers in the CQRS pattern.
 * Covers all user write operations and validation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CreateUserCommandHandler,
  UpdateUserCommandHandler,
  DeleteUserCommandHandler,
  UpdateUserLastLoginCommandHandler,
  ChangeUserPlanCommandHandler,
  AssignUserToOrganizationCommandHandler,
  RemoveUserFromOrganizationCommandHandler,
  CreateUserCommandValidator,
} from '../handlers/UserCommandHandlers';
import { UserService } from '../../services/UserService';
import { UserCommands } from '../commands/UserCommands';
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

describe('User Command Handlers', () => {
  let mockUserService: UserService;

  beforeEach(() => {
    mockUserService = createMockUserService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CreateUserCommandHandler', () => {
    let handler: CreateUserCommandHandler;

    beforeEach(() => {
      handler = new CreateUserCommandHandler(mockUserService);
    });

    it('should create user successfully', async () => {
      // Arrange
      const command = UserCommands.createUser({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
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

      (mockUserService.createUser as unknown).mockResolvedValue(expectedUser);

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedUser);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
        organizationId: undefined,
      });
    });

    it('should handle user creation errors', async () => {
      // Arrange
      const command = UserCommands.createUser({
        email: 'test@example.com',
        name: 'Test User',
        correlationId: 'test-correlation-id',
      });

      (mockUserService.createUser as unknown).mockRejectedValue(
        new Error('Email already exists')
      );

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
      expect(result.correlationId).toBe('test-correlation-id');
    });
  });

  describe('UpdateUserCommandHandler', () => {
    let handler: UpdateUserCommandHandler;

    beforeEach(() => {
      handler = new UpdateUserCommandHandler(mockUserService);
    });

    it('should update user successfully', async () => {
      // Arrange
      const command = UserCommands.updateUser({
        userId: '507f1f77bcf86cd799439011',
        name: 'Updated Name',
        plan: 'pro',
        correlationId: 'test-correlation-id',
      });

      const updatedUser: User = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Updated Name',
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
      };

      (mockUserService.updateUser as unknown).mockResolvedValue(updatedUser);

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedUser);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          name: 'Updated Name',
          plan: 'pro',
          role: undefined,
          organizationId: undefined,
          preferences: undefined,
        }
      );
    });

    it('should handle user not found', async () => {
      // Arrange
      const command = UserCommands.updateUser({
        userId: '507f1f77bcf86cd799439011',
        name: 'Updated Name',
        correlationId: 'test-correlation-id',
      });

      (mockUserService.updateUser as unknown).mockResolvedValue(null);

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.correlationId).toBe('test-correlation-id');
    });
  });

  describe('DeleteUserCommandHandler', () => {
    let handler: DeleteUserCommandHandler;

    beforeEach(() => {
      handler = new DeleteUserCommandHandler(mockUserService);
    });

    it('should delete user successfully', async () => {
      // Arrange
      const command = UserCommands.deleteUser({
        userId: '507f1f77bcf86cd799439011',
        correlationId: 'test-correlation-id',
      });

      (mockUserService.deleteUser as unknown).mockResolvedValue(true);

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
    });

    it('should handle deletion errors', async () => {
      // Arrange
      const command = UserCommands.deleteUser({
        userId: '507f1f77bcf86cd799439011',
        correlationId: 'test-correlation-id',
      });

      (mockUserService.deleteUser as unknown).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.correlationId).toBe('test-correlation-id');
    });
  });

  describe('UpdateUserLastLoginCommandHandler', () => {
    let handler: UpdateUserLastLoginCommandHandler;

    beforeEach(() => {
      handler = new UpdateUserLastLoginCommandHandler(mockUserService);
    });

    it('should update last login successfully', async () => {
      // Arrange
      const command = UserCommands.updateLastLogin({
        userId: '507f1f77bcf86cd799439011',
        correlationId: 'test-correlation-id',
      });

      (mockUserService.updateLastLogin as unknown).mockResolvedValue(undefined);

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.success).toBe(true);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.updateLastLogin).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
    });
  });

  describe('ChangeUserPlanCommandHandler', () => {
    let handler: ChangeUserPlanCommandHandler;

    beforeEach(() => {
      handler = new ChangeUserPlanCommandHandler(mockUserService);
    });

    it('should change user plan successfully', async () => {
      // Arrange
      const command = UserCommands.changePlan({
        userId: '507f1f77bcf86cd799439011',
        plan: 'pro',
        correlationId: 'test-correlation-id',
      });

      const updatedUser: User = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
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
      };

      (mockUserService.updateUser as unknown).mockResolvedValue(updatedUser);

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedUser);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          plan: 'pro',
        }
      );
    });
  });

  describe('AssignUserToOrganizationCommandHandler', () => {
    let handler: AssignUserToOrganizationCommandHandler;

    beforeEach(() => {
      handler = new AssignUserToOrganizationCommandHandler(mockUserService);
    });

    it('should assign user to organization successfully', async () => {
      // Arrange
      const command = UserCommands.assignToOrganization({
        userId: '507f1f77bcf86cd799439011',
        organizationId: 'org-123',
        correlationId: 'test-correlation-id',
      });

      const updatedUser: User = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
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
      };

      (mockUserService.updateUser as unknown).mockResolvedValue(updatedUser);

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedUser);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          organizationId: 'org-123',
        }
      );
    });
  });

  describe('RemoveUserFromOrganizationCommandHandler', () => {
    let handler: RemoveUserFromOrganizationCommandHandler;

    beforeEach(() => {
      handler = new RemoveUserFromOrganizationCommandHandler(mockUserService);
    });

    it('should remove user from organization successfully', async () => {
      // Arrange
      const command = UserCommands.removeFromOrganization({
        userId: '507f1f77bcf86cd799439011',
        correlationId: 'test-correlation-id',
      });

      const updatedUser: User = {
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

      (mockUserService.updateUser as unknown).mockResolvedValue(updatedUser);

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedUser);
      expect(result.correlationId).toBe('test-correlation-id');
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          organizationId: null,
        }
      );
    });
  });

  describe('CreateUserCommandValidator', () => {
    let validator: CreateUserCommandValidator;

    beforeEach(() => {
      validator = new CreateUserCommandValidator();
    });

    it('should validate valid command', async () => {
      // Arrange
      const command = UserCommands.createUser({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
      });

      // Act
      const result = await validator.validate(command);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email', async () => {
      // Arrange
      const command = UserCommands.createUser({
        email: 'invalid-email',
        name: 'Test User',
      });

      // Act
      const result = await validator.validate(command);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe('email');
      expect(result.errors[0]?.code).toBe('INVALID_EMAIL');
    });

    it('should reject empty name', async () => {
      // Arrange
      const command = UserCommands.createUser({
        email: 'test@example.com',
        name: '',
      });

      // Act
      const result = await validator.validate(command);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe('name');
      expect(result.errors[0]?.code).toBe('REQUIRED_NAME');
    });

    it('should reject name that is too long', async () => {
      // Arrange
      const command = UserCommands.createUser({
        email: 'test@example.com',
        name: 'a'.repeat(101), // 101 characters
      });

      // Act
      const result = await validator.validate(command);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe('name');
      expect(result.errors[0]?.code).toBe('NAME_TOO_LONG');
    });

    it('should reject invalid role', async () => {
      // Arrange
      const command = UserCommands.createUser({
        email: 'test@example.com',
        name: 'Test User',
        role: 'invalid-role',
      });

      // Act
      const result = await validator.validate(command);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe('role');
      expect(result.errors[0]?.code).toBe('INVALID_ROLE');
    });

    it('should reject invalid plan', async () => {
      // Arrange
      const command = UserCommands.createUser({
        email: 'test@example.com',
        name: 'Test User',
        plan: 'invalid-plan',
      });

      // Act
      const result = await validator.validate(command);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe('plan');
      expect(result.errors[0]?.code).toBe('INVALID_PLAN');
    });

    it('should accumulate multiple validation errors', async () => {
      // Arrange
      const command = UserCommands.createUser({
        email: 'invalid-email',
        name: '',
        role: 'invalid-role',
        plan: 'invalid-plan',
      });

      // Act
      const result = await validator.validate(command);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
      expect(result.errors.map((e) => e.field)).toEqual([
        'email',
        'name',
        'role',
        'plan',
      ]);
    });
  });
});
