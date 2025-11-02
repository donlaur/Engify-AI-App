/**
 * Application Limits & Thresholds
 * 
 * Consolidates all numeric limits, thresholds, and configuration values
 * used throughout the application. Single source of truth for boundaries.
 */

/**
 * Pagination Limits
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
  DEFAULT_SKIP: 0,
} as const;

/**
 * Content Length Limits
 */
export const CONTENT_LIMITS = {
  PROMPT_TITLE_MIN: 3,
  PROMPT_TITLE_MAX: 200,
  PROMPT_DESCRIPTION_MIN: 10,
  PROMPT_DESCRIPTION_MAX: 500,
  PROMPT_CONTENT_MIN: 50,
  PROMPT_CONTENT_MAX: 10000,
  
  PATTERN_TITLE_MIN: 3,
  PATTERN_TITLE_MAX: 200,
  PATTERN_DESCRIPTION_MIN: 10,
  PATTERN_DESCRIPTION_MAX: 500,
  
  COMMENT_MIN: 1,
  COMMENT_MAX: 500,
  
  BIO_MAX: 500,
  USERNAME_MIN: 3,
  USERNAME_MAX: 50,
  
  TAG_MIN: 2,
  TAG_MAX: 30,
  MAX_TAGS: 10,
} as const;

/**
 * Search & Query Limits
 */
export const QUERY_LIMITS = {
  SEARCH_MIN_LENGTH: 2,
  SEARCH_MAX_LENGTH: 100,
  MAX_RESULTS: 1000,
  DEFAULT_LIMIT: 50,
  AUTOCOMPLETE_LIMIT: 10,
} as const;

/**
 * File Upload Limits
 */
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  MAX_IMAGE_SIZE_MB: 5,
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'text/markdown'],
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  STATS: 3600, // 1 hour
  PROMPTS_LIST: 300, // 5 minutes
  PROMPT_DETAIL: 1800, // 30 minutes
  PATTERNS_LIST: 3600, // 1 hour
  USER_PROFILE: 600, // 10 minutes
  TAXONOMY: 3600, // 1 hour (roles, tags, categories)
  SESSION: 86400, // 24 hours
} as const;

/**
 * Timeouts (milliseconds)
 */
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  AI_REQUEST: 60000, // 60 seconds
  DATABASE_QUERY: 10000, // 10 seconds
  WEBHOOK: 5000, // 5 seconds
  SSE_HEARTBEAT: 30000, // 30 seconds
} as const;

/**
 * Retry Configuration
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 10000,
  BACKOFF_MULTIPLIER: 2,
} as const;

/**
 * Gamification Thresholds
 */
export const XP_THRESHOLDS = {
  LEVEL_2: 100,
  LEVEL_3: 300,
  LEVEL_4: 600,
  LEVEL_5: 1000,
  LEVEL_6: 1500,
  LEVEL_7: 2100,
  LEVEL_8: 2800,
  LEVEL_9: 3600,
  LEVEL_10: 5000,
} as const;

/**
 * XP Awards
 */
export const XP_AWARDS = {
  PROMPT_CREATED: 10,
  PROMPT_USED: 5,
  PROMPT_FAVORITED: 2,
  PROMPT_SHARED: 3,
  COMMENT_POSTED: 5,
  HELPFUL_FEEDBACK: 1,
  DAILY_LOGIN: 5,
  WEEK_STREAK: 50,
  MONTH_STREAK: 200,
  ACHIEVEMENT_UNLOCKED: 25,
} as const;

/**
 * Streak Configuration
 */
export const STREAK_CONFIG = {
  GRACE_PERIOD_HOURS: 36, // 36 hours grace period for streak
  MIN_ACTIVITY_FOR_STREAK: 1, // Minimum actions per day to maintain streak
} as const;

/**
 * Quality Score Thresholds
 */
export const QUALITY_THRESHOLDS = {
  FEATURED_MIN: 8.0, // Minimum score for featured content (out of 10)
  GOOD_MIN: 6.0, // Good quality threshold
  NEEDS_IMPROVEMENT: 4.0, // Below this needs improvement
  RAG_READY_MIN: 8.0, // Minimum for RAG training data
  MIN_RATINGS_FOR_FEATURED: 5, // Minimum number of ratings before featuring
} as const;

/**
 * Audit Log Retention (days)
 */
export const RETENTION = {
  AUDIT_LOGS: 365, // 1 year
  USAGE_METRICS: 90, // 3 months
  ERROR_LOGS: 30, // 1 month
  DEBUG_LOGS: 7, // 1 week
  RATE_LIMIT_RECORDS: 1, // 1 day
} as const;

/**
 * Batch Processing Limits
 */
export const BATCH_LIMITS = {
  MAX_BATCH_SIZE: 100,
  MAX_CONCURRENT_BATCHES: 5,
  BATCH_PROCESSING_DELAY_MS: 100,
} as const;

/**
 * Circuit Breaker Configuration
 */
export const CIRCUIT_BREAKER = {
  FAILURE_THRESHOLD: 5,
  SUCCESS_THRESHOLD: 2,
  TIMEOUT_MS: 30000,
  RESET_TIMEOUT_MS: 60000,
} as const;

/**
 * WebSocket Configuration
 */
export const WEBSOCKET = {
  HEARTBEAT_INTERVAL_MS: 30000,
  RECONNECT_DELAY_MS: 5000,
  MAX_RECONNECT_ATTEMPTS: 5,
  MESSAGE_QUEUE_SIZE: 100,
} as const;

/**
 * Security Thresholds
 */
export const SECURITY = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  SESSION_TIMEOUT_HOURS: 24,
  REFRESH_TOKEN_DAYS: 30,
  MFA_CODE_LENGTH: 6,
  MFA_CODE_EXPIRY_MINUTES: 5,
} as const;

/**
 * Helper function to get level from XP
 */
export function getLevelFromXP(xp: number): number {
  const thresholds = Object.values(XP_THRESHOLDS);
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) {
      return i + 2; // +2 because level 1 is 0 XP, and array is 0-indexed
    }
  }
  return 1;
}

/**
 * Helper function to get XP needed for next level
 */
export function getXPForNextLevel(currentXP: number): number {
  const thresholds = Object.values(XP_THRESHOLDS);
  for (const threshold of thresholds) {
    if (currentXP < threshold) {
      return threshold - currentXP;
    }
  }
  return 0; // Max level reached
}

