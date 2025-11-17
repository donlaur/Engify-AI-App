import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { logger } from '@/lib/logging/logger';
import { checkRateLimit } from '@/lib/rate-limit';

const TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours in seconds

export async function POST(_request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting for authenticated users (prevent token abuse)
    const rateLimit = await checkRateLimit(session.user.id, 'authenticated');

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.reason || 'Too many token requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate simple token (random bytes)
    // In production, you'd store this in DB and validate it
    const token = randomBytes(32).toString('hex');

    return NextResponse.json({
      token,
      expiresIn: TOKEN_EXPIRY,
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });
  } catch (error) {
    logger.error('MCP token generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
