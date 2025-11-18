/**
 * AI Model Schema
 * Validation for AI models stored in MongoDB registry
 */

import { z } from 'zod';

export const AIModelSchema = z.object({
  _id: z.string().optional(),
  id: z.string(), // Unique identifier: matches config (e.g., 'gpt-4o', 'claude-3-5-sonnet-20241022')
  slug: z.string().optional(), // URL-friendly slug for SEO (e.g., 'gpt-4o', 'claude-3-5-sonnet')
  provider: z.enum([
    'openai',
    'anthropic',
    'google',
    'groq',
    'replicate',
    'perplexity',
    'together',
    'mistral',
  ]),
  name: z.string(), // Actual model name used in API: 'gpt-4o'
  displayName: z.string(), // Human-readable: 'GPT-4o'
  codename: z.string().optional(), // Internal codename (e.g., 'nano', 'banana', 'flash' for Gemini)
  status: z.enum(['active', 'deprecated', 'sunset']).default('active'),
  deprecationDate: z.date().optional(),
  sunsetDate: z.date().optional(),
  capabilities: z.array(z.string()).default([]), // ['text', 'function-calling', 'json-mode', 'vision']
  contextWindow: z.number(), // 128000
  maxOutputTokens: z.number().optional(), // 16384
  costPer1kInputTokens: z.number(), // 0.0025 (in dollars per 1k tokens)
  costPer1kOutputTokens: z.number(), // 0.01
  costPer1kCachedInputTokens: z.number().optional(), // Cached input pricing (e.g., OpenAI)
  // Compatibility with providers.ts interface
  inputCostPer1M: z.number().optional(), // Auto-calculated from costPer1kInputTokens * 1000
  outputCostPer1M: z.number().optional(), // Auto-calculated from costPer1kOutputTokens * 1000
  cachedInputCostPer1M: z.number().optional(), // Auto-calculated from costPer1kCachedInputTokens * 1000
  supportsStreaming: z.boolean().default(true),
  supportsJSON: z.boolean().default(false),
  supportsVision: z.boolean().default(false),
  recommended: z.boolean().default(false),
  isDefault: z.boolean().default(false), // Default model for provider
  tier: z.enum(['free', 'affordable', 'premium']).optional(),
  averageLatency: z.number().optional(), // milliseconds
  qualityScore: z.number().min(0).max(10).optional(),
  lastVerified: z.date().optional(),
  isAllowed: z.boolean().default(true), // Admin toggle
  tags: z.array(z.string()).default([]), // ['fast', 'expensive', 'smart', 'multimodal']
  replacementModel: z.string().optional(), // ID of model to use instead if deprecated (matches config field name)
  notes: z.string().optional(),
  organizationId: z.string().optional(), // Multi-tenant support (null = system-wide)
  
  // OpenAI-style metadata
  knowledgeCutoff: z.string().optional(), // e.g., "Sep 30, 2024"
  tagline: z.string().optional(), // e.g., "The best model for coding and agentic tasks"
  description: z.string().optional(), // Detailed model description
  
  // Performance indicators (OpenAI-style)
  performanceMetrics: z.object({
    reasoning: z.enum(['lower', 'low', 'medium', 'high', 'higher']).optional(),
    speed: z.enum(['slower', 'slow', 'medium', 'fast', 'faster']).optional(),
    priceRange: z.string().optional(), // e.g., "$1.25 - $10"
  }).optional(),
  
  // Modalities (Input/Output support)
  modalities: z.object({
    text: z.enum(['input-output', 'input-only', 'output-only', 'not-supported']).optional(),
    image: z.enum(['input-output', 'input-only', 'output-only', 'not-supported']).optional(),
    audio: z.enum(['input-output', 'input-only', 'output-only', 'not-supported']).optional(),
    video: z.enum(['input-output', 'input-only', 'output-only', 'not-supported']).optional(),
  }).optional(),
  
  // Features (boolean flags)
  features: z.object({
    streaming: z.boolean().default(true),
    structuredOutputs: z.boolean().default(false),
    distillation: z.boolean().default(false),
    functionCalling: z.boolean().default(false),
    fineTuning: z.boolean().default(false),
  }).optional(),
  
  // Tools supported (when using Responses API or similar)
  tools: z.object({
    webSearch: z.boolean().default(false),
    imageGeneration: z.boolean().default(false),
    computerUse: z.boolean().default(false),
    fileSearch: z.boolean().default(false),
    codeInterpreter: z.boolean().default(false),
  }).optional(),
  
  // API Endpoints supported
  endpoints: z.array(z.object({
    name: z.string(), // e.g., "Chat Completions"
    path: z.string(), // e.g., "v1/chat/completions"
    supported: z.boolean().default(true),
    icon: z.string().optional(), // Icon identifier
  })).optional(),
  
  // Model snapshots/versions (aliases)
  snapshots: z.array(z.object({
    id: z.string(), // e.g., "gpt-5"
    pointsTo: z.string(), // e.g., "gpt-5-2025-08-07"
    isAlias: z.boolean().default(false),
    isSnapshot: z.boolean().default(false),
  })).optional(),
  
  // Rate limits by tier
  rateLimits: z.array(z.object({
    tier: z.string(), // e.g., "Free", "Tier 1", "Tier 2"
    rpm: z.number().optional(), // Requests per minute
    tpm: z.number().optional(), // Tokens per minute
    batchQueueLimit: z.number().optional(), // Batch queue limit
  })).optional(),
  
  // Parameter support tracking
  supportedParameters: z.object({
    temperature: z.object({
      supported: z.boolean().default(true),
      min: z.number().optional(),
      max: z.number().optional(),
      default: z.number().optional(),
      notes: z.string().optional(), // e.g., "Gemini uses 0-1 range"
    }).optional(),
    maxTokens: z.object({
      supported: z.boolean().default(true),
      min: z.number().optional(),
      max: z.number().optional(),
      default: z.number().optional(),
      notes: z.string().optional(), // e.g., "Use maxOutputTokens instead"
    }).optional(),
    stream: z.object({
      supported: z.boolean().default(true),
      notes: z.string().optional(),
    }).optional(),
    systemPrompt: z.object({
      supported: z.boolean().default(true),
      notes: z.string().optional(), // e.g., "Must be prepended to user message"
    }).optional(),
  }).optional(),
  parameterFailures: z.array(z.object({
    parameter: z.string(), // 'temperature', 'maxTokens', etc.
    error: z.string(), // Error message received
    attemptedValue: z.any().optional(), // What value was tried
    timestamp: z.date(),
    source: z.string().optional(), // Where it failed (e.g., 'test-all-ai-models', 'audit-prompts')
  })).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type AIModel = z.infer<typeof AIModelSchema>;

/**
 * Model Update Schema
 * Tracks news/announcements about models
 */
export const ModelUpdateSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  modelId: z.string(), // Reference to AIModel.id
  type: z.enum(['release', 'deprecation', 'sunset', 'price-change', 'update']),
  title: z.string(),
  description: z.string(),
  sourceUrl: z.string().url().optional(),
  effectiveDate: z.date(),
  createdAt: z.date().optional(),
});

export type ModelUpdate = z.infer<typeof ModelUpdateSchema>;
