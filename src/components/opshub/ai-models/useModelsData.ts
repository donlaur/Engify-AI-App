import { useState, useEffect, useCallback } from 'react';
import { useAdminToast } from '@/hooks/opshub';
import { clientLogger } from '@/lib/logging/client-logger';
import type { AIModel } from '@/lib/db/schemas/ai-model';

interface ModelDisplay extends AIModel {
  deprecated?: boolean;
}

/**
 * Hook for managing AI models data
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

