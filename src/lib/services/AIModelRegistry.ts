/**
 * AI Model Registry
 * 
 * Bridge between static config and database registry
 * Provides unified interface for accessing AI models
 */

import { aiModelService } from './AIModelService';
import { AIModel } from '@/lib/db/schemas/ai-model';
import { AI_MODELS as STATIC_MODELS, AIModel as StaticAIModel } from '@/lib/config/ai-models';

/**
 * Get model from database registry (preferred) or fallback to static config
 */
export async function getModel(id: string): Promise<AIModel | StaticAIModel | null> {
  // Try database first
  const dbModel = await aiModelService.findById(id);
  if (dbModel) {
    return convertDbModelToStatic(dbModel);
  }

  // Fallback to static config
  return STATIC_MODELS.find(m => m.id === id) || null;
}

/**
 * Get all active/allowed models
 */
export async function getActiveModels(): Promise<(AIModel | StaticAIModel)[]> {
  const dbModels = await aiModelService.findActive();
  const staticModels = STATIC_MODELS.filter(m => !m.deprecated);

  // Merge: DB models take precedence, static models fill gaps
  const dbModelIds = new Set(dbModels.map(m => m.id));
  const staticOnly = staticModels.filter(m => !dbModelIds.has(m.id));

  return [
    ...dbModels.map(convertDbModelToStatic),
    ...staticOnly,
  ];
}

/**
 * Get models by provider
 */
export async function getModelsByProvider(provider: string): Promise<(AIModel | StaticAIModel)[]> {
  const dbModels = await aiModelService.findByProvider(provider as AIModel['provider']);
  const staticModels = STATIC_MODELS.filter(m => m.provider === provider && !m.deprecated);

  // Merge: DB models take precedence
  const dbModelIds = new Set(dbModels.map(m => m.id));
  const staticOnly = staticModels.filter(m => !dbModelIds.has(m.id));

  return [
    ...dbModels.map(convertDbModelToStatic),
    ...staticOnly,
  ];
}

/**
 * Check if model is allowed (from DB or static config)
 */
export async function isModelAllowed(id: string): Promise<boolean> {
  const dbModel = await aiModelService.findById(id);
  if (dbModel) {
    return dbModel.isAllowed && dbModel.status === 'active';
  }

  const staticModel = STATIC_MODELS.find(m => m.id === id);
  return staticModel !== undefined && !staticModel.deprecated;
}

/**
 * Migrate static config models to database
 */
export async function migrateStaticModelsToDb(): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  for (const staticModel of STATIC_MODELS) {
    const existing = await aiModelService.findById(staticModel.id);
    
    if (existing) {
      skipped++;
      continue;
    }

    // Convert static model to DB format
    const dbModel: AIModel = {
      id: staticModel.id,
      provider: staticModel.provider,
      name: staticModel.name,
      displayName: staticModel.name,
      status: staticModel.deprecated ? 'deprecated' : 'active',
      deprecationDate: staticModel.deprecated ? new Date() : undefined,
      capabilities: staticModel.capabilities,
      contextWindow: staticModel.contextWindow,
      maxOutputTokens: staticModel.maxOutputTokens,
      costPer1kInputTokens: staticModel.costPer1kInputTokens,
      costPer1kOutputTokens: staticModel.costPer1kOutputTokens,
      inputCostPer1M: staticModel.costPer1kInputTokens * 1000,
      outputCostPer1M: staticModel.costPer1kOutputTokens * 1000,
      supportsStreaming: true,
      supportsJSON: staticModel.capabilities.includes('json'),
      supportsVision: staticModel.capabilities.includes('vision'),
      recommended: false,
      isAllowed: !staticModel.deprecated,
      replacementModel: staticModel.replacementModel,
      notes: staticModel.notes,
      lastVerified: staticModel.lastVerified ? new Date(staticModel.lastVerified) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false,
      tags: [],
      parameterFailures: [],
    };

    await aiModelService.upsert(dbModel);
    created++;
  }

  return { created, skipped };
}

/**
 * Convert DB model to static model format (for compatibility)
 */
function convertDbModelToStatic(dbModel: AIModel): StaticAIModel {
  return {
    id: dbModel.id,
    name: dbModel.name,
    provider: dbModel.provider as StaticAIModel['provider'],
    contextWindow: dbModel.contextWindow,
    maxOutputTokens: dbModel.maxOutputTokens || 8192,
    costPer1kInputTokens: dbModel.costPer1kInputTokens,
    costPer1kOutputTokens: dbModel.costPer1kOutputTokens,
    capabilities: dbModel.capabilities,
    deprecated: dbModel.status === 'deprecated' || dbModel.status === 'sunset',
    replacementModel: dbModel.replacementModel,
    notes: dbModel.notes,
    lastVerified: dbModel.lastVerified?.toISOString().split('T')[0],
  };
}

