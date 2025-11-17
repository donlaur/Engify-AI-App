/**
 * AWS Secrets Manager Types
 *
 * Type definitions for all application secrets stored in AWS Secrets Manager
 *
 * @module lib/aws/types
 */

/**
 * AI Provider Secrets
 */
export interface AIProviderSecrets {
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  GROQ_API_KEY?: string;
  REPLICATE_API_TOKEN?: string;
}

/**
 * Database Secrets
 */
export interface DatabaseSecrets {
  MONGODB_URI?: string;
}

/**
 * Authentication Secrets
 */
export interface AuthSecrets {
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_ID?: string;
  GITHUB_SECRET?: string;
}

/**
 * Email Service Secrets (SendGrid)
 */
export interface EmailSecrets {
  SENDGRID_API_KEY?: string;
  SENDGRID_WEBHOOK_PUBLIC_KEY?: string;
}

/**
 * SMS/MFA Secrets (Twilio)
 */
export interface SMSSecrets {
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_VERIFY_SERVICE_SID?: string;
}

/**
 * Queue/Job Secrets (Upstash QStash)
 */
export interface QueueSecrets {
  QSTASH_TOKEN?: string;
  CRON_SECRET?: string;
}

/**
 * Cache Secrets (Redis/Upstash)
 */
export interface CacheSecrets {
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  REDIS_PASSWORD?: string;
}

/**
 * Security/Encryption Secrets
 */
export interface SecuritySecrets {
  API_KEY_ENCRYPTION_KEY?: string;
  JIRA_TOKEN_ENCRYPTION_KEY?: string;
}

/**
 * AWS Configuration Secrets
 */
export interface AWSConfigSecrets {
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
}

/**
 * Complete application secrets structure
 * This represents the JSON structure stored in AWS Secrets Manager
 */
export interface AppSecrets {
  aiProviders: AIProviderSecrets;
  database: DatabaseSecrets;
  auth: AuthSecrets;
  email: EmailSecrets;
  sms: SMSSecrets;
  queue: QueueSecrets;
  cache: CacheSecrets;
  security: SecuritySecrets;
}

/**
 * Secrets Manager Configuration
 */
export interface SecretsManagerConfig {
  region?: string;
  secretName?: string;
  cacheTtlMs?: number;
  enableCache?: boolean;
  fallbackToEnv?: boolean;
  accessKeyId?: string;
  secretAccessKey?: string;
}

/**
 * Secret Cache Entry
 */
export interface SecretCacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  version?: string;
}

/**
 * Secret Metadata
 */
export interface SecretMetadata {
  name: string;
  arn?: string;
  versionId?: string;
  createdDate?: Date;
  lastAccessedDate?: Date;
  lastChangedDate?: Date;
  rotationEnabled?: boolean;
}

/**
 * Secret Rotation Configuration
 */
export interface SecretRotationConfig {
  automaticallyAfterDays?: number;
  rotationLambdaArn?: string;
  rotationRules?: {
    automaticallyAfterDays: number;
  };
}

/**
 * Health Check Result
 */
export interface HealthCheckResult {
  healthy: boolean;
  service: string;
  timestamp: Date;
  error?: string;
  metadata?: {
    region?: string;
    secretsAccessible?: boolean;
    cacheSize?: number;
  };
}

/**
 * Secret Validation Result
 */
export interface SecretValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingSecrets: string[];
}

/**
 * Secret names used in AWS Secrets Manager
 */
export enum SecretName {
  APP_SECRETS = 'engify-ai/app-secrets',
  DATABASE = 'engify-ai/database',
  AI_PROVIDERS = 'engify-ai/ai-providers',
  AUTH = 'engify-ai/auth',
  EMAIL = 'engify-ai/email',
  SMS = 'engify-ai/sms',
  CACHE = 'engify-ai/cache',
  SECURITY = 'engify-ai/security',
}

/**
 * Environment type
 */
export type Environment = 'development' | 'production' | 'test';
