/**
 * Twilio Webhook Handler
 *
 * Handles incoming webhooks from Twilio for:
 * - SMS status callbacks (delivered, failed, etc.)
 * - Voice call status updates
 * - Verify service callbacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';
import crypto from 'crypto';

interface TwilioStatusCallback {
  SmsSid?: string;
  MessageSid?: string;
  SmsStatus?: string;
  MessageStatus?: string;
  To?: string;
  From?: string;
  AccountSid?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
  CallSid?: string;
  CallStatus?: string;
  CallDuration?: string;
  CallDirection?: string;
}

/**
 * Verify Twilio webhook signature
 */
function verifyTwilioSignature(
  url: string,
  params: string,
  signature: string
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    logger.warn('TWILIO_AUTH_TOKEN not set - skipping signature verification');
    return true; // Allow in dev, but log warning
  }

  // Create the signature
  const data = url + params;
  const computedSignature = crypto
    .createHmac('sha1', authToken)
    .update(data, 'utf-8')
    .digest('base64');

  // Compare signatures
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

/**
 * POST handler for Twilio webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-twilio-signature');

    // Get the full URL
    // split('?') always returns at least one element (the URL itself)
    const urlParts = request.url.split('?');
    const url = urlParts.length >= 1 ? urlParts[0] : request.url; // Remove query string from URL
    const formData = await request.formData();

    // Build params string (same format Twilio uses)
    const params: string[] = [];
    for (const [key, value] of formData.entries()) {
      params.push(`${key}=${value}`);
    }
    params.sort();
    const paramsString = params.join('');

    // Verify signature
    if (signature && !verifyTwilioSignature(url, paramsString, signature)) {
      await auditLog({
        userId: 'system',
        action: 'TWILIO_WEBHOOK_SIGNATURE_FAILED',
        resource: 'webhook',
        metadata: {
          url,
        },
      });

      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse callback data
    const callback: TwilioStatusCallback = {};
    for (const [key, value] of formData.entries()) {
      callback[key as keyof TwilioStatusCallback] = value as string;
    }

    // Process based on type
    if (callback.SmsSid || callback.MessageSid) {
      // SMS status callback
      await processSMSStatus(callback);
    } else if (callback.CallSid) {
      // Voice call status callback
      await processCallStatus(callback);
    }

    // Twilio expects 200 response with TwiML or empty
    return NextResponse.xml('<Response></Response>', {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    logger.apiError('/api/webhooks/twilio', error, {
      method: 'POST',
    });

    await auditLog({
      userId: 'system',
      action: 'TWILIO_WEBHOOK_ERROR',
      resource: 'webhook',
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    // Still return 200 to prevent Twilio retries
    return NextResponse.xml('<Response></Response>', {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

/**
 * Process SMS status callbacks
 */
async function processSMSStatus(callback: TwilioStatusCallback) {
  const status = callback.SmsStatus || callback.MessageStatus;
  const messageId = callback.SmsSid || callback.MessageSid;

  await auditLog({
    userId: 'system',
    action: 'SMS_STATUS_UPDATE',
    resource: 'sms',
    metadata: {
      messageId,
      status,
      to: callback.To,
      from: callback.From,
      errorCode: callback.ErrorCode,
      errorMessage: callback.ErrorMessage,
    },
  });

  // Handle specific statuses
  switch (status) {
    case 'delivered':
      // eslint-disable-next-line no-console
      console.log(`SMS delivered: ${messageId}`);
      break;

    case 'failed':
    case 'undelivered':
      // eslint-disable-next-line no-console
      console.error(`SMS failed: ${messageId}`, callback.ErrorMessage);
      // Could trigger notification or retry logic here
      break;

    case 'sent':
      // eslint-disable-next-line no-console
      console.log(`SMS sent: ${messageId}`);
      break;
  }
}

/**
 * Process voice call status callbacks
 */
async function processCallStatus(callback: TwilioStatusCallback) {
  await auditLog({
    userId: 'system',
    action: 'CALL_STATUS_UPDATE',
    resource: 'voice',
    metadata: {
      callSid: callback.CallSid,
      status: callback.CallStatus,
      duration: callback.CallDuration,
      direction: callback.CallDirection,
    },
  });
}

/**
 * GET handler for webhook verification
 * Twilio may ping this endpoint to verify the webhook URL
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'engify-twilio-webhook',
    timestamp: new Date().toISOString(),
  });
}
