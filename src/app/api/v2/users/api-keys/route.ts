/**
 * API Key Management API
 *
 * GET /api/v2/users/api-keys - List user's API keys
 * POST /api/v2/users/api-keys - Add new API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logging/logger';
import { apiKeyService } from '@/lib/services/ApiKeyService';
import { RBACPresets } from '@/lib/middleware/rbac';
import { z } from 'zod';

const createKeySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google', 'groq']),
  keyName: z.string().min(1).max(100),
  apiKey: z.string().min(1),
  allowedModels: z.array(z.string()).default([]),
  monthlyUsageLimit: z.number().optional(),
});

export async function GET(request: NextRequest) {
  // RBAC: users:read permission
  const rbacCheck = await RBACPresets.requireUserRead()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as
      | 'openai'
      | 'anthropic'
      | 'google'
      | 'groq'
      | undefined;

    const keys = await apiKeyService.listKeys(session.user.id, provider);

    return NextResponse.json({ keys });
  } catch (error) {
    const session = await auth();
    logger.apiError('/api/v2/users/api-keys', error, {
      userId: session?.user?.id,
      method: 'GET',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // RBAC: users:write permission (users can add their own API keys)
  const rbacCheck = await RBACPresets.requireUserWrite()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createKeySchema.parse(body);

    const keyId = await apiKeyService.storeKey(
      session.user.id,
      validated.provider,
      validated.apiKey,
      validated.keyName,
      validated.allowedModels,
      session.user.id,
      {
        monthlyUsageLimit: validated.monthlyUsageLimit,
      }
    );

    return NextResponse.json({ keyId, success: true });
  } catch (error) {
    const session = await auth();
    logger.apiError('/api/v2/users/api-keys', error, {
      userId: session?.user?.id,
      method: 'POST',
    });
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
