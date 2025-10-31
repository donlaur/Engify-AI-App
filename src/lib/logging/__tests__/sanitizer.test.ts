import { describe, it, expect } from 'vitest';
import { sanitizeMeta, sanitizeString } from '../sanitizer';

describe('sanitizeString', () => {
  it('redacts emails, tokens, and phone numbers', () => {
    const input =
      'Contact me at user@example.com or +1 (555) 123-4567 with token sk-test-abc123';
    const sanitized = sanitizeString(input);
    expect(sanitized).not.toContain('user@example.com');
    expect(sanitized).not.toContain('+1 (555) 123-4567');
    expect(sanitized).not.toContain('sk-test-abc123');
    expect(sanitized).toContain('[REDACTED_EMAIL]');
    expect(sanitized).toContain('[REDACTED_PHONE]');
    expect(sanitized).toContain('[REDACTED_TOKEN]');
  });
});

describe('sanitizeMeta', () => {
  it('redacts sensitive fields recursively', () => {
    const meta = {
      email: 'admin@engify.ai',
      nested: {
        phoneNumber: '+44 7700 900123',
        details: 'sk-live-secret-token',
      },
      list: ['john@example.com', 'sk-test-xyz'],
    };

    const result = sanitizeMeta(meta);
    expect(result.email).toBe('[REDACTED]');
    expect(result.nested?.phoneNumber).toBe('[REDACTED]');
    expect(result.nested?.details).toContain('[REDACTED_TOKEN]');
    expect(Array.isArray(result.list)).toBe(true);
    expect(result.list?.[0]).toContain('[REDACTED_EMAIL]');
    expect(result.list?.[1]).toContain('[REDACTED_TOKEN]');
  });
});
