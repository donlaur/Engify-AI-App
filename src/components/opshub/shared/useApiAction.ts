import { useState } from 'react';
import { useAdminToast } from '@/hooks/opshub';
import { clientLogger } from '@/lib/logging/client-logger';

/**
 * Hook for handling API actions with loading and error states
 */
export function useApiAction() {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useAdminToast();

  const execute = async <T = void>(
    action: () => Promise<T>,
    options?: {
      successMessage?: string | ((result: T) => string);
      errorMessage?: string;
      onSuccess?: (result: T) => void | Promise<void>;
      onError?: (error: Error) => void;
    }
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

