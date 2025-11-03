/**
 * AI Model Schema
 * Validation for AI models stored in MongoDB registry
 */

import { z } from 'zod';

export const AIModelSchema = z.object({
  _id: z.string().optional(),
  id: z.string(), // Unique identifier: matches config (e.g., 'gpt-4o', 'claude-3-5-sonnet-20241022')
  provider: z.enum(['openai', 'anthropic', 'google', 'groq', 'replicate', 'perplexity', 'together', 'mistral']),
  name: z.string(), // Actual model name used in API: 'gpt-4o'
  displayName: z.string(), // Human-readable: 'GPT-4o'
  status: z.enum(['active', 'deprecated', 'sunset']).default('active'),
  deprecationDate: z.date().optional(),
  sunsetDate: z.date().optional(),
  capabilities: z.array(z.string()).default([]), // ['text', 'function-calling', 'json-mode', 'vision']
  contextWindow: z.number(), // 128000
  maxOutputTokens: z.number().optional(), // 16384
  costPer1kInputTokens: z.number(), // 0.0025 (in dollars per 1k tokens)
  costPer1kOutputTokens: z.number(), // 0.01
  // Compatibility with providers.ts interface
  inputCostPer1M: z.number().optional(), // Auto-calculated from costPer1kInputTokens * 1000
  outputCostPer1M: z.number().optional(), // Auto-calculated from costPer1kOutputTokens * 1000
  supportsStreaming: z.boolean().default(true),
  supportsJSON: z.boolean().default(false),
  supportsVision: z.boolean().default(false),
  recommended: z.boolean().default(false),
  tier: z.enum(['free', 'affordable', 'premium']).optional(),
  averageLatency: z.number().optional(), // milliseconds
  qualityScore: z.number().min(0).max(10).optional(),
  lastVerified: z.date().optional(),
  isAllowed: z.boolean().default(true), // Admin toggle
  tags: z.array(z.string()).default([]), // ['fast', 'expensive', 'smart', 'multimodal']
  replacementModel: z.string().optional(), // ID of model to use instead if deprecated (matches config field name)
  notes: z.string().optional(),
  organizationId: z.string().optional(), // Multi-tenant support (null = system-wide)
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

