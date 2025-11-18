/**
 * AI Summary: Cron/Internal API Verification - Protects background job endpoints
 * Provides verifyCronRequest() and verifyInternalRequest() helpers to authenticate
 * scheduled jobs and internal API calls. Supports CRON_SECRET, Vercel Cron headers,
 * and QStash signatures. Part of Day 7 Audit #6 medium priority security improvements.
 * Last updated: 2025-11-02
 */

import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';

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
    // QStash signature verification using @upstash/qstash
    try {
      // Using static import
      const receiverConfig: { currentSigningKey: string; nextSigningKey?: string } = {
        currentSigningKey: qstashSigningKey,
      };
      if (process.env.QSTASH_NEXT_SIGNING_KEY) {
        receiverConfig.nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
      }
      const receiver = new Receiver(receiverConfig as any);

      const body = await request.text();
      const isValid = await receiver.verify({
        signature: qstashSignature,
        body,
      });

      if (isValid) {
        return null; // Authorized via QStash
      }
    } catch (error) {
      // If verification fails, continue to other auth methods
      console.error('QStash signature verification failed:', error);
    }
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

