/**
 * Validation Utilities
 * 
 * Reusable Zod schemas and validation helpers to eliminate duplication.
 * Common validation patterns used across API routes and forms.
 */

import { z } from 'zod';
import { CONTENT_LIMITS, PAGINATION, SECURITY } from '@/lib/constants/limits';

/**
 * Common ID validations
 */
export const commonSchemas = {
  // MongoDB ObjectId or custom string ID
  id: z.string().min(1, 'ID is required'),
  
  // ObjectId format (24 hex characters)
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
  
  // User ID (required in most operations)
  userId: z.string().min(1, 'User ID is required'),
  
  // Organization ID (optional for multi-tenancy)
  organizationId: z.string().optional(),
  
  // Email validation
  email: z.string().email('Invalid email address'),
  
  // Password validation
  password: z
    .string()
    .min(SECURITY.PASSWORD_MIN_LENGTH, `Password must be at least ${SECURITY.PASSWORD_MIN_LENGTH} characters`)
    .max(SECURITY.PASSWORD_MAX_LENGTH, `Password must not exceed ${SECURITY.PASSWORD_MAX_LENGTH} characters`),
  
  // Username validation
  username: z
    .string()
    .min(CONTENT_LIMITS.USERNAME_MIN, `Username must be at least ${CONTENT_LIMITS.USERNAME_MIN} characters`)
    .max(CONTENT_LIMITS.USERNAME_MAX, `Username must not exceed ${CONTENT_LIMITS.USERNAME_MAX} characters`)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  
  // Slug validation (URL-safe)
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  
  // URL validation
  url: z.string().url('Invalid URL'),
  
  // ISO date string
  isoDate: z.string().datetime('Invalid ISO date format'),
};

/**
 * Pagination schemas
 */
export const paginationSchemas = {
  // Basic pagination
  pagination: z.object({
    limit: z
      .number()
      .min(PAGINATION.MIN_PAGE_SIZE)
      .max(PAGINATION.MAX_PAGE_SIZE)
      .default(PAGINATION.DEFAULT_PAGE_SIZE),
    skip: z.number().min(0).default(PAGINATION.DEFAULT_SKIP),
  }),
  
  // Pagination with page number
  paginationWithPage: z.object({
    page: z.number().min(1).default(1),
    pageSize: z
      .number()
      .min(PAGINATION.MIN_PAGE_SIZE)
      .max(PAGINATION.MAX_PAGE_SIZE)
      .default(PAGINATION.DEFAULT_PAGE_SIZE),
  }),
  
  // Cursor-based pagination
  cursorPagination: z.object({
    cursor: z.string().optional(),
    limit: z
      .number()
      .min(PAGINATION.MIN_PAGE_SIZE)
      .max(PAGINATION.MAX_PAGE_SIZE)
      .default(PAGINATION.DEFAULT_PAGE_SIZE),
  }),
};

/**
 * Content validation schemas
 */
export const contentSchemas = {
  // Prompt title
  promptTitle: z
    .string()
    .min(CONTENT_LIMITS.PROMPT_TITLE_MIN, `Title must be at least ${CONTENT_LIMITS.PROMPT_TITLE_MIN} characters`)
    .max(CONTENT_LIMITS.PROMPT_TITLE_MAX, `Title must not exceed ${CONTENT_LIMITS.PROMPT_TITLE_MAX} characters`),
  
  // Prompt description
  promptDescription: z
    .string()
    .min(CONTENT_LIMITS.PROMPT_DESCRIPTION_MIN, `Description must be at least ${CONTENT_LIMITS.PROMPT_DESCRIPTION_MIN} characters`)
    .max(CONTENT_LIMITS.PROMPT_DESCRIPTION_MAX, `Description must not exceed ${CONTENT_LIMITS.PROMPT_DESCRIPTION_MAX} characters`),
  
  // Prompt content
  promptContent: z
    .string()
    .min(CONTENT_LIMITS.PROMPT_CONTENT_MIN, `Content must be at least ${CONTENT_LIMITS.PROMPT_CONTENT_MIN} characters`)
    .max(CONTENT_LIMITS.PROMPT_CONTENT_MAX, `Content must not exceed ${CONTENT_LIMITS.PROMPT_CONTENT_MAX} characters`),
  
  // Comment
  comment: z
    .string()
    .min(CONTENT_LIMITS.COMMENT_MIN, `Comment must be at least ${CONTENT_LIMITS.COMMENT_MIN} character`)
    .max(CONTENT_LIMITS.COMMENT_MAX, `Comment must not exceed ${CONTENT_LIMITS.COMMENT_MAX} characters`),
  
  // Tag
  tag: z
    .string()
    .min(CONTENT_LIMITS.TAG_MIN)
    .max(CONTENT_LIMITS.TAG_MAX)
    .regex(/^[a-z0-9-]+$/, 'Tags must be lowercase with hyphens only'),
  
  // Array of tags
  tags: z
    .array(
      z
        .string()
        .min(CONTENT_LIMITS.TAG_MIN)
        .max(CONTENT_LIMITS.TAG_MAX)
    )
    .max(CONTENT_LIMITS.MAX_TAGS, `Maximum ${CONTENT_LIMITS.MAX_TAGS} tags allowed`),
};

/**
 * Filter and search schemas
 */
export const filterSchemas = {
  // Search query
  search: z.object({
    query: z.string().min(2).max(100).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
  
  // Date range
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
  
  // Sort options
  sort: z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
};

/**
 * Rating and feedback schemas
 */
export const feedbackSchemas = {
  // Star rating (1-5)
  rating: z.number().min(1).max(5),
  
  // Dimension scores (1-10)
  dimensionScore: z.number().min(1).max(10),
  
  // Quick feedback action
  quickAction: z.enum(['like', 'save', 'helpful', 'not-helpful']),
  
  // Detailed rating
  detailedRating: z.object({
    rating: z.number().min(1).max(5),
    dimensions: z
      .object({
        clarity: z.number().min(1).max(10),
        usefulness: z.number().min(1).max(10),
        completeness: z.number().min(1).max(10),
        accuracy: z.number().min(1).max(10),
      })
      .optional(),
    comment: contentSchemas.comment.optional(),
    wouldRecommend: z.boolean().optional(),
  }),
};

/**
 * Request metadata schemas
 */
export const metadataSchemas = {
  // Client info
  clientInfo: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    referer: z.string().optional(),
  }),
  
  // Tracking params
  tracking: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
  }),
};

/**
 * Combined request schemas
 */
export const requestSchemas = {
  // Standard API request with auth
  authenticatedRequest: z.object({
    userId: commonSchemas.userId,
    organizationId: commonSchemas.organizationId,
  }),
  
  // Public API request (no auth)
  publicRequest: z.object({
    ...paginationSchemas.pagination.shape,
    search: z.string().optional(),
  }),
  
  // Admin request
  adminRequest: z.object({
    userId: commonSchemas.userId,
    organizationId: commonSchemas.organizationId,
    role: z.enum(['super_admin', 'admin']),
  }),
};

/**
 * Validation helper functions
 */

/**
 * Validate and sanitize input
 */
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validate with custom error messages
 */
export function validateWithMessage<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorMessage = 'Validation failed'
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || errorMessage,
      };
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Validate ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const result = commonSchemas.email.safeParse(email);
  return result.success;
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  // Basic sanitization - in production, use DOMPurify
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and normalize tags
 */
export function normalizeTags(tags: string[]): string[] {
  return tags
    .map((tag) => tag.toLowerCase().trim().replace(/\s+/g, '-'))
    .filter((tag, index, self) => tag.length >= CONTENT_LIMITS.TAG_MIN && self.indexOf(tag) === index)
    .slice(0, CONTENT_LIMITS.MAX_TAGS);
}

/**
 * Create a reusable validation middleware for API routes
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        throw new Error(firstError?.message || 'Validation failed');
      }
      throw new Error('Validation failed');
    }
  };
}
