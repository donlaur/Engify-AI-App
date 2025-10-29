/**
 * Disable MFA API Route
 *
 * POST /api/auth/mfa/disable
 * Disables MFA for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mfaService } from '@/lib/services/mfaService';

export async function POST(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await mfaService.disableMFA(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to disable MFA' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'MFA disabled successfully',
    });
  } catch (error) {
    console.error('Error disabling MFA:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
