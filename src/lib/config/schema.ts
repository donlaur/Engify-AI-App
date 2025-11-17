/**
 * Configuration Schemas
 *
 * Comprehensive Zod schemas for all environment variables organized by domain.
 * This provides type-safe, validated configuration across the application.
 *
 * @module config/schema
 */

import { z } from 'zod';

/**
 * Helper to parse string booleans
 */
const stringBoolean = () =>
  z
    .string()
    .optional()
    .transform((val) => val?.toLowerCase() === 'true')
    .default('false');

/**
 * Helper to parse string numbers
 */
const stringNumber = (defaultValue?: number) =>
  z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : defaultValue))
    .pipe(z.number().optional());

/**
 * Core Application Configuration
 */
export const coreConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default('Engify.ai'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
});

/**
 * Database Configuration
 */
export const databaseConfigSchema = z.object({
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .describe('MongoDB connection string')
    .optional(),
});

/**
 * Authentication Configuration
 */
export const authConfigSchema = z.object({
  // NextAuth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters for security')
    .optional(),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),

  // AWS Cognito (optional)
  COGNITO_USER_POOL_ID: z.string().optional(),
  COGNITO_CLIENT_ID: z.string().optional(),
  COGNITO_REGION: z.string().optional(),

  // Admin Settings
  ADMIN_SESSION_MAX_AGE_MINUTES: stringNumber(60),
  ADMIN_MFA_REQUIRED: stringBoolean(),
});

/**
 * AI Provider Configuration
 */
export const aiProvidersConfigSchema = z.object({
  // OpenAI
  OPENAI_API_KEY: z.string().optional(),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().optional(),

  // Google AI
  GOOGLE_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),

  // Groq
  GROQ_API_KEY: z.string().optional(),

  // Replicate
  REPLICATE_API_TOKEN: z.string().optional(),
  REPLICATE_MODEL: z.string().default('google/gemini-2.5-flash'),
  REPLICATE_ALLOWED_MODELS: z
    .string()
    .optional()
    .transform((val) =>
      val ? val.split(',').map((s) => s.trim()) : []
    )
    .pipe(z.array(z.string())),
  REPLICATE_MAX_RETRIES: stringNumber(2),
  REPLICATE_RETRY_DELAY_MS: stringNumber(500),
  REPLICATE_TIMEOUT_MS: stringNumber(45000),
  REPLICATE_IMAGE_MODEL: z.string().default('stability-ai/sdxl'),

  // Global AI Provider Settings
  AI_PROVIDER_TIMEOUT_MS: stringNumber(45000),
  AI_PROVIDER_MAX_RETRIES: stringNumber(1),
  AI_PROVIDER_RETRY_DELAY_MS: stringNumber(300),

  // Feature Flags
  IMAGE_GENERATION_ENABLED: stringBoolean(),
});

/**
 * Email Service Configuration (SendGrid)
 */
export const emailConfigSchema = z.object({
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_FROM_NAME: z.string().default('Engify.ai'),
  SENDGRID_REPLY_TO: z.string().email().optional(),
  SENDGRID_WEBHOOK_PUBLIC_KEY: z.string().optional(),

  // Email Templates
  SENDGRID_WELCOME_TEMPLATE_ID: z.string().optional(),
  SENDGRID_PASSWORD_RESET_TEMPLATE_ID: z.string().optional(),
  SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID: z.string().optional(),
  SENDGRID_PROMPT_SHARED_TEMPLATE_ID: z.string().optional(),
  SENDGRID_CONTACT_FORM_TEMPLATE_ID: z.string().optional(),
  SENDGRID_API_KEY_ALERT_TEMPLATE_ID: z.string().optional(),
  SENDGRID_WEEKLY_DIGEST_TEMPLATE_ID: z.string().optional(),
  SENDGRID_AI_CONTENT_READY_TEMPLATE_ID: z.string().optional(),
});

/**
 * SMS/MFA Configuration (Twilio)
 */
export const smsConfigSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),
});

/**
 * Queue/Job Configuration
 */
export const queueConfigSchema = z.object({
  // QStash
  QSTASH_URL: z.string().url().default('https://qstash.upstash.io/v2'),
  QSTASH_TOKEN: z.string().optional(),
  QSTASH_WEBHOOK_URL: z.string().url().optional(),

  // Cron Jobs
  CRON_SECRET: z.string().optional(),
});

/**
 * Cache/Redis Configuration
 */
export const cacheConfigSchema = z.object({
  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Local Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: stringNumber(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: stringNumber(0),
});

/**
 * AWS Configuration
 */
export const awsConfigSchema = z.object({
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCOUNT_ID: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_PROFILE: z.string().optional(),
});

/**
 * Security/Encryption Configuration
 */
export const securityConfigSchema = z.object({
  API_KEY_ENCRYPTION_KEY: z
    .string()
    .optional()
    .describe('32-byte hex key for API key encryption'),
  JIRA_TOKEN_ENCRYPTION_KEY: z.string().optional(),
});

/**
 * Content Creation Agent Configuration
 */
export const contentCreationConfigSchema = z.object({
  CONTENT_CREATION_ALLOWED_MODELS: z
    .string()
    .optional()
    .transform((val) =>
      val ? val.split(',').map((s) => s.trim()) : []
    )
    .pipe(z.array(z.string())),
  CONTENT_CREATION_BUDGET_LIMIT: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : 0.5))
    .pipe(z.number()),
  CONTENT_CREATION_MIN_WORDS: stringNumber(120),
});

/**
 * RAG/Python Backend Configuration
 */
export const ragConfigSchema = z.object({
  RAG_API_URL: z.string().url().optional(),
  AGENTS_SANDBOX_ENABLED: stringBoolean(),
  RAG_INDEX_ENABLED: stringBoolean(),
});

/**
 * Feature Flags Configuration
 */
export const featureFlagsConfigSchema = z.object({
  NEXT_PUBLIC_ALLOW_SIGNUP: stringBoolean(),
  NEXT_PUBLIC_AGENTS_SANDBOX_ENABLED: stringBoolean(),
  NEXT_PUBLIC_SHOW_PLAYGROUND: stringBoolean(),
  NEXT_PUBLIC_SHOW_ADMIN_LINK: stringBoolean(),
  CONTENT_PROVENANCE_ENABLED: stringBoolean(),
});

/**
 * Analytics Configuration
 */
export const analyticsConfigSchema = z.object({
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

/**
 * Complete Application Configuration Schema
 *
 * Combines all domain-specific schemas into one comprehensive schema
 */
export const appConfigSchema = z.object({
  core: coreConfigSchema,
  database: databaseConfigSchema,
  auth: authConfigSchema,
  aiProviders: aiProvidersConfigSchema,
  email: emailConfigSchema,
  sms: smsConfigSchema,
  queue: queueConfigSchema,
  cache: cacheConfigSchema,
  aws: awsConfigSchema,
  security: securityConfigSchema,
  contentCreation: contentCreationConfigSchema,
  rag: ragConfigSchema,
  featureFlags: featureFlagsConfigSchema,
  analytics: analyticsConfigSchema,
});

/**
 * Flat schema for backward compatibility with process.env
 */
export const flatConfigSchema = z.object({
  ...coreConfigSchema.shape,
  ...databaseConfigSchema.shape,
  ...authConfigSchema.shape,
  ...aiProvidersConfigSchema.shape,
  ...emailConfigSchema.shape,
  ...smsConfigSchema.shape,
  ...queueConfigSchema.shape,
  ...cacheConfigSchema.shape,
  ...awsConfigSchema.shape,
  ...securityConfigSchema.shape,
  ...contentCreationConfigSchema.shape,
  ...ragConfigSchema.shape,
  ...featureFlagsConfigSchema.shape,
  ...analyticsConfigSchema.shape,
});

/**
 * Type definitions
 */
export type CoreConfig = z.infer<typeof coreConfigSchema>;
export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;
export type AuthConfig = z.infer<typeof authConfigSchema>;
export type AIProvidersConfig = z.infer<typeof aiProvidersConfigSchema>;
export type EmailConfig = z.infer<typeof emailConfigSchema>;
export type SMSConfig = z.infer<typeof smsConfigSchema>;
export type QueueConfig = z.infer<typeof queueConfigSchema>;
export type CacheConfig = z.infer<typeof cacheConfigSchema>;
export type AWSConfig = z.infer<typeof awsConfigSchema>;
export type SecurityConfig = z.infer<typeof securityConfigSchema>;
export type ContentCreationConfig = z.infer<typeof contentCreationConfigSchema>;
export type RAGConfig = z.infer<typeof ragConfigSchema>;
export type FeatureFlagsConfig = z.infer<typeof featureFlagsConfigSchema>;
export type AnalyticsConfig = z.infer<typeof analyticsConfigSchema>;

export type AppConfig = z.infer<typeof appConfigSchema>;
export type FlatConfig = z.infer<typeof flatConfigSchema>;
