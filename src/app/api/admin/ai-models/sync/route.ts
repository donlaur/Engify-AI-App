/**
 * AI Models Sync API
 * 
 * Syncs models from provider APIs (OpenAI, Anthropic, Google)
 * RBAC: Super Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { auth } from '@/lib/auth';
import { auditLog } from '@/lib/logging/audit';
import { aiModelService } from '@/lib/services/AIModelService';
import { AIModel } from '@/lib/db/schemas/ai-model';
import OpenAI from 'openai';

// POST: Sync models from providers
export async function POST(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
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

  const aiModels: AIModel[] = models.data
    .filter((m) => m.id.includes('gpt') || m.id.includes('o1'))
    .map((m) => {
      return {
        id: m.id, // Use model ID as-is (matches config)
        provider: 'openai' as const,
        name: m.id,
        displayName: m.id
          .replace(/^gpt-/, 'GPT-')
          .replace(/^o1-/, 'O1-')
          .replace(/-preview$/i, ' Preview')
          .replace(/-turbo$/i, ' Turbo'),
        status: 'active' as const,
        capabilities: ['text', ...(m.id.includes('vision') || m.id.includes('o1') ? ['vision'] : [])],
        contextWindow: getOpenAIContextWindow(m.id),
        maxOutputTokens: m.id.includes('gpt-4o') ? 16384 : 4096,
        costPer1kInputTokens: getOpenAICost(m.id, 'input'),
        costPer1kOutputTokens: getOpenAICost(m.id, 'output'),
        inputCostPer1M: getOpenAICost(m.id, 'input') * 1000,
        outputCostPer1M: getOpenAICost(m.id, 'output') * 1000,
        supportsStreaming: true,
        supportsJSON: m.id.includes('o') || m.id.includes('gpt-4'),
        supportsVision: m.id.includes('vision') || m.id.includes('o1'),
        recommended: m.id.includes('gpt-4o'),
        tier: m.id.includes('gpt-4o-mini') ? 'affordable' as const : 'premium' as const,
        isAllowed: true,
        tags: getOpenAITags(m.id),
        lastVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } satisfies AIModel;
    });

  return await aiModelService.bulkUpsert(aiModels);
}

/**
 * Sync Anthropic models
 */
async function syncAnthropicModels(): Promise<{ created: number; updated: number }> {
  // Anthropic doesn't have a public models list API
  // Use known models as of Nov 2025
  const knownModels: Array<{ name: string; displayName: string; contextWindow: number }> = [
    { name: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet', contextWindow: 200000 },
    { name: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus', contextWindow: 200000 },
    { name: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku', contextWindow: 200000 },
  ];

  const aiModels: AIModel[] = knownModels.map((m) => ({
    id: m.name, // Use model name as ID (matches config)
    provider: 'anthropic' as const,
    name: m.name,
    displayName: m.displayName,
    status: 'active' as const,
    capabilities: ['text', 'vision'],
    contextWindow: m.contextWindow,
    maxOutputTokens: m.name.includes('sonnet') || m.name.includes('opus') ? 8192 : 4096,
    costPer1kInputTokens: getAnthropicCost(m.name, 'input'),
    costPer1kOutputTokens: getAnthropicCost(m.name, 'output'),
    inputCostPer1M: getAnthropicCost(m.name, 'input') * 1000,
    outputCostPer1M: getAnthropicCost(m.name, 'output') * 1000,
    supportsStreaming: true,
    supportsJSON: false,
    supportsVision: true,
    recommended: m.name.includes('sonnet'),
    tier: m.name.includes('haiku') ? 'affordable' as const : 'premium' as const,
    isAllowed: true,
    tags: getAnthropicTags(m.name),
    lastVerified: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies AIModel));

  return await aiModelService.bulkUpsert(aiModels);
}

/**
 * Sync Google models
 */
async function syncGoogleModels(): Promise<{ created: number; updated: number }> {
  // Google Gemini models (as of Nov 2025)
  const knownModels: Array<{ name: string; displayName: string }> = [
    { name: 'gemini-2.0-flash-exp', displayName: 'Gemini 2.0 Flash Experimental' },
    { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' }, // If still available
    { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' }, // If still available
  ];

  const aiModels: AIModel[] = knownModels.map((m) => ({
    id: m.name, // Use model name as ID (matches config)
    provider: 'google' as const,
    name: m.name,
    displayName: m.displayName,
    status: 'active' as const,
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
    recommended: m.name.includes('2.0'),
    tier: getGoogleCost(m.name, 'input') === 0 ? 'free' as const : 'affordable' as const,
    isAllowed: true,
    tags: ['fast', 'multimodal'],
    lastVerified: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies AIModel));

  return await aiModelService.bulkUpsert(aiModels);
}

// Helper functions for pricing (as of Nov 2025)
function getOpenAIContextWindow(modelId: string): number {
  if (modelId.includes('gpt-4o')) return 128000;
  if (modelId.includes('gpt-4-turbo')) return 128000;
  if (modelId.includes('gpt-4')) return 8192;
  if (modelId.includes('gpt-3.5')) return 16385;
  return 128000; // Default
}

function getOpenAICost(modelId: string, type: 'input' | 'output'): number {
  // Prices per 1M tokens as of Nov 2025
  if (modelId.includes('gpt-4o')) {
    return type === 'input' ? 2.50 / 1000 : 10.00 / 1000; // $2.50/$10 per 1M
  }
  if (modelId.includes('gpt-4-turbo')) {
    return type === 'input' ? 10.00 / 1000 : 30.00 / 1000;
  }
  if (modelId.includes('gpt-4')) {
    return type === 'input' ? 30.00 / 1000 : 60.00 / 1000;
  }
  if (modelId.includes('gpt-3.5')) {
    return type === 'input' ? 0.50 / 1000 : 1.50 / 1000;
  }
  return 1.00 / 1000; // Default
}

function getOpenAITags(modelId: string): string[] {
  const tags: string[] = [];
  if (modelId.includes('gpt-4o')) tags.push('smart', 'fast', 'latest');
  if (modelId.includes('gpt-4')) tags.push('smart', 'expensive');
  if (modelId.includes('vision')) tags.push('multimodal');
  if (modelId.includes('o1')) tags.push('reasoning');
  return tags;
}

function getAnthropicCost(modelName: string, type: 'input' | 'output'): number {
  // Prices per 1M tokens as of Nov 2025
  if (modelName.includes('opus')) {
    return type === 'input' ? 15.00 / 1000 : 75.00 / 1000;
  }
  if (modelName.includes('sonnet')) {
    return type === 'input' ? 3.00 / 1000 : 15.00 / 1000;
  }
  if (modelName.includes('haiku')) {
    return type === 'input' ? 0.25 / 1000 : 1.25 / 1000;
  }
  return 1.00 / 1000;
}

function getAnthropicTags(modelName: string): string[] {
  const tags: string[] = ['smart'];
  if (modelName.includes('sonnet')) tags.push('balanced');
  if (modelName.includes('haiku')) tags.push('fast', 'cheap');
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

