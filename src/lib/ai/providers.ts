/**
 * AI Provider Configuration
 * Supports multiple AI providers with affordable models
 */

export type AIProvider = 
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'perplexity'
  | 'groq'
  | 'together'
  | 'mistral';

export interface AIModel {
  id: string;
  provider: AIProvider;
  name: string;
  displayName: string;
  contextWindow: number;
  inputCostPer1M: number;  // Cost per 1M input tokens
  outputCostPer1M: number; // Cost per 1M output tokens
  maxOutputTokens: number;
  supportsStreaming: boolean;
  supportsJSON: boolean;
  supportsVision: boolean;
  recommended: boolean;
  tier: 'free' | 'affordable' | 'premium';
}

/**
 * Affordable AI Models Database
 * Focused on personal/small business use without contracts
 */
export const AI_MODELS: Record<string, AIModel> = {
  // OpenAI - Affordable options
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    name: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    contextWindow: 128000,
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    maxOutputTokens: 16384,
    supportsStreaming: true,
    supportsJSON: true,
    supportsVision: true,
    recommended: true,
    tier: 'affordable',
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    provider: 'openai',
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    contextWindow: 16385,
    inputCostPer1M: 0.50,
    outputCostPer1M: 1.50,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsJSON: true,
    supportsVision: false,
    recommended: true,
    tier: 'affordable',
  },

  // Anthropic - Claude models
  'claude-3-haiku': {
    id: 'claude-3-haiku-20240307',
    provider: 'anthropic',
    name: 'claude-3-haiku-20240307',
    displayName: 'Claude 3 Haiku',
    contextWindow: 200000,
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsJSON: false,
    supportsVision: true,
    recommended: true,
    tier: 'affordable',
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    name: 'claude-3-5-sonnet-20241022',
    displayName: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsJSON: false,
    supportsVision: true,
    recommended: true,
    tier: 'premium',
  },

  // Google - Gemini models (FREE tier available!)
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    provider: 'google',
    name: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash',
    contextWindow: 1000000,
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsJSON: true,
    supportsVision: true,
    recommended: true,
    tier: 'affordable',
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    provider: 'google',
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    contextWindow: 2000000,
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsJSON: true,
    supportsVision: true,
    recommended: false,
    tier: 'premium',
  },

  // Perplexity - Affordable with built-in search
  'perplexity-sonar-small': {
    id: 'sonar-small-online',
    provider: 'perplexity',
    name: 'sonar-small-online',
    displayName: 'Perplexity Sonar Small',
    contextWindow: 127072,
    inputCostPer1M: 0.20,
    outputCostPer1M: 0.20,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    supportsJSON: false,
    supportsVision: false,
    recommended: true,
    tier: 'affordable',
  },

  // Groq - FASTEST inference (free tier!)
  'groq-llama-3.1-8b': {
    id: 'llama-3.1-8b-instant',
    provider: 'groq',
    name: 'llama-3.1-8b-instant',
    displayName: 'Llama 3.1 8B (Groq)',
    contextWindow: 131072,
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.08,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsJSON: true,
    supportsVision: false,
    recommended: true,
    tier: 'free',
  },
  'groq-llama-3.1-70b': {
    id: 'llama-3.1-70b-versatile',
    provider: 'groq',
    name: 'llama-3.1-70b-versatile',
    displayName: 'Llama 3.1 70B (Groq)',
    contextWindow: 131072,
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsJSON: true,
    supportsVision: false,
    recommended: true,
    tier: 'affordable',
  },

  // Together AI - Open source models
  'together-mixtral-8x7b': {
    id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    provider: 'together',
    name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    displayName: 'Mixtral 8x7B',
    contextWindow: 32768,
    inputCostPer1M: 0.60,
    outputCostPer1M: 0.60,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsJSON: true,
    supportsVision: false,
    recommended: true,
    tier: 'affordable',
  },

  // Mistral AI - European alternative
  'mistral-small': {
    id: 'mistral-small-latest',
    provider: 'mistral',
    name: 'mistral-small-latest',
    displayName: 'Mistral Small',
    contextWindow: 32000,
    inputCostPer1M: 1.00,
    outputCostPer1M: 3.00,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    supportsJSON: true,
    supportsVision: false,
    recommended: true,
    tier: 'affordable',
  },
};

/**
 * Get recommended models by use case
 */
export function getRecommendedModels(useCase: 'chat' | 'code' | 'analysis' | 'creative'): AIModel[] {
  const allModels = Object.values(AI_MODELS);
  
  switch (useCase) {
    case 'chat':
      return allModels.filter(m => 
        m.recommended && 
        ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.5-flash', 'groq-llama-3.1-8b'].includes(m.id)
      );
    case 'code':
      return allModels.filter(m => 
        ['gpt-4o-mini', 'claude-3-5-sonnet', 'groq-llama-3.1-70b'].includes(m.id)
      );
    case 'analysis':
      return allModels.filter(m => 
        ['claude-3-5-sonnet', 'gpt-4o-mini', 'gemini-1.5-pro'].includes(m.id)
      );
    case 'creative':
      return allModels.filter(m => 
        ['claude-3-5-sonnet', 'gpt-4o-mini', 'mistral-small'].includes(m.id)
      );
    default:
      return allModels.filter(m => m.recommended);
  }
}

/**
 * Get cheapest model
 */
export function getCheapestModel(): AIModel {
  return AI_MODELS['groq-llama-3.1-8b']; // Free tier!
}

/**
 * Get models by tier
 */
export function getModelsByTier(tier: 'free' | 'affordable' | 'premium'): AIModel[] {
  return Object.values(AI_MODELS).filter(m => m.tier === tier);
}

/**
 * Get model by ID
 */
export function getModel(id: string): AIModel | undefined {
  return AI_MODELS[id];
}

/**
 * Get all providers
 */
export function getAllProviders(): AIProvider[] {
  return ['openai', 'anthropic', 'google', 'perplexity', 'groq', 'together', 'mistral'];
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: AIProvider): AIModel[] {
  return Object.values(AI_MODELS).filter(m => m.provider === provider);
}
