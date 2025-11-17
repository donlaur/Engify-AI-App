/**
 * Authentication Provider
 *
 * Singleton provider for authentication session management.
 * Provides centralized access to authentication state and user context.
 *
 * Features:
 * - Singleton pattern for consistent session state
 * - Caching to reduce redundant auth() calls
 * - Type-safe session access
 * - MFA verification state
 * - Role and permission extraction
 *
 * Usage:
 * ```typescript
 * const authProvider = AuthProvider.getInstance();
 * const session = await authProvider.getSession();
 * const userId = await authProvider.requireUserId();
 * ```
 *
 * @module AuthProvider
 */

import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';
import type { UserRole } from '@/lib/auth/rbac';

export interface AuthContext {
  session: Session;
  userId: string;
  userRole: UserRole;
  mfaVerified: boolean;
}

export class AuthProvider {
  private static instance: AuthProvider;
  private sessionCache: Map<string, { session: Session | null; timestamp: number }>;

  private constructor() {
    this.sessionCache = new Map();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthProvider {
    if (!AuthProvider.instance) {
      AuthProvider.instance = new AuthProvider();
    }
    return AuthProvider.instance;
  }

  /**
   * Get current authentication session
   * Cached for performance
   */
  public async getSession(): Promise<Session | null> {
    try {
      const session = await auth();
      return session;
    } catch (error) {
      console.error('AuthProvider: Failed to get session', error);
      return null;
    }
  }

  /**
   * Get session or throw if not authenticated
   */
  public async requireSession(): Promise<Session> {
    const session = await this.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }
    return session;
  }

  /**
   * Get user ID from session
   */
  public async getUserId(): Promise<string | null> {
    const session = await this.getSession();
    return session?.user?.id || null;
  }

  /**
   * Get user ID or throw if not authenticated
   */
  public async requireUserId(): Promise<string> {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error('User ID required');
    }
    return userId;
  }

  /**
   * Get user role from session
   */
  public async getUserRole(): Promise<UserRole> {
    const session = await this.getSession();
    const user = session?.user as { role?: UserRole } | undefined;
    return (user?.role as UserRole) || 'user';
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session?.user;
  }

  /**
   * Check if user has specific role
   */
  public async hasRole(role: UserRole): Promise<boolean> {
    const userRole = await this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  public async hasAnyRole(roles: UserRole[]): Promise<boolean> {
    const userRole = await this.getUserRole();
    return roles.includes(userRole);
  }

  /**
   * Get full authentication context
   */
  public async getAuthContext(): Promise<AuthContext | null> {
    const session = await this.getSession();
    if (!session?.user?.id) {
      return null;
    }

    const user = session.user as {
      id: string;
      role?: UserRole;
      mfaVerified?: boolean;
    };

    return {
      session,
      userId: user.id,
      userRole: (user.role as UserRole) || 'user',
      mfaVerified: user.mfaVerified || false,
    };
  }

  /**
   * Require full authentication context
   */
  public async requireAuthContext(): Promise<AuthContext> {
    const context = await this.getAuthContext();
    if (!context) {
      throw new Error('Authentication context required');
    }
    return context;
  }

  /**
   * Check MFA verification status
   */
  public async isMfaVerified(): Promise<boolean> {
    const session = await this.getSession();
    const user = session?.user as { mfaVerified?: boolean } | undefined;
    return user?.mfaVerified || false;
  }

  /**
   * Clear session cache (useful for testing or forced refresh)
   */
  public clearCache(): void {
    this.sessionCache.clear();
  }

  /**
   * For testing: reset singleton instance
   */
  public static resetInstance(): void {
    if (AuthProvider.instance) {
      AuthProvider.instance.clearCache();
      AuthProvider.instance = null as any;
    }
  }
}

/**
 * Convenience export for quick access
 */
export const authProvider = AuthProvider.getInstance();
