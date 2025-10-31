/**
 * Send MFA Code API Route
 *
 * POST /api/auth/mfa/send-code
 * Sends a new MFA verification code to user's phone
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logging/logger';
import { mfaService } from '@/lib/services/mfaService';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { z } from 'zod';

const sendCodeSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = sendCodeSchema.parse(body);

    const rateKey = `mfa:send:${session.user.id}`;
    const allowed = rateLimit(rateKey, { windowMs: 60_000, max: 3 });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before requesting another code.' },
        { status: 429 }
      );
    }

    // Send code
    const result = await mfaService.sendMFACode(
      session.user.id,
      validated.phoneNumber
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your phone',
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    const session = await auth();
    logger.apiError('/api/auth/mfa/send-code', error, {
      userId: session?.user?.id,
      method: 'POST',
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
