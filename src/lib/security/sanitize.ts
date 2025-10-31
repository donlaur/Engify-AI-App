/**
 * XSS Sanitization Utilities
 * Sanitizes user-generated content before storage and display
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize plain text (removes HTML, scripts, etc.)
 * Use for user comments, titles, descriptions
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove all HTML tags and return plain text
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content but strip tags
  });
}

/**
 * Sanitize rich content (allows safe HTML)
 * Use for content that may contain formatting
 */
export function sanitizeRichContent(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Allow safe HTML tags only
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize object with string values
 * Recursively sanitizes all string fields
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeText(sanitized[key] as string) as T[typeof key];
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeObject(sanitized[key] as Record<string, unknown>) as T[typeof key];
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = (sanitized[key] as unknown[]).map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      ) as T[typeof key];
    }
  }
  
  return sanitized;
}

