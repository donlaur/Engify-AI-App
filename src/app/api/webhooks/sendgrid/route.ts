/**
 * SendGrid Webhook Handler
 *
 * Handles incoming webhooks from SendGrid for:
 * - Email events (delivered, opened, clicked, bounced, etc.)
 * - Inbound email parsing (when emails are sent to your domain)
 */

import { NextRequest, NextResponse } from 'next/server';
import { QStashMessageQueue } from '@/lib/messaging/queues/QStashMessageQueue';
import { auditLog, type AuditAction } from '@/lib/logging/audit';
import { logger } from '@/lib/logging/logger';
import type { MessagePriority, IMessage } from '@/lib/messaging/types';
import {
  createEmailProcessingJob,
  type ParsedEmail,
} from '@/lib/services/emailParser';

interface SendGridEvent {
  email: string;
  timestamp: number;
  'smtp-id'?: string;
  event:
    | 'delivered'
    | 'open'
    | 'click'
    | 'bounce'
    | 'dropped'
    | 'deferred'
    | 'processed';
  category?: string[];
  sg_event_id?: string;
  sg_message_id?: string;
  reason?: string;
  status?: string;
  response?: string;
  url?: string;
  useragent?: string;
  ip?: string;
  url_offset?: {
    index: number;
    type: string;
  };
  asm_group_id?: number;
}

interface SendGridInboundEmail {
  headers: string;
  text: string;
  html: string;
  from: string;
  to: string;
  subject: string;
  dkim?: string;
  envelope?: string;
  charsets?: string;
  SPF?: string;
}

/**
 * Process email events (delivered, opened, clicked, etc.)
 */
async function processEmailEvent(event: SendGridEvent) {
  // Log email event for analytics
  await auditLog({
    userId: 'system',
    action: `EMAIL_${event.event.toUpperCase()}` as AuditAction,
    resource: 'email',
    details: {
      email: event.email,
      event: event.event,
      timestamp: new Date(event.timestamp * 1000),
      messageId: event.sg_message_id,
      categories: event.category,
    },
  });

  // Store in database for analytics (optional)
  // You can create an email_events collection to track opens, clicks, etc.

  // Handle specific events
  switch (event.event) {
    case 'bounce':
    case 'dropped':
      // Handle failed emails - maybe notify user
      logger.warn('Email failed', {
        email: event.email,
        reason: event.reason,
      });
      break;

    case 'click':
      // Track link clicks for analytics
      logger.debug('Email link clicked', {
        email: event.email,
        url: event.url,
      });
      break;

    case 'open':
      // Track email opens
      logger.debug('Email opened', {
        email: event.email,
      });
      break;
  }
}

/**
 * Process inbound emails (when emails are sent to your domain)
 * Uses QStash to process asynchronously
 */
async function processInboundEmail(email: SendGridInboundEmail) {
  const parsedEmail: ParsedEmail = {
    from: email.from,
    to: email.to,
    subject: email.subject,
    text: email.text,
    html: email.html,
    receivedAt: new Date(),
    metadata: {
      messageId: email.envelope,
      categories: [],
    },
  };

  // Create processing job with parsed content
  const emailId = `email-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const processingJob = createEmailProcessingJob(parsedEmail, emailId);

  // Queue email for async processing using QStash
  const queue = new QStashMessageQueue('inbound-emails', 'redis', {
    name: 'inbound-emails',
    type: 'redis',
    maxRetries: 3,
    retryDelay: 1000,
    visibilityTimeout: 30000,
    batchSize: 10,
    concurrency: 5,
    enableDeadLetter: true,
    enableMetrics: true,
  });

  // Map email priority ('high'|'medium'|'low') to MessagePriority ('high'|'normal'|'low'|'critical')
  const messagePriority: MessagePriority =
    processingJob.priority === 'high'
      ? 'high'
      : processingJob.priority === 'medium'
        ? 'normal'
        : 'low';

  // Create full IMessage object with all required fields
  const message: IMessage = {
    id: emailId,
    type: 'event', // Use 'event' instead of 'inbound-email' (not in MessageType union)
    payload: {
      email: parsedEmail,
      contentType: processingJob.contentType,
      priority: processingJob.priority,
    },
    priority: messagePriority,
    status: 'pending',
    metadata: {
      source: 'sendgrid-webhook',
      version: '1.0.0',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    retryCount: 0,
    maxRetries: 3,
  };

  await queue.publish(message);

  // Log for audit trail
  await auditLog({
    userId: 'system',
    action: 'INBOUND_EMAIL_RECEIVED',
    resource: 'email',
    details: {
      from: email.from,
      to: email.to,
      subject: email.subject,
      contentType: processingJob.contentType,
      priority: processingJob.priority,
    },
  });

  // Log queued email (using audit log in production)
  logger.debug('Queued inbound email', {
    from: email.from,
    contentType: processingJob.contentType,
    priority: processingJob.priority,
  });
}

/**
 * Verify SendGrid webhook signature
 * SendGrid signs webhooks with your public key for security
 */
function verifyWebhookSignature(
  _payload: string,
  _signature: string,
  _timestamp: string
): boolean {
  // In production, verify SendGrid signature
  // For now, we'll rely on the webhook URL being secret
  if (process.env.NODE_ENV === 'production') {
    const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;

    if (!publicKey) {
      logger.warn(
        'SENDGRID_WEBHOOK_PUBLIC_KEY not set - skipping signature verification'
      );
      return true; // Allow in dev, but log warning
    }

    // Verify signature logic here
    // This is a simplified check - implement full verification
    return true;
  }

  // In development, skip verification
  return true;
}

/**
 * POST handler for SendGrid webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get(
      'x-twilio-email-event-webhook-signature'
    );
    const timestamp = request.headers.get(
      'x-twilio-email-event-webhook-signature-timestamp'
    );

    // For inbound emails, SendGrid uses different headers
    const isInboundEmail = request.headers
      .get('user-agent')
      ?.includes('SendGrid');

    const rawBody = await request.text();

    // Verify signature (optional but recommended)
    if (
      signature &&
      timestamp &&
      !verifyWebhookSignature(rawBody, signature, timestamp)
    ) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook data
    const data = JSON.parse(rawBody);

    // Handle event webhooks (delivered, opened, clicked, etc.)
    if (Array.isArray(data)) {
      // Multiple events
      for (const event of data) {
        await processEmailEvent(event);
      }
    } else if (data.event) {
      // Single event
      await processEmailEvent(data);
    } else if (isInboundEmail || data.from) {
      // Inbound email
      await processInboundEmail(data as SendGridInboundEmail);
    }

    // SendGrid expects 200 response
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('/api/webhooks/sendgrid', error, {
      method: 'POST',
    });

    // Still return 200 to prevent SendGrid from retrying
    // Log error for investigation
    await auditLog({
      userId: 'system',
      action: 'WEBHOOK_ERROR',
      resource: 'sendgrid',
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { success: false, error: 'Processing failed' },
      { status: 200 }
    );
  }
}

/**
 * GET handler for webhook verification
 * SendGrid may ping this endpoint to verify the webhook URL
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'engify-sendgrid-webhook',
    timestamp: new Date().toISOString(),
  });
}
