/**
 * Enable MFA API Route
 *
 * POST /api/auth/mfa/enable
 * Enables MFA for a user via SMS
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logging/logger';
import { mfaService } from '@/lib/services/mfaService';
import { z } from 'zod';

const enableMFASchema = z.object({
  phoneNumber: z
    .string()
    .regex(
      /^\+[1-9]\d{1,14}$/,
      'Invalid phone number format. Use E.164 format (e.g., +1234567890)'
    ),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = enableMFASchema.parse(body);

    // Enable MFA
    const result = await mfaService.enableMFA(
      session.user.id,
      validated.phoneNumber
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to enable MFA' },
        { status: 400 }
      );
    }

    // Send initial verification code
    const codeResult = await mfaService.sendMFACode(
      session.user.id,
      validated.phoneNumber
    );

    if (!codeResult.success) {
      return NextResponse.json(
        {
          success: true,
          message: 'MFA enabled, but failed to send verification code',
          error: codeResult.error,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'MFA enabled. Verification code sent to your phone.',
      expiresAt: codeResult.expiresAt,
    });
  } catch (error) {
    const session = await auth();
    logger.apiError('/api/auth/mfa/enable', error, {
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
