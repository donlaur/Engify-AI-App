import { useState, useEffect, useCallback } from 'react';
import { useAdminToast } from '@/hooks/opshub';
import { clientLogger } from '@/lib/logging/client-logger';
import type { AIModel } from '@/lib/db/schemas/ai-model';

interface ModelDisplay extends AIModel {
  deprecated?: boolean;
}

/**
 * useModelsData Hook
 * 
 * A custom React hook for fetching and managing AI model data in admin panels.
 * Handles loading states, error handling, and automatic data refresh.
 * 
 * @pattern CUSTOM_HOOK
 * @principle DRY - Centralizes AI model data fetching logic
 * 
 * @features
 * - Automatic data fetching on mount
 * - Loading state management
 * - Error handling with toast notifications
 * - Manual reload capability
 * - Deprecated status detection
 * 
 * @returns Object containing models array, loading state, and reload function
 * @returns {ModelDisplay[]} models - Array of AI models with deprecated flag
 * @returns {boolean} loading - Current loading state
 * @returns {Function} reload - Function to manually refresh model data
 * 
 * @example
 * ```tsx
 * const { models, loading, reload } = useModelsData();
 * 
 * if (loading) return <LoadingState />;
 * return <ModelList models={models} onRefresh={reload} />;
 * ```
 * 
 * @usage
 * Used in AI model management panels to fetch and display model data.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */
export function useModelsData() {
  const [models, setModels] = useState<ModelDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const { error: showError } = useAdminToast();

  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ai-models');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to load models: ${response.status}`);
      }

      const data = await response.json();
      const modelsArray = data.models || data || [];

      const modelsWithDeprecated = modelsArray.map((m: AIModel) => ({
        ...m,
        deprecated: m.status === 'deprecated' || m.status === 'sunset',
      }));

      setModels(modelsWithDeprecated);

      if (modelsArray.length === 0) {
        clientLogger.warn('No models found in database', { component: 'useModelsData' });
      }
    } catch (error) {
      clientLogger.apiError('/api/admin/ai-models', error, { component: 'useModelsData' });
      const errorMessage = error instanceof Error ? error.message : 'Failed to load AI models';
      showError('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  return { models, loading, reload: loadModels };
}

