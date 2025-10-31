/**
 * AI Summary: SendGrid email event webhook with ECDSA signature verification, auditing, and health tracking.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySendGridWebhook } from '@/lib/messaging/sendgrid';
import { auditLog } from '@/lib/logging/audit';
import { logger } from '@/lib/logging/logger';
import { recordSendGridEvent } from '@/lib/services/sendgridHealth';

const SIGNATURE_HEADER = 'x-twilio-email-event-webhook-signature';
const TIMESTAMP_HEADER = 'x-twilio-email-event-webhook-timestamp';

interface SendGridEvent {
  event: string;
  email?: string;
  sg_event_id?: string;
  sg_message_id?: string;
  reason?: string;
  timestamp?: number;
  [key: string]: unknown;
}

function toArray(input: unknown): SendGridEvent[] {
  if (Array.isArray(input)) {
    return input as SendGridEvent[];
  }
  if (typeof input === 'object' && input !== null) {
    return [input as SendGridEvent];
  }
  return [];
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER);
  const timestamp = request.headers.get(TIMESTAMP_HEADER);
  const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY ?? null;

  const verified = await verifySendGridWebhook(
    timestamp,
    signature,
    rawBody,
    publicKey
  );

  if (!verified) {
    await auditLog({
      action: 'sendgrid_event_failed',
      resource: 'sendgrid_webhook',
      details: {
        reason: 'invalid_signature',
      },
      severity: 'warning',
    });

    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const payload = rawBody.length > 0 ? JSON.parse(rawBody) : [];
    const events = toArray(payload);

    for (const event of events) {
      const occurredAt = event.timestamp
        ? new Date(event.timestamp * 1000)
        : new Date();
      const status = event.event === 'bounce' || event.event === 'dropped'
        ? 'error'
        : 'success';

      recordSendGridEvent({
        type: event.event,
        occurredAt,
        status,
        eventId: event.sg_event_id ?? null,
        reason: typeof event.reason === 'string' ? event.reason : null,
        severity: status === 'error' ? 'error' : 'info',
      });

      await auditLog({
        action: status === 'error' ? 'sendgrid_event_failed' : 'sendgrid_event_received',
        resource: 'sendgrid_webhook',
        details: {
          event: event.event,
          email: event.email,
          eventId: event.sg_event_id,
          messageId: event.sg_message_id,
          reason: event.reason,
        },
        severity: status === 'error' ? 'warning' : 'info',
      });
    }

    return NextResponse.json({ success: true, processed: events.length });
  } catch (error) {
    logger.apiError('/api/email/webhook', error, { method: 'POST' });
    await auditLog({
      action: 'sendgrid_event_failed',
      resource: 'sendgrid_webhook',
      details: {
        reason: 'invalid_payload',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      severity: 'error',
    });

    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    );
  }
}
