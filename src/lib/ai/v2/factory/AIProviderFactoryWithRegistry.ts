/**
 * AIProviderFactory with Database Registry Integration
 * 
 * Enhanced factory that queries database registry for model names
 * Falls back to hardcoded defaults if DB unavailable
 */

import { AIProvider } from '../interfaces/AIProvider';
import { OpenAIAdapter } from '../adapters/OpenAIAdapter';
import { ClaudeAdapter } from '../adapters/ClaudeAdapter';
import { GeminiAdapter } from '../adapters/GeminiAdapter';
import { GroqAdapter } from '../adapters/GroqAdapter';
import { ReplicateAdapter } from '../adapters/ReplicateAdapter';
import { getActiveModels, getModelsByProvider, isModelAllowed } from '@/lib/services/AIModelRegistry';
import { AIProviderFactory } from './AIProviderFactory';

/**
 * Provider name to model ID mapping
 * Used when DB registry doesn't have explicit provider name mappings
 */
const PROVIDER_TO_MODEL_ID: Record<string, string> = {
  'openai': 'gpt-4o',
  'openai-mini': 'gpt-4o-mini',
  'openai-gpt4': 'gpt-4',
  'openai-gpt4-turbo': 'gpt-4o',
  'openai-gpt4o': 'gpt-4o',
  'claude': 'claude-3-haiku-20240307',
  'claude-haiku': 'claude-3-haiku-20240307',
  'claude-sonnet': 'claude-3-5-sonnet-20241022',
  'claude-opus': 'claude-3-opus-20240229',
  'gemini': 'gemini-2.0-flash-exp',
  'gemini-pro': 'gemini-2.0-flash-exp',
  'gemini-flash': 'gemini-2.0-flash-exp',
  'gemini-exp': 'gemini-2.0-flash-exp',
  'groq': 'llama3-8b-8192',
  'groq-llama3-8b': 'llama3-8b-8192',
  'groq-llama3-70b': 'llama3-70b-8192',
  'groq-mixtral': 'mixtral-8x7b-32768',
};

/**
 * Get model name from registry by provider name
 */
async function getModelNameFromRegistry(providerName: string): Promise<string | null> {
  try {
    // Check if model is allowed
    const modelId = PROVIDER_TO_MODEL_ID[providerName];
    if (!modelId) return null;

    const allowed = await isModelAllowed(modelId);
    if (!allowed) return null;

    // Get models for this provider
    const provider = providerName.includes('openai') ? 'openai' :
                     providerName.includes('claude') ? 'anthropic' :
                     providerName.includes('gemini') ? 'google' :
                     providerName.includes('groq') ? 'groq' :
                     'openai';

    const models = await getModelsByProvider(provider);
    const model = models.find(m => m.id === modelId);
    
    return model ? model.name : null;
  } catch (error) {
    console.warn(`[AIProviderFactory] Failed to query registry for ${providerName}:`, error);
    return null;
  }
}

/**
 * Enhanced AIProviderFactory with database registry support
 */
export class AIProviderFactoryWithRegistry {
  /**
   * Create provider with model from database registry
   * Falls back to hardcoded defaults if registry unavailable
   */
  static async create(providerName: string, _organizationId?: string): Promise<AIProvider> {
    // Try to get model name from registry
    const modelName = await getModelNameFromRegistry(providerName);
    
    if (modelName) {
      // Use model from registry
      return this.createFromModelName(providerName, modelName);
    }

    // Fallback to original factory (hardcoded defaults)
    return AIProviderFactory.create(providerName);
  }

  /**
   * Create provider with specific model name
   */
  private static createFromModelName(providerName: string, modelName: string): AIProvider {
    // Replicate: Support any owner/model format
    if (providerName.startsWith('replicate-')) {
      return new ReplicateAdapter(modelName); // modelName is already in owner/model format
    }
    if (providerName.includes('openai')) {
      return new OpenAIAdapter(modelName);
    }
    if (providerName.includes('claude')) {
      return new ClaudeAdapter(modelName);
    }
    if (providerName.includes('gemini')) {
      return new GeminiAdapter(modelName);
    }
    if (providerName.includes('groq')) {
      return new GroqAdapter(modelName);
    }

    // Fallback to original factory
    return AIProviderFactory.create(providerName);
  }

  /**
   * Get available providers (from registry or hardcoded)
   */
  static async getAvailableProviders(): Promise<string[]> {
    try {
      const activeModels = await getActiveModels();
      const providers = new Set<string>();
      
      // Extract provider names from model IDs
      activeModels.forEach(model => {
        if (model.provider === 'openai') {
          if (model.id.includes('gpt-4o')) providers.add('openai');
          if (model.id.includes('gpt-4o-mini')) providers.add('openai-mini');
          if (model.id === 'gpt-4') providers.add('openai-gpt4');
        }
        if (model.provider === 'anthropic') {
          if (model.id.includes('haiku')) providers.add('claude-haiku');
          if (model.id.includes('sonnet')) providers.add('claude-sonnet');
          if (model.id.includes('opus')) providers.add('claude-opus');
          providers.add('claude');
        }
        if (model.provider === 'google') {
          providers.add('gemini');
          providers.add('gemini-exp');
        }
        if (model.provider === 'groq') {
          providers.add('groq');
        }
      });

      return Array.from(providers).length > 0 
        ? Array.from(providers)
        : AIProviderFactory.getAvailableProviders();
    } catch (error) {
      console.warn('[AIProviderFactory] Failed to get providers from registry:', error);
      return AIProviderFactory.getAvailableProviders();
    }
  }

  /**
   * Check if provider/model is allowed
   */
  static async isProviderAllowed(providerName: string): Promise<boolean> {
    const modelId = PROVIDER_TO_MODEL_ID[providerName];
    if (!modelId) return true; // Unknown provider, allow (backward compat)

    try {
      return await isModelAllowed(modelId);
    } catch (error) {
      console.warn(`[AIProviderFactory] Failed to check if ${providerName} is allowed:`, error);
      return true; // Fail open for backward compatibility
    }
  }
}

