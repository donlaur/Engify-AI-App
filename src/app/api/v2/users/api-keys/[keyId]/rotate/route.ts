/**
 * Rotate API Key Endpoint
 *
 * POST /api/v2/users/api-keys/[keyId]/rotate
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logging/logger';
import { apiKeyService } from '@/lib/services/ApiKeyService';
import { RBACPresets } from '@/lib/middleware/rbac';
import { auditLog } from '@/lib/logging/audit';
import { z } from 'zod';

const rotateKeySchema = z.object({
  apiKey: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  // RBAC: users:write permission (users can rotate their own API keys)
  const rbacCheck = await RBACPresets.requireUserWrite()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();
    const { keyId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = rotateKeySchema.parse(body);

    await apiKeyService.rotateKey(
      session.user.id,
      keyId,
      validated.apiKey,
      session.user.id
    );

    // Audit log: API key rotated
    await auditLog({
      action: 'api_key_rotated',
      userId: session.user.id,
      severity: 'info',
      details: {
        keyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const session = await auth();
    const { keyId } = await params;
    logger.apiError(`/api/v2/users/api-keys/${keyId}/rotate`, error, {
      userId: session?.user?.id,
      method: 'POST',
      keyId,
    });

    // Try to get userId from session for audit log
    let userId = 'unknown';
    try {
      const session = await auth();
      userId = session?.user?.id || 'unknown';
    } catch {
      // Session fetch failed, use unknown
    }

    // Audit log: API key rotation failed
    await auditLog({
      action: 'api_key_rotate_failed',
      userId,
      severity: 'warning',
      details: {
        keyId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
