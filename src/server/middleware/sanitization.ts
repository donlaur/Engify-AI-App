/**
 * Sanitization Middleware for tRPC
 * 
 * Automatically sanitizes all user input to prevent XSS attacks
 * Red Hat Review - Critical Fix: Input Sanitization
 * 
 * SECURITY STANDARD: This middleware MUST be applied to all user-facing procedures
 */

import { TRPCError } from '@trpc/server';
import { sanitizeObject, containsScriptTag } from '@/lib/security/sanitizer';
import { t } from '../trpc';

/**
 * Sanitization middleware
 * Sanitizes all string inputs in the request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizationMiddleware = t.middleware(async ({ next, rawInput }: { next: any; rawInput: unknown }) => {
  // Check for obvious XSS attempts
  if (typeof rawInput === 'string' && containsScriptTag(rawInput)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid input: Potential XSS detected',
    });
  }

  if (rawInput && typeof rawInput === 'object') {
    // Check all string values for script tags
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkObject = (obj: any): boolean => {
      for (const value of Object.values(obj)) {
        if (typeof value === 'string' && containsScriptTag(value)) {
          return true;
        }
        if (value && typeof value === 'object') {
          if (checkObject(value)) {
            return true;
          }
        }
      }
      return false;
    };

    if (checkObject(rawInput)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid input: Potential XSS detected',
      });
    }
  }

  // Sanitize the input
  let sanitizedInput = rawInput;
  
  if (typeof rawInput === 'string') {
    sanitizedInput = sanitizeObject({ value: rawInput }, 'basic').value;
  } else if (rawInput && typeof rawInput === 'object') {
    sanitizedInput = sanitizeObject(rawInput as Record<string, unknown>, 'basic');
  }

  // Continue with sanitized input
  return next({
    ctx: {
      sanitizedInput,
    },
  });
});

/**
 * Create a sanitized procedure
 * Use this for all procedures that accept user input
 */
export const sanitizedProcedure = t.procedure.use(sanitizationMiddleware);
