/**
 * Zod Validation Schemas
 * 
 * Centralized validation for all API inputs
 * Prevents injection attacks and ensures data integrity
 */

import { z } from 'zod';

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const userEmailSchema = z.string().email().max(255);
export const userPasswordSchema = z.string().min(8).max(128);
export const userNameSchema = z.string().min(1).max(255);

export const loginSchema = z.object({
  email: userEmailSchema,
  password: userPasswordSchema,
});

export const signupSchema = z.object({
  email: userEmailSchema,
  password: userPasswordSchema,
  name: userNameSchema,
});

export const updateProfileSchema = z.object({
  name: userNameSchema.optional(),
  email: userEmailSchema.optional(),
});

// ============================================================================
// PROMPT SCHEMAS
// ============================================================================

export const promptContentSchema = z.string()
  .min(1, 'Prompt cannot be empty')
  .max(10000, 'Prompt too long (max 10,000 characters)');

export const promptExecutionSchema = z.object({
  prompt: promptContentSchema,
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gemini-pro']).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
  pattern: z.string().optional(),
});

// ============================================================================
// LEARNING RESOURCE SCHEMAS
// ============================================================================

export const learningResourceQuerySchema = z.object({
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  featured: z.enum(['true', 'false']).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional(),
  skip: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(0)).optional(),
});

export const learningResourceSlugSchema = z.string()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9-]+$/, 'Invalid slug format');

// ============================================================================
// WORKBENCH SCHEMAS
// ============================================================================

export const workbenchExecutionSchema = z.object({
  prompt: promptContentSchema,
  provider: z.enum(['openai', 'anthropic', 'google', 'groq']),
  model: z.string().min(1).max(100),
  systemPrompt: z.string().max(5000).optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
});

// ============================================================================
// PATTERN SCHEMAS
// ============================================================================

export const patternIdSchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Invalid pattern ID');

export const patternApplicationSchema = z.object({
  patternId: patternIdSchema,
  userPrompt: promptContentSchema,
  context: z.record(z.any()).optional(),
});

// ============================================================================
// FEEDBACK SCHEMAS
// ============================================================================

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other']),
  title: z.string().min(1).max(255),
  description: z.string().min(10).max(5000),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  email: userEmailSchema.optional(),
});

// ============================================================================
// RATE LIMIT SCHEMAS
// ============================================================================

export const rateLimitKeySchema = z.string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9:_-]+$/, 'Invalid rate limit key');

// ============================================================================
// CONTENT FILTERING
// ============================================================================

const PROHIBITED_PATTERNS = [
  /\b(password|secret|api[_-]?key|token|credential)\b/i,
  /\b(credit[_-]?card|ssn|social[_-]?security)\b/i,
];

export function containsSensitiveData(text: string): boolean {
  return PROHIBITED_PATTERNS.some(pattern => pattern.test(text));
}

export function sanitizeInput(text: string): string {
  // Remove null bytes
  let sanitized = text.replace(/\0/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Limit length
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }
  
  return sanitized;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: `${firstError.path.join('.')}: ${firstError.message}`,
      };
    }
    return {
      success: false,
      error: 'Validation failed',
    };
  }
}
