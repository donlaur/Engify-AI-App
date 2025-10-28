/**
 * GitHub OAuth Connect
 * Initiates GitHub OAuth flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGitHubAuthUrl } from '@/lib/integrations/github';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/github/connect
 * Redirect to GitHub OAuth
 */
export async function GET(_request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      timestamp: Date.now(),
    })).toString('base64');

    // Get GitHub OAuth URL
    const authUrl = getGitHubAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error: unknown) {
    console.error('GitHub connect error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate GitHub connection' },
      { status: 500 }
    );
  }
}
