/**
 * ValidatorFactory Tests
 *
 * Tests for the ValidatorFactory.
 * Covers:
 * - Common validators
 * - Schema creation
 * - Validation logic
 * - Error messages
 */

import { describe, it, expect } from 'vitest';
import { ValidatorFactory, CommonValidators } from '../ValidatorFactory';
import { z } from 'zod';

describe('ValidatorFactory', () => {
  describe('CommonValidators', () => {
    describe('objectId', () => {
      it('should validate valid ObjectID', () => {
        // Arrange
        const validator = CommonValidators.objectId();
        const validId = '507f1f77bcf86cd799439011';

        // Act
        const result = validator.parse(validId);

        // Assert
        expect(result).toBe(validId);
      });

      it('should reject invalid ObjectID', () => {
        // Arrange
        const validator = CommonValidators.objectId();

        // Act & Assert
        expect(() => validator.parse('invalid')).toThrow('Invalid ObjectID');
        expect(() => validator.parse('123')).toThrow('Invalid ObjectID');
        expect(() => validator.parse('507f1f77bcf86cd79943901G')).toThrow('Invalid ObjectID'); // Invalid char
      });

      it('should validate 24 character hex string', () => {
        // Arrange
        const validator = CommonValidators.objectId();

        // Act & Assert
        expect(() => validator.parse('507f1f77bcf86cd799439011')).not.toThrow();
        expect(() => validator.parse('507f1f77bcf86cd79943901')).toThrow(); // 23 chars
        expect(() => validator.parse('507f1f77bcf86cd7994390111')).toThrow(); // 25 chars
      });
    });

    describe('email', () => {
      it('should validate valid email', () => {
        // Arrange
        const validator = CommonValidators.email();

        // Act & Assert
        expect(() => validator.parse('test@example.com')).not.toThrow();
        expect(() => validator.parse('user.name+tag@example.co.uk')).not.toThrow();
      });

      it('should reject invalid email', () => {
        // Arrange
        const validator = CommonValidators.email();

        // Act & Assert
        expect(() => validator.parse('invalid')).toThrow('Invalid email');
        expect(() => validator.parse('@example.com')).toThrow('Invalid email');
        expect(() => validator.parse('user@')).toThrow('Invalid email');
      });
    });

    describe('password', () => {
      it('should validate password with all requirements', () => {
        // Arrange
        const validator = CommonValidators.password();

        // Act & Assert
        expect(() => validator.parse('Password1')).not.toThrow();
        expect(() => validator.parse('SecurePass123')).not.toThrow();
      });

      it('should reject password less than 8 characters', () => {
        // Arrange
        const validator = CommonValidators.password();

        // Act & Assert
        expect(() => validator.parse('Pass1')).toThrow('at least 8 characters');
      });

      it('should reject password without uppercase', () => {
        // Arrange
        const validator = CommonValidators.password();

        // Act & Assert
        expect(() => validator.parse('password1')).toThrow('uppercase letter');
      });

      it('should reject password without lowercase', () => {
        // Arrange
        const validator = CommonValidators.password();

        // Act & Assert
        expect(() => validator.parse('PASSWORD1')).toThrow('lowercase letter');
      });

      it('should reject password without number', () => {
        // Arrange
        const validator = CommonValidators.password();

        // Act & Assert
        expect(() => validator.parse('Password')).toThrow('at least one number');
      });
    });

    describe('strongPassword', () => {
      it('should validate strong password with special character', () => {
        // Arrange
        const validator = CommonValidators.strongPassword();

        // Act & Assert
        expect(() => validator.parse('Password1!')).not.toThrow();
        expect(() => validator.parse('Secure@Pass123')).not.toThrow();
      });

      it('should reject password without special character', () => {
        // Arrange
        const validator = CommonValidators.strongPassword();

        // Act & Assert
        expect(() => validator.parse('Password1')).toThrow('special character');
      });
    });

    describe('username', () => {
      it('should validate valid username', () => {
        // Arrange
        const validator = CommonValidators.username();

        // Act & Assert
        expect(() => validator.parse('user123')).not.toThrow();
        expect(() => validator.parse('test_user')).not.toThrow();
        expect(() => validator.parse('user-name')).not.toThrow();
      });

      it('should reject username less than 3 characters', () => {
        // Arrange
        const validator = CommonValidators.username();

        // Act & Assert
        expect(() => validator.parse('ab')).toThrow('at least 3 characters');
      });

      it('should reject username more than 30 characters', () => {
        // Arrange
        const validator = CommonValidators.username();

        // Act & Assert
        expect(() => validator.parse('a'.repeat(31))).toThrow('at most 30 characters');
      });

      it('should reject username with invalid characters', () => {
        // Arrange
        const validator = CommonValidators.username();

        // Act & Assert
        expect(() => validator.parse('user@name')).toThrow('letters, numbers, underscores, and hyphens');
        expect(() => validator.parse('user name')).toThrow('letters, numbers, underscores, and hyphens');
      });
    });

    describe('url', () => {
      it('should validate valid URL', () => {
        // Arrange
        const validator = CommonValidators.url();

        // Act & Assert
        expect(() => validator.parse('https://example.com')).not.toThrow();
        expect(() => validator.parse('http://localhost:3000')).not.toThrow();
      });

      it('should reject invalid URL', () => {
        // Arrange
        const validator = CommonValidators.url();

        // Act & Assert
        expect(() => validator.parse('not-a-url')).toThrow('Invalid URL');
        expect(() => validator.parse('example.com')).toThrow('Invalid URL'); // Missing protocol
      });
    });

    describe('pagination', () => {
      it('should validate pagination with defaults', () => {
        // Arrange
        const validator = CommonValidators.pagination();

        // Act
        const result = validator.parse({});

        // Assert
        expect(result).toEqual({ page: 1, limit: 20 });
      });

      it('should validate custom pagination values', () => {
        // Arrange
        const validator = CommonValidators.pagination();

        // Act
        const result = validator.parse({ page: 2, limit: 50 });

        // Assert
        expect(result).toEqual({ page: 2, limit: 50 });
      });

      it('should reject invalid pagination values', () => {
        // Arrange
        const validator = CommonValidators.pagination();

        // Act & Assert
        expect(() => validator.parse({ page: 0 })).toThrow(); // Page must be >= 1
        expect(() => validator.parse({ page: -1 })).toThrow();
        expect(() => validator.parse({ limit: 0 })).toThrow(); // Limit must be >= 1
        expect(() => validator.parse({ limit: 101 })).toThrow(); // Limit must be <= 100
      });
    });

    describe('sort', () => {
      it('should validate sort parameters', () => {
        // Arrange
        const validator = CommonValidators.sort();

        // Act
        const result = validator.parse({ field: 'createdAt', order: 'desc' });

        // Assert
        expect(result).toEqual({ field: 'createdAt', order: 'desc' });
      });

      it('should reject invalid order', () => {
        // Arrange
        const validator = CommonValidators.sort();

        // Act & Assert
        expect(() => validator.parse({ field: 'name', order: 'invalid' })).toThrow();
      });
    });
  });

  describe('createUserSchemas', () => {
    it('should create user schemas', () => {
      // Act
      const schemas = ValidatorFactory.createUserSchemas();

      // Assert
      expect(schemas).toHaveProperty('createUserSchema');
      expect(schemas).toHaveProperty('updateUserSchema');
      expect(schemas).toHaveProperty('userIdSchema');
    });

    it('should validate create user data', () => {
      // Arrange
      const { createUserSchema } = ValidatorFactory.createUserSchemas();

      // Act
      const result = createUserSchema.parse({
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      });

      // Assert
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.role).toBe('admin');
    });

    it('should reject invalid create user data', () => {
      // Arrange
      const { createUserSchema } = ValidatorFactory.createUserSchemas();

      // Act & Assert
      expect(() => createUserSchema.parse({ email: 'invalid' })).toThrow();
      expect(() => createUserSchema.parse({ email: 'test@example.com', role: 'invalid_role' })).toThrow();
    });
  });

  describe('createAPIKeySchemas', () => {
    it('should create API key schemas', () => {
      // Act
      const schemas = ValidatorFactory.createAPIKeySchemas();

      // Assert
      expect(schemas).toHaveProperty('createAPIKeySchema');
      expect(schemas).toHaveProperty('rotateAPIKeySchema');
      expect(schemas).toHaveProperty('keyIdSchema');
    });

    it('should validate create API key data', () => {
      // Arrange
      const { createAPIKeySchema } = ValidatorFactory.createAPIKeySchemas();

      // Act
      const result = createAPIKeySchema.parse({
        name: 'My API Key',
        expiresIn: 30,
      });

      // Assert
      expect(result.name).toBe('My API Key');
      expect(result.expiresIn).toBe(30);
    });

    it('should reject invalid API key data', () => {
      // Arrange
      const { createAPIKeySchema } = ValidatorFactory.createAPIKeySchemas();

      // Act & Assert
      expect(() => createAPIKeySchema.parse({ name: '' })).toThrow('required');
      expect(() => createAPIKeySchema.parse({ name: 'a'.repeat(101) })).toThrow();
      expect(() => createAPIKeySchema.parse({ name: 'Test', expiresIn: 0 })).toThrow();
      expect(() => createAPIKeySchema.parse({ name: 'Test', expiresIn: 366 })).toThrow();
    });
  });

  describe('createContentSchemas', () => {
    it('should create content schemas', () => {
      // Act
      const schemas = ValidatorFactory.createContentSchemas();

      // Assert
      expect(schemas).toHaveProperty('createContentSchema');
      expect(schemas).toHaveProperty('updateContentSchema');
      expect(schemas).toHaveProperty('contentQuerySchema');
    });

    it('should validate create content data', () => {
      // Arrange
      const { createContentSchema } = ValidatorFactory.createContentSchemas();

      // Act
      const result = createContentSchema.parse({
        title: 'Test Article',
        content: 'Content body',
        contentType: 'article',
        tags: ['test', 'example'],
      });

      // Assert
      expect(result.title).toBe('Test Article');
      expect(result.contentType).toBe('article');
      expect(result.tags).toEqual(['test', 'example']);
    });

    it('should allow partial updates', () => {
      // Arrange
      const { updateContentSchema } = ValidatorFactory.createContentSchemas();

      // Act
      const result = updateContentSchema.parse({ title: 'New Title' });

      // Assert
      expect(result.title).toBe('New Title');
    });
  });

  describe('createPromptSchemas', () => {
    it('should create prompt schemas', () => {
      // Act
      const schemas = ValidatorFactory.createPromptSchemas();

      // Assert
      expect(schemas).toHaveProperty('createPromptSchema');
      expect(schemas).toHaveProperty('updatePromptSchema');
      expect(schemas).toHaveProperty('executePromptSchema');
    });

    it('should validate create prompt data', () => {
      // Arrange
      const { createPromptSchema } = ValidatorFactory.createPromptSchemas();

      // Act
      const result = createPromptSchema.parse({
        title: 'Test Prompt',
        template: 'Hello {name}',
        variables: ['name'],
        isPublic: true,
      });

      // Assert
      expect(result.title).toBe('Test Prompt');
      expect(result.template).toBe('Hello {name}');
      expect(result.isPublic).toBe(true);
    });

    it('should have default isPublic value', () => {
      // Arrange
      const { createPromptSchema } = ValidatorFactory.createPromptSchemas();

      // Act
      const result = createPromptSchema.parse({
        title: 'Test',
        template: 'Template',
      });

      // Assert
      expect(result.isPublic).toBe(false);
    });
  });

  describe('getCommonValidators', () => {
    it('should return CommonValidators class', () => {
      // Act
      const validators = ValidatorFactory.getCommonValidators();

      // Assert
      expect(validators).toBe(CommonValidators);
      expect(validators.email).toBeDefined();
      expect(validators.password).toBeDefined();
    });
  });

  describe('Convenience Exports', () => {
    it('should export createUserSchemas', () => {
      // Arrange
      const { createUserSchemas } = require('../ValidatorFactory');

      // Act
      const schemas = createUserSchemas();

      // Assert
      expect(schemas).toHaveProperty('createUserSchema');
    });

    it('should export createAPIKeySchemas', () => {
      // Arrange
      const { createAPIKeySchemas } = require('../ValidatorFactory');

      // Act
      const schemas = createAPIKeySchemas();

      // Assert
      expect(schemas).toHaveProperty('createAPIKeySchema');
    });

    it('should export CommonValidators', () => {
      // Arrange
      const { CommonValidators: CV } = require('../ValidatorFactory');

      // Act & Assert
      expect(CV).toBeDefined();
      expect(CV.email).toBeDefined();
    });
  });
});
