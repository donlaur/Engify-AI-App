/**
 * AI Models Sync API
 *
 * Syncs models from provider APIs (OpenAI, Anthropic, Google)
 * RBAC: Admin, Super Admin, and Org Admin roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/lib/middleware/rbac';
import { auth } from '@/lib/auth';
import { auditLog } from '@/lib/logging/audit';
import { aiModelService } from '@/lib/services/AIModelService';
import { AIModel } from '@/lib/db/schemas/ai-model';
import { generateSlug } from '@/lib/utils/slug';
import OpenAI from 'openai';
import { OPENAI_MODEL_DATA, convertOpenAIDataToModel } from '@/lib/data/openai-model-data';

// POST: Sync models from providers
export async function POST(request: NextRequest) {
  // RBAC: Allow super_admin and org_admin roles
  const r = await withRBAC({ roles: ['super_admin', 'org_admin'] })(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { provider } = body;

    let result: { created: number; updated: number } = { created: 0, updated: 0 };

    if (provider === 'openai' || !provider) {
      result = await syncOpenAIModels();
    }

    if (provider === 'anthropic' || !provider) {
      const anthropicResult = await syncAnthropicModels();
      result.created += anthropicResult.created;
      result.updated += anthropicResult.updated;
    }

    if (provider === 'google' || !provider || provider === 'all') {
      const googleResult = await syncGoogleModels();
      result.created += googleResult.created;
      result.updated += googleResult.updated;
    }

    if (provider === 'replicate' || provider === 'all') {
      // Fetch Replicate models from dedicated endpoint
      const baseUrl = new URL(request.url);
      baseUrl.pathname = '/api/admin/ai-models/sync/replicate';
      const replicateResponse = await fetch(baseUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('Cookie') || '',
        },
      });
      
      if (replicateResponse.ok) {
        const replicateData = await replicateResponse.json();
        if (replicateData.created) result.created += replicateData.created;
        if (replicateData.updated) result.updated += replicateData.updated;
      }
    }

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: 'ai_models',
      details: { action: 'models_synced', provider, ...result },
    });

    return NextResponse.json({
      success: true,
      message: 'Models synced successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error syncing AI models:', error);
    return NextResponse.json(
      { error: 'Failed to sync models', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Sync OpenAI models
 */
async function syncOpenAIModels(): Promise<{ created: number; updated: number }> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, skipping OpenAI sync');
    return { created: 0, updated: 0 };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const models = await openai.models.list();

  // Start with models from OpenAI API
  const apiModels: AIModel[] = models.data
    .filter((m) => m.id.includes('gpt') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('o4'))
    .map((m) => {
      const displayName = m.id
        .replace(/^gpt-/, 'GPT-')
        .replace(/^o1-/, 'O1-')
        .replace(/^o3-/, 'O3-')
        .replace(/^o4-/, 'O4-')
        .replace(/-preview$/i, ' Preview')
        .replace(/-turbo$/i, ' Turbo')
        .replace(/-2024\d+$/, '');
      
      // Check if we have structured data for this model
      const structuredData = OPENAI_MODEL_DATA[m.id];
      
      if (structuredData) {
        // Use structured data with conversion helper
        const baseModel = convertOpenAIDataToModel(
          structuredData,
          getOpenAIContextWindow(m.id),
          m.id.includes('gpt-4o') ? 16384 : m.id.includes('gpt-4') ? 8192 : 4096
        );

        return {
          ...baseModel,
          id: m.id,
          slug: generateSlug(m.id),
          provider: 'openai' as const,
          name: m.id,
          displayName: structuredData.displayName,
          status: 'active' as const,
          contextWindow: baseModel.contextWindow ?? getOpenAIContextWindow(m.id),
          costPer1kInputTokens: baseModel.costPer1kInputTokens ?? getOpenAICost(m.id, 'input'),
          costPer1kOutputTokens: baseModel.costPer1kOutputTokens ?? getOpenAICost(m.id, 'output'),
          capabilities: baseModel.capabilities || ['text'],
          supportsStreaming: baseModel.supportsStreaming ?? true,
          supportsJSON: baseModel.supportsJSON ?? false,
          supportsVision: baseModel.supportsVision ?? false,
          isDefault: baseModel.isDefault ?? false,
          isAllowed: baseModel.isAllowed ?? true,
          recommended: baseModel.recommended ?? false,
          tags: getOpenAITags(m.id),
          parameterFailures: [],
          lastVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } satisfies AIModel;
      }
      
      // Fallback to existing logic for models not in structured data
      return {
        id: m.id,
        slug: generateSlug(m.id),
        provider: 'openai' as const,
        name: m.id,
        displayName,
        status: 'active' as const,
        capabilities: ['text', ...(m.id.includes('vision') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('o4') ? ['vision'] : [])],
        contextWindow: getOpenAIContextWindow(m.id),
        maxOutputTokens: m.id.includes('gpt-4o') ? 16384 : m.id.includes('gpt-4') ? 8192 : 4096,
        costPer1kInputTokens: getOpenAICost(m.id, 'input'),
        costPer1kOutputTokens: getOpenAICost(m.id, 'output'),
        inputCostPer1M: getOpenAICost(m.id, 'input') * 1000,
        outputCostPer1M: getOpenAICost(m.id, 'output') * 1000,
        supportsStreaming: true,
        supportsJSON: m.id.includes('o') || m.id.includes('gpt-4'),
        supportsVision: m.id.includes('vision') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('o4'),
        recommended: m.id.includes('gpt-4o') && !m.id.includes('mini'),
        tier: m.id.includes('gpt-4o-mini') || m.id.includes('gpt-3.5') ? 'affordable' as const : 'premium' as const,
        isDefault: false,
        isAllowed: true,
        tags: getOpenAITags(m.id),
        parameterFailures: [],
        lastVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } satisfies AIModel;
    });

  // Add structured models that might not be in the API list (e.g., GPT-5 series, Sora 2)
  // These are hypothetical/future models that we want to track
  const structuredModels: AIModel[] = Object.values(OPENAI_MODEL_DATA)
    .filter((data) => {
      // Only add if not already in API models
      return !apiModels.some((m) => m.id === data.id);
    })
    .map((data) => {
      const baseModel = convertOpenAIDataToModel(
        data,
        data.id.includes('gpt-5') ? 400000 : 128000,
        data.id.includes('gpt-5') ? 128000 : 8192
      );
      
      return {
        ...baseModel,
        id: data.id,
        name: data.id,
        displayName: data.displayName,
        slug: generateSlug(data.id),
        provider: 'openai' as const,
        status: 'active' as const,
        contextWindow: baseModel.contextWindow ?? (data.id.includes('gpt-5') ? 400000 : 128000),
        costPer1kInputTokens: baseModel.costPer1kInputTokens ?? 0,
        costPer1kOutputTokens: baseModel.costPer1kOutputTokens ?? 0,
        capabilities: baseModel.capabilities || ['text'],
        supportsStreaming: baseModel.supportsStreaming ?? true,
        supportsJSON: baseModel.supportsJSON ?? false,
        supportsVision: baseModel.supportsVision ?? false,
        isDefault: baseModel.isDefault ?? false,
        isAllowed: baseModel.isAllowed ?? true,
        recommended: baseModel.recommended ?? false,
        parameterFailures: [],
        tags: getOpenAITags(data.id),
        lastVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } satisfies AIModel;
    });

  const allModels = [...apiModels, ...structuredModels];

  return await aiModelService.bulkUpsert(allModels);
}

/**
 * Sync Anthropic models
 */
async function syncAnthropicModels(): Promise<{ created: number; updated: number }> {
  // Anthropic doesn't have a public models list API
  // Updated with latest models as of Nov 2024
  const knownModels: Array<{ name: string; displayName: string; contextWindow: number; deprecated?: boolean }> = [
    // Claude 3.5 Series (latest)
    { name: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet', contextWindow: 200000 },
    { name: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku', contextWindow: 200000 },
    // Claude 3 Series (deprecated - replaced by 3.5)
    { name: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus', contextWindow: 200000, deprecated: true },
    { name: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet', contextWindow: 200000, deprecated: true },
    { name: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku', contextWindow: 200000, deprecated: true },
  ];

  const aiModels: AIModel[] = knownModels.map((m) => ({
    id: m.name, // Use model name as ID (matches config)
    slug: generateSlug(m.name), // Generate slug for SEO URLs
    provider: 'anthropic' as const,
    name: m.name,
    displayName: m.displayName,
    status: m.deprecated ? ('deprecated' as const) : ('active' as const),
    deprecationDate: m.deprecated ? new Date() : undefined,
    capabilities: ['text', 'vision'],
    contextWindow: m.contextWindow,
    maxOutputTokens: m.name.includes('3-5-sonnet') || m.name.includes('opus') ? 8192 : m.name.includes('sonnet') || m.name.includes('opus') ? 8192 : 4096,
    costPer1kInputTokens: getAnthropicCost(m.name, 'input'),
    costPer1kOutputTokens: getAnthropicCost(m.name, 'output'),
    inputCostPer1M: getAnthropicCost(m.name, 'input') * 1000,
    outputCostPer1M: getAnthropicCost(m.name, 'output') * 1000,
    supportsStreaming: true,
    supportsJSON: false,
    supportsVision: true,
    recommended: m.name.includes('3-5-sonnet') || m.name.includes('3-5-haiku'),
    tier: m.name.includes('haiku') ? 'affordable' as const : 'premium' as const,
    isDefault: false,
    isAllowed: !m.deprecated, // Deprecated models not allowed by default
    tags: getAnthropicTags(m.name),
    replacementModel: m.deprecated ? 'claude-3-5-sonnet-20241022' : undefined, // Suggest 3.5 Sonnet as replacement
    parameterFailures: [],
    lastVerified: m.deprecated ? undefined : new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies AIModel));

  return await aiModelService.bulkUpsert(aiModels);
}

/**
 * Sync Google models
 */
async function syncGoogleModels(): Promise<{ created: number; updated: number }> {
  // Google Gemini models (updated as of Nov 2024)
  // Many Gemini 1.0 and 1.5 models are deprecated/removed as of 2025
  const knownModels: Array<{ name: string; displayName: string; codename?: string; deprecated?: boolean }> = [
    // Gemini 2.0 Series (latest experimental)
    { name: 'gemini-2.0-flash-exp', displayName: 'Gemini 2.0 Flash Experimental', codename: 'flash' },
    // Gemini 1.5 Series - many deprecated
    { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', codename: 'pro', deprecated: true }, // Deprecated/removed
    { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', codename: 'flash', deprecated: true }, // Deprecated/removed
    { name: 'gemini-1.5-flash-8b', displayName: 'Gemini 1.5 Flash 8B', codename: 'flash-8b', deprecated: true }, // Deprecated/removed
    // Gemini 1.0 Series (legacy - all deprecated)
    { name: 'gemini-pro', displayName: 'Gemini Pro', codename: 'pro', deprecated: true },
    { name: 'gemini-pro-vision', displayName: 'Gemini Pro Vision', codename: 'pro-vision', deprecated: true },
  ];

  const aiModels: AIModel[] = knownModels.map((m) => ({
    id: m.name, // Use model name as ID (matches config)
    slug: generateSlug(m.name), // Generate slug for SEO URLs
    provider: 'google' as const,
    name: m.name,
    displayName: m.displayName,
    codename: m.codename, // Internal codename (nano, banana, flash, etc.)
    status: m.deprecated ? ('deprecated' as const) : ('active' as const),
    deprecationDate: m.deprecated ? new Date() : undefined,
    capabilities: ['text', 'vision'],
    contextWindow: 1000000, // Gemini has large context
    maxOutputTokens: 8192,
    costPer1kInputTokens: getGoogleCost(m.name, 'input'),
    costPer1kOutputTokens: getGoogleCost(m.name, 'output'),
    inputCostPer1M: getGoogleCost(m.name, 'input') * 1000,
    outputCostPer1M: getGoogleCost(m.name, 'output') * 1000,
    supportsStreaming: true,
    supportsJSON: true,
    supportsVision: true,
    recommended: m.name.includes('2.0') && !m.deprecated,
    tier: getGoogleCost(m.name, 'input') === 0 ? 'free' as const : 'affordable' as const,
    isDefault: false,
    isAllowed: !m.deprecated, // Deprecated models not allowed
    tags: ['fast', 'multimodal'],
    replacementModel: m.deprecated ? 'gemini-2.0-flash-exp' : undefined, // Suggest 2.0 Flash as replacement
    parameterFailures: [],
    lastVerified: m.deprecated ? undefined : new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies AIModel));

  return await aiModelService.bulkUpsert(aiModels);
}

// Helper functions for pricing (as of Nov 2025)
function getOpenAIContextWindow(modelId: string): number {
  // O-series models (reasoning)
  if (modelId.includes('o1') || modelId.includes('o3') || modelId.includes('o4')) return 200000;
  // GPT-4o series
  if (modelId.includes('gpt-4o')) return 128000;
  // GPT-4 Turbo series
  if (modelId.includes('gpt-4-turbo')) return 128000;
  // GPT-4 base
  if (modelId.includes('gpt-4')) return 8192;
  // GPT-3.5 series
  if (modelId.includes('gpt-3.5')) return 16385;
  return 128000; // Default
}

function getOpenAICost(modelId: string, type: 'input' | 'output'): number {
  // Prices per 1K tokens as of Nov 2024 (updated with latest pricing)
  // O-series models (reasoning - premium pricing)
  if (modelId.includes('o1') || modelId.includes('o3') || modelId.includes('o4')) {
    return type === 'input' ? 15.00 / 1000 : 60.00 / 1000; // Higher for reasoning models
  }
  // GPT-4o series (latest, best price/performance)
  if (modelId.includes('gpt-4o-mini')) {
    return type === 'input' ? 0.15 / 1000 : 0.60 / 1000; // $0.15/$0.60 per 1M
  }
  if (modelId.includes('gpt-4o')) {
    return type === 'input' ? 2.50 / 1000 : 10.00 / 1000; // $2.50/$10 per 1M
  }
  // GPT-4 Turbo series
  if (modelId.includes('gpt-4-turbo')) {
    return type === 'input' ? 10.00 / 1000 : 30.00 / 1000;
  }
  // GPT-4 base
  if (modelId.includes('gpt-4')) {
    return type === 'input' ? 30.00 / 1000 : 60.00 / 1000;
  }
  // GPT-3.5 series (affordable)
  if (modelId.includes('gpt-3.5')) {
    return type === 'input' ? 0.50 / 1000 : 1.50 / 1000;
  }
  return 1.00 / 1000; // Default
}

function getOpenAITags(modelId: string): string[] {
  const tags: string[] = [];
  if (modelId.includes('gpt-4o')) tags.push('smart', 'fast', 'latest', 'recommended');
  if (modelId.includes('gpt-4o-mini')) tags.push('smart', 'fast', 'affordable', 'latest');
  if (modelId.includes('gpt-4')) tags.push('smart', 'expensive');
  if (modelId.includes('vision')) tags.push('multimodal');
  if (modelId.includes('o1') || modelId.includes('o3') || modelId.includes('o4')) {
    tags.push('reasoning', 'advanced');
  }
  return tags;
}

function getAnthropicCost(modelName: string, type: 'input' | 'output'): number {
  // Prices per 1K tokens as of Nov 2024 (updated with latest pricing)
  // Claude 3.5 series (latest)
  if (modelName.includes('3-5-sonnet')) {
    return type === 'input' ? 3.00 / 1000 : 15.00 / 1000; // $3/$15 per 1M
  }
  if (modelName.includes('3-5-haiku')) {
    return type === 'input' ? 0.25 / 1000 : 1.25 / 1000; // $0.25/$1.25 per 1M
  }
  // Claude 3 Opus (most capable)
  if (modelName.includes('opus')) {
    return type === 'input' ? 15.00 / 1000 : 75.00 / 1000; // $15/$75 per 1M
  }
  // Claude 3 Sonnet
  if (modelName.includes('sonnet')) {
    return type === 'input' ? 3.00 / 1000 : 15.00 / 1000;
  }
  // Claude 3 Haiku (fastest, cheapest)
  if (modelName.includes('haiku')) {
    return type === 'input' ? 0.25 / 1000 : 1.25 / 1000;
  }
  return 1.00 / 1000;
}

function getAnthropicTags(modelName: string): string[] {
  const tags: string[] = ['smart'];
  if (modelName.includes('3-5')) tags.push('latest');
  if (modelName.includes('sonnet')) tags.push('balanced', 'recommended');
  if (modelName.includes('haiku')) tags.push('fast', 'affordable');
  if (modelName.includes('opus')) tags.push('expensive', 'highest-quality');
  return tags;
}

function getGoogleCost(modelName: string, type: 'input' | 'output'): number {
  // Gemini pricing as of Nov 2025
  if (modelName.includes('2.0')) {
    return type === 'input' ? 0.075 / 1000 : 0.30 / 1000; // Free tier
  }
  return type === 'input' ? 1.25 / 1000 : 5.00 / 1000;
}

