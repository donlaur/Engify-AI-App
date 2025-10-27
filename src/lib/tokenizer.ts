/**
 * Token Counter Utility
 * Estimates tokens for different AI models
 * Based on common tokenization patterns
 */

export interface TokenCount {
  tokens: number;
  characters: number;
  words: number;
}

export interface ModelPricing {
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  inputPrice: number;  // per 1K tokens
  outputPrice: number; // per 1K tokens
  contextWindow: number;
}

// Current pricing (as of Oct 2025)
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    provider: 'openai',
    inputPrice: 0.01,
    outputPrice: 0.03,
    contextWindow: 128000,
  },
  'gpt-4': {
    name: 'GPT-4',
    provider: 'openai',
    inputPrice: 0.03,
    outputPrice: 0.06,
    contextWindow: 8192,
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    inputPrice: 0.0015,
    outputPrice: 0.002,
    contextWindow: 16385,
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    inputPrice: 0.015,
    outputPrice: 0.075,
    contextWindow: 200000,
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    inputPrice: 0.003,
    outputPrice: 0.015,
    contextWindow: 200000,
  },
  'claude-3-haiku': {
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    inputPrice: 0.00025,
    outputPrice: 0.00125,
    contextWindow: 200000,
  },
  'gemini-pro': {
    name: 'Gemini Pro',
    provider: 'google',
    inputPrice: 0.00025,
    outputPrice: 0.0005,
    contextWindow: 32000,
  },
  'gemini-ultra': {
    name: 'Gemini Ultra',
    provider: 'google',
    inputPrice: 0.00125,
    outputPrice: 0.00375,
    contextWindow: 32000,
  },
};

/**
 * Estimate token count for text
 * Uses a simple heuristic: ~4 characters per token
 * This is approximate but good enough for estimation
 */
export function estimateTokens(text: string): TokenCount {
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  
  // Heuristic: ~4 characters per token (average for English)
  // More accurate would use tiktoken, but this is good for estimation
  const tokens = Math.ceil(characters / 4);

  return {
    tokens,
    characters,
    words,
  };
}

/**
 * Calculate cost for a given model and token count
 */
export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number = 0
): number {
  const model = MODEL_PRICING[modelId];
  if (!model) return 0;

  const inputCost = (inputTokens / 1000) * model.inputPrice;
  const outputCost = (outputTokens / 1000) * model.outputPrice;

  return inputCost + outputCost;
}

/**
 * Format cost as currency
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 100).toFixed(4)}¢`;
  }
  return `$${cost.toFixed(4)}`;
}

/**
 * Get cost comparison for all models
 */
export function getCostComparison(
  inputTokens: number,
  outputTokens: number = 0
) {
  return Object.entries(MODEL_PRICING).map(([id, model]) => ({
    id,
    name: model.name,
    provider: model.provider,
    cost: calculateCost(id, inputTokens, outputTokens),
    inputCost: (inputTokens / 1000) * model.inputPrice,
    outputCost: (outputTokens / 1000) * model.outputPrice,
    contextWindow: model.contextWindow,
    fitsInContext: inputTokens + outputTokens <= model.contextWindow,
  }));
}

/**
 * Get optimization tips based on token count
 */
export function getOptimizationTips(tokens: number): string[] {
  const tips: string[] = [];

  if (tokens > 1000) {
    tips.push('Consider breaking into smaller prompts');
    tips.push('Remove unnecessary context');
    tips.push('Use more concise language');
  }

  if (tokens > 4000) {
    tips.push('This is a large prompt - consider using RAG');
    tips.push('Split into multiple API calls');
  }

  if (tokens > 8000) {
    tips.push('⚠️ May exceed context window for some models');
    tips.push('Use models with larger context windows');
  }

  if (tokens < 100) {
    tips.push('Add more context for better results');
    tips.push('Consider using few-shot examples');
  }

  return tips;
}

/**
 * Get cheapest model for given token count
 */
export function getCheapestModel(inputTokens: number, outputTokens: number = 0) {
  const comparison = getCostComparison(inputTokens, outputTokens);
  const validModels = comparison.filter((m) => m.fitsInContext);
  
  if (validModels.length === 0) {
    return null;
  }

  return validModels.reduce((cheapest, current) =>
    current.cost < cheapest.cost ? current : cheapest
  );
}
