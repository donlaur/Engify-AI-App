/**
 * Verify MFA Code API Route
 *
 * POST /api/auth/mfa/verify
 * Verifies an MFA code during login or MFA setup
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mfaService } from '@/lib/services/mfaService';
import { z } from 'zod';

const verifyMFASchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = verifyMFASchema.parse(body);

    // Verify code
    const result = await mfaService.verifyMFACode(
      session.user.id,
      validated.phoneNumber,
      validated.code
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'MFA code verified successfully',
    });
  } catch (error) {
    console.error('Error verifying MFA code:', error);

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
