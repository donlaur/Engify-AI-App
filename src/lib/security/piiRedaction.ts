/**
 * AI Summary: PII redaction utilities for logs and audit trails.
 * Part of Day 5 Phase 8 security hardening.
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?1?\s*\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4})/g;
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
const CREDIT_CARD_REGEX = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
const API_KEY_REGEX = /(sk-[a-zA-Z0-9]{32,}|pk_[a-z]+_[a-zA-Z0-9]{24,})/g;
const IP_ADDRESS_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

export interface RedactionOptions {
  redactEmails?: boolean;
  redactPhones?: boolean;
  redactSSN?: boolean;
  redactCreditCards?: boolean;
  redactApiKeys?: boolean;
  redactIPs?: boolean;
  placeholder?: string;
}

const DEFAULT_OPTIONS: RedactionOptions = {
  redactEmails: true,
  redactPhones: true,
  redactSSN: true,
  redactCreditCards: true,
  redactApiKeys: true,
  redactIPs: false, // Keep IPs for security logs
  placeholder: '[REDACTED]',
};

/**
 * Redact PII from a string
 */
export function redactPII(
  text: string,
  options: RedactionOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let redacted = text;

  if (opts.redactEmails) {
    redacted = redacted.replace(EMAIL_REGEX, (match) => {
      const [local, domain] = match.split('@');
      const visibleChars = Math.min(3, Math.max(1, Math.floor(local.length / 2)));
      return `${local.slice(0, visibleChars)}***@${domain}`;
    });
  }

  if (opts.redactPhones) {
    redacted = redacted.replace(PHONE_REGEX, opts.placeholder ?? '[REDACTED]');
  }

  if (opts.redactSSN) {
    redacted = redacted.replace(SSN_REGEX, '***-**-****');
  }

  if (opts.redactCreditCards) {
    redacted = redacted.replace(CREDIT_CARD_REGEX, (match) => {
      const last4 = match.slice(-4);
      return `****-****-****-${last4}`;
    });
  }

  if (opts.redactApiKeys) {
    redacted = redacted.replace(API_KEY_REGEX, opts.placeholder ?? '[REDACTED]');
  }

  if (opts.redactIPs) {
    redacted = redacted.replace(IP_ADDRESS_REGEX, '***.***.***.***.***');
  }

  return redacted;
}

/**
 * Redact PII from object (deep)
 */
export function redactPIIFromObject<T extends Record<string, unknown>>(
  obj: T,
  options: RedactionOptions = {}
): T {
  const result: Record<string, unknown> = { ...obj };

  Object.keys(result).forEach((key) => {
    const value = result[key];

    if (typeof value === 'string') {
      result[key] = redactPII(value, options);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = redactPIIFromObject(
        value as Record<string, unknown>,
        options
      );
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string'
          ? redactPII(item, options)
          : typeof item === 'object' && item !== null
            ? redactPIIFromObject(item as Record<string, unknown>, options)
            : item
      );
    }
  });

  return result as T;
}

/**
 * Mask email for display
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '[INVALID_EMAIL]';

  const visibleChars = Math.min(3, Math.max(1, Math.floor(local.length / 2)));
  const masked = local.slice(0, visibleChars) + '***';
  return `${masked}@${domain}`;
}

/**
 * Mask phone for display
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '****';

  const last4 = digits.slice(-4);
  return `****${last4}`;
}

/**
 * Mask API key for display
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return '****';

  const start = apiKey.slice(0, 7);
  const end = apiKey.slice(-4);
  return `${start}...${end}`;
}

/**
 * Check if string contains PII
 */
export function containsPII(text: string): boolean {
  return (
    EMAIL_REGEX.test(text) ||
    PHONE_REGEX.test(text) ||
    SSN_REGEX.test(text) ||
    CREDIT_CARD_REGEX.test(text)
  );
}

/**
 * Sanitize for logging
 */
export function sanitizeForLog(
  data: unknown,
  options: RedactionOptions = {}
): unknown {
  if (typeof data === 'string') {
    return redactPII(data, options);
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return redactPIIFromObject(data as Record<string, unknown>, options);
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForLog(item, options));
  }

  return data;
}

