/**
 * Require Authentication Helper
 * 
 * Helper function for API routes that need authentication.
 * Returns user object or error response.
 * 
 * Part of Day 7 Audit #6 authentication improvements.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from './index';
import type { UserRole } from '@/types/persona';

interface AuthUser {
  _id: string;
  role: UserRole;
  email: string;
  name?: string;
}

interface RequireAuthResult {
  user: AuthUser;
  error: null;
}

interface RequireAuthError {
  user: null;
  error: NextResponse;
}

export async function requireAuth(
  _request: NextRequest
): Promise<RequireAuthResult | RequireAuthError> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        ),
      };
    }

    const user = session.user as {
      id?: string;
      email?: string;
      name?: string;
      role?: UserRole;
    };

    if (!user.id || !user.email) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Invalid session - Missing user data' },
          { status: 401 }
        ),
      };
    }

    return {
      user: {
        _id: user.id,
        role: (user.role as UserRole) || 'user',
        email: user.email,
        name: user.name,
      },
      error: null,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      ),
    };
  }
}

