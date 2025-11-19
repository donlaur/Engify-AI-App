'use client';

import { useToast, toast } from '@/hooks/use-toast';

/**
 * Toast variant types for different notification contexts
 */
export type ToastVariant = 'default' | 'success' | 'error' | 'info' | 'warning' | 'loading';

/**
 * Configuration options for toast notifications
 */
export interface ToastOptions {
  /** Title text for the toast */
  title: string;
  /** Optional description text for the toast */
  description?: string;
  /** Visual variant of the toast */
  variant?: ToastVariant;
  /** Duration in milliseconds before auto-dismiss (0 = persistent) */
  duration?: number;
}

/**
 * Return type for the useAdminToast hook
 */
export interface UseAdminToastReturn {
  /**
   * Display a success notification
   * @param title - Title text for the toast
   * @param description - Optional description text
   */
  success: (title: string, description?: string) => void;

  /**
   * Display an error notification
   * @param title - Title text for the toast
   * @param description - Optional description text
   */
  error: (title: string, description?: string) => void;

  /**
   * Display an informational notification
   * @param title - Title text for the toast
   * @param description - Optional description text
   */
  info: (title: string, description?: string) => void;

  /**
   * Display a warning notification
   * @param title - Title text for the toast
   * @param description - Optional description text
   */
  warning: (title: string, description?: string) => void;

  /**
   * Display a loading notification
   * @param title - Title text for the toast
   * @param description - Optional description text
   */
  loading: (title: string, description?: string) => void;

  /**
   * Display a custom toast with full configuration
   * @param options - Toast configuration options
   */
  custom: (options: ToastOptions) => void;
}

/**
 * Admin toast hook that provides convenient methods for displaying notifications
 *
 * This hook wraps the base `useToast` hook from shadcn/ui and provides
 * convenience methods for common toast variants (success, error, info, warning, loading).
 * It follows the shadcn/ui toast implementation based on Radix UI Toast primitives.
 *
 * @returns Object containing toast notification methods (success, error, info, warning, loading, custom)
 *
 * @example
 * ```tsx
 * // Success toast after saving data
 * function PromptEditor() {
 *   const { success, error } = useAdminToast();
 *
 *   const handleSavePrompt = async () => {
 *     try {
 *       const response = await fetch('/api/admin/prompts', {
 *         method: 'POST',
 *         body: JSON.stringify(promptData)
 *       });
 *
 *       if (response.ok) {
 *         success('Prompt saved', 'Your changes have been saved successfully');
 *       }
 *     } catch (err) {
 *       error('Save failed', 'Could not save prompt. Please try again.');
 *     }
 *   };
 *
 *   return <button onClick={handleSavePrompt}>Save</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Error toast on API failures
 * function WorkflowPanel() {
 *   const { error } = useAdminToast();
 *
 *   const handleDelete = async (workflowId: string) => {
 *     try {
 *       const response = await fetch(`/api/admin/workflows/${workflowId}`, {
 *         method: 'DELETE'
 *       });
 *
 *       if (!response.ok) {
 *         error(
 *           'Deletion failed',
 *           `Error ${response.status}: Could not delete workflow`
 *         );
 *       }
 *     } catch (err) {
 *       error(
 *         'Network error',
 *         'Could not reach the server. Check your connection.'
 *       );
 *     }
 *   };
 *
 *   return <button onClick={() => handleDelete(id)}>Delete</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Loading toast for async operations
 * function DataImporter() {
 *   const { loading, success, error } = useAdminToast();
 *
 *   const handleImportData = async (file: File) => {
 *     const toastId = loading(
 *       'Importing data',
 *       'Processing your file, this may take a moment...'
 *     );
 *
 *     try {
 *       const formData = new FormData();
 *       formData.append('file', file);
 *
 *       const response = await fetch('/api/admin/import', {
 *         method: 'POST',
 *         body: formData
 *       });
 *
 *       if (response.ok) {
 *         success('Import complete', 'Your data has been imported');
 *       } else {
 *         error('Import failed', 'Check file format and try again');
 *       }
 *     } catch (err) {
 *       error('Import error', 'An unexpected error occurred');
 *     }
 *   };
 *
 *   return <input type="file" onChange={(e) => handleImportData(e.target.files[0])} />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using warning toast for validation
 * function BulkActionPanel() {
 *   const { warning, info } = useAdminToast();
 *
 *   const handleBulkAction = (selectedCount: number) => {
 *     if (selectedCount === 0) {
 *       warning('No items selected', 'Please select at least one item to continue');
 *       return;
 *     }
 *
 *     info('Preparing bulk action', `Processing ${selectedCount} items...`);
 *     // Continue with bulk operation
 *   };
 *
 *   return <button onClick={() => handleBulkAction(selected.length)}>
 *     Apply to Selected
 *   </button>;
 * }
 * ```
 */
export function useAdminToast(): UseAdminToastReturn {
  // Call the base useToast hook (required for component registration)
  useToast();

  /**
   * Display a success toast
   */
  const success = (title: string, description?: string): void => {
    toast({
      title,
      description,
      variant: 'default',
    });
  };

  /**
   * Display an error toast
   */
  const error = (title: string, description?: string): void => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  };

  /**
   * Display an info toast
   */
  const info = (title: string, description?: string): void => {
    toast({
      title,
      description,
      variant: 'default',
    });
  };

  /**
   * Display a warning toast
   */
  const warning = (title: string, description?: string): void => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  };

  /**
   * Display a loading toast
   */
  const loading = (title: string, description?: string): void => {
    toast({
      title,
      description,
      variant: 'default',
    });
  };

  /**
   * Display a custom toast with full configuration
   */
  const custom = (options: ToastOptions): void => {
    const { title, description, variant = 'default' } = options;

    // Map custom variants to shadcn/ui variants
    const toastVariant: 'default' | 'destructive' =
      variant === 'error' || variant === 'warning' ? 'destructive' : 'default';

    toast({
      title,
      description,
      variant: toastVariant,
    });
  };

  return {
    success,
    error,
    info,
    warning,
    loading,
    custom,
  };
}
