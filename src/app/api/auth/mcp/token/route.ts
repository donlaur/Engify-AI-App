/**
 * MCP Token Generation Endpoint
 *
 * Generates OAuth 2.0 access tokens for MCP (Model Context Protocol) integration
 * Compatible with both local NextAuth system and external auth-service
 *
 * POST /api/auth/mcp/token
 *
 * Request body:
 * {
 *   "tokenName": "My MCP Token",
 *   "scopes": ["memory.read", "memory.write"],
 *   "workspaceId": "optional_workspace_id",
 *   "expiresInDays": 30
 * }
 *
 * Response:
 * {
 *   "access_token": "eyJhbGc...",
 *   "refresh_token": "sk_ref_...",
 *   "token_type": "Bearer",
 *   "expires_in": 3600,
 *   "scope": "memory.read memory.write",
 *   "resource": "urn:mcp:bug-reporter"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { kv } from '@vercel/kv';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db/mongodb';
import { MCPTokenScopeSchema } from '@/lib/db/schema';
import { logger } from '@/lib/logging/logger';
import { success, fail, unauthorized } from '@/lib/api/response';
import { checkOAuthRateLimit } from '@/lib/rate-limit/oauth';

const tokenRequestSchema = z.object({
  tokenName: z.string().min(1).max(100).default('MCP Access Token'),
  scopes: z.array(MCPTokenScopeSchema).min(1).default(['memory.read', 'prompts.execute']),
  workspaceId: z.string().optional(),
  expiresInDays: z.number().int().min(1).max(365).default(30),
});

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
const ACCESS_TOKEN_EXPIRY = 3600; // 1 hour

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized('Authentication required');
    }

    const userId = session.user.id;
    const userEmail = session.user.email || '';

    // 2. Rate limiting
    const rateLimitResult = await checkOAuthRateLimit('token', userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          error_description: 'Too many token generation requests. Try again later.',
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate request
    const body = await request.json().catch(() => ({}));
    const validationResult = tokenRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return fail('Invalid request parameters', 400, {
        errors: validationResult.error.flatten(),
      });
    }

    const { tokenName, scopes, workspaceId, expiresInDays } = validationResult.data;

    // 4. Get user's organization and workspace info
    const db = await getMongoDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return fail('User not found', 404);
    }

    const organizationId = user.organizationId?.toString() || null;
    let workspaceSlug = 'default';
    let workspaceRole = 'owner';

    // If workspaceId provided, validate and get workspace info
    if (workspaceId) {
      const workspacesCollection = db.collection('workspaces');
      const workspace = await workspacesCollection.findOne({
        _id: new ObjectId(workspaceId),
      });

      if (!workspace) {
        return fail('Workspace not found', 404);
      }

      // Verify user has access to this workspace
      if (workspace.organizationId?.toString() !== organizationId) {
        return fail('Access denied to workspace', 403);
      }

      workspaceSlug = workspace.slug;

      // Get workspace role
      const workspaceMembersCollection = db.collection('workspace_members');
      const membership = await workspaceMembersCollection.findOne({
        workspaceId: new ObjectId(workspaceId),
        userId: new ObjectId(userId),
      });

      workspaceRole = membership?.role || 'viewer';
    }

    // 5. Generate JTI (JWT ID) for revocation support
    const jti = crypto.randomUUID();

    // 6. Generate access token (JWT)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + ACCESS_TOKEN_EXPIRY;

    const accessToken = await new SignJWT({
      sub: userId,
      email: userEmail,
      orgId: organizationId,
      orgRole: user.role || 'user',
      workspaceId: workspaceId || null,
      workspaceSlug,
      wsRole: workspaceRole,
      scopes,
      resource: 'urn:mcp:bug-reporter',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setIssuer(process.env.NEXTAUTH_URL || 'https://engify.ai')
      .setAudience('urn:mcp:bug-reporter')
      .setExpirationTime(expiresAt)
      .setJti(jti)
      .sign(JWT_SECRET);

    // 7. Generate refresh token
    const refreshToken = `sk_ref_${crypto.randomBytes(32).toString('base64url')}`;

    // 8. Store refresh token in Redis (Vercel KV)
    const refreshTokenData = {
      userId,
      email: userEmail,
      organizationId,
      workspaceId: workspaceId || null,
      scopes,
      jti,
      createdAt: new Date().toISOString(),
    };

    await kv.set(
      `mcp_refresh_token:${refreshToken}`,
      refreshTokenData,
      { ex: expiresInDays * 24 * 60 * 60 }
    );

    // 9. Store MCP token metadata in MongoDB
    const mcpTokensCollection = db.collection('mcp_tokens');
    const tokenExpiryDate = new Date();
    tokenExpiryDate.setDate(tokenExpiryDate.getDate() + expiresInDays);

    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      null;
    const userAgent = request.headers.get('user-agent') || null;

    await mcpTokensCollection.insertOne({
      _id: new ObjectId(),
      userId: new ObjectId(userId),
      organizationId: organizationId ? new ObjectId(organizationId) : null,
      workspaceId: workspaceId ? new ObjectId(workspaceId) : null,
      tokenName,
      jti,
      resource: 'urn:mcp:bug-reporter',
      scopes,
      isActive: true,
      expiresAt: tokenExpiryDate,
      lastUsedAt: null,
      usageCount: 0,
      revokedAt: null,
      revokedBy: null,
      revokeReason: null,
      metadata: {
        ipAddress,
        userAgent,
        createdVia: 'dashboard',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 10. Log token generation
    logger.info('MCP token generated', {
      userId,
      organizationId,
      workspaceId,
      scopes,
      tokenName,
      jti,
    });

    // 11. Return OAuth 2.0 response
    return success({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_EXPIRY,
      scope: scopes.join(' '),
      resource: 'urn:mcp:bug-reporter',
      jti,
    });

  } catch (error) {
    logger.error('MCP token generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return fail('Failed to generate MCP token', 500);
  }
}

/**
 * GET /api/auth/mcp/token
 * List user's MCP tokens
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized('Authentication required');
    }

    const userId = session.user.id;
    const db = await getMongoDb();
    const mcpTokensCollection = db.collection('mcp_tokens');

    // Get all active tokens for this user
    const tokens = await mcpTokensCollection
      .find({
        userId: new ObjectId(userId),
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Sanitize response (don't include JTI or sensitive data)
    const sanitizedTokens = tokens.map((token) => ({
      id: token._id.toString(),
      tokenName: token.tokenName,
      scopes: token.scopes,
      resource: token.resource,
      expiresAt: token.expiresAt,
      lastUsedAt: token.lastUsedAt,
      usageCount: token.usageCount,
      createdAt: token.createdAt,
    }));

    return success({ tokens: sanitizedTokens });
  } catch (error) {
    logger.error('Failed to list MCP tokens', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return fail('Failed to list tokens', 500);
  }
}
