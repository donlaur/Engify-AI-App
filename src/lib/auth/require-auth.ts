/**
 * Authentication Helper for API Routes
 * Provides consistent authentication checks across all API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';

interface AuthResult {
  user: NonNullable<Session['user']>;
  error?: never;
}

interface AuthError {
  user?: never;
  error: NextResponse;
}

/**
 * Require authentication for API routes
 * Returns user or error response
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const { user, error } = await requireAuth(request);
 *   if (error) return error;
 *   
 *   // user is guaranteed to be defined here
 *   return NextResponse.json({ data: user });
 * }
 * ```
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const session = await auth();

  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Ensure user has required fields
  if (!session.user.id || !session.user.email) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      ),
    };
  }

  return {
    user: session.user as NonNullable<Session['user']>,
  };
}

/**
 * Require specific role for API routes
 * Returns user or error response
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const { user, error } = await requireRole(request, ['admin', 'super_admin']);
 *   if (error) return error;
 *   
 *   // user is guaranteed to be admin or super_admin
 *   return NextResponse.json({ data: user });
 * }
 * ```
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<AuthResult | AuthError> {
  const authResult = await requireAuth(request);
  
  if (authResult.error) {
    return authResult;
  }

  const { user } = authResult;

  if (!user.role || !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        {
          error: 'Forbidden - Insufficient permissions',
          required: allowedRoles,
          actual: user.role || 'none',
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

