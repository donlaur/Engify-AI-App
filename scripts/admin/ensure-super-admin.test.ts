/**
 * Unit Tests for Super Admin Setup Script
 *
 * Tests validation functions and core logic
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  maskEmail,
} from './ensure-super-admin';

describe('Super Admin Setup - Email Validation', () => {
  it('should validate correct email format', () => {
    const result = validateEmail('admin@engify.ai');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty email', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Email is required');
  });

  it('should reject invalid email format', () => {
    const result = validateEmail('not-an-email');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });

  it('should reject email without domain', () => {
    const result = validateEmail('admin@');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });

  it('should reject email without @', () => {
    const result = validateEmail('admin.engify.ai');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });
});

describe('Super Admin Setup - Password Validation', () => {
  it('should validate strong password', () => {
    const result = validatePassword('SecureP@ssw0rd123!');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject password shorter than 12 characters', () => {
    const result = validatePassword('Short1!Aa');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 12 characters');
  });

  it('should reject password without uppercase letter', () => {
    const result = validatePassword('lowercase123!@#');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('uppercase letter');
  });

  it('should reject password without lowercase letter', () => {
    const result = validatePassword('UPPERCASE123!@#');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('lowercase letter');
  });

  it('should reject password without number', () => {
    const result = validatePassword('NoNumbersHere!@#Aa');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('number');
  });

  it('should reject password without special character', () => {
    const result = validatePassword('NoSpecialChar123Aa');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('special character');
  });

  it('should reject empty password', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password is required');
  });

  it('should accept password with various special characters', () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '='];

    specialChars.forEach(char => {
      const result = validatePassword(`SecurePass123${char}Aa`);
      expect(result.valid).toBe(true);
    });
  });
});

describe('Super Admin Setup - Email Masking', () => {
  it('should mask email for logging', () => {
    const masked = maskEmail('admin@engify.ai');
    expect(masked).toBe('ad***@engify.ai');
  });

  it('should mask short email addresses', () => {
    const masked = maskEmail('a@example.com');
    expect(masked).toBe('***@example.com');
  });

  it('should handle malformed email', () => {
    const masked = maskEmail('not-an-email');
    expect(masked).toBe('***@***');
  });

  it('should mask long email addresses', () => {
    const masked = maskEmail('verylongemail@engify.ai');
    expect(masked).toBe('ve***@engify.ai');
  });
});

describe('Super Admin Setup - Password Complexity', () => {
  const validPasswords = [
    'SecureP@ssw0rd123!',
    'MyStr0ng!P@ssword',
    'C0mpl3x#P@ssw0rd',
    '!QAZ2wsx#EDC4rfv',
    'P@ssw0rd!2345678',
  ];

  const invalidPasswords = [
    { password: 'short', reason: 'too short' },
    { password: 'alllowercase123!', reason: 'no uppercase' },
    { password: 'ALLUPPERCASE123!', reason: 'no lowercase' },
    { password: 'NoNumbers!@#Aa', reason: 'no numbers' },
    { password: 'NoSpecialChars123Aa', reason: 'no special chars' },
  ];

  it.each(validPasswords)('should accept valid password: %s', (password) => {
    const result = validatePassword(password);
    expect(result.valid).toBe(true);
  });

  it.each(invalidPasswords)(
    'should reject invalid password ($reason): $password',
    ({ password }) => {
      const result = validatePassword(password);
      expect(result.valid).toBe(false);
    }
  );
});
