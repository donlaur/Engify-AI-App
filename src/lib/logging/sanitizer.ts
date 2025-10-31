/**
 * AI Summary: Scrubs PII (emails, tokens, phone numbers) before logging.
 */

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const TOKEN_REGEX = /(sk-|rk-|pk_|sess_|ya29\.|r8_|ghp_|gho_)[A-Za-z0-9_-]+/gi;
const PHONE_REGEX = /\+?\d{1,3}[\s-]?\(?\d{2,3}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/g;

const SENSITIVE_KEYS = new Set([
  'email',
  'emailAddress',
  'phone',
  'phoneNumber',
  'token',
  'apiKey',
  'secret',
  'authorization',
  'password',
]);

export function sanitizeString(value: string): string {
  let sanitized = value;
  sanitized = sanitized.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
  sanitized = sanitized.replace(TOKEN_REGEX, '[REDACTED_TOKEN]');
  sanitized = sanitized.replace(PHONE_REGEX, '[REDACTED_PHONE]');
  return sanitized;
}

export function sanitizeValue(value: unknown, key?: string): unknown {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    if (key && SENSITIVE_KEYS.has(key)) {
      return '[REDACTED]';
    }
    return sanitizeString(value);
  }

  if (typeof value === 'number') {
    if (key && SENSITIVE_KEYS.has(key)) {
      return '[REDACTED_NUMBER]';
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      result[childKey] = sanitizeValue(childValue, childKey);
    }
    return result;
  }

  return value;
}

export function sanitizeMeta(
  meta?: Record<string, unknown>
): Record<string, unknown> {
  if (!meta) return {};
  return sanitizeValue(meta) as Record<string, unknown>;
}
