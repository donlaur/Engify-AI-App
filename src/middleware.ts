/**
 * Middleware
 * Protect routes that require authentication
 * Handle prompt slug redirects (301 permanent redirects for SEO)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getPromptSlug } from '@/lib/utils/slug';

async function handlePromptRedirect(request: NextRequest): Promise<NextResponse | null> {
  const path = request.nextUrl.pathname;
  
  // Only handle /prompts/:id paths
  const promptMatch = path.match(/^\/prompts\/(.+)$/);
  if (!promptMatch) {
    return null;
  }

  const idOrSlug = promptMatch[1];
  
  // Skip if it's already a valid slug-looking path (starts with lowercase, no special chars)
  // This is a quick heuristic to avoid DB lookups for valid slugs
  if (/^[a-z0-9-]+$/.test(idOrSlug) && !idOrSlug.includes('generated-')) {
    // Might be a slug already - still check DB to be sure
  }

  try {
    const db = await getDb();
    const promptsCollection = db.collection('prompts');
    
    // Fetch only id, slug, and title fields (minimal query for performance)
    const prompt = await promptsCollection.findOne(
      {
        $or: [
          { id: idOrSlug },
          { slug: idOrSlug },
          { _id: idOrSlug }
        ],
        isPublic: { $ne: false },
        active: { $ne: false }
      },
      {
        projection: {
          id: 1,
          slug: 1,
          title: 1
        }
      }
    );

    if (!prompt) {
      // Prompt not found - let the page handle 404
      return null;
    }

    // Get canonical slug
    const canonicalSlug = getPromptSlug({
      id: prompt.id || String(prompt._id),
      slug: prompt.slug,
      title: prompt.title
    });

    // Validate slug before redirecting
    const isValidSlug = canonicalSlug && 
      canonicalSlug !== '' && 
      canonicalSlug !== 'untitled' && 
      canonicalSlug !== (prompt.id || String(prompt._id)) &&
      canonicalSlug.length > 0 &&
      canonicalSlug.length <= 100 &&
      /^[a-z0-9-]+$/.test(canonicalSlug) &&
      !canonicalSlug.startsWith('-') &&
      !canonicalSlug.endsWith('-') &&
      !canonicalSlug.includes('--') &&
      !canonicalSlug.includes('generated-');

    // Only redirect if URL doesn't match canonical slug and slug is valid
    if (idOrSlug !== canonicalSlug && isValidSlug) {
      const redirectUrl = new URL(`/prompts/${encodeURIComponent(canonicalSlug)}`, request.url);
      redirectUrl.search = request.nextUrl.search; // Preserve query params
      
      // 301 permanent redirect for SEO
      return NextResponse.redirect(redirectUrl, 301);
    }

    // No redirect needed
    return null;
  } catch (error) {
    // If DB lookup fails, let the page handle it (don't block requests)
    console.error('Middleware: Failed to fetch prompt for redirect', {
      idOrSlug,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Handle prompt slug redirects first (before auth checks)
  const promptRedirect = await handlePromptRedirect(request);
  if (promptRedirect) {
    return promptRedirect;
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
    '/api/:path*',
    '/dashboard',
    '/settings',
    '/opshub/:path*',
    '/prompts/:path*', // Add prompts paths for redirect handling
  ],
};
