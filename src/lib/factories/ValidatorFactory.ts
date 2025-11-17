/**
 * Validator Factory
 *
 * Central factory for creating and managing Zod validation schemas.
 * Provides reusable schema components and common validators.
 *
 * Features:
 * - Common validation schemas
 * - Reusable schema components
 * - Type-safe validation
 * - Consistent error messages
 *
 * Usage:
 * ```typescript
 * const schema = ValidatorFactory.createUserSchema();
 * const validated = schema.parse(data);
 * ```
 *
 * @module ValidatorFactory
 */

import { z } from 'zod';

/**
 * Common field validators
 */
export class CommonValidators {
  /**
   * MongoDB ObjectID validator
   */
  static objectId() {
    return z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectID');
  }

  /**
   * Email validator
   */
  static email() {
    return z.string().email('Invalid email address');
  }

  /**
   * Password validator (min 8 chars, at least one uppercase, one lowercase, one number)
   */
  static password() {
    return z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number');
  }

  /**
   * Strong password validator (includes special characters)
   */
  static strongPassword() {
    return CommonValidators.password()
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');
  }

  /**
   * Username validator
   */
  static username() {
    return z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');
  }

  /**
   * URL validator
   */
  static url() {
    return z.string().url('Invalid URL');
  }

  /**
   * Phone number validator (basic)
   */
  static phone() {
    return z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number');
  }

  /**
   * Date validator (ISO string or Date object)
   */
  static date() {
    return z.union([z.string().datetime(), z.date()]).transform(val =>
      typeof val === 'string' ? new Date(val) : val
    );
  }

  /**
   * Pagination parameters
   */
  static pagination() {
    return z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
    });
  }

  /**
   * Sort parameters
   */
  static sort() {
    return z.object({
      field: z.string(),
      order: z.enum(['asc', 'desc']),
    });
  }
}

/**
 * Validator Factory
 */
export class ValidatorFactory {
  /**
   * Create User validation schemas
   */
  static createUserSchemas() {
    const createUserSchema = z.object({
      email: CommonValidators.email(),
      name: z.string().min(1, 'Name is required').optional(),
      role: z.enum(['user', 'admin', 'super_admin', 'org_admin', 'org_manager']).optional(),
      organizationId: CommonValidators.objectId().optional(),
      plan: z.enum(['free', 'pro', 'enterprise']).optional(),
    });

    const updateUserSchema = z.object({
      email: CommonValidators.email().optional(),
      name: z.string().min(1).optional(),
      role: z.enum(['user', 'admin', 'super_admin', 'org_admin', 'org_manager']).optional(),
      plan: z.enum(['free', 'pro', 'enterprise']).optional(),
    });

    const userIdSchema = z.object({
      userId: CommonValidators.objectId(),
    });

    return {
      createUserSchema,
      updateUserSchema,
      userIdSchema,
    };
  }

  /**
   * Create API Key validation schemas
   */
  static createAPIKeySchemas() {
    const createAPIKeySchema = z.object({
      name: z.string().min(1, 'Key name is required').max(100),
      expiresIn: z.number().int().min(1).max(365).optional(), // days
    });

    const rotateAPIKeySchema = z.object({
      apiKey: z.string().min(1, 'Current API key is required'),
    });

    const keyIdSchema = z.object({
      keyId: CommonValidators.objectId(),
    });

    return {
      createAPIKeySchema,
      rotateAPIKeySchema,
      keyIdSchema,
    };
  }

  /**
   * Create Content validation schemas
   */
  static createContentSchemas() {
    const createContentSchema = z.object({
      title: z.string().min(1, 'Title is required').max(200),
      content: z.string().min(1, 'Content is required'),
      contentType: z.enum(['article', 'snippet', 'prompt', 'template']),
      tags: z.array(z.string()).optional(),
      metadata: z.record(z.unknown()).optional(),
    });

    const updateContentSchema = createContentSchema.partial();

    const contentQuerySchema = z.object({
      ...CommonValidators.pagination().shape,
      contentType: z.enum(['article', 'snippet', 'prompt', 'template']).optional(),
      tags: z.array(z.string()).optional(),
      search: z.string().optional(),
    });

    return {
      createContentSchema,
      updateContentSchema,
      contentQuerySchema,
    };
  }

  /**
   * Create Prompt validation schemas
   */
  static createPromptSchemas() {
    const createPromptSchema = z.object({
      title: z.string().min(1, 'Title is required').max(200),
      description: z.string().optional(),
      template: z.string().min(1, 'Template is required'),
      variables: z.array(z.string()).optional(),
      category: z.string().optional(),
      isPublic: z.boolean().default(false),
    });

    const updatePromptSchema = createPromptSchema.partial();

    const executePromptSchema = z.object({
      variables: z.record(z.string()).optional(),
      modelId: z.string().optional(),
    });

    return {
      createPromptSchema,
      updatePromptSchema,
      executePromptSchema,
    };
  }

  /**
   * Get all common validators
   */
  static getCommonValidators() {
    return CommonValidators;
  }
}

/**
 * Convenience exports
 */
export const { createUserSchemas, createAPIKeySchemas, createContentSchemas, createPromptSchemas } = ValidatorFactory;
export { CommonValidators };
