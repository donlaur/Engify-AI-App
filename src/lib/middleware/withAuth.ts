/**
 * Authentication Middleware
 * 
 * Ensures user is authenticated before accessing route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { unauthorized } from '@/lib/api/response';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    organizationId: string | null;
  };
}

type AuthHandler = (
  req: NextRequest,
  context: AuthContext
) => Promise<NextResponse>;

/**
 * Middleware to require authentication
 * 
 * @example
 * export const GET = withAuth(async (req, { user }) => {
 *   // user.id is guaranteed to exist
 *   return success({ userId: user.id });
 * });
 */
export function withAuth(handler: AuthHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return unauthorized('Authentication required');
    }

    // Build context with user info
    const context: AuthContext = {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
        role: session.user.role || 'user',
        organizationId: session.user.organizationId || null,
      },
    };

    return handler(req, context);
  };
}
