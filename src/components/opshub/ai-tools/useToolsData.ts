import { useState, useEffect, useCallback } from 'react';
import { useAdminToast } from '@/hooks/opshub';
import { clientLogger } from '@/lib/logging/client-logger';
import type { AITool } from '@/lib/db/schemas/ai-tool';

interface ToolDisplay extends AITool {
  _id?: string;
}

/**
 * useToolsData Hook
 * 
 * A custom React hook for fetching and managing AI tool data in admin panels.
 * Handles loading states, error handling, and automatic data refresh.
 * 
 * @pattern CUSTOM_HOOK
 * @principle DRY - Centralizes AI tool data fetching logic
 * 
 * @features
 * - Automatic data fetching on mount
 * - Loading state management
 * - Error handling with toast notifications
 * - Manual reload capability
 * 
 * @returns Object containing tools array, loading state, and reload function
 * @returns {ToolDisplay[]} tools - Array of AI tools
 * @returns {boolean} loading - Current loading state
 * @returns {Function} reload - Function to manually refresh tool data
 * 
 * @example
 * ```tsx
 * const { tools, loading, reload } = useToolsData();
 * 
 * if (loading) return <LoadingState />;
 * return <ToolList tools={tools} onRefresh={reload} />;
 * ```
 * 
 * @usage
 * Used in AI tool management panels to fetch and display tool data.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 * 
 * @function useToolsData
 */
export function useToolsData() {
  const [tools, setTools] = useState<ToolDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const { error: showError } = useAdminToast();

  const loadTools = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ai-tools');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to load tools: ${response.status}`);
      }

      const data = await response.json();
      const toolsArray = data.tools || data || [];

      setTools(toolsArray);

      if (toolsArray.length === 0) {
        clientLogger.warn('No tools found in database', { component: 'useToolsData' });
      }
    } catch (error) {
      clientLogger.apiError('/api/admin/ai-tools', error, { component: 'useToolsData' });
      const errorMessage = error instanceof Error ? error.message : 'Failed to load AI tools';
      showError('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  return { tools, loading, reload: loadTools };
}

