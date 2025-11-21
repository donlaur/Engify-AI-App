'use client';
import { clientLogger } from '@/lib/logging/client-logger';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { sanitizeErrorMessage } from '@/lib/utils/sanitize-error';

/**
 * Props for the AdminErrorFallback component
 */
interface AdminErrorFallbackProps {
  /**
   * The error that was caught by the error boundary
   */
  error: Error;

  /**
   * Optional retry function to reset the error boundary
   * When provided, displays a retry button
   */
  retry?: () => void;
}

/**
 * AdminErrorFallback - Error Display Component for Admin Panels
 *
 * A user-friendly error display component that shows error information with
 * the ability to retry or copy error details for debugging.
 *
 * Features:
 * - Displays sanitized error message safe for production
 * - Shows stack trace in development mode only (hidden in production)
 * - Provides retry button when retry function is available
 * - Copy error button for easy debugging
 * - Responsive design with red color scheme for errors
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AdminErrorFallback error={new Error('Something went wrong')} />
 *
 * // With retry functionality
 * <AdminErrorFallback
 *   error={error}
 *   retry={() => window.location.reload()}
 * />
 * ```
 *
 * @remarks
 * This component is typically used as the default fallback UI for AdminErrorBoundary,
 * but can also be used standalone for displaying error states.
 *
 * Security considerations:
 * - Error messages are sanitized to prevent information disclosure
 * - Stack traces are only shown in development mode
 * - Technical details are hidden from production users
 */
export function AdminErrorFallback({ error, retry }: AdminErrorFallbackProps) {
  const [copied, setCopied] = useState(false);
  const isDevelopment = process.env.NODE_ENV !== 'production';

  /**
   * Sanitize the error message for safe display in production
   * Removes internal technology references and sensitive details
   */
  const safeMessage = sanitizeErrorMessage(
    error.message || 'An unexpected error occurred in the admin panel'
  );

  /**
   * Get the full error details for copying (development only)
   * Includes error message, name, and stack trace
   */
  const getFullErrorDetails = (): string => {
    const details = [
      `Error: ${error.name}`,
      `Message: ${error.message}`,
      '',
      'Stack Trace:',
      error.stack || 'No stack trace available',
    ];
    return details.join('\n');
  };

  /**
   * Copy error details to clipboard for debugging
   * Shows a checkmark icon briefly after copying
   */
  const handleCopyError = async (): Promise<void> => {
    try {
      const errorDetails = isDevelopment
        ? getFullErrorDetails()
        : `Error: ${safeMessage}`;

      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      clientLogger.error('Failed to copy error to clipboard', { component: 'AdminErrorFallback', error: err });
    }
  };

  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Icons.alertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <CardTitle className="text-red-900 dark:text-red-100">
              Something went wrong
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300 mt-2">
              {safeMessage}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stack trace - Development only */}
        {isDevelopment && error.stack && (
          <div className="rounded-md bg-red-100 dark:bg-red-900 p-3 border border-red-200 dark:border-red-800">
            <p className="text-xs font-semibold text-red-900 dark:text-red-100 mb-2">
              Stack Trace (Development Only):
            </p>
            <pre className="text-xs text-red-800 dark:text-red-200 overflow-x-auto whitespace-pre-wrap break-words">
              {error.stack}
            </pre>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Retry button - only shown if retry function is provided */}
          {retry && (
            <Button
              onClick={retry}
              variant="default"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600"
            >
              <Icons.refresh className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}

          {/* Copy error button */}
          <Button
            onClick={handleCopyError}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
          >
            {copied ? (
              <>
                <Icons.check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Icons.copy className="mr-2 h-4 w-4" />
                Copy Error
              </>
            )}
          </Button>
        </div>

        {/* Development mode indicator */}
        {isDevelopment && (
          <p className="text-xs text-red-600 dark:text-red-400 italic">
            Development mode: Full error details are visible. In production, only
            sanitized messages will be shown.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
