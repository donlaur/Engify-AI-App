/**
 * AuthService Tests
 *
 * Comprehensive test coverage for authentication service including:
 * - Registration (email/password)
 * - Login (email/password, OAuth)
 * - Email verification
 * - Password reset/change
 * - MFA operations
 * - Session management
 * - Error handling and security validations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from '../AuthService';
import { userService } from '@/lib/services/UserService';
import { RBACService } from '../rbac';
import type { User } from '@/lib/db/schema';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logging/logger';

// Mock dependencies
vi.mock('@/lib/services/UserService', () => ({
  userService: {
    findByEmail: vi.fn(),
    createUser: vi.fn(),
    setPassword: vi.fn(),
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    updateLastLogin: vi.fn(),
  },
}));

vi.mock('@/lib/logging/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('bcryptjs');
vi.mock('../rbac');

// Helper to create mock user
const createMockUser = (overrides: Partial<User> = {}): User => ({
  _id: new ObjectId('507f1f77bcf86cd799439011'),
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  plan: 'free',
  organizationId: null,
  emailVerified: new Date(),
  image: null,
  password: 'hashed_password',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123',
        name: 'New User',
      };

      const mockUser = createMockUser({
        email: userData.email,
        name: userData.name,
        emailVerified: null,
      });

      vi.mocked(userService.findByEmail).mockResolvedValue(null);
      vi.mocked(userService.createUser).mockResolvedValue(mockUser);
      vi.mocked(userService.setPassword).mockResolvedValue();
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.verificationToken).toBeDefined();
      expect(result.verificationToken).toContain('verify_');
      expect(userService.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userService.createUser).toHaveBeenCalledWith({
        email: userData.email,
        name: userData.name,
        role: 'user',
        organizationId: undefined,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
      expect(userService.setPassword).toHaveBeenCalledWith(
        mockUser._id.toString(),
        'hashed_password'
      );
    });

    it('should register user with organization ID', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123',
        name: 'New User',
        organizationId: '507f1f77bcf86cd799439022',
      };

      const mockUser = createMockUser({
        email: userData.email,
        name: userData.name,
      });

      vi.mocked(userService.findByEmail).mockResolvedValue(null);
      vi.mocked(userService.createUser).mockResolvedValue(mockUser);
      vi.mocked(userService.setPassword).mockResolvedValue();
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.success).toBe(true);
      expect(userService.createUser).toHaveBeenCalledWith({
        email: userData.email,
        name: userData.name,
        role: 'user',
        organizationId: userData.organizationId,
      });
    });

    it('should fail if user already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'SecurePass123',
        name: 'New User',
      };

      const existingUser = createMockUser({ email: userData.email });
      vi.mocked(userService.findByEmail).mockResolvedValue(existingUser);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User with this email already exists');
      expect(result.user).toBeUndefined();
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('should fail with invalid email', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        password: 'SecurePass123',
        name: 'New User',
      };

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email');
      expect(userService.findByEmail).not.toHaveBeenCalled();
    });

    it('should fail with password less than 8 characters', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'short',
        name: 'New User',
      };

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Password must be at least 8 characters');
    });

    it('should fail with name less than 2 characters', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'A',
      };

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Name must be at least 2 characters');
    });

    it('should handle errors during registration', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'Test User',
      };

      vi.mocked(userService.findByEmail).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(logger.error).toHaveBeenCalledWith(
        'User registration failed',
        expect.objectContaining({
          error: 'Database error',
        })
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };

      const mockUser = createMockUser({
        email: credentials.email,
        password: 'hashed_password',
        emailVerified: new Date(),
      });

      vi.mocked(userService.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(userService.updateLastLogin).mockResolvedValue();

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.sessionToken).toBeDefined();
      expect(result.sessionToken).toContain('session_');
      expect(userService.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password
      );
      expect(userService.updateLastLogin).toHaveBeenCalledWith(
        mockUser._id.toString()
      );
    });

    it('should fail with invalid email', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123',
      };

      vi.mocked(userService.findByEmail).mockResolvedValue(null);

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
      expect(result.user).toBeUndefined();
      expect(result.sessionToken).toBeUndefined();
    });

    it('should fail when user has no password (OAuth user)', async () => {
      // Arrange
      const credentials = {
        email: 'oauth@example.com',
        password: 'SomePassword',
      };

      const mockUser = createMockUser({
        email: credentials.email,
        password: null,
      });

      vi.mocked(userService.findByEmail).mockResolvedValue(mockUser);

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should fail with incorrect password', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const mockUser = createMockUser({
        email: credentials.email,
        password: 'hashed_password',
      });

      vi.mocked(userService.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
      expect(userService.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should fail if email is not verified', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };

      const mockUser = createMockUser({
        email: credentials.email,
        emailVerified: null,
      });

      vi.mocked(userService.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Please verify your email address before logging in'
      );
      expect(result.requiresVerification).toBe(true);
      expect(userService.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should require MFA if enabled', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };

      const mockUser = createMockUser({
        email: credentials.email,
        emailVerified: new Date(),
      }) as User & { mfaEnabled?: boolean };
      mockUser.mfaEnabled = true;

      vi.mocked(userService.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('MFA verification required');
      expect(result.requiresMFA).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(userService.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should fail with invalid email format', async () => {
      // Arrange
      const credentials = {
        email: 'invalid-email',
        password: 'SecurePass123',
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email');
    });

    it('should fail with empty password', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: '',
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Password is required');
    });

    it('should handle errors during login', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };

      vi.mocked(userService.findByEmail).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(logger.error).toHaveBeenCalledWith(
        'User login failed',
        expect.objectContaining({
          error: 'Database error',
        })
      );
    });
  });

  describe('loginWithOAuth', () => {
    it('should login existing user with OAuth', async () => {
      // Arrange
      const providerData = {
        id: 'google_123',
        email: 'oauth@example.com',
        name: 'OAuth User',
        image: 'https://example.com/avatar.jpg',
      };

      const existingUser = createMockUser({
        email: providerData.email,
        name: providerData.name,
      });

      vi.mocked(userService.findByEmail).mockResolvedValue(existingUser);

      // Act
      const result = await authService.loginWithOAuth('google', providerData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(existingUser);
      expect(result.sessionToken).toBeDefined();
      expect(result.sessionToken).toContain('session_');
      expect(userService.findByEmail).toHaveBeenCalledWith(providerData.email);
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('should create new user if not exists', async () => {
      // Arrange
      const providerData = {
        id: 'google_456',
        email: 'newuser@example.com',
        name: 'New OAuth User',
      };

      const newUser = createMockUser({
        email: providerData.email,
        name: providerData.name,
        role: 'free',
      });

      vi.mocked(userService.findByEmail).mockResolvedValue(null);
      vi.mocked(userService.createUser).mockResolvedValue(newUser);

      // Act
      const result = await authService.loginWithOAuth('google', providerData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(newUser);
      expect(result.sessionToken).toBeDefined();
      expect(userService.findByEmail).toHaveBeenCalledWith(providerData.email);
      expect(userService.createUser).toHaveBeenCalledWith({
        email: providerData.email,
        name: providerData.name,
        role: 'free',
      });
    });

    it('should handle errors during OAuth login', async () => {
      // Arrange
      const providerData = {
        id: 'google_789',
        email: 'error@example.com',
        name: 'Error User',
      };

      vi.mocked(userService.findByEmail).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await authService.loginWithOAuth('google', providerData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(logger.error).toHaveBeenCalledWith(
        'OAuth login failed',
        expect.objectContaining({
          error: 'Database error',
        })
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const token = `verify_${userId}_${Date.now()}`;
      const mockUser = createMockUser({
        _id: new ObjectId(userId),
        emailVerified: null,
      });

      vi.mocked(userService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(userService.updateUser).mockResolvedValue({
        ...mockUser,
        emailVerified: new Date(),
      });

      // Act
      const result = await authService.verifyEmail(token);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(userService.updateUser).toHaveBeenCalledWith(userId, {
        emailVerified: expect.any(Date),
      });
    });

    it('should fail with invalid token format', async () => {
      // Arrange
      const token = 'invalid'; // Single part token

      // Act
      const result = await authService.verifyEmail(token);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid verification token');
      expect(userService.getUserById).not.toHaveBeenCalled();
    });

    it('should fail if user not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const token = `verify_${userId}_${Date.now()}`;

      vi.mocked(userService.getUserById).mockResolvedValue(null);

      // Act
      const result = await authService.verifyEmail(token);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should handle errors during email verification', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const token = `verify_${userId}_${Date.now()}`;

      vi.mocked(userService.getUserById).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await authService.verifyEmail(token);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email verification failed');
      expect(logger.error).toHaveBeenCalledWith(
        'Email verification failed',
        expect.any(Object)
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset for existing user', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = createMockUser({ email });

      vi.mocked(userService.findByEmail).mockResolvedValue(mockUser);

      // Act
      const result = await authService.requestPasswordReset(email);

      // Assert
      expect(result.success).toBe(true);
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return success for non-existent user (security)', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      vi.mocked(userService.findByEmail).mockResolvedValue(null);

      // Act
      const result = await authService.requestPasswordReset(email);

      // Assert - Should not reveal if user exists
      expect(result.success).toBe(true);
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should fail with invalid email', async () => {
      // Arrange
      const email = 'invalid-email';

      // Act
      const result = await authService.requestPasswordReset(email);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password reset request failed');
    });

    it('should handle errors during password reset request', async () => {
      // Arrange
      const email = 'test@example.com';

      vi.mocked(userService.findByEmail).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await authService.requestPasswordReset(email);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password reset request failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const token = `reset_${userId}_${Date.now()}`;
      const newPassword = 'NewSecurePass123';
      const mockUser = createMockUser({ _id: new ObjectId(userId) });

      vi.mocked(userService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(userService.setPassword).mockResolvedValue();
      vi.mocked(bcrypt.hash).mockResolvedValue('new_hashed_password' as never);

      // Act
      const result = await authService.resetPassword(token, newPassword);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(userService.setPassword).toHaveBeenCalledWith(
        userId,
        'new_hashed_password'
      );
    });

    it('should fail with invalid token', async () => {
      // Arrange
      const token = 'invalid'; // Single part token
      const newPassword = 'NewSecurePass123';

      // Act
      const result = await authService.resetPassword(token, newPassword);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid reset token');
      expect(userService.getUserById).not.toHaveBeenCalled();
    });

    it('should fail if user not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const token = `reset_${userId}_${Date.now()}`;
      const newPassword = 'NewSecurePass123';

      vi.mocked(userService.getUserById).mockResolvedValue(null);

      // Act
      const result = await authService.resetPassword(token, newPassword);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should handle errors during password reset', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const token = `reset_${userId}_${Date.now()}`;
      const newPassword = 'NewSecurePass123';

      vi.mocked(userService.getUserById).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await authService.resetPassword(token, newPassword);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password reset failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const passwords = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
      };
      const mockUser = createMockUser({
        _id: new ObjectId(userId),
        password: 'old_hashed_password',
      });

      vi.mocked(userService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue('new_hashed_password' as never);
      vi.mocked(userService.setPassword).mockResolvedValue();

      // Act
      const result = await authService.changePassword(userId, passwords);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        passwords.currentPassword,
        mockUser.password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(passwords.newPassword, 12);
      expect(userService.setPassword).toHaveBeenCalledWith(
        userId,
        'new_hashed_password'
      );
    });

    it('should fail if current password is incorrect', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const passwords = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword123',
      };
      const mockUser = createMockUser({
        _id: new ObjectId(userId),
        password: 'hashed_password',
      });

      vi.mocked(userService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      // Act
      const result = await authService.changePassword(userId, passwords);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Current password is incorrect');
      expect(userService.setPassword).not.toHaveBeenCalled();
    });

    it('should fail if user not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const passwords = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
      };

      vi.mocked(userService.getUserById).mockResolvedValue(null);

      // Act
      const result = await authService.changePassword(userId, passwords);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should fail if user has no password (OAuth user)', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const passwords = {
        currentPassword: 'SomePassword',
        newPassword: 'NewPassword123',
      };
      const mockUser = createMockUser({
        _id: new ObjectId(userId),
        password: null,
      });

      vi.mocked(userService.getUserById).mockResolvedValue(mockUser);

      // Act
      const result = await authService.changePassword(userId, passwords);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should validate password length', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const passwords = {
        currentPassword: 'OldPassword123',
        newPassword: 'short',
      };

      // Act
      const result = await authService.changePassword(userId, passwords);

      // Assert
      expect(result.success).toBe(false);
      // The error is wrapped in generic "Password change failed" message
      expect(result.error).toBe('Password change failed');
    });

    it('should handle errors during password change', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const passwords = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
      };

      vi.mocked(userService.getUserById).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await authService.changePassword(userId, passwords);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password change failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('MFA operations', () => {
    it('should enable MFA', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const phoneNumber = '+1234567890';

      // Mock the dynamic import
      const mockMfaService = {
        enableMFA: vi.fn().mockResolvedValue({ success: true }),
      };

      vi.doMock('@/lib/services/mfaService', () => ({
        mfaService: mockMfaService,
      }));

      // Act
      const result = await authService.enableMFA(userId, phoneNumber);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should verify MFA token', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const phoneNumber = '+1234567890';
      const token = '123456';

      // Mock the dynamic import
      const mockMfaService = {
        verifyMFACode: vi.fn().mockResolvedValue({ success: true }),
      };

      vi.doMock('@/lib/services/mfaService', () => ({
        mfaService: mockMfaService,
      }));

      // Act
      const result = await authService.verifyMFAToken(
        userId,
        phoneNumber,
        token
      );

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('Permission checks', () => {
    it('should check user permissions', () => {
      // Arrange
      vi.mocked(RBACService.hasPermission).mockReturnValue(true);

      // Act
      const result = authService.hasPermission('admin', 'users:write');

      // Assert
      expect(result).toBe(true);
      expect(RBACService.hasPermission).toHaveBeenCalledWith(
        'admin',
        'users:write'
      );
    });

    it('should check resource access', () => {
      // Arrange
      vi.mocked(RBACService.canAccess).mockReturnValue(true);

      // Act
      const result = authService.canAccess('admin', 'users', 'delete');

      // Assert
      expect(result).toBe(true);
      expect(RBACService.canAccess).toHaveBeenCalledWith(
        'admin',
        'users',
        'delete'
      );
    });
  });

  describe('Token operations', () => {
    it('should generate verification token', () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';

      // Access private method through any cast
      const token = (authService as any).generateVerificationToken(userId);

      // Assert
      expect(token).toContain('verify_');
      expect(token).toContain(userId);
    });

    it('should generate session token', () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';

      // Access private method
      const token = (authService as any).generateSessionToken(userId);

      // Assert
      expect(token).toContain('session_');
      expect(token).toContain(userId);
    });

    it('should generate reset token', () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';

      // Access private method
      const token = (authService as any).generateResetToken(userId);

      // Assert
      expect(token).toContain('reset_');
      expect(token).toContain(userId);
    });

    it('should extract user ID from valid token', () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const token = `verify_${userId}_${Date.now()}`;

      // Access private method
      const extractedId = (authService as any).extractUserIdFromToken(token);

      // Assert
      expect(extractedId).toBe(userId);
    });

    it('should return null for invalid token format', () => {
      // Arrange
      const token = 'singletoken'; // No underscore

      // Access private method
      const extractedId = (authService as any).extractUserIdFromToken(token);

      // Assert
      expect(extractedId).toBeNull();
    });

    it('should return null for single part token', () => {
      // Arrange
      const token = 'singlepart';

      // Access private method
      const extractedId = (authService as any).extractUserIdFromToken(token);

      // Assert
      expect(extractedId).toBeNull();
    });
  });
});
