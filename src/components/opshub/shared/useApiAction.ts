import { useState } from 'react';
import { useAdminToast } from '@/hooks/opshub';
import { clientLogger } from '@/lib/logging/client-logger';

/**
 * Options for API action execution
 * 
 * @interface ApiActionOptions
 * @template T - The return type of the action
 */
interface ApiActionOptions<T> {
  /** Success message to display, or function to generate message from result */
  successMessage?: string | ((result: T) => string);
  /** Custom error message to display on failure */
  errorMessage?: string;
  /** Callback executed on successful action completion */
  onSuccess?: (result: T) => void | Promise<void>;
  /** Callback executed on action failure */
  onError?: (error: Error) => void;
}

/**
 * useApiAction Hook
 * 
 * A reusable React hook for handling asynchronous API actions with built-in
 * loading states, error handling, and toast notifications. Provides a consistent
 * pattern for API calls across admin panels.
 * 
 * @pattern CUSTOM_HOOK
 * @principle DRY - Eliminates boilerplate for API action handling
 * 
 * @features
 * - Automatic loading state management
 * - Error handling with toast notifications
 * - Success callbacks and messages
 * - Error logging via clientLogger
 * - Type-safe generic implementation
 * 
 * @returns Object containing execute function and loading state
 * @returns {Function} execute - Function to execute API actions
 * @returns {boolean} loading - Current loading state
 * 
 * @example
 * ```tsx
 * const { execute, loading } = useApiAction();
 * 
 * const handleSave = async () => {
 *   await execute(
 *     () => fetch('/api/save', { method: 'POST', body: data }),
 *     {
 *       successMessage: 'Data saved successfully',
 *       errorMessage: 'Failed to save data',
 *       onSuccess: () => {
 *         // Refresh data or navigate
 *         router.refresh();
 *       },
 *     }
 *   );
 * };
 * ```
 * 
 * @usage
 * Used throughout OpsHub admin panels for consistent API action handling.
 * Reduces boilerplate and ensures consistent error handling and user feedback.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */
export function useApiAction() {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useAdminToast();

  /**
   * Execute an API action with loading and error handling
   * 
   * @template T - The return type of the action
   * @param action - Async function that performs the API call
   * @param options - Optional configuration for success/error handling
   * @returns Promise resolving to the action result, or null on error
   * 
   * @example
   * ```tsx
   * const result = await execute(
   *   () => api.updateUser(userId, data),
   *   {
   *     successMessage: (result) => `User ${result.name} updated`,
   *     onSuccess: () => router.refresh(),
   *   }
   * );
   * ```
   */
  const execute = async <T = void>(
    action: () => Promise<T>,
    options?: ApiActionOptions<T>
  ): Promise<T | null> => {
    try {
      setLoading(true);
      const result = await action();

      if (options?.successMessage) {
        const message =
          typeof options.successMessage === 'function'
            ? options.successMessage(result)
            : options.successMessage;
        success(message);
      }

      if (options?.onSuccess) {
        await options.onSuccess(result);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      const errorMessage = options?.errorMessage || error.message;

      showError('Error', errorMessage);
      clientLogger.apiError('API action', error, { component: 'useApiAction', errorMessage });

      if (options?.onError) {
        options.onError(error);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
}

