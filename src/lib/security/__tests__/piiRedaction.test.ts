/**
 * AI Summary: Tests for PII redaction utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  redactPII,
  maskEmail,
  maskPhone,
  maskApiKey,
  containsPII,
  sanitizeForLog,
} from '../piiRedaction';

describe('PII Redaction', () => {
  describe('redactPII', () => {
    it('redacts email addresses', () => {
      const text = 'Contact user@example.com for details';
      const redacted = redactPII(text);
      expect(redacted).toContain('us***@example.com'); // 2 chars visible (floor(4/2))
      expect(redacted).not.toContain('user@example.com');
    });

    it('redacts phone numbers', () => {
      const text = 'Call me at +1-555-123-4567';
      const redacted = redactPII(text);
      expect(redacted).toContain('[REDACTED]');
      expect(redacted).not.toContain('555-123-4567');
    });

    it('redacts SSN', () => {
      const text = 'SSN: 123-45-6789';
      const redacted = redactPII(text);
      expect(redacted).toContain('***-**-****');
      expect(redacted).not.toContain('123-45-6789');
    });

    it('redacts credit card numbers', () => {
      const text = 'Card: 4532-1234-5678-9010';
      const redacted = redactPII(text);
      expect(redacted).toContain('****-****-****-9010');
      expect(redacted).not.toContain('4532');
    });

    it('redacts API keys', () => {
      const text = 'Key: sk-1234567890abcdefghijklmnopqrstuvwxyz';
      const redacted = redactPII(text);
      expect(redacted).toContain('[REDACTED]');
      expect(redacted).not.toContain('1234567890abcdefghijklmnopqrstuvwxyz');
    });
  });

  describe('maskEmail', () => {
    it('masks email preserving first few chars and domain', () => {
      expect(maskEmail('john.doe@example.com')).toBe('joh***@example.com');
      expect(maskEmail('a@test.com')).toBe('a***@test.com');
    });
  });

  describe('maskPhone', () => {
    it('masks phone showing only last 4 digits', () => {
      expect(maskPhone('+1-555-123-4567')).toBe('****4567');
      expect(maskPhone('5551234567')).toBe('****4567');
    });
  });

  describe('maskApiKey', () => {
    it('masks API key showing prefix and suffix', () => {
      const key = 'sk-1234567890abcdefghijklmnopqrstuvwxyz';
      const masked = maskApiKey(key);
      expect(masked).toContain('sk-1234');
      expect(masked).toContain('...');
      expect(masked).not.toContain('890abcdefg');
    });
  });

  describe('containsPII', () => {
    it('detects email addresses', () => {
      expect(containsPII('user@example.com')).toBe(true);
    });

    it('detects phone numbers', () => {
      expect(containsPII('+1-555-123-4567')).toBe(true);
    });

    it('detects SSN', () => {
      expect(containsPII('123-45-6789')).toBe(true);
    });

    it('returns false for clean text', () => {
      expect(containsPII('This is a clean message')).toBe(false);
    });
  });

  describe('sanitizeForLog', () => {
    it('redacts PII from nested objects', () => {
      const data = {
        user: {
          email: 'user@example.com',
          phone: '+1-555-123-4567',
        },
        message: 'Contact at user@example.com',
      };

      const sanitized = sanitizeForLog(data) as typeof data;
      expect(sanitized.user.email).toContain('us***@example.com');
      expect(sanitized.user.phone).toContain('[REDACTED]');
      expect(sanitized.message).toContain('us***@example.com');
    });

    it('handles arrays', () => {
      const data = ['user@example.com', 'another@test.com'];
      const sanitized = sanitizeForLog(data) as string[];
      expect(sanitized[0]).toContain('us***@example.com');
      expect(sanitized[1]).toContain('ano***@test.com');
    });
  });
});

