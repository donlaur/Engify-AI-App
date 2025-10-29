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
