/**
 * GitHub Code Context API
 * Extract code context from repository for AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { githubConnectionService } from '@/lib/services/GitHubConnectionService';
import { GitHubClient, extractCodeContext } from '@/lib/integrations/github';
import { RBACPresets } from '@/lib/middleware/rbac';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for large repos

// Validation schema for code context request
const CodeContextSchema = z.object({
  owner: z.string().min(1).max(100).regex(/^[a-zA-Z0-9-]+$/, 'Invalid owner format'),
  repo: z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/, 'Invalid repo format'),
  maxFiles: z.number().int().min(1).max(100).optional(),
  includePatterns: z.array(z.string().max(200)).max(50).optional(),
  excludePatterns: z.array(z.string().max(200)).max(50).optional(),
});

/**
 * POST /api/github/code-context
 * Extract code context from repository
 * Requires users:read permission (users access their own GitHub repos)
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();

    const validation = CodeContextSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { owner, repo, maxFiles, includePatterns, excludePatterns } = validation.data;

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
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Code context error:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract code context',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
