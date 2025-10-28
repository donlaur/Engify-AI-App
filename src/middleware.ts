/**
 * Middleware
 * Protect routes that require authentication
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect AI execution endpoints
  // Everything else is public (library, patterns, learn, etc.)

  const protectedPaths = [
    '/api/ai/execute', // Legacy
    '/api/v2/ai/execute', // New v2 route
    '/api/prompts/history',
    '/api/user/',
    '/workbench',
    '/dashboard',
    '/settings',
  ];

  const path = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  if (isProtected) {
    // Check for session cookie
    const sessionCookie =
      request.cookies.get('next-auth.session-token') ||
      request.cookies.get('__Secure-next-auth.session-token');

    if (!sessionCookie) {
      // Redirect to login for protected routes
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/workbench', '/dashboard', '/settings'],
};
