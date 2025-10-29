/**
 * Get MFA Status API Route
 *
 * GET /api/auth/mfa/status
 * Returns the current MFA status for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mfaService } from '@/lib/services/mfaService';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await mfaService.getMFAStatus(session.user.id);

    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error getting MFA status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
