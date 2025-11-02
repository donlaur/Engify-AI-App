/**
 * Tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  commonSchemas,
  paginationSchemas,
  contentSchemas,
  isValidObjectId,
  isValidEmail,
  sanitizeHTML,
  normalizeTags,
  validateWithMessage,
} from '../validation';

describe('commonSchemas', () => {
  describe('id', () => {
    it('should accept valid IDs', () => {
      expect(commonSchemas.id.parse('123')).toBe('123');
      expect(commonSchemas.id.parse('abc-def')).toBe('abc-def');
    });

    it('should reject empty IDs', () => {
      expect(() => commonSchemas.id.parse('')).toThrow();
    });
  });

  describe('objectId', () => {
    it('should accept valid MongoDB ObjectIds', () => {
      const validId = '507f1f77bcf86cd799439011';
      expect(commonSchemas.objectId.parse(validId)).toBe(validId);
    });

    it('should reject invalid ObjectIds', () => {
      expect(() => commonSchemas.objectId.parse('invalid')).toThrow();
      expect(() => commonSchemas.objectId.parse('123')).toThrow();
    });
  });

  describe('email', () => {
    it('should accept valid emails', () => {
      expect(commonSchemas.email.parse('test@example.com')).toBe('test@example.com');
    });

    it('should reject invalid emails', () => {
      expect(() => commonSchemas.email.parse('invalid')).toThrow();
      expect(() => commonSchemas.email.parse('test@')).toThrow();
    });
  });

  describe('password', () => {
    it('should accept valid passwords', () => {
      expect(commonSchemas.password.parse('password123')).toBe('password123');
    });

    it('should reject short passwords', () => {
      expect(() => commonSchemas.password.parse('short')).toThrow();
    });
  });
});

describe('paginationSchemas', () => {
  describe('pagination', () => {
    it('should use defaults', () => {
      const result = paginationSchemas.pagination.parse({});
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(0);
    });

    it('should accept custom values', () => {
      const result = paginationSchemas.pagination.parse({ limit: 50, skip: 100 });
      expect(result.limit).toBe(50);
      expect(result.skip).toBe(100);
    });

    it('should enforce max limit', () => {
      expect(() => 
        paginationSchemas.pagination.parse({ limit: 200 })
      ).toThrow();
    });
  });
});

describe('contentSchemas', () => {
  describe('promptTitle', () => {
    it('should accept valid titles', () => {
      const title = 'Valid Prompt Title';
      expect(contentSchemas.promptTitle.parse(title)).toBe(title);
    });

    it('should reject too short titles', () => {
      expect(() => contentSchemas.promptTitle.parse('ab')).toThrow();
    });

    it('should reject too long titles', () => {
      const longTitle = 'a'.repeat(201);
      expect(() => contentSchemas.promptTitle.parse(longTitle)).toThrow();
    });
  });

  describe('tags', () => {
    it('should accept valid tag arrays', () => {
      const tags = ['tag1', 'tag2', 'tag3'];
      expect(contentSchemas.tags.parse(tags)).toEqual(tags);
    });

    it('should enforce max tags limit', () => {
      const tooManyTags = Array(15).fill('tag');
      expect(() => contentSchemas.tags.parse(tooManyTags)).toThrow();
    });
  });
});

describe('helper functions', () => {
  describe('isValidObjectId', () => {
    it('should validate ObjectId format', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('invalid')).toBe(false);
      expect(isValidObjectId('123')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate email format', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('sanitizeHTML', () => {
    it('should escape HTML characters', () => {
      expect(sanitizeHTML('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle quotes', () => {
      expect(sanitizeHTML("'single' and \"double\""))
        .toBe('&#x27;single&#x27; and &quot;double&quot;');
    });
  });

  describe('normalizeTags', () => {
    it('should normalize tags to lowercase', () => {
      const tags = ['JavaScript', 'Python', 'REACT'];
      expect(normalizeTags(tags)).toEqual(['javascript', 'python', 'react']);
    });

    it('should replace spaces with hyphens', () => {
      const tags = ['machine learning', 'web development'];
      expect(normalizeTags(tags)).toEqual(['machine-learning', 'web-development']);
    });

    it('should remove duplicates', () => {
      const tags = ['javascript', 'javascript', 'python'];
      expect(normalizeTags(tags)).toEqual(['javascript', 'python']);
    });

    it('should enforce max tags limit', () => {
      const tags = Array(15).fill('tag').map((t, i) => `${t}${i}`);
      const result = normalizeTags(tags);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should filter out too short tags', () => {
      const tags = ['a', 'javascript', 'b', 'python'];
      expect(normalizeTags(tags)).toEqual(['javascript', 'python']);
    });
  });

  describe('validateWithMessage', () => {
    it('should return success for valid data', () => {
      const result = validateWithMessage(
        commonSchemas.email,
        'test@example.com'
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should return error for invalid data', () => {
      const result = validateWithMessage(
        commonSchemas.email,
        'invalid'
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });

    it('should use custom error message', () => {
      const result = validateWithMessage(
        commonSchemas.email,
        'invalid',
        'Custom error'
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid email');
      }
    });
  });
});

