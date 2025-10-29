/**
 * Get MFA Status API Route
 *
 * GET /api/auth/mfa/status
 * Returns the current MFA status for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logging/logger';
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
    const session = await auth();
    logger.apiError('/api/auth/mfa/status', error, {
      userId: session?.user?.id,
      method: 'GET',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
