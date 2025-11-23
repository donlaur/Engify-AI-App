/**
 * MCP Token Refresh Endpoint
 *
 * POST /api/auth/mcp/refresh
 *
 * Exchanges a refresh token for a new access token
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

// Use Upstash Redis directly (works on Vercel and locally)
const redis = Redis.fromEnv();
import crypto from 'crypto';
import { logger } from '@/lib/logging/logger';
import { success, fail } from '@/lib/api/response';
import { checkOAuthRateLimit } from '@/lib/rate-limit/oauth';

const refreshRequestSchema = z.object({
  refresh_token: z.string().startsWith('sk_ref_'),
});

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
const ACCESS_TOKEN_EXPIRY = 3600; // 1 hour

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request
    const body = await request.json().catch(() => ({}));
    const validationResult = refreshRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Invalid refresh token' },
        { status: 400 }
      );
    }

    const { refresh_token } = validationResult.data;

    // 2. Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkOAuthRateLimit('token', identifier);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded' },
        { status: 429 }
      );
    }

    // 3. Validate refresh token
    const rawData = await redis.get(`mcp_refresh_token:${refresh_token}`);
    const refreshTokenData = rawData ? (typeof rawData === 'string' ? JSON.parse(rawData) : rawData) as {
      userId: string;
      email: string;
      organizationId: string | null;
      workspaceId: string | null;
      scopes: string[];
      jti: string;
      createdAt: string;
    } : null;

    if (!refreshTokenData) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Refresh token expired or revoked' },
        { status: 400 }
      );
    }

    // 4. Generate new access token with same claims
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + ACCESS_TOKEN_EXPIRY;
    const newJti = crypto.randomUUID();

    const accessToken = await new SignJWT({
      sub: refreshTokenData.userId,
      email: refreshTokenData.email,
      orgId: refreshTokenData.organizationId,
      workspaceId: refreshTokenData.workspaceId,
      scopes: refreshTokenData.scopes,
      resource: 'urn:mcp:bug-reporter',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setIssuer(process.env.NEXTAUTH_URL || 'https://engify.ai')
      .setAudience('urn:mcp:bug-reporter')
      .setExpirationTime(expiresAt)
      .setJti(newJti)
      .sign(JWT_SECRET);

    logger.info('MCP token refreshed', {
      userId: refreshTokenData.userId,
      oldJti: refreshTokenData.jti,
      newJti,
    });

    return success({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_EXPIRY,
      scope: refreshTokenData.scopes.join(' '),
      resource: 'urn:mcp:bug-reporter',
    });

  } catch (error) {
    logger.error('MCP token refresh failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return fail('Failed to refresh token', 500);
  }
}
