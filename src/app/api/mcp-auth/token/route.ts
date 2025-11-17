import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { SignJWT } from 'jose';
import { checkOAuthRateLimit } from '@/lib/rate-limit/oauth';
import crypto from 'crypto';

// OAuth 2.1 Token Endpoint with RFC 8707 Resource Indicators
// Exchanges authorization code for JWT access and refresh tokens

const CLIENT_ID = 'engify-mcp-client';
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
const ACCESS_TOKEN_EXPIRY = 3600; // 1 hour (OAuth 2.1 short-lived)
const REFRESH_TOKEN_EXPIRY = 2592000; // 30 days

// RFC 8707: Resource-specific audience
const RESOURCE_AUDIENCE_MAP: Record<string, string> = {
  'urn:mcp:bug-reporter': 'urn:mcp:bug-reporter',
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP or fallback to user agent
    const identifier = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       request.headers.get('user-agent') || 
                       'unknown';
    const rateLimitResult = await checkOAuthRateLimit('token', identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded', error_description: 'Too many token requests' },
        { status: 429 }
      );
    }

    const body = await request.formData();
    
    // Extract token request parameters
    const grantType = body.get('grant_type') as string;
    const code = body.get('code') as string;
    const redirectUri = body.get('redirect_uri') as string;
    const clientId = body.get('client_id') as string;
    const codeVerifier = body.get('code_verifier') as string; // PKCE

    // Validate grant type
    if (grantType !== 'authorization_code') {
      return NextResponse.json(
        { error: 'unsupported_grant_type', error_description: 'Only authorization_code is supported' },
        { status: 400 }
      );
    }

    // Validate required parameters
    if (!code || !redirectUri || !clientId || !codeVerifier) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate client
    if (clientId !== CLIENT_ID) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Unknown client' },
        { status: 400 }
      );
    }

    // Retrieve authorization code data
    const codeData = await kv.get(`mcp_auth_code:${code}`) as any;
    
    if (!codeData) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid or expired authorization code' },
        { status: 400 }
      );
    }

    // Verify redirect URI matches
    if (codeData.redirectUri !== redirectUri) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Redirect URI mismatch' },
        { status: 400 }
      );
    }

    // Verify PKCE code verifier (RFC 7636)
    const expectedCodeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    if (codeData.codeChallenge !== expectedCodeChallenge) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid code verifier' },
        { status: 400 }
      );
    }

    // Delete the authorization code (single use)
    await kv.del(`mcp_auth_code:${code}`);

    // Get audience from stored resource (RFC 8707)
    const audience = RESOURCE_AUDIENCE_MAP[codeData.resource];
    if (!audience) {
      return NextResponse.json(
        { error: 'invalid_resource', error_description: 'Unknown resource' },
        { status: 400 }
      );
    }

    // Generate access token (JWT with RFC 8707 audience)
    const accessToken = await new SignJWT({
      sub: codeData.userId,
      email: codeData.email,
      resource: codeData.resource, // RFC 8707 resource indicator
      scope: 'read write', // MCP server permissions
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(`${process.env.NEXTAUTH_URL}`)
      .setAudience(audience) // RFC 8707: Resource-specific audience
      .setExpirationTime(Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY)
      .sign(JWT_SECRET);

    // Generate refresh token (longer-lived, no audience)
    const refreshToken = await new SignJWT({
      sub: codeData.userId,
      tokenType: 'refresh',
      resource: codeData.resource, // Keep resource for refresh validation
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(`${process.env.NEXTAUTH_URL}`)
      .setExpirationTime(Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY)
      .sign(JWT_SECRET);

    // Store refresh token for later validation
    const refreshTokenData = {
      userId: codeData.userId,
      resource: codeData.resource,
      createdAt: Date.now(),
    };
    
    await kv.set(`mcp_refresh_token:${refreshToken}`, refreshTokenData, { 
      ex: REFRESH_TOKEN_EXPIRY 
    });

    console.log(`[MCP Auth] Generated tokens for user ${codeData.userId}`);

    // Return OAuth 2.1 token response
    return NextResponse.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_EXPIRY,
      refresh_token: refreshToken,
      scope: 'read write',
      resource: codeData.resource, // RFC 8707: Echo resource
    });

  } catch (error) {
    console.error('[MCP Auth] Token error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
