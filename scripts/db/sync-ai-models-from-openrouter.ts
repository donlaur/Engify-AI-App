#!/usr/bin/env tsx

/**
 * Sync AI Models from OpenRouter API
 * 
 * Fetches comprehensive model data from OpenRouter's unified API
 * and syncs it to our MongoDB database.
 * 
 * OpenRouter API: https://openrouter.ai/api/v1/models
 * - 500+ models from 60+ providers
 * - Includes pricing, modalities, context length, supported parameters
 * - Free tier available (no API key required for basic usage)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { aiModelService } from '@/lib/services/AIModelService';
import { AIModel } from '@/lib/db/schemas/ai-model';
import { generateSlug } from '@/lib/utils/slug';
import { logger } from '@/lib/logging/logger';

interface OpenRouterModel {
  id: string; // e.g., "openai/gpt-4"
  canonical_slug: string;
  name: string; // e.g., "GPT-4"
  created: number; // Unix timestamp
  pricing: {
    prompt: string; // Price per 1M prompt tokens (as string)
    completion: string; // Price per 1M completion tokens
    request?: string; // Price per request (for some models)
    image?: string; // Price per image (for image generation models)
  };
  context_length: number;
  architecture: {
    modality: string; // e.g., "text->text", "text->image"
    input_modalities: string[]; // ["text", "image"]
    output_modalities: string[]; // ["text", "image"]
    tokenizer?: string; // e.g., "GPT", "Claude"
    instruct_type?: string; // e.g., "chatml", "llama3"
  };
  top_provider?: {
    is_moderated: boolean;
    context_length: number;
    max_completion_tokens?: number;
  };
  per_request_limits?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  supported_parameters: string[]; // ["temperature", "top_p", "max_tokens", "tools", ...]
  default_parameters?: Record<string, any>;
  description?: string;
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

/**
 * Extract provider from OpenRouter model ID
 * e.g., "openai/gpt-4" -> "openai"
 */
function extractProvider(modelId: string): AIModel['provider'] {
  const providerMap: Record<string, AIModel['provider']> = {
    openai: 'openai',
    anthropic: 'anthropic',
    google: 'google',
    groq: 'groq',
    replicate: 'replicate',
    perplexity: 'perplexity',
    together: 'together',
    mistralai: 'mistral',
    mistral: 'mistral',
  };

  const provider = modelId.split('/')[0]?.toLowerCase() || '';
  return providerMap[provider] || 'openai'; // Default to openai if unknown
}

/**
 * Extract model name from OpenRouter model ID
 * e.g., "openai/gpt-4" -> "gpt-4"
 */
function extractModelName(modelId: string): string {
  const parts = modelId.split('/');
  return parts.length > 1 ? parts[1] : modelId;
}

/**
 * Map OpenRouter modalities to our schema format
 */
function mapModalities(architecture: OpenRouterModel['architecture']): AIModel['modalities'] {
  const mapModality = (modalities: string[], direction: 'input' | 'output'): string => {
    if (modalities.length === 0) return 'not-supported';
    if (direction === 'input' && architecture.input_modalities.includes(modalities[0])) {
      return architecture.output_modalities.includes(modalities[0]) ? 'input-output' : 'input-only';
    }
    if (direction === 'output' && architecture.output_modalities.includes(modalities[0])) {
      return architecture.input_modalities.includes(modalities[0]) ? 'input-output' : 'output-only';
    }
    return 'not-supported';
  };

  return {
    text: mapModality(['text'], 'input') === 'input-output' || mapModality(['text'], 'output') === 'input-output' 
      ? 'input-output' 
      : architecture.input_modalities.includes('text') ? 'input-only' 
      : architecture.output_modalities.includes('text') ? 'output-only' 
      : 'not-supported',
    image: architecture.input_modalities.includes('image') && architecture.output_modalities.includes('image')
      ? 'input-output'
      : architecture.input_modalities.includes('image') ? 'input-only'
      : architecture.output_modalities.includes('image') ? 'output-only'
      : 'not-supported',
    audio: architecture.input_modalities.includes('audio') && architecture.output_modalities.includes('audio')
      ? 'input-output'
      : architecture.input_modalities.includes('audio') ? 'input-only'
      : architecture.output_modalities.includes('audio') ? 'output-only'
      : 'not-supported',
    video: architecture.input_modalities.includes('video') && architecture.output_modalities.includes('video')
      ? 'input-output'
      : architecture.input_modalities.includes('video') ? 'input-only'
      : architecture.output_modalities.includes('video') ? 'output-only'
      : 'not-supported',
  };
}

/**
 * Map OpenRouter model to our AIModel schema
 */
function mapOpenRouterToModel(openRouterModel: OpenRouterModel): Partial<AIModel> {
  const provider = extractProvider(openRouterModel.id);
  const modelName = extractModelName(openRouterModel.id);
  const slug = generateSlug(openRouterModel.canonical_slug || openRouterModel.id);

  // Parse pricing (OpenRouter prices are per 1M tokens, we store per 1k)
  const costPer1kInputTokens = parseFloat(openRouterModel.pricing.prompt || '0') / 1000;
  const costPer1kOutputTokens = parseFloat(openRouterModel.pricing.completion || '0') / 1000;
  const costPer1kCachedInputTokens = openRouterModel.pricing.request 
    ? parseFloat(openRouterModel.pricing.request) / 1000 
    : undefined;

  // Map capabilities
  const capabilities: string[] = [];
  if (openRouterModel.architecture.input_modalities.includes('text') || 
      openRouterModel.architecture.output_modalities.includes('text')) {
    capabilities.push('text');
  }
  if (openRouterModel.architecture.input_modalities.includes('image') || 
      openRouterModel.architecture.output_modalities.includes('image')) {
    capabilities.push('vision');
  }
  if (openRouterModel.architecture.input_modalities.includes('audio') || 
      openRouterModel.architecture.output_modalities.includes('audio')) {
    capabilities.push('audio');
  }
  if (openRouterModel.architecture.input_modalities.includes('video') || 
      openRouterModel.architecture.output_modalities.includes('video')) {
    capabilities.push('video');
  }
  if (openRouterModel.supported_parameters.includes('tools') || 
      openRouterModel.supported_parameters.includes('function_calling')) {
    capabilities.push('function-calling');
  }
  if (openRouterModel.supported_parameters.includes('response_format') || 
      openRouterModel.supported_parameters.includes('json')) {
    capabilities.push('json-mode');
  }

  // Determine tier based on pricing
  const tier: AIModel['tier'] = 
    costPer1kInputTokens === 0 ? 'free' :
    costPer1kInputTokens < 0.01 ? 'affordable' :
    'premium';

  // Map supported parameters
  const supportedParameters: AIModel['supportedParameters'] = {
    temperature: openRouterModel.supported_parameters.includes('temperature') ? {
      supported: true,
      min: 0,
      max: 2,
      default: 1,
    } : undefined,
    maxTokens: openRouterModel.supported_parameters.includes('max_tokens') ? {
      supported: true,
      min: 1,
      max: openRouterModel.top_provider?.max_completion_tokens,
    } : undefined,
    stream: {
      supported: true, // Most models support streaming
      notes: 'Streaming is generally supported',
    },
    systemPrompt: {
      supported: true, // Most modern models support system prompts
      notes: 'System prompt support varies by model',
    },
  };

  const model: Partial<AIModel> = {
    id: openRouterModel.id, // Use full OpenRouter ID (e.g., "openai/gpt-4")
    slug,
    provider,
    name: modelName,
    displayName: openRouterModel.name,
    status: 'active',
    capabilities,
    contextWindow: openRouterModel.top_provider?.context_length || openRouterModel.context_length,
    maxOutputTokens: openRouterModel.top_provider?.max_completion_tokens || 
                     openRouterModel.per_request_limits?.completion_tokens,
    costPer1kInputTokens,
    costPer1kOutputTokens,
    costPer1kCachedInputTokens,
    inputCostPer1M: costPer1kInputTokens * 1000,
    outputCostPer1M: costPer1kOutputTokens * 1000,
    cachedInputCostPer1M: costPer1kCachedInputTokens ? costPer1kCachedInputTokens * 1000 : undefined,
    supportsStreaming: true, // Most models support streaming
    supportsJSON: openRouterModel.supported_parameters.includes('response_format') || 
                  openRouterModel.supported_parameters.includes('json'),
    supportsVision: openRouterModel.architecture.input_modalities.includes('image') || 
                    openRouterModel.architecture.output_modalities.includes('image'),
    recommended: false, // We'll set this manually for key models
    isDefault: false, // We'll set this manually for default models
    tier,
    isAllowed: true,
    tags: [
      ...(costPer1kInputTokens === 0 ? ['free'] : []),
      ...(tier === 'affordable' ? ['affordable'] : []),
      ...(capabilities.includes('vision') ? ['multimodal'] : []),
      ...(openRouterModel.supported_parameters.includes('tools') ? ['function-calling'] : []),
    ],
    description: openRouterModel.description,
    modalities: mapModalities(openRouterModel.architecture),
    features: {
      streaming: true,
      structuredOutputs: openRouterModel.supported_parameters.includes('response_format'),
      distillation: false, // Not available from OpenRouter
      functionCalling: openRouterModel.supported_parameters.includes('tools'),
      fineTuning: false, // Not available from OpenRouter
    },
    tools: {
      webSearch: openRouterModel.supported_parameters.includes('web_search') ||
                 openRouterModel.supported_parameters.includes('tools'),
      imageGeneration: openRouterModel.architecture.output_modalities.includes('image'),
      computerUse: false, // Not available from OpenRouter
      fileSearch: openRouterModel.supported_parameters.includes('file_search') ||
                  openRouterModel.supported_parameters.includes('tools'),
      codeInterpreter: openRouterModel.supported_parameters.includes('code_interpreter') ||
                       openRouterModel.supported_parameters.includes('tools'),
      mcp: false, // Not available from OpenRouter
    },
    supportedParameters,
    lastVerified: new Date(),
    createdAt: new Date(openRouterModel.created * 1000), // Convert Unix timestamp to Date
    updatedAt: new Date(),
  };

  return model;
}

/**
 * Fetch models from OpenRouter API
 */
async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const url = 'https://openrouter.ai/api/v1/models';

  console.log('📡 Fetching models from OpenRouter API...');
  console.log(`   URL: ${url}`);
  console.log(`   API Key: ${apiKey ? '✅ Provided' : '❌ Not provided (using free tier)'}\n`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add API key if available (optional, but provides better rate limits)
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();
    console.log(`✅ Fetched ${data.data.length} models from OpenRouter\n`);
    return data.data;
  } catch (error) {
    logger.error('Failed to fetch models from OpenRouter', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Main sync function
 */
async function syncFromOpenRouter() {
  console.log('🚀 Starting OpenRouter model sync...\n');

  try {
    // Ensure database connection
    await getMongoDb();
    console.log('✅ Database connected\n');

    // Fetch models from OpenRouter
    const openRouterModels = await fetchOpenRouterModels();

    // Map to our schema
    console.log('🔄 Mapping models to our schema...');
    const modelsToSync: Partial<AIModel>[] = [];

    for (const openRouterModel of openRouterModels) {
      try {
        const mappedModel = mapOpenRouterToModel(openRouterModel);
        modelsToSync.push(mappedModel);
      } catch (error) {
        console.warn(`⚠️  Failed to map model ${openRouterModel.id}:`, error);
        continue;
      }
    }

    console.log(`✅ Mapped ${modelsToSync.length} models\n`);

    // Sync to database
    console.log('💾 Syncing to database...');
    const result = await aiModelService.bulkUpsert(modelsToSync as AIModel[]);

    console.log('\n📊 Sync Summary:');
    console.log(`   ✅ Created: ${result.created} models`);
    console.log(`   ✅ Updated: ${result.updated} models`);
    console.log(`   ⏭️  Skipped: ${openRouterModels.length - result.created - result.updated} models`);
    console.log(`   📈 Total synced: ${result.created + result.updated} models\n`);

    console.log('✨ Sync completed successfully!');

  } catch (error) {
    logger.error('Failed to sync models from OpenRouter', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run sync
syncFromOpenRouter();

