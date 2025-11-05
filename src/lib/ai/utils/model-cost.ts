/**
 * Get Model Cost from Database
 * 
 * Retrieves pricing information from the AI models database registry
 * Falls back to static config if database is unavailable
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { AI_MODELS } from '@/lib/config/ai-models';

export interface ModelCost {
  inputCostPer1M: number;
  outputCostPer1M: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
}

/**
 * Get model cost from database, fallback to static config
 */
export async function getModelCost(modelId: string): Promise<ModelCost | null> {
  try {
    const db = await getMongoDb();
    const model = await db.collection('ai_models').findOne({ id: modelId });

    if (model && model.costPer1kInputTokens && model.costPer1kOutputTokens) {
      return {
        inputCostPer1M: model.inputCostPer1M || model.costPer1kInputTokens * 1000,
        outputCostPer1M: model.outputCostPer1M || model.costPer1kOutputTokens * 1000,
        costPer1kInputTokens: model.costPer1kInputTokens,
        costPer1kOutputTokens: model.costPer1kOutputTokens,
      };
    }
  } catch (error) {
    console.warn(`Failed to get model cost from DB for ${modelId}:`, error);
  }

  // Fallback to static config
  const staticModel = AI_MODELS.find((m) => m.id === modelId);
  if (staticModel) {
    return {
      inputCostPer1M: staticModel.costPer1kInputTokens * 1000,
      outputCostPer1M: staticModel.costPer1kOutputTokens * 1000,
      costPer1kInputTokens: staticModel.costPer1kInputTokens,
      costPer1kOutputTokens: staticModel.costPer1kOutputTokens,
    };
  }

  return null;
}

/**
 * Calculate cost from token usage using database pricing
 */
export async function calculateCostFromDB(
  modelId: string,
  promptTokens: number,
  completionTokens: number
): Promise<{
  input: number;
  output: number;
  total: number;
}> {
  const modelCost = await getModelCost(modelId);

  if (!modelCost) {
    console.warn(`Model ${modelId} not found in DB or config, using zero cost`);
    return { input: 0, output: 0, total: 0 };
  }

  const input = (promptTokens / 1000) * modelCost.costPer1kInputTokens;
  const output = (completionTokens / 1000) * modelCost.costPer1kOutputTokens;

  return {
    input,
    output,
    total: input + output,
  };
}

/**
 * Sync version - uses cached model registry for better performance
 * Requires AIModelRegistry to be available
 */
export function calculateCostFromModelRegistry(
  modelCost: ModelCost,
  promptTokens: number,
  completionTokens: number
): {
  input: number;
  output: number;
  total: number;
} {
  const input = (promptTokens / 1000) * modelCost.costPer1kInputTokens;
  const output = (completionTokens / 1000) * modelCost.costPer1kOutputTokens;

  return {
    input,
    output,
    total: input + output,
  };
}

