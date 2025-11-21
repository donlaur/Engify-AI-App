import { useState, useCallback } from 'react';

/**
 * Return value from the useAdminViewDrawer hook
 */
export interface UseAdminViewDrawerReturn<T> {
  /** Currently selected item */
  selectedItem: T | null;
  /** Whether the drawer is open */
  isDrawerOpen: boolean;
  /** Open the drawer with a specific item */
  openDrawer: (item: T) => void;
  /** Close the drawer */
  closeDrawer: () => void;
  /** Toggle drawer open/closed state */
  toggleDrawer: () => void;
  /** Update the selected item (useful for updating status after toggle) */
  updateSelectedItem: (updater: (item: T | null) => T | null) => void;
}

/**
 * Reusable hook for managing view drawer state in admin panels
 *
 * @template T - Type of the item being viewed
 * @returns Object containing drawer state and control functions
 *
 * @example
 * ```tsx
 * interface Workflow {
 *   _id: string;
 *   title: string;
 * }
 *
 * function WorkflowPanel() {
 *   const { selectedItem, isDrawerOpen, openDrawer, closeDrawer } = useAdminViewDrawer<Workflow>();
 *
 *   return (
 *     <>
 *       <Button onClick={() => openDrawer(workflow)}>View</Button>
 *       <Sheet open={isDrawerOpen} onOpenChange={closeDrawer}>
 *         {selectedItem && <WorkflowDetails workflow={selectedItem} />}
 *       </Sheet>
 *     </>
 *   );
 * }
 * ```
 */
export function useAdminViewDrawer<T>(): UseAdminViewDrawerReturn<T> {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = useCallback((item: T) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    // Clear selected item after animation completes
    setTimeout(() => setSelectedItem(null), 200);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen(prev => !prev);
    if (isDrawerOpen) {
      setTimeout(() => setSelectedItem(null), 200);
    }
  }, [isDrawerOpen]);

  const updateSelectedItem = useCallback((updater: (item: T | null) => T | null) => {
    setSelectedItem(prev => updater(prev));
  }, []);

  return {
    selectedItem,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    updateSelectedItem,
  };
}

