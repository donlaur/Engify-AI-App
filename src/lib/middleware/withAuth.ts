/**
 * Authentication Middleware
 * 
 * Ensures user is authenticated before accessing route
 * Note: For App Router, use auth() directly in Server Components/Actions
 * This middleware is for API routes if needed
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    organizationId: string | null;
  };
}

/**
 * Middleware to check authentication for API routes
 * Usage: Wrap your API route handler with this function
 */
export async function withAuth(
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<(req: NextRequest) => Promise<NextResponse>> {
  return async (req: NextRequest) => {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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
