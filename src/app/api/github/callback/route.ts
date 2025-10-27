/**
 * GitHub OAuth Callback
 * Handles GitHub OAuth callback and saves connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, GitHubClient } from '@/lib/integrations/github';
import { githubConnectionService } from '@/lib/services/GitHubConnectionService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/github/callback
 * Handle GitHub OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect('/settings?error=github_no_code');
    }

    // Verify state (CSRF protection)
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        const age = Date.now() - stateData.timestamp;
        
        // State should be less than 10 minutes old
        if (age > 10 * 60 * 1000) {
          return NextResponse.redirect('/settings?error=github_state_expired');
        }
      } catch (error) {
        return NextResponse.redirect('/settings?error=github_invalid_state');
      }
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);
    const accessToken = tokenData.access_token;

    // Get user data from GitHub
    const client = new GitHubClient(accessToken);
    const githubUser = await client.getUser();

    // Extract userId from state
    const stateData = state ? JSON.parse(Buffer.from(state, 'base64').toString()) : null;
    const userId = stateData?.userId;

    if (!userId) {
      return NextResponse.redirect('/settings?error=github_no_user');
    }

    // Save connection
    await githubConnectionService.saveConnection(userId, accessToken, {
      username: githubUser.login,
      email: githubUser.email,
      avatarUrl: githubUser.avatar_url,
      scopes: tokenData.scope.split(','),
    });

    // Redirect back to settings with success
    return NextResponse.redirect('/settings?github_connected=true');
  } catch (error: any) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect('/settings?error=github_connection_failed');
  }
}
