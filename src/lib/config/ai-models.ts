/**
 * AI Model Configuration
 * 
 * Centralized list of valid AI models and providers
 * Used for validation and API key management
 */

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'groq';
  contextWindow: number;
  maxOutputTokens: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  capabilities: string[];
  deprecated?: boolean;
  replacementModel?: string;
}

export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kInputTokens: 0.01,
    costPer1kOutputTokens: 0.03,
    capabilities: ['text', 'code', 'analysis', 'vision'],
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    costPer1kInputTokens: 0.03,
    costPer1kOutputTokens: 0.06,
    capabilities: ['text', 'code', 'analysis'],
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    costPer1kInputTokens: 0.0005,
    costPer1kOutputTokens: 0.0015,
    capabilities: ['text', 'code'],
  },
  
  // Anthropic Models
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    costPer1kInputTokens: 0.015,
    costPer1kOutputTokens: 0.075,
    capabilities: ['text', 'code', 'analysis', 'vision'],
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    capabilities: ['text', 'code', 'analysis', 'vision'],
    deprecated: true,
    replacementModel: 'claude-3-5-sonnet-20250219',
  },
  {
    id: 'claude-3-5-sonnet-20250219',
    name: 'Claude 3.5 Sonnet (Latest)',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    capabilities: ['text', 'code', 'analysis', 'vision'],
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    costPer1kInputTokens: 0.00025,
    costPer1kOutputTokens: 0.00125,
    capabilities: ['text', 'code', 'vision'],
  },
  
  // Google Models
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    contextWindow: 2000000,
    maxOutputTokens: 8192,
    costPer1kInputTokens: 0.00125,
    costPer1kOutputTokens: 0.005,
    capabilities: ['text', 'code', 'analysis', 'vision', 'audio'],
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    costPer1kInputTokens: 0.000075,
    costPer1kOutputTokens: 0.0003,
    capabilities: ['text', 'code', 'vision'],
  },
  
  // Groq Models (Fast inference)
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B',
    provider: 'groq',
    contextWindow: 131072,
    maxOutputTokens: 8192,
    costPer1kInputTokens: 0.00059,
    costPer1kOutputTokens: 0.00079,
    capabilities: ['text', 'code'],
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    contextWindow: 32768,
    maxOutputTokens: 32768,
    costPer1kInputTokens: 0.00024,
    costPer1kOutputTokens: 0.00024,
    capabilities: ['text', 'code'],
  },
];

export function getModelById(modelId: string): AIModel | undefined {
  return AI_MODELS.find(m => m.id === modelId);
}

export function getModelsByProvider(provider: string): AIModel[] {
  return AI_MODELS.filter(m => m.provider === provider && !m.deprecated);
}

export function isValidModel(modelId: string): boolean {
  const model = getModelById(modelId);
  return model !== undefined && !model.deprecated;
}

export function getReplacementModel(modelId: string): AIModel | undefined {
  const model = getModelById(modelId);
  if (model?.replacementModel) {
    return getModelById(model.replacementModel);
  }
  return undefined;
}
