'use client';
import { clientLogger } from '@/lib/logging/client-logger';

import { Component, ReactNode, ErrorInfo } from 'react';
import { AdminErrorFallback } from './AdminErrorFallback';

/**
 * Props for the AdminErrorBoundary component
 */
interface AdminErrorBoundaryProps {
  /**
   * Child components to be wrapped by the error boundary
   */
  children: ReactNode;

  /**
   * Optional custom fallback render function
   * @param error - The error that was caught
   * @param retry - Function to reset the error boundary and retry
   * @returns ReactNode to display when an error occurs
   */
  fallback?: (error: Error, retry: () => void) => ReactNode;

  /**
   * Optional error handler callback
   * Called when an error is caught by the boundary
   * @param error - The error that was caught
   * @param errorInfo - React error info including component stack
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for the AdminErrorBoundary component
 */
interface AdminErrorBoundaryState {
  /**
   * Whether an error has been caught
   */
  hasError: boolean;

  /**
   * The error that was caught, if any
   */
  error: Error | null;
}

/**
 * AdminErrorBoundary - Production-ready Error Boundary for Admin Panels
 *
 * A React error boundary component that catches JavaScript errors anywhere in the
 * child component tree, logs those errors, and displays a fallback UI instead of
 * crashing the entire admin panel.
 *
 * @example
 * ```tsx
 * // Basic usage with default fallback
 * <AdminErrorBoundary>
 *   <MyAdminPanel />
 * </AdminErrorBoundary>
 *
 * // With custom fallback
 * <AdminErrorBoundary
 *   fallback={(error, retry) => (
 *     <div>
 *       <p>Custom error: {error.message}</p>
 *       <button onClick={retry}>Retry</button>
 *     </div>
 *   )}
 * >
 *   <MyAdminPanel />
 * </AdminErrorBoundary>
 *
 * // With error logging
 * <AdminErrorBoundary
 *   onError={(error, errorInfo) => {
 *     logErrorToService(error, errorInfo);
 *   }}
 * >
 *   <MyAdminPanel />
 * </AdminErrorBoundary>
 * ```
 *
 * @remarks
 * Error boundaries must be class components because they use lifecycle methods
 * that are not available in functional components.
 *
 * Error boundaries do NOT catch errors in:
 * - Event handlers (use try-catch instead)
 * - Asynchronous code (e.g., setTimeout, requestAnimationFrame callbacks)
 * - Server-side rendering
 * - Errors thrown in the error boundary itself
 *
 * @class AdminErrorBoundary
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class AdminErrorBoundary extends Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  /**
   * Initialize the error boundary with no error state
   */
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Static lifecycle method called when an error is thrown in a descendant component
   * Updates state to trigger a re-render with the fallback UI
   *
   * @param error - The error that was thrown
   * @returns Updated state object
   */
  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Lifecycle method called after an error has been thrown by a descendant component
   * Used for logging errors and calling the optional onError callback
   *
   * @param error - The error that was thrown
   * @param errorInfo - Object containing component stack trace
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error using clientLogger
    clientLogger.componentError('AdminErrorBoundary', error, {
      componentStack: errorInfo.componentStack,
    });

    // Call optional error handler callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Resets the error boundary state, allowing the component tree to retry rendering
   * This is passed to the fallback UI to allow users to retry after an error
   */
  retry = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  /**
   * Renders either the children or the fallback UI based on error state
   */
  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }

      // Otherwise, use default AdminErrorFallback component
      return <AdminErrorFallback error={this.state.error} retry={this.retry} />;
    }

    // No error, render children normally
    return this.props.children;
  }
}
