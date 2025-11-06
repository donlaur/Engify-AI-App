/**
 * Rate Limiting Constants
 * 
 * Single source of truth for all rate limiting values across the application.
 * Consolidates rate limits from multiple systems into one unified configuration.
 * 
 * Related:
 * - src/lib/rate-limit.ts (AI requests)
 * - src/lib/db/schemas/usage.ts (Plan-based limits)
 * - src/lib/security/feedback-rate-limit.ts (Feedback API)
 */

/**
 * AI Request Rate Limits
 * Used for AI provider API calls (GPT, Claude, Gemini, etc.)
 */
export const AI_RATE_LIMITS = {
  anonymous: {
    perMinute: 10,
    perHour: 20,
    perDay: 50,
    perMonth: 200,
    maxTokensPerRequest: 1000,
    maxTokensPerDay: 20000,
  },
  authenticated: {
    perMinute: 20,
    perHour: 20,
    perDay: 100,
    perMonth: 1000,
    maxTokensPerRequest: 4000,
    maxTokensPerDay: 100000,
  },
  pro: {
    perMinute: 200,
    perHour: 200,
    perDay: 2000,
    perMonth: 20000,
    maxTokensPerRequest: 8000,
    maxTokensPerDay: 1000000,
  },
  team: {
    perMinute: 500,
    perHour: 500,
    perDay: 5000,
    perMonth: 50000,
    maxTokensPerRequest: 16000,
    maxTokensPerDay: 2000000,
  },
  enterprise: {
    perMinute: 1000,
    perHour: 1000,
    perDay: 20000,
    perMonth: 200000,
    maxTokensPerRequest: 32000,
    maxTokensPerDay: 10000000,
  },
} as const;

/**
 * Feedback API Rate Limits
 * Used for user feedback endpoints (likes, ratings, comments)
 */
export const FEEDBACK_RATE_LIMITS = {
  anonymous: {
    perMinute: 10,
    perHour: 60,
    perDay: 200,
  },
  authenticated: {
    perMinute: 100,
    perHour: 1000,
    perDay: 5000,
  },
} as const;

/**
 * Public API Rate Limits
 * Used for public REST API endpoints
 */
export const API_RATE_LIMITS = {
  public: {
    perMinute: 60,
    perHour: 1000,
    perDay: 10000,
  },
  authenticated: {
    perMinute: 300,
    perHour: 5000,
    perDay: 50000,
  },
  admin: {
    perMinute: 1000,
    perHour: 20000,
    perDay: 100000,
  },
} as const;

/**
 * Cost Limits by Plan (in cents)
 */
export const COST_LIMITS = {
  free: 500, // $5
  pro: 5000, // $50
  team: 20000, // $200
  enterprise_starter: 100000, // $1000
  enterprise_growth: 500000, // $5000
  enterprise_scale: 2000000, // $20000
} as const;

/**
 * Plan-based Combined Limits
 * Unified configuration matching the usage quota system
 */
export const PLAN_RATE_LIMITS = {
  free: {
    requestsPerMinute: AI_RATE_LIMITS.authenticated.perMinute,
    requestsPerMonth: AI_RATE_LIMITS.authenticated.perMonth,
    tokensPerMonth: AI_RATE_LIMITS.authenticated.maxTokensPerDay * 30,
    costLimitCents: COST_LIMITS.free,
  },
  pro: {
    requestsPerMinute: AI_RATE_LIMITS.pro.perMinute,
    requestsPerMonth: AI_RATE_LIMITS.pro.perMonth,
    tokensPerMonth: AI_RATE_LIMITS.pro.maxTokensPerDay * 30,
    costLimitCents: COST_LIMITS.pro,
  },
  team: {
    requestsPerMinute: AI_RATE_LIMITS.team.perMinute,
    requestsPerMonth: AI_RATE_LIMITS.team.perMonth,
    tokensPerMonth: AI_RATE_LIMITS.team.maxTokensPerDay * 30,
    costLimitCents: COST_LIMITS.team,
  },
  enterprise_starter: {
    requestsPerMinute: AI_RATE_LIMITS.enterprise.perMinute,
    requestsPerMonth: AI_RATE_LIMITS.enterprise.perMonth,
    tokensPerMonth: AI_RATE_LIMITS.enterprise.maxTokensPerDay * 30,
    costLimitCents: COST_LIMITS.enterprise_starter,
  },
  enterprise_growth: {
    requestsPerMinute: AI_RATE_LIMITS.enterprise.perMinute * 2,
    requestsPerMonth: AI_RATE_LIMITS.enterprise.perMonth * 2,
    tokensPerMonth: AI_RATE_LIMITS.enterprise.maxTokensPerDay * 60,
    costLimitCents: COST_LIMITS.enterprise_growth,
  },
  enterprise_scale: {
    requestsPerMinute: AI_RATE_LIMITS.enterprise.perMinute * 5,
    requestsPerMonth: AI_RATE_LIMITS.enterprise.perMonth * 5,
    tokensPerMonth: AI_RATE_LIMITS.enterprise.maxTokensPerDay * 150,
    costLimitCents: COST_LIMITS.enterprise_scale,
  },
} as const;

/**
 * Type exports for type-safe usage
 */
export type RateLimitTier = keyof typeof AI_RATE_LIMITS;
export type PlanTier = keyof typeof PLAN_RATE_LIMITS;
export type APITier = keyof typeof API_RATE_LIMITS;

