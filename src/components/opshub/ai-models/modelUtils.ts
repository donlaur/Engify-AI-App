import type { AIModel } from '@/lib/db/schemas/ai-model';

interface ModelDisplay extends AIModel {
  deprecated?: boolean;
}

export type FilterType = 'all' | 'active' | 'deprecated';

/**
 * Filter AI models based on filter type
 * 
 * Filters an array of AI models by their status (all, active, or deprecated).
 * Active models are those that are not deprecated and are allowed.
 * 
 * @param models - Array of AI models to filter
 * @param filter - Filter type: 'all', 'active', or 'deprecated'
 * @returns Filtered array of models matching the filter criteria
 * 
 * @example
 * ```tsx
 * const activeModels = filterModels(allModels, 'active');
 * const deprecatedModels = filterModels(allModels, 'deprecated');
 * ```
 * 
 * @function filterModels
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
 * Group AI models by their provider
 * 
 * Organizes an array of AI models into a dictionary keyed by provider name.
 * Useful for displaying models grouped by provider (e.g., OpenAI, Anthropic, Google).
 * 
 * @param models - Array of AI models to group
 * @returns Dictionary mapping provider names to arrays of models
 * 
 * @example
 * ```tsx
 * const grouped = groupModelsByProvider(models);
 * // Result: { 'openai': [...], 'anthropic': [...], 'google': [...] }
 * ```
 * 
 * @function groupModelsByProvider
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
 * Get the icon component name for an AI model provider
 * 
 * Maps provider names to their corresponding icon identifiers from the Icons library.
 * Used for displaying provider-specific icons in the UI.
 * 
 * @param provider - Provider name (e.g., 'openai', 'anthropic', 'google')
 * @returns Icon component name ('zap', 'brain', 'globe') or undefined if not found
 * 
 * @example
 * ```tsx
 * const iconName = getProviderIcon('openai'); // Returns 'zap'
 * const Icon = Icons[iconName || 'globe'];
 * ```
 * 
 * @function getProviderIcon
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

