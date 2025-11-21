/**
 * useCrudOperations Hook
 *
 * A reusable React hook for handling CRUD operations (Create, Update, Delete)
 * with consistent error handling, toast notifications, and data refresh.
 *
 * @pattern CUSTOM_HOOK
 * @principle DRY - Eliminates boilerplate for CRUD operations across admin panels
 *
 * @features
 * - Type-safe generic implementation
 * - Automatic data refresh after operations
 * - Consistent error handling with toast notifications
 * - Loading state management
 * - Success/error callbacks
 *
 * @template T - The entity type being managed
 *
 * @example
 * ```tsx
 * const { saveItem, deleteItem, loading } = useCrudOperations<Pattern>({
 *   endpoint: '/api/admin/patterns',
 *   onRefresh: refresh,
 * });
 *
 * const handleSave = async () => {
 *   await saveItem(editingPattern, isCreating);
 * };
 *
 * const handleDelete = async (id: string) => {
 *   await deleteItem(id);
 * };
 * ```
 *
 * @usage
 * Used throughout OpsHub admin panels for consistent CRUD operation handling.
 * Reduces duplication and ensures consistent user feedback and error handling.
 *
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */

'use client';

import { useState } from 'react';
import { useAdminToast } from '@/hooks/opshub/useAdminToast';
import { clientLogger } from '@/lib/logging/client-logger';

/**
 * Options for CRUD operations hook
 *
 * @interface CrudOperationsOptions
 * @template T - The entity type
 */
interface CrudOperationsOptions<T> {
  /** API endpoint for CRUD operations */
  endpoint: string;
  /** Function to refresh data after operations */
  onRefresh: () => void;
  /** Custom success message for create operation */
  createSuccessMessage?: string;
  /** Custom success message for update operation */
  updateSuccessMessage?: string;
  /** Custom success message for delete operation */
  deleteSuccessMessage?: string;
  /** Custom error message prefix */
  errorMessagePrefix?: string;
  /** Callback executed after successful save */
  onSaveSuccess?: (item: T, isCreating: boolean) => void | Promise<void>;
  /** Callback executed after successful delete */
  onDeleteSuccess?: (id: string) => void | Promise<void>;
  /** Callback executed on save error */
  onSaveError?: (error: Error) => void;
  /** Callback executed on delete error */
  onDeleteError?: (error: Error) => void;
}

/**
 * useCrudOperations hook
 *
 * @template T - The entity type being managed
 * @param options - Configuration options for CRUD operations
 * @returns Object containing saveItem, deleteItem functions and loading state
 */
export function useCrudOperations<T extends { _id?: string; id?: string }>({
  endpoint,
  onRefresh,
  createSuccessMessage = 'Item created successfully',
  updateSuccessMessage = 'Item updated successfully',
  deleteSuccessMessage = 'Item deleted successfully',
  errorMessagePrefix = 'Operation failed',
  onSaveSuccess,
  onDeleteSuccess,
  onSaveError,
  onDeleteError,
}: CrudOperationsOptions<T>) {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useAdminToast();

  /**
   * Save an item (create or update)
   *
   * @param item - The item to save
   * @param isCreating - Whether this is a create operation (true) or update (false)
   * @returns Promise resolving to true on success, false on failure
   */
  const saveItem = async (item: T, isCreating: boolean): Promise<boolean> => {
    if (!item) {
      showError('Validation error', 'Item is required');
      return false;
    }

    try {
      setLoading(true);
      const method = isCreating ? 'POST' : 'PUT';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      const data = await res.json();

      if (data.success || res.ok) {
        const successMsg = isCreating ? createSuccessMessage : updateSuccessMessage;
        success(
          isCreating ? 'Item created' : 'Item updated',
          successMsg
        );

        if (onSaveSuccess) {
          await onSaveSuccess(item, isCreating);
        }

        onRefresh();
        return true;
      } else {
        const errorMsg = data.error || `${errorMessagePrefix}: ${data.message || 'Unknown error'}`;
        showError('Save failed', errorMsg);

        if (onSaveError) {
          onSaveError(new Error(errorMsg));
        }

        return false;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      clientLogger.apiError(endpoint, error, {
        component: 'useCrudOperations',
        action: 'save',
        isCreating,
      });

      showError('Save failed', 'An unexpected error occurred');

      if (onSaveError) {
        onSaveError(error);
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete an item
   *
   * @param id - The ID of the item to delete
   * @param confirmMessage - Optional confirmation message (if not provided, no confirmation dialog)
   * @returns Promise resolving to true on success, false on failure or cancellation
   */
  const deleteItem = async (
    id: string,
    confirmMessage?: string
  ): Promise<boolean> => {
    if (!id) {
      showError('Validation error', 'Item ID is required');
      return false;
    }

    // Show confirmation dialog if message provided
    if (confirmMessage && !confirm(confirmMessage)) {
      return false;
    }

    try {
      setLoading(true);
      const res = await fetch(`${endpoint}?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success || res.ok) {
        success('Item deleted', deleteSuccessMessage);

        if (onDeleteSuccess) {
          await onDeleteSuccess(id);
        }

        onRefresh();
        return true;
      } else {
        const errorMsg = data.error || `${errorMessagePrefix}: ${data.message || 'Unknown error'}`;
        showError('Delete failed', errorMsg);

        if (onDeleteError) {
          onDeleteError(new Error(errorMsg));
        }

        return false;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      clientLogger.apiError(endpoint, error, {
        component: 'useCrudOperations',
        action: 'delete',
        id,
      });

      showError('Delete failed', 'An unexpected error occurred');

      if (onDeleteError) {
        onDeleteError(error);
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  return { saveItem, deleteItem, loading };
}

