/**
 * Revoke API Key Endpoint
 *
 * POST /api/v2/users/api-keys/[keyId]/revoke
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { apiKeyService } from '@/lib/services/ApiKeyService';
import { RBACPresets } from '@/lib/middleware/rbac';
import { auditLog } from '@/lib/logging/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  // RBAC: users:write permission (users can revoke their own API keys)
  const rbacCheck = await RBACPresets.requireUserWrite()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await apiKeyService.revokeKey(
      session.user.id,
      params.keyId,
      session.user.id
    );

    // Audit log: API key revoked
    await auditLog({
      action: 'api_key_revoked',
      userId: session.user.id,
      severity: 'warning', // Important security event
      metadata: {
        keyId: params.keyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error revoking API key:', error);

    // Try to get userId from session for audit log
    let userId = 'unknown';
    try {
      const session = await auth();
      userId = session?.user?.id || 'unknown';
    } catch {
      // Session fetch failed, use unknown
    }

    // Audit log: API key revocation failed
    await auditLog({
      action: 'api_key_revoke_failed',
      userId,
      severity: 'warning',
      metadata: {
        keyId: params.keyId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

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
