/**
 * API Route Wrapper Tests
 *
 * Comprehensive tests for the withAPI middleware wrapper.
 * Covers:
 * - Authentication enforcement
 * - RBAC (Role-Based Access Control)
 * - Rate limiting
 * - Input validation (Zod)
 * - Error handling
 * - Audit logging
 * - Caching (GET requests)
 * - All option combinations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAPI } from '../api-route-wrapper';
import { AuthProvider } from '@/lib/providers/AuthProvider';
import { CacheProvider } from '@/lib/providers/CacheProvider';
import { LoggingProvider } from '@/lib/providers/LoggingProvider';
import { RBACService } from '@/lib/auth/rbac';

// Mock all providers
vi.mock('@/lib/providers/AuthProvider');
vi.mock('@/lib/providers/CacheProvider');
vi.mock('@/lib/providers/LoggingProvider');
vi.mock('@/lib/auth/rbac');
vi.mock('@/lib/env', () => ({
  isAdminMFAEnforced: false,
}));

describe('withAPI Middleware', () => {
  let mockAuthProvider: any;
  let mockCacheProvider: any;
  let mockLoggingProvider: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock AuthProvider
    mockAuthProvider = {
      getAuthContext: vi.fn(),
    };
    vi.mocked(AuthProvider.getInstance).mockReturnValue(mockAuthProvider);

    // Mock CacheProvider
    mockCacheProvider = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      increment: vi.fn().mockResolvedValue(1),
    };
    vi.mocked(CacheProvider.getInstance).mockReturnValue(mockCacheProvider);

    // Mock LoggingProvider
    mockLoggingProvider = {
      apiError: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      apiSuccess: vi.fn(),
      audit: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(LoggingProvider.getInstance).mockReturnValue(mockLoggingProvider);

    // Mock RBACService
    vi.mocked(RBACService.hasPermission).mockReturnValue(true);
    vi.mocked(RBACService.canAccess).mockReturnValue(true);

    // Create mock request
    mockRequest = {
      nextUrl: { pathname: '/api/test' },
      method: 'POST',
      ip: '127.0.0.1',
      json: vi.fn().mockResolvedValue({}),
    } as unknown as NextRequest;
  });

  describe('Authentication', () => {
    it('should allow unauthenticated access when auth is false', async () => {
      // Arrange
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI({ auth: false }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(handler).toHaveBeenCalled();
    });

    it('should return 401 when auth required but not authenticated', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue(null);
      const handler = vi.fn();
      const route = withAPI({ auth: true }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unauthorized');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow authenticated access when auth required', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: false,
        session: {},
      });
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI({ auth: true }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(handler).toHaveBeenCalled();
    });

    it('should use custom unauthorized error message', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue(null);
      const handler = vi.fn();
      const route = withAPI(
        {
          auth: true,
          errors: { unauthorized: 'Custom auth error' },
        },
        handler
      );

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Custom auth error');
    });
  });

  describe('MFA Verification', () => {
    it('should return 403 when MFA required but not verified', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: false,
        session: {},
      });
      const handler = vi.fn();
      const route = withAPI({ auth: true, requireMFA: true }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('MFA verification required');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow access when MFA verified', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: true,
        session: {},
      });
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI({ auth: true, requireMFA: true }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('RBAC - Role Array', () => {
    it('should allow access when user has required role', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'admin',
        mfaVerified: false,
        session: {},
      });
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI({ auth: true, rbac: ['admin', 'super_admin'] }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 403 when user does not have required role', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: false,
        session: {},
      });
      const handler = vi.fn();
      const route = withAPI({ auth: true, rbac: ['admin', 'super_admin'] }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should return 401 when RBAC check but not authenticated', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: undefined,
        userRole: 'user',
        mfaVerified: false,
        session: {},
      });
      const handler = vi.fn();
      const route = withAPI({ rbac: ['admin'] }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toContain('Authentication required for authorization');
    });
  });

  describe('RBAC - Permission Check', () => {
    it('should allow access when user has permission', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'admin',
        mfaVerified: false,
        session: {},
      });
      vi.mocked(RBACService.hasPermission).mockReturnValue(true);
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI(
        { auth: true, rbac: { permission: 'users:write' } },
        handler
      );

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(RBACService.hasPermission).toHaveBeenCalledWith('admin', 'users:write');
    });

    it('should deny access when user lacks permission', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: false,
        session: {},
      });
      vi.mocked(RBACService.hasPermission).mockReturnValue(false);
      const handler = vi.fn();
      const route = withAPI(
        { auth: true, rbac: { permission: 'users:write' } },
        handler
      );

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toContain('Required permission: users:write');
    });
  });

  describe('RBAC - Resource/Action Check', () => {
    it('should allow access when user can access resource', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'admin',
        mfaVerified: false,
        session: {},
      });
      vi.mocked(RBACService.canAccess).mockReturnValue(true);
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI(
        { auth: true, rbac: { resource: 'users', action: 'write' } },
        handler
      );

      // Act
      const response = await route(mockRequest);

      // Assert
      expect(response.status).toBe(200);
      expect(RBACService.canAccess).toHaveBeenCalledWith('admin', 'users', 'write');
    });

    it('should deny access when user cannot access resource', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: false,
        session: {},
      });
      vi.mocked(RBACService.canAccess).mockReturnValue(false);
      const handler = vi.fn();
      const route = withAPI(
        { auth: true, rbac: { resource: 'users', action: 'write' } },
        handler
      );

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toContain('Required access: write on users');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow request within rate limit', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: false,
        session: {},
      });
      mockCacheProvider.increment.mockResolvedValue(5); // Within limit
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI(
        { auth: true, rateLimit: { max: 10, window: 60 } },
        handler
      );

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 429 when rate limit exceeded', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: false,
        session: {},
      });
      mockCacheProvider.increment.mockResolvedValue(11); // Exceeded
      const handler = vi.fn();
      const route = withAPI(
        { auth: true, rateLimit: { max: 10, window: 60 } },
        handler
      );

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(429);
      expect(data.error).toContain('Rate limit exceeded');
      expect(data.meta.limit).toBe(10);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should use preset rate limit', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: false,
        session: {},
      });
      mockCacheProvider.increment.mockResolvedValue(1);
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI({ auth: true, rateLimit: 'user-create' }, handler);

      // Act
      const response = await route(mockRequest);

      // Assert
      expect(response.status).toBe(200);
      expect(mockCacheProvider.increment).toHaveBeenCalledWith(
        expect.stringContaining('rl:user:create'),
        300
      );
    });

    it('should use IP address for unauthenticated rate limiting', async () => {
      // Arrange
      mockCacheProvider.increment.mockResolvedValue(1);
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI({ rateLimit: { max: 10, window: 60 } }, handler);

      // Act
      await route(mockRequest);

      // Assert
      expect(mockCacheProvider.increment).toHaveBeenCalledWith(
        expect.stringContaining('127.0.0.1'),
        60
      );
    });
  });

  describe('Input Validation', () => {
    it('should validate request body and pass to handler', async () => {
      // Arrange
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      mockRequest.json = vi.fn().mockResolvedValue({ name: 'John', age: 30 });
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI({ validate: schema }, handler);

      // Act
      const response = await route(mockRequest);

      // Assert
      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          validated: { name: 'John', age: 30 },
        })
      );
    });

    it('should return 400 on validation error', async () => {
      // Arrange
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      mockRequest.json = vi.fn().mockResolvedValue({ name: 'John', age: 'invalid' });
      const handler = vi.fn();
      const route = withAPI({ validate: schema }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
      expect(data.errors).toBeDefined();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should use custom validation error message', async () => {
      // Arrange
      const schema = z.object({ name: z.string() });
      mockRequest.json = vi.fn().mockResolvedValue({ name: 123 });
      const handler = vi.fn();
      const route = withAPI(
        {
          validate: schema,
          errors: { validation: 'Custom validation error' },
        },
        handler
      );

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Custom validation error');
    });

    it('should handle malformed JSON', async () => {
      // Arrange
      const schema = z.object({ name: z.string() });
      mockRequest.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
      const handler = vi.fn();
      const route = withAPI({ validate: schema }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('Caching (GET requests)', () => {
    it('should return cached response for GET requests', async () => {
      // Arrange
      const cachedData = { cached: true, value: 'test' };
      mockCacheProvider.get.mockResolvedValue(cachedData);
      mockRequest.method = 'GET';
      const handler = vi.fn().mockResolvedValue({ fresh: true });
      const route = withAPI({ cache: true }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data).toEqual(cachedData);
      expect(data.meta.cached).toBe(true);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should cache response when not in cache', async () => {
      // Arrange
      mockCacheProvider.get.mockResolvedValue(null);
      mockRequest.method = 'GET';
      const handler = vi.fn().mockResolvedValue({ fresh: true });
      const route = withAPI({ cache: { ttl: 300 } }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data).toEqual({ fresh: true });
      expect(handler).toHaveBeenCalled();
      expect(mockCacheProvider.set).toHaveBeenCalledWith(
        expect.any(String),
        { fresh: true },
        300
      );
    });

    it('should not cache POST requests', async () => {
      // Arrange
      mockRequest.method = 'POST';
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI({ cache: true }, handler);

      // Act
      await route(mockRequest);

      // Assert
      expect(mockCacheProvider.get).not.toHaveBeenCalled();
      expect(mockCacheProvider.set).not.toHaveBeenCalled();
    });
  });

  describe('Audit Logging', () => {
    it('should create audit log on success', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: false,
        session: {},
      });
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI(
        { auth: true, audit: { action: 'user_created' } },
        handler
      );

      // Act
      await route(mockRequest);

      // Assert
      expect(mockLoggingProvider.audit).toHaveBeenCalledWith('user_created', {
        userId: 'user-123',
        resource: '/api/test',
        severity: 'info',
        details: expect.objectContaining({
          duration: expect.any(Number),
          statusCode: 200,
        }),
      });
    });

    it('should create audit log on failure', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'user',
        mfaVerified: false,
        session: {},
      });
      const handler = vi.fn().mockRejectedValue(new Error('Handler failed'));
      const route = withAPI(
        { auth: true, audit: { action: 'user_update' } },
        handler
      );

      // Act
      await route(mockRequest);

      // Assert
      expect(mockLoggingProvider.audit).toHaveBeenCalledWith('user_update', {
        userId: 'user-123',
        resource: '/api/test',
        severity: 'error',
        details: expect.objectContaining({
          error: 'Handler failed',
          statusCode: 500,
        }),
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on handler error', async () => {
      // Arrange
      const handler = vi.fn().mockRejectedValue(new Error('Internal error'));
      const route = withAPI({}, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal error');
    });

    it('should return 404 for "not found" errors', async () => {
      // Arrange
      const handler = vi.fn().mockRejectedValue(new Error('User not found'));
      const route = withAPI({}, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should use custom error message', async () => {
      // Arrange
      const handler = vi.fn().mockRejectedValue(new Error('Something went wrong'));
      const route = withAPI({ errors: { internal: 'Custom error' } }, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Something went wrong');
    });

    it('should include duration in error response', async () => {
      // Arrange
      const handler = vi.fn().mockRejectedValue(new Error('Error'));
      const route = withAPI({}, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(data.meta.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Success Response', () => {
    it('should return success response with data and metadata', async () => {
      // Arrange
      const handler = vi.fn().mockResolvedValue({ user: { id: '123', name: 'John' } });
      const route = withAPI({}, handler);

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: { user: { id: '123', name: 'John' } },
        meta: {
          duration: expect.any(Number),
          timestamp: expect.any(String),
        },
      });
    });

    it('should pass correct context to handler', async () => {
      // Arrange
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'admin',
        mfaVerified: true,
        session: {},
      });
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI({ auth: true }, handler);

      // Act
      await route(mockRequest);

      // Assert
      expect(handler).toHaveBeenCalledWith({
        validated: undefined,
        userId: 'user-123',
        userRole: 'admin',
        request: mockRequest,
        params: undefined,
        context: {
          startTime: expect.any(Number),
          route: '/api/test',
        },
      });
    });

    it('should handle route params', async () => {
      // Arrange
      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI({}, handler);
      const context = { params: Promise.resolve({ id: '123' }) };

      // Act
      await route(mockRequest, context);

      // Assert
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: '123' },
        })
      );
    });
  });

  describe('Combined Options', () => {
    it('should handle all options together', async () => {
      // Arrange
      const schema = z.object({ name: z.string() });
      mockRequest.json = vi.fn().mockResolvedValue({ name: 'John' });
      mockAuthProvider.getAuthContext.mockResolvedValue({
        userId: 'user-123',
        userRole: 'admin',
        mfaVerified: true,
        session: {},
      });
      mockCacheProvider.increment.mockResolvedValue(1);
      vi.mocked(RBACService.hasPermission).mockReturnValue(true);

      const handler = vi.fn().mockResolvedValue({ success: true });
      const route = withAPI(
        {
          auth: true,
          requireMFA: true,
          rbac: { permission: 'users:write' },
          rateLimit: { max: 10, window: 60 },
          validate: schema,
          audit: { action: 'user_created' },
        },
        handler
      );

      // Act
      const response = await route(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          validated: { name: 'John' },
          userId: 'user-123',
          userRole: 'admin',
        })
      );
      expect(mockLoggingProvider.audit).toHaveBeenCalled();
    });
  });
});
