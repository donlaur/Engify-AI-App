/**
 * GitHub Code Context API
 * Extract code context from repository for AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { githubConnectionService } from '@/lib/services/GitHubConnectionService';
import { GitHubClient, extractCodeContext } from '@/lib/integrations/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for large repos

/**
 * POST /api/github/code-context
 * Extract code context from repository
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get GitHub access token
    const accessToken = await githubConnectionService.getAccessToken(session.user.id);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { owner, repo, maxFiles, includePatterns, excludePatterns } = body;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repo are required' },
        { status: 400 }
      );
    }

    // Extract code context
    const client = new GitHubClient(accessToken);
    const context = await extractCodeContext(client, owner, repo, {
      maxFiles: maxFiles || 50,
      includePatterns,
      excludePatterns,
    });

    return NextResponse.json({
      success: true,
      context,
      filesAnalyzed: context.files.length,
      totalSize: context.files.reduce((sum, f) => sum + f.content.length, 0),
    });
  } catch (error: any) {
    console.error('Code context error:', error);
    return NextResponse.json(
      { error: 'Failed to extract code context', message: error.message },
      { status: 500 }
    );
  }
}
