/**
 * Revoke API Key Endpoint
 * 
 * POST /api/v2/users/api-keys/[keyId]/revoke
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { apiKeyService } from '@/lib/services/ApiKeyService';

export async function POST(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await apiKeyService.revokeKey(session.user.id, params.keyId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking API key:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

