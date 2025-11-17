/**
 * Secrets Configuration with Validation
 *
 * Type-safe secrets loading with Zod validation and environment-aware configuration.
 * Automatically loads from AWS Secrets Manager in production and falls back to
 * environment variables for local development.
 *
 * @module lib/config/secrets
 *
 * @example
 * ```typescript
 * import { getSecrets, secrets } from '@/lib/config/secrets';
 *
 * // Get validated secrets
 * const appSecrets = await getSecrets();
 * console.log('MongoDB URI:', appSecrets.database.MONGODB_URI);
 *
 * // Use singleton
 * const openaiKey = secrets.aiProviders.OPENAI_API_KEY;
 * ```
 */

import { z } from 'zod';
import { getSecretsManager } from '@/lib/aws/secrets-manager';
import type { AppSecrets } from '@/lib/aws/types';

/**
 * Validation Schemas
 */

/**
 * AI Provider Secrets Schema
 */
export const aiProviderSecretsSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  REPLICATE_API_TOKEN: z.string().optional(),
});

/**
 * Database Secrets Schema
 */
export const databaseSecretsSchema = z.object({
  MONGODB_URI: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Allow undefined in development
        return val.startsWith('mongodb://') || val.startsWith('mongodb+srv://');
      },
      { message: 'MONGODB_URI must be a valid MongoDB connection string' }
    ),
});

/**
 * Auth Secrets Schema
 */
export const authSecretsSchema = z.object({
  NEXTAUTH_SECRET: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Allow undefined in development
        return val.length >= 32;
      },
      { message: 'NEXTAUTH_SECRET must be at least 32 characters for security' }
    ),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
});

/**
 * Email Secrets Schema
 */
export const emailSecretsSchema = z.object({
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_WEBHOOK_PUBLIC_KEY: z.string().optional(),
});

/**
 * SMS Secrets Schema
 */
export const smsSecretsSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),
});

/**
 * Queue Secrets Schema
 */
export const queueSecretsSchema = z.object({
  QSTASH_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().optional(),
});

/**
 * Cache Secrets Schema
 */
export const cacheSecretsSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal('')),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
});

/**
 * Security Secrets Schema
 */
export const securitySecretsSchema = z.object({
  API_KEY_ENCRYPTION_KEY: z.string().optional(),
  JIRA_TOKEN_ENCRYPTION_KEY: z.string().optional(),
});

/**
 * Complete App Secrets Schema
 */
export const appSecretsSchema = z.object({
  aiProviders: aiProviderSecretsSchema,
  database: databaseSecretsSchema,
  auth: authSecretsSchema,
  email: emailSecretsSchema,
  sms: smsSecretsSchema,
  queue: queueSecretsSchema,
  cache: cacheSecretsSchema,
  security: securitySecretsSchema,
});

/**
 * Type inference from schema
 */
export type ValidatedAppSecrets = z.infer<typeof appSecretsSchema>;

/**
 * Secrets validation result
 */
export interface SecretsValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: ValidatedAppSecrets;
}

/**
 * Validate secrets against schema
 */
export function validateSecrets(secrets: AppSecrets): SecretsValidationResult {
  const result = appSecretsSchema.safeParse(secrets);

  if (result.success) {
    const warnings: string[] = [];

    // Check for missing recommended secrets in production
    if (process.env.NODE_ENV === 'production') {
      if (!result.data.database.MONGODB_URI) {
        warnings.push('MONGODB_URI is not set (database will not be available)');
      }
      if (!result.data.auth.NEXTAUTH_SECRET) {
        warnings.push('NEXTAUTH_SECRET is not set (authentication will not work)');
      }
      if (
        !result.data.aiProviders.OPENAI_API_KEY &&
        !result.data.aiProviders.ANTHROPIC_API_KEY &&
        !result.data.aiProviders.GOOGLE_API_KEY
      ) {
        warnings.push('No AI provider API keys are set (AI features will not work)');
      }
    }

    return {
      valid: true,
      errors: [],
      warnings,
      data: result.data,
    };
  }

  const errors = result.error.errors.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  return {
    valid: false,
    errors,
    warnings: [],
  };
}

/**
 * Load and validate secrets
 */
export async function loadSecrets(): Promise<ValidatedAppSecrets> {
  const secretsManager = getSecretsManager();
  const secrets = await secretsManager.getAppSecrets();

  const validationResult = validateSecrets(secrets);

  // Log validation errors
  if (!validationResult.valid) {
    console.error('❌ Secrets validation failed:');
    validationResult.errors.forEach((error) => {
      console.error(`   - ${error}`);
    });
    throw new Error('Secrets validation failed. Check the errors above.');
  }

  // Log validation warnings
  if (validationResult.warnings.length > 0) {
    console.warn('⚠️  Secrets validation warnings:');
    validationResult.warnings.forEach((warning) => {
      console.warn(`   - ${warning}`);
    });
  }

  // Log success in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    const env = process.env.NODE_ENV || 'development';
    const source = process.env.AWS_ACCESS_KEY_ID ? 'AWS Secrets Manager' : 'environment variables';
    console.log(`✅ Secrets loaded successfully from ${source} (env: ${env})`);

    // Log configured services (without exposing keys)
    const services: string[] = [];
    if (validationResult.data!.database.MONGODB_URI) services.push('MongoDB');
    if (validationResult.data!.aiProviders.OPENAI_API_KEY) services.push('OpenAI');
    if (validationResult.data!.aiProviders.ANTHROPIC_API_KEY) services.push('Anthropic');
    if (validationResult.data!.aiProviders.GOOGLE_API_KEY) services.push('Google AI');
    if (validationResult.data!.email.SENDGRID_API_KEY) services.push('SendGrid');
    if (validationResult.data!.cache.UPSTASH_REDIS_REST_URL) services.push('Redis');

    if (services.length > 0) {
      console.log(`   Configured services: ${services.join(', ')}`);
    }
  }

  return validationResult.data!;
}

/**
 * Secrets cache
 */
let cachedSecrets: ValidatedAppSecrets | null = null;
let secretsLoadPromise: Promise<ValidatedAppSecrets> | null = null;

/**
 * Get secrets (cached)
 * Loads secrets once and caches them for the lifetime of the process
 */
export async function getSecrets(): Promise<ValidatedAppSecrets> {
  // Return cached secrets if available
  if (cachedSecrets) {
    return cachedSecrets;
  }

  // If a load is in progress, wait for it
  if (secretsLoadPromise) {
    return secretsLoadPromise;
  }

  // Load secrets
  secretsLoadPromise = loadSecrets();

  try {
    cachedSecrets = await secretsLoadPromise;
    return cachedSecrets;
  } finally {
    secretsLoadPromise = null;
  }
}

/**
 * Clear the secrets cache
 * Useful for testing or when secrets have been rotated
 */
export function clearSecretsCache(): void {
  cachedSecrets = null;
  secretsLoadPromise = null;
}

/**
 * Helper functions for checking secret availability
 */
export const secretsHelpers = {
  /**
   * Check if a specific AI provider is configured
   */
  hasAIProvider: async (provider: 'openai' | 'anthropic' | 'google' | 'groq' | 'replicate'): Promise<boolean> => {
    const secrets = await getSecrets();
    const keyMap = {
      openai: secrets.aiProviders.OPENAI_API_KEY,
      anthropic: secrets.aiProviders.ANTHROPIC_API_KEY,
      google: secrets.aiProviders.GOOGLE_API_KEY,
      groq: secrets.aiProviders.GROQ_API_KEY,
      replicate: secrets.aiProviders.REPLICATE_API_TOKEN,
    };
    return Boolean(keyMap[provider]);
  },

  /**
   * Check if database is configured
   */
  hasDatabase: async (): Promise<boolean> => {
    const secrets = await getSecrets();
    return Boolean(secrets.database.MONGODB_URI);
  },

  /**
   * Check if email service is configured
   */
  hasEmail: async (): Promise<boolean> => {
    const secrets = await getSecrets();
    return Boolean(secrets.email.SENDGRID_API_KEY);
  },

  /**
   * Check if SMS service is configured
   */
  hasSMS: async (): Promise<boolean> => {
    const secrets = await getSecrets();
    return Boolean(secrets.sms.TWILIO_ACCOUNT_SID && secrets.sms.TWILIO_AUTH_TOKEN);
  },

  /**
   * Check if cache is configured
   */
  hasCache: async (): Promise<boolean> => {
    const secrets = await getSecrets();
    return Boolean(secrets.cache.UPSTASH_REDIS_REST_URL || secrets.cache.REDIS_PASSWORD);
  },

  /**
   * Get all configured AI providers
   */
  getConfiguredProviders: async (): Promise<string[]> => {
    const secrets = await getSecrets();
    const providers: string[] = [];

    if (secrets.aiProviders.OPENAI_API_KEY) providers.push('OpenAI');
    if (secrets.aiProviders.ANTHROPIC_API_KEY) providers.push('Anthropic');
    if (secrets.aiProviders.GOOGLE_API_KEY) providers.push('Google AI');
    if (secrets.aiProviders.GROQ_API_KEY) providers.push('Groq');
    if (secrets.aiProviders.REPLICATE_API_TOKEN) providers.push('Replicate');

    return providers;
  },
};

/**
 * Default export
 */
export default {
  getSecrets,
  validateSecrets,
  loadSecrets,
  clearSecretsCache,
  helpers: secretsHelpers,
};
