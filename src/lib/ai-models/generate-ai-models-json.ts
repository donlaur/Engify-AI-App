/**
 * Generate AI Models JSON - Reusable Function
 *
 * Can be called from API routes or scripts
 * Similar to prompts JSON generation - pre-builds static JSON for fast loading
 */

import { aiModelService } from '@/lib/services/AIModelService';
import type { AIModel } from '@/lib/db/schemas/ai-model';
import fs from 'fs/promises';
import path from 'path';

interface AIModelExport {
  id: string;
  slug?: string;
  provider: string;
  name: string;
  displayName: string;
  codename?: string;
  status: 'active' | 'deprecated' | 'sunset';
  deprecationDate?: Date;
  sunsetDate?: Date;
  capabilities: string[];
  contextWindow: number;
  maxOutputTokens?: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  costPer1kCachedInputTokens?: number;
  supportsStreaming: boolean;
  supportsJSON: boolean;
  supportsVision: boolean;
  recommended: boolean;
  isDefault: boolean;
  tier?: 'free' | 'affordable' | 'premium';
  averageLatency?: number;
  qualityScore?: number;
  lastVerified?: Date;
  isAllowed: boolean;
  tags: string[];
  replacementModel?: string;
  notes?: string;
  knowledgeCutoff?: string;
  tagline?: string;
  description?: string;
  performanceMetrics?: {
    reasoning?: 'lower' | 'low' | 'medium' | 'high' | 'higher';
    speed?: 'slower' | 'slow' | 'medium' | 'fast' | 'faster';
    priceRange?: string;
  };
  modalities?: {
    text?: 'input-output' | 'input-only' | 'output-only' | 'not-supported';
    image?: 'input-output' | 'input-only' | 'output-only' | 'not-supported';
    audio?: 'input-output' | 'input-only' | 'output-only' | 'not-supported';
    video?: 'input-output' | 'input-only' | 'output-only' | 'not-supported';
  };
  features?: {
    streaming: boolean;
    structuredOutputs: boolean;
    distillation: boolean;
    functionCalling: boolean;
    fineTuning: boolean;
  };
  tools?: {
    webSearch: boolean;
    imageGeneration: boolean;
    computerUse: boolean;
    fileSearch: boolean;
    codeInterpreter: boolean;
  };
  endpoints?: Array<{
    name: string;
    path: string;
    supported: boolean;
    icon?: string;
  }>;
  snapshots?: Array<{
    id: string;
    pointsTo: string;
    isAlias: boolean;
    isSnapshot: boolean;
  }>;
  rateLimits?: Array<{
    tier: string;
    rpm?: number;
    tpm?: number;
    batchQueueLimit?: number;
  }>;
  supportedParameters?: {
    temperature?: {
      supported: boolean;
      min?: number;
      max?: number;
      default?: number;
      notes?: string;
    };
    maxTokens?: {
      supported: boolean;
      min?: number;
      max?: number;
      default?: number;
      notes?: string;
    };
    stream?: {
      supported: boolean;
      notes?: string;
    };
    systemPrompt?: {
      supported: boolean;
      notes?: string;
    };
  };
  parameterFailures?: Array<{
    parameter: string;
    error: string;
    attemptedValue?: any;
    timestamp: Date;
    source?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AIModelsExport {
  version: '1.0';
  generatedAt: string;
  totalModels: number;
  models: AIModelExport[];
  totals: {
    byProvider: Record<string, number>;
    byStatus: Record<string, number>;
    byTier: Record<string, number>;
    active: number;
    deprecated: number;
    sunset: number;
  };
}

/**
 * Generate AI models JSON file
 */
export async function generateAIModelsJson(): Promise<void> {
  // Fetch all models from MongoDB
  const models = await aiModelService.find({});

  // Count by provider, status, and tier
  const byProvider: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byTier: Record<string, number> = {};
  let active = 0;
  let deprecated = 0;
  let sunset = 0;

  models.forEach((model) => {
    byProvider[model.provider] = (byProvider[model.provider] || 0) + 1;
    byStatus[model.status] = (byStatus[model.status] || 0) + 1;
    if (model.tier) {
      byTier[model.tier] = (byTier[model.tier] || 0) + 1;
    }
    if (model.status === 'active') active++;
    if (model.status === 'deprecated') deprecated++;
    if (model.status === 'sunset') sunset++;
  });

  // Transform models for export
  const modelsExport: AIModelExport[] = models.map((model) => ({
    id: model.id,
    slug: model.slug,
    provider: model.provider,
    name: model.name,
    displayName: model.displayName,
    codename: model.codename,
    status: model.status,
    deprecationDate: model.deprecationDate,
    sunsetDate: model.sunsetDate,
    capabilities: model.capabilities,
    contextWindow: model.contextWindow,
    maxOutputTokens: model.maxOutputTokens,
    costPer1kInputTokens: model.costPer1kInputTokens,
    costPer1kOutputTokens: model.costPer1kOutputTokens,
    costPer1kCachedInputTokens: model.costPer1kCachedInputTokens,
    supportsStreaming: model.supportsStreaming,
    supportsJSON: model.supportsJSON,
    supportsVision: model.supportsVision,
    recommended: model.recommended,
    isDefault: model.isDefault,
    tier: model.tier,
    averageLatency: model.averageLatency,
    qualityScore: model.qualityScore,
    lastVerified: model.lastVerified,
    isAllowed: model.isAllowed,
    tags: model.tags,
    replacementModel: model.replacementModel,
    notes: model.notes,
    knowledgeCutoff: model.knowledgeCutoff,
    tagline: model.tagline,
    description: model.description,
    performanceMetrics: model.performanceMetrics,
    modalities: model.modalities,
    features: model.features,
    tools: model.tools,
    endpoints: model.endpoints,
    snapshots: model.snapshots,
    rateLimits: model.rateLimits,
    supportedParameters: model.supportedParameters,
    parameterFailures: model.parameterFailures,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  }));

  // Build new export object
  const newExportData: AIModelsExport = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalModels: models.length,
    models: modelsExport,
    totals: {
      byProvider,
      byStatus,
      byTier,
      active,
      deprecated,
      sunset,
    },
  };

  // Ensure public/data directory exists
  const dataDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  const jsonPath = path.join(dataDir, 'ai-models.json');

  // Check if content has actually changed
  let shouldWrite = true;
  try {
    const existingContent = await fs.readFile(jsonPath, 'utf-8');
    const existingData: AIModelsExport = JSON.parse(existingContent);
    
    // Compare everything except generatedAt timestamp
    const existingWithoutTimestamp = { ...existingData, generatedAt: '' };
    const newWithoutTimestamp = { ...newExportData, generatedAt: '' };
    
    if (JSON.stringify(existingWithoutTimestamp) === JSON.stringify(newWithoutTimestamp)) {
      // Content hasn't changed, just update timestamp
      existingData.generatedAt = new Date().toISOString();
      await fs.writeFile(jsonPath, JSON.stringify(existingData), 'utf-8');
      shouldWrite = false;
      console.log('[AI Models JSON] Content unchanged, refreshed timestamp only');
    }
  } catch (error) {
    // File doesn't exist or can't be read, write new file
    shouldWrite = true;
  }

  // Write new content if it changed
  if (shouldWrite) {
    const jsonContent = JSON.stringify(newExportData);
    await fs.writeFile(jsonPath, jsonContent, 'utf-8');
    console.log('[AI Models JSON] Content changed, regenerated file');
  }
}

