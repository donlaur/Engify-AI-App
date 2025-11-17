/**
 * Configuration Types
 *
 * Type definitions for configuration management system
 *
 * @module config/types
 */

/**
 * Environment types supported by the application
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  success: boolean;
  errors?: ConfigValidationError[];
  warnings?: ConfigValidationWarning[];
}

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
  path: string[];
  message: string;
  code: string;
}

/**
 * Configuration validation warning
 */
export interface ConfigValidationWarning {
  path: string[];
  message: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Configuration source information
 */
export interface ConfigSource {
  type: 'env' | 'file' | 'default' | 'runtime';
  location?: string;
}

/**
 * Configuration metadata
 */
export interface ConfigMetadata {
  key: string;
  value: unknown;
  source: ConfigSource;
  isSecret: boolean;
  isRequired: boolean;
  description?: string;
}

/**
 * Configuration change event
 */
export interface ConfigChangeEvent {
  key: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: Date;
}

/**
 * Configuration validation options
 */
export interface ValidationOptions {
  strict?: boolean;
  allowUnknown?: boolean;
  warnOnMissing?: boolean;
  throwOnError?: boolean;
}

/**
 * Configuration loader options
 */
export interface ConfigLoaderOptions {
  validateOnLoad?: boolean;
  cacheConfig?: boolean;
  envFile?: string;
  environmentOverride?: Environment;
}

/**
 * AI Provider type
 */
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'groq' | 'replicate';

/**
 * Feature flag status
 */
export type FeatureFlagStatus = boolean;

/**
 * Configuration domain
 */
export type ConfigDomain =
  | 'core'
  | 'database'
  | 'auth'
  | 'aiProviders'
  | 'email'
  | 'sms'
  | 'queue'
  | 'cache'
  | 'aws'
  | 'security'
  | 'contentCreation'
  | 'rag'
  | 'featureFlags'
  | 'analytics';

/**
 * Configuration key prefix by domain
 */
export const CONFIG_PREFIXES: Record<ConfigDomain, string> = {
  core: 'NEXT_PUBLIC_',
  database: 'MONGODB_',
  auth: 'NEXTAUTH_',
  aiProviders: 'AI_',
  email: 'SENDGRID_',
  sms: 'TWILIO_',
  queue: 'QSTASH_',
  cache: 'REDIS_',
  aws: 'AWS_',
  security: 'ENCRYPTION_',
  contentCreation: 'CONTENT_',
  rag: 'RAG_',
  featureFlags: 'NEXT_PUBLIC_',
  analytics: 'NEXT_PUBLIC_',
};

/**
 * Secret configuration keys that should never be logged or exposed
 */
export const SECRET_KEYS = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_API_KEY',
  'GOOGLE_AI_API_KEY',
  'GROQ_API_KEY',
  'REPLICATE_API_TOKEN',
  'SENDGRID_API_KEY',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_ACCOUNT_SID',
  'QSTASH_TOKEN',
  'UPSTASH_REDIS_REST_TOKEN',
  'REDIS_PASSWORD',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_ACCESS_KEY_ID',
  'API_KEY_ENCRYPTION_KEY',
  'JIRA_TOKEN_ENCRYPTION_KEY',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_SECRET',
  'COGNITO_CLIENT_ID',
] as const;

/**
 * Type guard to check if a key is a secret
 */
export function isSecretKey(key: string): boolean {
  return SECRET_KEYS.includes(key as (typeof SECRET_KEYS)[number]) ||
    key.includes('SECRET') ||
    key.includes('PASSWORD') ||
    key.includes('TOKEN') ||
    key.includes('KEY');
}

/**
 * Configuration defaults by environment
 */
export const ENVIRONMENT_DEFAULTS: Record<Environment, Partial<Record<string, unknown>>> = {
  development: {
    NODE_ENV: 'development',
    ADMIN_SESSION_MAX_AGE_MINUTES: 60,
    ADMIN_MFA_REQUIRED: false,
    IMAGE_GENERATION_ENABLED: true,
    NEXT_PUBLIC_ALLOW_SIGNUP: true,
    NEXT_PUBLIC_SHOW_PLAYGROUND: true,
  },
  production: {
    NODE_ENV: 'production',
    ADMIN_SESSION_MAX_AGE_MINUTES: 30,
    ADMIN_MFA_REQUIRED: true,
    IMAGE_GENERATION_ENABLED: true,
    NEXT_PUBLIC_ALLOW_SIGNUP: false,
    NEXT_PUBLIC_SHOW_PLAYGROUND: false,
  },
  test: {
    NODE_ENV: 'test',
    ADMIN_SESSION_MAX_AGE_MINUTES: 5,
    ADMIN_MFA_REQUIRED: false,
    IMAGE_GENERATION_ENABLED: false,
    NEXT_PUBLIC_ALLOW_SIGNUP: true,
    NEXT_PUBLIC_SHOW_PLAYGROUND: true,
  },
};
