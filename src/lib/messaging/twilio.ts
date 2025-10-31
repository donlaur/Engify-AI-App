/**
 * AI Summary: Twilio utilities including E.164 validation, signature verification, SMS sending with retry/backoff.
 */
import { createHmac } from 'node:crypto';

// Twilio API configuration
const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';

interface SMSOptions {
  to: string;
  from?: string; // Uses env default if not provided
  body: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  attempts?: number;
}

/**
 * Sends SMS via Twilio with retry logic and backoff
 */
export async function sendSMS(options: SMSOptions): Promise<SMSResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const defaultFrom = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken) {
    return { success: false, error: 'Twilio credentials not configured' };
  }

  if (!validateE164(options.to)) {
    return {
      success: false,
      error: 'Invalid recipient phone number format (must be E.164)',
    };
  }

  const from = options.from || defaultFrom;
  if (!from || !validateE164(from)) {
    return {
      success: false,
      error: 'Invalid sender phone number format (must be E.164)',
    };
  }

  const maxRetries = options.maxRetries ?? 3;
  const baseDelay = options.retryDelayMs ?? 1000;
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new URLSearchParams({
        To: options.to,
        From: from,
        Body: options.body,
      });

      const response = await fetch(
        `${TWILIO_API_BASE}/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          messageId: data.sid,
          attempts: attempt,
        };
      }

      // Check for retryable errors (rate limits, temporary failures)
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Unknown error' }));
      lastError = errorData.message || `HTTP ${response.status}`;

      // Don't retry on client errors (4xx except 429)
      if (
        response.status >= 400 &&
        response.status < 500 &&
        response.status !== 429
      ) {
        break;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Network error';

      // Retry on network errors
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: lastError || 'Max retries exceeded',
    attempts: maxRetries,
  };
}

// E.164 phone number validation regex
const E164_REGEX = /^\+[1-9]\d{1,14}$/;

/**
 * Validates E.164 phone number format
 * @param phoneNumber Phone number to validate
 * @returns true if valid E.164 format
 */
export function validateE164(phoneNumber: string): boolean {
  return E164_REGEX.test(phoneNumber);
}

/**
 * Formats phone number to E.164 if possible
 * @param phoneNumber Raw phone number
 * @returns E.164 formatted number or null if invalid
 */
export function formatE164(phoneNumber: string): string | null {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // Handle US numbers (add +1 if missing)
  if (digits.length === 10 && !phoneNumber.startsWith('+')) {
    return `+1${digits}`;
  }

  // Handle international numbers
  if (digits.length >= 7 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

function buildBaseString(url: string, params: URLSearchParams): string {
  // Twilio docs: concatenate URL with sorted POST params (key=value)
  const pairs: string[] = [];
  Array.from(params.keys())
    .sort()
    .forEach((k) => pairs.push(k + params.get(k)));
  return url + pairs.join('');
}

export async function verifyTwilioSignature(
  requestUrl: string,
  rawBody: string | null,
  signature: string | null,
  authToken: string | null
): Promise<boolean> {
  if (!signature || !authToken) return false;
  // If content-type is application/x-www-form-urlencoded use params rule, else use raw body
  try {
    const base = requestUrl;
    if (rawBody && rawBody.length > 0) {
      // JSON payloads: sign as URL + raw body
      const digest = createHmac('sha1', authToken)
        .update(base + rawBody)
        .digest('base64');
      return digest === signature;
    }
    // Fallback: try URL-encoded
    const url = new URL(requestUrl);
    const baseString = buildBaseString(
      url.origin + url.pathname,
      url.searchParams
    );
    const digest = createHmac('sha1', authToken)
      .update(baseString)
      .digest('base64');
    return digest === signature;
  } catch {
    return false;
  }
}
