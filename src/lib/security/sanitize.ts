/**
 * XSS Sanitization Utilities
 * Sanitizes user-generated content before storage and display
 *
 * NOTE: Uses simple regex-based sanitization for serverless compatibility
 * For client-side rich content, use DOMPurify directly
 */

/**
 * Sanitize plain text (removes HTML, scripts, etc.)
 * Use for user comments, titles, descriptions
 *
 * Serverless-safe implementation without DOM dependencies
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // Remove HTML tags
  let cleaned = input.replace(/<[^>]*>/g, '');

  // Remove script tags and their content
  cleaned = cleaned.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // Remove style tags and their content
  cleaned = cleaned.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    ''
  );

  // Remove event handlers
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  cleaned = cleaned.replace(/javascript:/gi, '');

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

  // Trim whitespace
  return cleaned.trim();
}

/**
 * Sanitize rich content (allows safe HTML)
 * Use for content that may contain formatting
 *
 * NOTE: For true rich content sanitization, use DOMPurify on client-side
 * This is a basic server-side filter
 */
export function sanitizeRichContent(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // For now, same as sanitizeText for serverless compatibility
  // TODO: Implement proper rich content sanitization if needed
  return sanitizeText(input);
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
    } else if (
      typeof sanitized[key] === 'object' &&
      sanitized[key] !== null &&
      !Array.isArray(sanitized[key])
    ) {
      sanitized[key] = sanitizeObject(
        sanitized[key] as Record<string, unknown>
      ) as T[typeof key];
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = (sanitized[key] as unknown[]).map((item) =>
        typeof item === 'string' ? sanitizeText(item) : item
      ) as T[typeof key];
    }
  }

  return sanitized;
}
