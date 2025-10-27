/**
 * Usage Tracking Schemas
 * 
 * Track AI usage, tokens, and rate limits per user
 */

import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const ObjectIdSchema = z.instanceof(ObjectId);

/**
 * AI Usage Log Schema
 * Track every AI request for billing and rate limiting
 */
export const AIUsageLogSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  organizationId: ObjectIdSchema.nullable(),
  
  // Request details
  provider: z.enum(['openai', 'anthropic', 'google', 'internal']),
  model: z.string(),
  promptId: ObjectIdSchema.nullable(), // If using a template
  
  // Usage metrics
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  
  // Cost tracking (in cents)
  estimatedCost: z.number().nonnegative(),
  
  // Request metadata
  promptLength: z.number().int().nonnegative(),
  responseLength: z.number().int().nonnegative(),
  latencyMs: z.number().int().nonnegative(),
  
  // Security
  wasRateLimited: z.boolean().default(false),
  wasBlocked: z.boolean().default(false),
  blockReason: z.string().nullable(),
  
  // Timestamps
  createdAt: z.date(),
});

export type AIUsageLog = z.infer<typeof AIUsageLogSchema>;

/**
 * User Usage Quota Schema
 * Track current usage against limits
 */
export const UserUsageQuotaSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  
  // Current period (resets monthly)
  periodStart: z.date(),
  periodEnd: z.date(),
  
  // Usage counters
  totalRequests: z.number().int().nonnegative().default(0),
  totalTokens: z.number().int().nonnegative().default(0),
  totalCost: z.number().nonnegative().default(0), // In cents
  
  // Limits based on plan
  requestLimit: z.number().int().positive(),
  tokenLimit: z.number().int().positive(),
  costLimit: z.number().positive(), // In cents
  
  // Rate limiting (per minute)
  requestsThisMinute: z.number().int().nonnegative().default(0),
  lastRequestAt: z.date().nullable(),
  
  // Status
  isBlocked: z.boolean().default(false),
  blockReason: z.string().nullable(),
  
  updatedAt: z.date(),
});

export type UserUsageQuota = z.infer<typeof UserUsageQuotaSchema>;

/**
 * Rate Limit Config by Plan
 */
export const RATE_LIMITS = {
  free: {
    requestsPerMinute: 5,
    requestsPerMonth: 100,
    tokensPerMonth: 50000,
    costLimitCents: 500, // $5
  },
  pro: {
    requestsPerMinute: 20,
    requestsPerMonth: 1000,
    tokensPerMonth: 500000,
    costLimitCents: 5000, // $50
  },
  team: {
    requestsPerMinute: 50,
    requestsPerMonth: 5000,
    tokensPerMonth: 2000000,
    costLimitCents: 20000, // $200
  },
  enterprise_starter: {
    requestsPerMinute: 100,
    requestsPerMonth: 20000,
    tokensPerMonth: 10000000,
    costLimitCents: 100000, // $1000
  },
} as const;

/**
 * Blocked Content Schema
 * Track and block malicious prompts
 */
export const BlockedContentSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  
  // Content that was blocked
  content: z.string(),
  contentHash: z.string(), // SHA256 hash
  
  // Why it was blocked
  reason: z.enum([
    'injection_attempt',
    'prompt_injection',
    'jailbreak_attempt',
    'excessive_tokens',
    'rate_limit_exceeded',
    'malicious_pattern',
    'abuse_detected',
  ]),
  
  // Detection details
  detectionMethod: z.string(),
  confidence: z.number().min(0).max(1),
  
  // Action taken
  actionTaken: z.enum(['blocked', 'flagged', 'rate_limited']),
  
  createdAt: z.date(),
});

export type BlockedContent = z.infer<typeof BlockedContentSchema>;
