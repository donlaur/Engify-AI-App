import type { AIModel } from '@/lib/db/schemas/ai-model';

interface ModelDisplay extends AIModel {
  deprecated?: boolean;
}

export type FilterType = 'all' | 'active' | 'deprecated';

/**
 * Filter models based on filter type
 */
export function filterModels(models: ModelDisplay[], filter: FilterType): ModelDisplay[] {
  switch (filter) {
    case 'all':
      return models;
    case 'active':
      return models.filter((m) => !m.deprecated && m.isAllowed);
    case 'deprecated':
      return models.filter((m) => m.deprecated || m.status === 'deprecated');
    default:
      return models;
  }
}

/**
 * Group models by provider
 */
export function groupModelsByProvider(
  models: ModelDisplay[]
): Record<string, ModelDisplay[]> {
  return models.reduce((acc, model) => {
    const provider = model.provider;
    if (!acc[provider]) acc[provider] = [];
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, ModelDisplay[]>);
}

/**
 * Get provider icon component name
 */
export function getProviderIcon(provider: string): 'zap' | 'brain' | 'globe' | undefined {
  switch (provider) {
    case 'openai':
      return 'zap';
    case 'anthropic':
      return 'brain';
    case 'google':
      return 'globe';
    default:
      return undefined;
  }
}

