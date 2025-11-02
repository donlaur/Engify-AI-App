/**
 * Authentication Helper for API Routes
 * 
 * Provides reusable auth checks for protected API endpoints
 */

import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export type AuthResult = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
  };
};

export type AuthError = {
  error: NextResponse;
};

/**
 * Require authentication for an API route
 * Returns user object or error response
 */
export async function requireAuth(
  _request: NextRequest
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

  return {
    user: {
      id: session.user.id as string,
      email: session.user.email as string,
      name: session.user.name,
      role: (session.user as { role?: string }).role,
    },
  };
}

/**
 * Require specific role for an API route
 * Returns user object or error response
 */
export async function requireRole(
  _request: NextRequest,
  allowedRoles: string[]
): Promise<AuthResult | AuthError> {
  const authResult = await requireAuth(_request);

  if ('error' in authResult) {
    return authResult;
  }

  const userRole = authResult.user.role || 'user';

  if (!allowedRoles.includes(userRole)) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}


