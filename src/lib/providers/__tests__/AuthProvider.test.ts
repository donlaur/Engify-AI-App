/**
 * AuthProvider Tests
 *
 * Tests for the AuthProvider singleton.
 * Covers:
 * - Singleton behavior
 * - Session management
 * - Role/permission checking
 * - MFA verification
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthProvider } from '../AuthProvider';
import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('AuthProvider', () => {
  let authProvider: AuthProvider;
  let mockSession: Session;

  beforeEach(() => {
    // Reset singleton instance before each test
    AuthProvider.resetInstance();
    authProvider = AuthProvider.getInstance();

    // Create mock session
    mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        mfaVerified: true,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as Session;

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    AuthProvider.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      // Arrange & Act
      const instance1 = AuthProvider.getInstance();
      const instance2 = AuthProvider.getInstance();

      // Assert
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      // Arrange
      const instance1 = AuthProvider.getInstance();

      // Act
      AuthProvider.resetInstance();
      const instance2 = AuthProvider.getInstance();

      // Assert
      expect(instance1).not.toBe(instance2);
    });

    it('should clear cache on reset', () => {
      // Arrange
      const instance = AuthProvider.getInstance();
      instance.clearCache();

      // Act
      AuthProvider.resetInstance();

      // Assert - should not throw
      expect(() => AuthProvider.getInstance()).not.toThrow();
    });
  });

  describe('getSession', () => {
    it('should return session when authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const session = await authProvider.getSession();

      // Assert
      expect(session).toEqual(mockSession);
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it('should return null when not authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act
      const session = await authProvider.getSession();

      // Assert
      expect(session).toBeNull();
    });

    it('should return null on error and log it', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(auth).mockRejectedValue(new Error('Auth failed'));

      // Act
      const session = await authProvider.getSession();

      // Assert
      expect(session).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('requireSession', () => {
    it('should return session when authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const session = await authProvider.requireSession();

      // Assert
      expect(session).toEqual(mockSession);
    });

    it('should throw error when not authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act & Assert
      await expect(authProvider.requireSession()).rejects.toThrow('Authentication required');
    });
  });

  describe('getUserId', () => {
    it('should return user ID when authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const userId = await authProvider.getUserId();

      // Assert
      expect(userId).toBe('user-123');
    });

    it('should return null when not authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act
      const userId = await authProvider.getUserId();

      // Assert
      expect(userId).toBeNull();
    });

    it('should return null when user has no ID', async () => {
      // Arrange
      const sessionWithoutId = {
        ...mockSession,
        user: { email: 'test@example.com' },
      } as Session;
      vi.mocked(auth).mockResolvedValue(sessionWithoutId);

      // Act
      const userId = await authProvider.getUserId();

      // Assert
      expect(userId).toBeNull();
    });
  });

  describe('requireUserId', () => {
    it('should return user ID when authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const userId = await authProvider.requireUserId();

      // Assert
      expect(userId).toBe('user-123');
    });

    it('should throw error when not authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act & Assert
      await expect(authProvider.requireUserId()).rejects.toThrow('User ID required');
    });
  });

  describe('getUserRole', () => {
    it('should return user role when authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const role = await authProvider.getUserRole();

      // Assert
      expect(role).toBe('admin');
    });

    it('should return default role "user" when not authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act
      const role = await authProvider.getUserRole();

      // Assert
      expect(role).toBe('user');
    });

    it('should return default role "user" when role is missing', async () => {
      // Arrange
      const sessionWithoutRole = {
        ...mockSession,
        user: { id: 'user-123', email: 'test@example.com' },
      } as Session;
      vi.mocked(auth).mockResolvedValue(sessionWithoutRole);

      // Act
      const role = await authProvider.getUserRole();

      // Assert
      expect(role).toBe('user');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const isAuth = await authProvider.isAuthenticated();

      // Assert
      expect(isAuth).toBe(true);
    });

    it('should return false when not authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act
      const isAuth = await authProvider.isAuthenticated();

      // Assert
      expect(isAuth).toBe(false);
    });

    it('should return false when session has no user', async () => {
      // Arrange
      const sessionWithoutUser = { expires: mockSession.expires } as Session;
      vi.mocked(auth).mockResolvedValue(sessionWithoutUser);

      // Act
      const isAuth = await authProvider.isAuthenticated();

      // Assert
      expect(isAuth).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const hasRole = await authProvider.hasRole('admin');

      // Assert
      expect(hasRole).toBe(true);
    });

    it('should return false when user does not have the role', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const hasRole = await authProvider.hasRole('super_admin');

      // Assert
      expect(hasRole).toBe(false);
    });

    it('should return false when not authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act
      const hasRole = await authProvider.hasRole('admin');

      // Assert
      expect(hasRole).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has one of the roles', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const hasAnyRole = await authProvider.hasAnyRole(['admin', 'super_admin']);

      // Assert
      expect(hasAnyRole).toBe(true);
    });

    it('should return false when user has none of the roles', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const hasAnyRole = await authProvider.hasAnyRole(['super_admin', 'org_admin']);

      // Assert
      expect(hasAnyRole).toBe(false);
    });

    it('should return true when user role is in the list', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const hasAnyRole = await authProvider.hasAnyRole(['user', 'admin']);

      // Assert
      expect(hasAnyRole).toBe(true);
    });
  });

  describe('getAuthContext', () => {
    it('should return full auth context when authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const context = await authProvider.getAuthContext();

      // Assert
      expect(context).toEqual({
        session: mockSession,
        userId: 'user-123',
        userRole: 'admin',
        mfaVerified: true,
      });
    });

    it('should return null when not authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act
      const context = await authProvider.getAuthContext();

      // Assert
      expect(context).toBeNull();
    });

    it('should return context with default values when fields missing', async () => {
      // Arrange
      const minimalSession = {
        user: { id: 'user-123' },
        expires: mockSession.expires,
      } as Session;
      vi.mocked(auth).mockResolvedValue(minimalSession);

      // Act
      const context = await authProvider.getAuthContext();

      // Assert
      expect(context).toEqual({
        session: minimalSession,
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: false,
      });
    });
  });

  describe('requireAuthContext', () => {
    it('should return auth context when authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const context = await authProvider.requireAuthContext();

      // Assert
      expect(context).toEqual({
        session: mockSession,
        userId: 'user-123',
        userRole: 'admin',
        mfaVerified: true,
      });
    });

    it('should throw error when not authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act & Assert
      await expect(authProvider.requireAuthContext()).rejects.toThrow(
        'Authentication context required'
      );
    });
  });

  describe('isMfaVerified', () => {
    it('should return true when MFA is verified', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const isMfaVerified = await authProvider.isMfaVerified();

      // Assert
      expect(isMfaVerified).toBe(true);
    });

    it('should return false when MFA is not verified', async () => {
      // Arrange
      const sessionWithoutMfa = {
        ...mockSession,
        user: { ...mockSession.user, mfaVerified: false },
      } as Session;
      vi.mocked(auth).mockResolvedValue(sessionWithoutMfa);

      // Act
      const isMfaVerified = await authProvider.isMfaVerified();

      // Assert
      expect(isMfaVerified).toBe(false);
    });

    it('should return false when not authenticated', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act
      const isMfaVerified = await authProvider.isMfaVerified();

      // Assert
      expect(isMfaVerified).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear the session cache', () => {
      // Arrange & Act
      authProvider.clearCache();

      // Assert - should not throw
      expect(() => authProvider.clearCache()).not.toThrow();
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent getSession calls', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act - Multiple concurrent calls
      const promises = Array.from({ length: 10 }, () => authProvider.getSession());
      const results = await Promise.all(promises);

      // Assert
      results.forEach((result) => {
        expect(result).toEqual(mockSession);
      });
      // Auth should be called for each request (no caching in current implementation)
      expect(auth).toHaveBeenCalledTimes(10);
    });

    it('should handle concurrent requireSession calls', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Act
      const promises = Array.from({ length: 5 }, () => authProvider.requireSession());
      const results = await Promise.all(promises);

      // Assert
      results.forEach((result) => {
        expect(result).toEqual(mockSession);
      });
    });
  });
});
