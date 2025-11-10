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
  const url = request.nextUrl;

  // Handle www redirects and HTTP to HTTPS (if not already handled by hosting)
  // Ensure consistent domain: redirect www to non-www (or vice versa based on preference)
  const hostname = request.headers.get('host') || '';
  const isWww = hostname.startsWith('www.');
  const isHttp = url.protocol === 'http:';

  // Redirect HTTP to HTTPS
  if (isHttp && process.env.NODE_ENV === 'production') {
    const httpsUrl = url.clone();
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, 301);
  }

  // Redirect www to non-www (or non-www to www based on preference)
  // For engify.ai, prefer non-www (www.engify.ai -> engify.ai)
  if (isWww && process.env.NODE_ENV === 'production') {
    const nonWwwUrl = url.clone();
    nonWwwUrl.host = hostname.replace(/^www\./, '');
    return NextResponse.redirect(nonWwwUrl, 301);
  }

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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
    '/api/:path*',
    '/dashboard',
    '/settings',
    '/opshub/:path*',
    // Note: /prompts/:path* removed - redirects handled in page component
    // to avoid MongoDB calls in Edge runtime (which doesn't support crypto)
  ],
};
