import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { kv } from '@vercel/kv';
import { checkOAuthRateLimit } from '@/lib/rate-limit/oauth';
import { logger } from '@/lib/logging/logger';

// RFC 8693: OAuth 2.0 Token Exchange
// Exchanges user's MCP access token for downstream service token
// Prevents token passthrough attacks to RAG service

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
const OBO_TOKEN_EXPIRY = 1800; // 30 minutes (very short-lived)

// Valid resource mappings for OBO exchange
const OBO_RESOURCES = {
  'urn:mcp:bug-reporter': 'urn:engify:rag-service',
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP or fallback to user agent
    const identifier = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       request.headers.get('user-agent') || 
                       'unknown';
    const rateLimitResult = await checkOAuthRateLimit('obo', identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded', error_description: 'Too many token exchange requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Extract RFC 8693 parameters
    const grantType = body.grant_type;
    const subjectToken = body.subject_token;
    const subjectTokenType = body.subject_token_type;
    const resource = body.resource;
    const audience = body.audience;
    const scope = body.scope || 'read';

    // Validate grant type
    if (grantType !== 'urn:ietf:params:oauth:grant-type:token-exchange') {
      return NextResponse.json(
        { error: 'unsupported_grant_type', error_description: 'Only token exchange is supported' },
        { status: 400 }
      );
    }

    // Validate subject token type
    if (subjectTokenType !== 'urn:ietf:params:oauth:token-type:access_token') {
      return NextResponse.json(
        { error: 'invalid_target', error_description: 'Invalid subject token type' },
        { status: 400 }
      );
    }

    // Validate required parameters
    if (!subjectToken || !resource || !audience) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify the subject token (user's MCP access token)
    const { payload } = await jwtVerify(subjectToken, JWT_SECRET);
    
    // Validate token is for MCP bug reporter
    if (payload.resource !== 'urn:mcp:bug-reporter') {
      return NextResponse.json(
        { error: 'invalid_target', error_description: 'Invalid subject token resource' },
        { status: 400 }
      );
    }

    // Check if user's refresh token is still valid
    const refreshTokens = await kv.keys(`mcp_refresh_token:*`);
    let userHasValidRefresh = false;
    
    for (const tokenKey of refreshTokens) {
      const tokenData = await kv.get(tokenKey) as any;
      if (tokenData?.userId === payload.sub && tokenData?.resource === payload.resource) {
        userHasValidRefresh = true;
        break;
      }
    }

    if (!userHasValidRefresh) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'User session expired' },
        { status: 401 }
      );
    }

    // Validate resource mapping
    const targetResource = OBO_RESOURCES[resource as keyof typeof OBO_RESOURCES];
    if (!targetResource || targetResource !== audience) {
      return NextResponse.json(
        { error: 'invalid_target', error_description: 'Invalid resource or audience mapping' },
        { status: 400 }
      );
    }

    // Generate OBO token for downstream service
    const oboToken = await new SignJWT({
      sub: payload.sub, // Preserve user ID
      email: payload.email,
      originalResource: resource, // Track original resource
      scope: scope, // Requested scope
      act: { // Actor token - indicates this is an OBO token
        sub: 'urn:engify:mcp-server',
        for: payload.sub,
      },
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(`${process.env.NEXTAUTH_URL}`)
      .setAudience(audience) // Target service audience
      .setExpirationTime(Math.floor(Date.now() / 1000) + OBO_TOKEN_EXPIRY)
      .sign(JWT_SECRET);

    logger.info('OBO token exchange successful', {
      userId: payload.sub,
      targetAudience: audience,
      scope,
    });

    // Return RFC 8693 token exchange response
    return NextResponse.json({
      access_token: oboToken,
      token_type: 'Bearer',
      expires_in: OBO_TOKEN_EXPIRY,
      issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      scope: scope,
    });

  } catch (error: any) {
    logger.error('OBO token exchange failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: error?.code,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Handle JWT verification errors
    if (error.code === 'ERR_JWT_EXPIRED') {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Subject token expired' },
        { status: 401 }
      );
    }
    
    if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid subject token signature' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
