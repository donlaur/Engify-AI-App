import { useState, useCallback } from 'react';
import { useAdminToast } from './useAdminToast';

/**
 * Configuration for the status toggle hook
 */
export interface UseAdminStatusToggleConfig {
  /** API endpoint path (e.g., '/api/admin/workflows') */
  endpoint: string;
  /** Entity name for success messages (e.g., 'Workflow', 'Recommendation') */
  entityName: string;
  /** Callback to refresh data after status change */
  onRefresh: () => Promise<void> | void;
  /** Optional callback to update selected item state */
  onUpdateSelected?: (id: string, newStatus: string) => void;
}

/**
 * Return value from the useAdminStatusToggle hook
 */
export interface UseAdminStatusToggleReturn {
  /** Toggle status between published and draft */
  toggleStatus: (id: string, currentStatus: string) => Promise<void>;
  /** Loading state for the toggle operation */
  loading: boolean;
}

/**
 * Reusable hook for toggling entity status (published/draft) in admin panels
 *
 * @param config - Configuration object for the hook
 * @returns Object containing toggleStatus function and loading state
 *
 * @example
 * ```tsx
 * function WorkflowPanel() {
 *   const { refresh } = useAdminData({ endpoint: '/api/admin/workflows' });
 *   const { toggleStatus, loading } = useAdminStatusToggle({
 *     endpoint: '/api/admin/workflows',
 *     entityName: 'Workflow',
 *     onRefresh: refresh,
 *   });
 *
 *   return (
 *     <Button onClick={() => toggleStatus(workflowId, 'published')} disabled={loading}>
 *       Toggle Status
 *     </Button>
 *   );
 * }
 * ```
 */
export function useAdminStatusToggle(
  config: UseAdminStatusToggleConfig
): UseAdminStatusToggleReturn {
  const { endpoint, entityName, onRefresh, onUpdateSelected } = config;
  const { success, error: showError } = useAdminToast();
  const [loading, setLoading] = useState(false);

  const toggleStatus = useCallback(
    async (id: string, currentStatus: string) => {
      setLoading(true);
      try {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';

        const res = await fetch(`${endpoint}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
          await onRefresh();
          success(
            'Status updated',
            `${entityName} ${newStatus === 'published' ? 'published' : 'saved as draft'} successfully`
          );
          onUpdateSelected?.(id, newStatus);
        } else {
          showError('Failed to update status', 'Please try again');
        }
      } catch (err) {
        showError('Network error', 'Unable to connect to server');
      } finally {
        setLoading(false);
      }
    },
    [endpoint, entityName, onRefresh, onUpdateSelected, success, showError]
  );

  return { toggleStatus, loading };
}

