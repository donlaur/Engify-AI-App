/**
 * Middleware
 * Protect routes that require authentication
 * 
 * NOTE: Prompt slug redirects are handled in the page component to avoid
 * MongoDB calls in Edge runtime (which doesn't support Node.js crypto module).
 * The page component handles redirects efficiently with proper 301 status codes.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only protect AI execution endpoints
  // Everything else is public (library, patterns, learn, etc.)
  const protectedPaths = [
    '/api/v2/ai/execute', // New v2 route
    '/api/v2/execution', // Execution strategy route
    '/api/prompts/history',
    '/api/user/',
    // '/workbench', // Removed for beta - keep open
    '/dashboard',
    '/settings',
  ];

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
  matcher: [
    '/api/:path*',
    '/dashboard',
    '/settings',
    '/opshub/:path*',
    // Note: /prompts/:path* removed - redirects handled in page component
    // to avoid MongoDB calls in Edge runtime (which doesn't support crypto)
  ],
};
