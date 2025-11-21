import { useState, useEffect, useCallback } from 'react';
import { useAdminToast } from '@/hooks/opshub';
import type { AITool } from '@/lib/db/schemas/ai-tool';

interface ToolDisplay extends AITool {
  _id?: string;
}

/**
 * Hook for managing AI tools data
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
        console.warn('No tools found in database. Tools may need to be migrated or synced.');
      }
    } catch (error) {
      console.error('Error loading tools:', error);
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

