/**
 * Input Sanitization Utilities
 * 
 * Prevents XSS attacks by sanitizing user input
 * Red Hat Review - Critical Fix: Input Sanitization
 * 
 * SECURITY STANDARD: All user-generated content MUST be sanitized
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization configuration for different contexts
 */
const SANITIZE_CONFIG = {
  // Strict: Remove all HTML tags (for plain text fields)
  strict: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  
  // Basic: Allow safe formatting tags only
  basic: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  
  // Rich: Allow common rich text tags (for markdown/rich text editors)
  rich: {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'b', 'i', 'em', 'strong', 'u', 's', 'code', 'pre',
      'ul', 'ol', 'li',
      'blockquote',
      'a',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
  },
};

/**
 * Sanitize HTML string to prevent XSS
 * @param dirty - Potentially unsafe HTML string
 * @param level - Sanitization level (strict, basic, rich)
 * @returns Sanitized safe string
 */
export function sanitizeHtml(
  dirty: string,
  level: 'strict' | 'basic' | 'rich' = 'strict'
): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const config = SANITIZE_CONFIG[level];
  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize plain text (removes all HTML)
 * Use for: usernames, titles, search queries, etc.
 */
export function sanitizeText(input: string): string {
  return sanitizeHtml(input, 'strict');
}

/**
 * Sanitize user prompt content
 * Allows basic formatting but removes dangerous tags
 */
export function sanitizePrompt(prompt: string): string {
  return sanitizeHtml(prompt, 'basic');
}

/**
 * Sanitize rich content (markdown, descriptions, etc.)
 * Allows more formatting but still prevents XSS
 */
export function sanitizeRichContent(content: string): string {
  return sanitizeHtml(content, 'rich');
}

/**
 * Sanitize object recursively
 * Sanitizes all string values in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  level: 'strict' | 'basic' | 'rich' = 'strict'
): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(value, level);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeHtml(item, level) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, level);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Escape HTML entities for safe display
 * Use when you need to display user input as-is but safely
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') {
    return '';
  }

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate that string doesn't contain script tags
 * Additional layer of defense
 */
export function containsScriptTag(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const scriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
  const onEventPattern = /\bon\w+\s*=/gi;
  const javascriptPattern = /javascript:/gi;

  return (
    scriptPattern.test(input) ||
    onEventPattern.test(input) ||
    javascriptPattern.test(input)
  );
}

/**
 * Validate and sanitize URL
 * Prevents javascript: and data: URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove whitespace
  url = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
  ];

  const lowerUrl = url.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }

  // Only allow http, https, mailto
  if (!/^(https?|mailto):/i.test(url)) {
    return '';
  }

  return url;
}

/**
 * Sanitization middleware for tRPC
 * Automatically sanitizes all string inputs
 */
export function createSanitizationMiddleware(
  level: 'strict' | 'basic' | 'rich' = 'strict'
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (input: any) => {
    if (typeof input === 'string') {
      return sanitizeHtml(input, level);
    }
    
    if (input && typeof input === 'object') {
      return sanitizeObject(input, level);
    }
    
    return input;
  };
}
