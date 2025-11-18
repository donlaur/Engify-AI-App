/**
 * MCP Token Revocation Endpoint
 *
 * POST /api/auth/mcp/revoke
 *
 * Revokes an MCP token by JTI or refresh token
 */

import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db/mongodb';
import { logger } from '@/lib/logging/logger';
import { success, fail, unauthorized } from '@/lib/api/response';

const revokeRequestSchema = z.object({
  jti: z.string().optional(),
  refresh_token: z.string().optional(),
  token_id: z.string().optional(), // MongoDB _id
  reason: z.string().max(500).optional(),
}).refine(
  (data) => data.jti || data.refresh_token || data.token_id,
  { message: 'Must provide jti, refresh_token, or token_id' }
);

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized('Authentication required');
    }

    const userId = session.user.id;

    // 2. Parse request
    const body = await request.json().catch(() => ({}));
    const validationResult = revokeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return fail('Invalid request', 400, {
        errors: validationResult.error.flatten(),
      });
    }

    const { jti, refresh_token, token_id, reason } = validationResult.data;

    const db = await getMongoDb();
    const mcpTokensCollection = db.collection('mcp_tokens');

    // 3. Find token to revoke
    let tokenToRevoke;

    if (token_id) {
      tokenToRevoke = await mcpTokensCollection.findOne({
        _id: new ObjectId(token_id),
        userId: new ObjectId(userId),
      });
    } else if (jti) {
      tokenToRevoke = await mcpTokensCollection.findOne({
        jti,
        userId: new ObjectId(userId),
      });
    } else if (refresh_token) {
      // Get JTI from refresh token
      const refreshData = await kv.get<{ jti: string; userId: string }>(
        `mcp_refresh_token:${refresh_token}`
      );

      if (refreshData && refreshData.userId === userId) {
        tokenToRevoke = await mcpTokensCollection.findOne({
          jti: refreshData.jti,
          userId: new ObjectId(userId),
        });

        // Delete refresh token from Redis
        await kv.del(`mcp_refresh_token:${refresh_token}`);
      }
    }

    if (!tokenToRevoke) {
      return fail('Token not found or access denied', 404);
    }

    if (tokenToRevoke.revokedAt) {
      return fail('Token already revoked', 400);
    }

    // 4. Revoke token
    const now = new Date();
    await mcpTokensCollection.updateOne(
      { _id: tokenToRevoke._id },
      {
        $set: {
          isActive: false,
          revokedAt: now,
          revokedBy: new ObjectId(userId),
          revokeReason: reason || 'User revocation',
          updatedAt: now,
        },
      }
    );

    // 5. Add JTI to Redis revocation list (for access token validation)
    const ttl = Math.floor((tokenToRevoke.expiresAt.getTime() - Date.now()) / 1000);
    if (ttl > 0) {
      await kv.set(`mcp_revoked:${tokenToRevoke.jti}`, '1', { ex: ttl });
    }

    logger.info('MCP token revoked', {
      userId,
      jti: tokenToRevoke.jti,
      reason: reason || 'User revocation',
    });

    return success({
      message: 'Token revoked successfully',
      jti: tokenToRevoke.jti,
    });

  } catch (error) {
    logger.error('MCP token revocation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return fail('Failed to revoke token', 500);
  }
}
