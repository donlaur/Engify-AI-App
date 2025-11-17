/**
 * AI Model Configuration
 * 
 * ⚠️ IMPORTANT: Model names change frequently!
 * Last updated: November 17, 2025
 * 
 * Centralized list of valid AI models and providers.
 * Used for validation and API key management.
 * 
 * UPDATE PROCESS:
 * 1. Check provider docs monthly
 * 2. Update model IDs with correct suffixes (-002, date versions, etc.)
 * 3. Update pricing (check provider pricing pages)
 * 4. Mark old models as deprecated
 * 5. Test with scripts/content/test-prompts-multi-model.ts
 * 
 * PROVIDER DOCS (Check for latest models):
 * - OpenAI: https://platform.openai.com/docs/models
 * - Anthropic: https://docs.anthropic.com/en/docs/models-overview
 * - Google: https://ai.google.dev/gemini-api/docs/models/gemini
 */

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'groq';
  contextWindow: number;
  maxOutputTokens: number;
  costPer1kInputTokens: number;     // USD per 1K input tokens
  costPer1kOutputTokens: number;    // USD per 1K output tokens
  capabilities: string[];
  deprecated?: boolean;
  replacementModel?: string;
  notes?: string;                    // Important notes about this model
  lastVerified?: string;             // Date we last verified this works (YYYY-MM-DD)
}

export const AI_MODELS: AIModel[] = [
  // OpenAI Models (Updated Oct 31, 2025)
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPer1kInputTokens: 0.0025,     // $2.50 per 1M tokens
    costPer1kOutputTokens: 0.01,      // $10 per 1M tokens
    capabilities: ['text', 'code', 'analysis', 'vision', 'tools', 'json'],
    notes: 'Best balance cost/performance. Recommended for most tasks.',
    lastVerified: '2025-10-31',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPer1kInputTokens: 0.00015,    // $0.15 per 1M tokens
    costPer1kOutputTokens: 0.0006,    // $0.60 per 1M tokens
    capabilities: ['text', 'code', 'vision', 'tools', 'json'],
    notes: 'Extremely cheap. Use for simple tasks, high-volume processing.',
    lastVerified: '2025-10-31',
  },
  // gpt-3.5-turbo REMOVED: Deprecated - use gpt-4o-mini instead (better quality, similar cost)
  {
    id: 'o1-preview',
    name: 'O1 Preview',
    provider: 'openai',
    contextWindow: 128000,
    maxOutputTokens: 32768,
    costPer1kInputTokens: 0.015,      // $15 per 1M tokens!
    costPer1kOutputTokens: 0.06,      // $60 per 1M tokens!
    capabilities: ['text', 'code', 'reasoning'],
    notes: '⚠️ EXPENSIVE! Use only for complex reasoning, critical bugs. Most tasks don\'t need this.',
    lastVerified: '2025-10-31',
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
  
  // Google Models (VERIFIED Oct 31, 2025 via list-gemini-models.ts)
  // ⚠️ CRITICAL: Gemini 1.5 models are SUNSET! Only 2.0 models work now.
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'google',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    costPer1kInputTokens: 0,         // FREE during experimental phase!
    costPer1kOutputTokens: 0,
    capabilities: ['text', 'code', 'vision'],
    notes: '✅ VERIFIED WORKING: Free experimental model. Best option for Google AI as of Oct 31, 2025.',
    lastVerified: '2025-10-31',
  },
  {
    id: 'gemini-exp-1206',
    name: 'Gemini Experimental (Dec 6 version)',
    provider: 'google',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    costPer1kInputTokens: 0,         // FREE
    costPer1kOutputTokens: 0,
    capabilities: ['text', 'code', 'vision'],
    notes: '✅ VERIFIED WORKING: Experimental model, may change. Free during testing.',
    lastVerified: '2025-10-31',
  },
  // gemini-1.5-pro-002 REMOVED: SUNSET - Model no longer available. Use gemini-2.0-flash-exp instead.
  // gemini-1.5-flash-002 REMOVED: SUNSET - Model no longer available. Use gemini-2.0-flash-exp instead.
  // gemini-1.5-flash REMOVED: SUNSET - All 1.5 models removed. Use gemini-2.0-flash-exp.
  
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
