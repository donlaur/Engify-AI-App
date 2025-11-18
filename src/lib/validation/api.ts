/**
 * API Validation Utilities
 *
 * Reusable validation helpers for common API patterns
 * Provides enterprise-grade input validation and sanitization
 */

import { z } from 'zod';
import { NextResponse } from 'next/server';
import { sanitizeText } from '@/lib/security/sanitize';

/**
 * Common validation schemas for API requests
 */
export const CommonSchemas = {
  /**
   * Pagination parameters
   * Enforces safe limits to prevent DOS attacks
   */
  pagination: z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    skip: z.coerce.number().int().min(0).max(10000).default(0),
  }),

  /**
   * Search query validation
   * Prevents injection and DOS via overly long queries
   */
  search: z.string().min(1).max(200).transform(sanitizeText),

  /**
   * Email validation with sanitization
   */
  email: z.string().email().max(255).transform((email) => email.toLowerCase().trim()),

  /**
   * URL validation
   */
  url: z.string().url().max(2048),

  /**
   * Safe string (alphanumeric + common safe chars)
   */
  safeString: z
    .string()
    .min(1)
    .max(500)
    .regex(/^[a-zA-Z0-9\s\-_.,!?@#$%&()'":;]+$/, 'Contains invalid characters')
    .transform(sanitizeText),

  /**
   * Date range validation
   */
  dateRange: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  }).refine(
    (data) => data.endDate >= data.startDate,
    {
      message: 'End date must be after start date',
    }
  ),

  /**
   * Array of IDs (max 100 to prevent DOS)
   */
  idArray: z.array(z.string().min(1).max(100)).min(1).max(100),
};

/**
 * Validation error response builder
 * Creates consistent error responses for validation failures
 */
export function validationErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: error.flatten(),
      fields: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    },
    { status: 400 }
  );
}

/**
 * Safe parse with automatic error response
 * Returns validated data or NextResponse with error
 */
export function safeValidate<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      response: validationErrorResponse(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Sanitize object fields recursively
 * Applies sanitizeText to all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else if (value !== null && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Request body size limiter
 * Prevents DOS via oversized payloads
 */
export function validateBodySize(body: unknown, maxSizeKB = 100): boolean {
  const bodyString = JSON.stringify(body);
  const sizeKB = new Blob([bodyString]).size / 1024;
  return sizeKB <= maxSizeKB;
}

/**
 * Rate limit exceeded response builder
 */
export function rateLimitResponse(retryAfter = 60) {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again after ${retryAfter} seconds.`,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}
