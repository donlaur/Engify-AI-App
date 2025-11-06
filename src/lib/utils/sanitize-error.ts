/**
 * Error Message Sanitization for Client Display
 * 
 * Removes internal technology references (MongoDB, database names, etc.)
 * and technical details that shouldn't be exposed to users.
 * 
 * Security: Prevents information disclosure about backend infrastructure
 */

/**
 * Sanitize error messages for client display
 * Removes internal technology references (e.g., MongoDB, database names)
 * and technical error details that shouldn't be exposed to users
 */
export function sanitizeErrorMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return 'An unexpected error occurred';
  }

  // Remove MongoDB/database references
  const sanitized = message
    .replace(/mongodb/gi, 'data store')
    .replace(/mongo/gi, 'database')
    .replace(/database connection failed/gi, 'connection failed')
    .replace(/connection timeout/gi, 'request timeout')
    .replace(/connection refused/gi, 'connection failed')
    .trim();

  // If message is about undefined variables, return generic error
  if (sanitized.includes('is not defined') || sanitized.includes('undefined')) {
    return 'An unexpected error occurred';
  }

  // If message contains internal paths or stack traces, return generic error
  if (
    sanitized.includes('at ') ||
    sanitized.includes('Error:') ||
    sanitized.includes('stack') ||
    sanitized.includes('ReferenceError') ||
    sanitized.includes('TypeError')
  ) {
    return 'An unexpected error occurred';
  }

  // If message contains file paths or internal system details
  if (
    sanitized.includes('/') ||
    sanitized.includes('\\') ||
    sanitized.includes('node_modules') ||
    sanitized.includes('.ts') ||
    sanitized.includes('.js')
  ) {
    return 'An unexpected error occurred';
  }

  return sanitized || 'An unexpected error occurred';
}

