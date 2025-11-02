/**
 * Verify Cron/Internal API Calls
 * 
 * Protects background job endpoints from unauthorized access
 * Supports both Vercel Cron and QStash
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify request is from authorized cron/scheduled job
 * 
 * Checks:
 * 1. CRON_SECRET header (for internal cron jobs)
 * 2. Vercel Cron header (for Vercel scheduled functions)
 * 3. QStash signature (for Upstash QStash jobs)
 * 
 * @param request NextRequest
 * @returns NextResponse error if unauthorized, null if authorized
 */
export async function verifyCronRequest(
  request: NextRequest
): Promise<NextResponse | null> {
  // Check 1: CRON_SECRET environment variable
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return null; // Authorized via CRON_SECRET
  }

  // Check 2: Vercel Cron header
  // Vercel automatically adds this header for scheduled functions
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader) {
    return null; // Authorized via Vercel Cron
  }

  // Check 3: QStash signature (if configured)
  const qstashSignature = request.headers.get('upstash-signature');
  const qstashSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  
  if (qstashSignature && qstashSigningKey) {
    // QStash signature verification
    // For now, just check presence of signature
    // TODO: Implement full HMAC signature verification
    return null; // Authorized via QStash
  }

  // None of the auth methods passed
  return NextResponse.json(
    { 
      error: 'Unauthorized',
      message: 'This endpoint is only accessible to scheduled jobs'
    },
    { status: 401 }
  );
}

/**
 * Verify request is from internal service (not external user)
 * 
 * Checks for internal API key
 * 
 * @param request NextRequest
 * @returns NextResponse error if unauthorized, null if authorized
 */
export async function verifyInternalRequest(
  request: NextRequest
): Promise<NextResponse | null> {
  const internalKey = process.env.INTERNAL_API_KEY;
  const authHeader = request.headers.get('x-internal-key');
  
  if (!internalKey) {
    // If no internal key configured, allow (backwards compatibility)
    return null;
  }

  if (authHeader === internalKey) {
    return null; // Authorized
  }

  return NextResponse.json(
    { 
      error: 'Unauthorized',
      message: 'This endpoint requires internal API key'
    },
    { status: 401 }
  );
}

