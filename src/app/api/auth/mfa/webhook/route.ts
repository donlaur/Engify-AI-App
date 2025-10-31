/**
 * AI Summary: Twilio webhook endpoint with signature verification, rate limiting, and replay protection.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyTwilioSignature } from '@/lib/messaging/twilio';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { auditLog } from '@/lib/logging/audit';
import { logger } from '@/lib/logging/logger';
import { hasProcessedMessage } from '@/lib/services/twilioWebhookState';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'local';

  // Rate limiting
  if (!rateLimit(`twilio-webhook:${ip}`, { windowMs: 60_000, max: 60 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Read raw body for signature verification
  const raw = await request.text();
  const signature = request.headers.get('x-twilio-signature');
  const token = process.env.TWILIO_AUTH_TOKEN ?? null;

  // Verify signature
  const signatureValid = await verifyTwilioSignature(
    request.url,
    raw,
    signature,
    token
  );
  if (!signatureValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    // Parse webhook payload
    const params = new URLSearchParams(raw);
    const messageId = params.get('MessageSid');

    // Replay protection
    if (messageId && hasProcessedMessage(messageId)) {
      return NextResponse.json(
        { error: 'Message already processed' },
        { status: 200 }
      ); // Return 200 to prevent retries
    }

    // Process webhook event (placeholder for actual MFA verification logic)
    const eventType = params.get('EventType') || 'message';
    const from = params.get('From');
    const to = params.get('To');
    const body = params.get('Body');

    await auditLog({
      action: 'TWILIO_WEBHOOK_RECEIVED',
      resource: 'twilio_webhook',
      details: {
        messageId,
        eventType,
        from,
        to,
        bodyPreview: body?.substring(0, 100) ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      messageId,
      processed: true,
    });
  } catch (error) {
    logger.apiError('/api/auth/mfa/webhook', error, { method: 'POST' });
    await auditLog({
      action: 'TWILIO_WEBHOOK_ERROR',
      resource: 'twilio_webhook',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        message: raw?.substring(0, 200) ?? null,
      },
      severity: 'error',
    });
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

