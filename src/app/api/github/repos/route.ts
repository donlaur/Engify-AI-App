/**
 * GitHub Repos API
 * List user's GitHub repositories
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { githubConnectionService } from '@/lib/services/GitHubConnectionService';
import { GitHubClient } from '@/lib/integrations/github';
import { RBACPresets } from '@/lib/middleware/rbac';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/github/repos
 * List user's repositories
 * Requires GitHub read access (users can only see their own repos)
 */
export async function GET(request: NextRequest) {
  // RBAC: users:read permission (users read their own GitHub repos)
  const rbacCheck = await RBACPresets.requireUserRead()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get GitHub access token
    const accessToken = await githubConnectionService.getAccessToken(
      session.user.id
    );
    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type =
      (searchParams.get('type') as 'all' | 'owner' | 'public' | 'private') ||
      'all';
    const sort =
      (searchParams.get('sort') as
        | 'created'
        | 'updated'
        | 'pushed'
        | 'full_name') || 'updated';

    // Fetch repositories
    const client = new GitHubClient(accessToken);
    const repos = await client.listRepos({ type, sort, per_page: 100 });

    return NextResponse.json({
      success: true,
      repos,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('GitHub repos error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch repositories',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
