/**
 * Password Reset Security Tests
 *
 * Tests for password reset email flow and token security
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/lib/auth/AuthService';

// Mock dependencies
vi.mock('@/lib/services/UserService', () => ({
  userService: {
    findByEmail: vi.fn(),
    storePasswordResetToken: vi.fn(),
    verifyPasswordResetToken: vi.fn(),
    clearPasswordResetToken: vi.fn(),
    setPassword: vi.fn(),
    getUserById: vi.fn(),
    updateLastLogin: vi.fn(),
  },
}));

vi.mock('@/lib/services/emailService', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('@/lib/logging/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import { userService } from '@/lib/services/UserService';
import { sendPasswordResetEmail } from '@/lib/services/emailService';

describe('Password Reset Security Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  describe('requestPasswordReset', () => {
    it('should not reveal if email exists (security)', async () => {
      vi.mocked(userService.findByEmail).mockResolvedValue(null);

      const result = await authService.requestPasswordReset(
        'nonexistent@example.com'
      );

      expect(result.success).toBe(true);
      expect(userService.storePasswordResetToken).not.toHaveBeenCalled();
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should generate token and send email for valid user', async () => {
      const mockUser = {
        _id: { toString: () => 'user-123' },
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(userService.findByEmail).mockResolvedValue(mockUser as never);
      vi.mocked(userService.storePasswordResetToken).mockResolvedValue(
        undefined
      );
      vi.mocked(sendPasswordResetEmail).mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      const result = await authService.requestPasswordReset('test@example.com');

      expect(result.success).toBe(true);
      expect(userService.storePasswordResetToken).toHaveBeenCalledWith(
        'user-123',
        expect.any(String),
        expect.any(Date)
      );
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
        'Test User'
      );
    });

    it('should still return success even if email sending fails', async () => {
      const mockUser = {
        _id: { toString: () => 'user-123' },
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(userService.findByEmail).mockResolvedValue(mockUser as never);
      vi.mocked(userService.storePasswordResetToken).mockResolvedValue(
        undefined
      );
      vi.mocked(sendPasswordResetEmail).mockResolvedValue({
        success: false,
        error: 'Email service unavailable',
      });

      const result = await authService.requestPasswordReset('test@example.com');

      // Should still return success to prevent email enumeration
      expect(result.success).toBe(true);
    });

    it('should validate email format', async () => {
      const result = await authService.requestPasswordReset('invalid-email');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('resetPassword', () => {
    it('should reject invalid token', async () => {
      vi.mocked(userService.verifyPasswordResetToken).mockResolvedValue(null);

      const result = await authService.resetPassword(
        'invalid-token',
        'newpassword123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid or expired');
    });

    it('should reject expired token', async () => {
      vi.mocked(userService.verifyPasswordResetToken).mockResolvedValue(null);

      const result = await authService.resetPassword(
        'expired-token',
        'newpassword123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid or expired');
    });

    it('should enforce password minimum length', async () => {
      const mockUser = {
        _id: { toString: () => 'user-123' },
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(userService.verifyPasswordResetToken).mockResolvedValue(
        mockUser as never
      );

      const result = await authService.resetPassword('valid-token', 'short');

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });

    it('should reset password and clear token on success', async () => {
      const mockUser = {
        _id: { toString: () => 'user-123' },
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(userService.verifyPasswordResetToken).mockResolvedValue(
        mockUser as never
      );
      vi.mocked(userService.setPassword).mockResolvedValue(undefined);
      vi.mocked(userService.clearPasswordResetToken).mockResolvedValue(
        undefined
      );

      const result = await authService.resetPassword(
        'valid-token',
        'newpassword123'
      );

      expect(result.success).toBe(true);
      expect(userService.setPassword).toHaveBeenCalledWith(
        'user-123',
        expect.any(String)
      );
      expect(userService.clearPasswordResetToken).toHaveBeenCalledWith(
        'user-123'
      );
    });

    it('should prevent token reuse after successful reset', async () => {
      const mockUser = {
        _id: { toString: () => 'user-123' },
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(userService.verifyPasswordResetToken).mockResolvedValue(
        mockUser as never
      );
      vi.mocked(userService.setPassword).mockResolvedValue(undefined);
      vi.mocked(userService.clearPasswordResetToken).mockResolvedValue(
        undefined
      );

      const result = await authService.resetPassword(
        'valid-token',
        'newpassword123'
      );

      expect(result.success).toBe(true);
      expect(userService.clearPasswordResetToken).toHaveBeenCalled();
    });
  });

  describe('Token Security', () => {
    it('should generate unique tokens', async () => {
      const mockUser = {
        _id: { toString: () => 'user-123' },
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(userService.findByEmail).mockResolvedValue(mockUser as never);
      vi.mocked(userService.storePasswordResetToken).mockResolvedValue(
        undefined
      );
      vi.mocked(sendPasswordResetEmail).mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      // Request reset twice
      await authService.requestPasswordReset('test@example.com');
      await authService.requestPasswordReset('test@example.com');

      // Verify that different tokens were generated
      const calls = vi.mocked(userService.storePasswordResetToken).mock.calls;
      expect(calls.length).toBe(2);
      expect(calls[0][1]).not.toBe(calls[1][1]);
    });

    it('should include expiration time with token', async () => {
      const mockUser = {
        _id: { toString: () => 'user-123' },
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(userService.findByEmail).mockResolvedValue(mockUser as never);
      vi.mocked(userService.storePasswordResetToken).mockResolvedValue(
        undefined
      );
      vi.mocked(sendPasswordResetEmail).mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      await authService.requestPasswordReset('test@example.com');

      const call = vi.mocked(userService.storePasswordResetToken).mock.calls[0];
      const expiresAt = call[2] as Date;

      // Should expire in approximately 1 hour
      const now = new Date();
      const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const timeDiff = Math.abs(expiresAt.getTime() - hourFromNow.getTime());

      expect(timeDiff).toBeLessThan(5000); // Within 5 seconds
    });
  });
});
