import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import { checkOAuthRateLimit } from '@/lib/rate-limit/oauth';

// OAuth 2.1 Authorization Endpoint with PKCE and RFC 8707
// MCP spec: Implementations using STDIO transport should retrieve credentials from environment
// This endpoint supports the out-of-band browser authentication flow

const CLIENT_ID = 'engify-mcp-client';
const AUTH_CODE_EXPIRY = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.ip || 'unknown';
    const rateLimitResult = await checkOAuthRateLimit('authorize', ip);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded', error_description: 'Too many authorization requests' },
        { status: 429 }
      );
    }

    const { searchParams } = request.nextUrl;

    // Extract OAuth 2.1 parameters
    const redirectUri = searchParams.get('redirect_uri');
    const clientId = searchParams.get('client_id');
    const codeChallenge = searchParams.get('code_challenge');
    const codeChallengeMethod = searchParams.get('code_challenge_method');
    const state = searchParams.get('state');
    const resource = searchParams.get('resource'); // RFC 8707 Resource Indicator

    // Validate required parameters
    if (!redirectUri || !clientId || !codeChallenge || !codeChallengeMethod || !state || !resource) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate client (public client for MCP)
    if (clientId !== CLIENT_ID) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Unknown client' },
        { status: 400 }
      );
    }

    // Validate redirect URI (must be localhost for security)
    if (!redirectUri.startsWith('http://localhost:') && !redirectUri.startsWith('http://127.0.0.1:')) {
      return NextResponse.json(
        { error: 'invalid_redirect_uri', error_description: 'Redirect URI must be localhost' },
        { status: 400 }
      );
    }

    // Validate PKCE method (must be S256 per OAuth 2.1)
    if (codeChallengeMethod !== 'S256') {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'PKCE method must be S256' },
        { status: 400 }
      );
    }

    // Validate resource indicator (RFC 8707)
    if (resource !== 'urn:mcp:bug-reporter') {
      return NextResponse.json(
        { error: 'invalid_resource', error_description: 'Invalid resource identifier' },
        { status: 400 }
      );
    }

    // Check if user is authenticated with NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      // User not logged in - redirect to login with original params preserved
      const loginUrl = new URL('/login', request.nextUrl.origin);
      loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname + request.nextUrl.search);
      
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated - generate authorization code
    const authCode = nanoid(32);
    
    // Store authorization code data with expiry
    const codeData = {
      userId: session.user.id,
      email: session.user.email,
      clientId: clientId,
      redirectUri: redirectUri,
      codeChallenge: codeChallenge,
      resource: resource, // Store for RFC 8707 validation
      createdAt: Date.now(),
    };

    // Store in KV with 5-minute expiry
    await kv.set(`mcp_auth_code:${authCode}`, codeData, { ex: AUTH_CODE_EXPIRY });

    // Redirect back to client with authorization code
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('code', authCode);
    callbackUrl.searchParams.set('state', state);

    console.log(`[MCP Auth] Generated auth code for user ${session.user.id}`);

    return NextResponse.redirect(callbackUrl);

  } catch (error) {
    console.error('[MCP Auth] Authorization error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
