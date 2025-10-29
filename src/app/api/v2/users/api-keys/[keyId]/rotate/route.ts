/**
 * Rotate API Key Endpoint
 * 
 * POST /api/v2/users/api-keys/[keyId]/rotate
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { apiKeyService } from '@/lib/services/ApiKeyService';
import { z } from 'zod';

const rotateKeySchema = z.object({
  apiKey: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = rotateKeySchema.parse(body);

    await apiKeyService.rotateKey(
      session.user.id,
      params.keyId,
      validated.apiKey,
      session.user.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rotating API key:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

