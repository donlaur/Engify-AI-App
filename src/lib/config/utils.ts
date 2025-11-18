/**
 * Configuration Utilities
 *
 * Helper functions for configuration management, validation, and transformation
 *
 * @module config/utils
 */

import { z } from 'zod';
import type {
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  ConfigMetadata,
  Environment,
  ValidationOptions,
} from './types';
import { isSecretKey, ENVIRONMENT_DEFAULTS } from './types';

/**
 * Pattern to detect placeholder values in environment variables
 */
const PLACEHOLDER_PATTERNS = [
  /^(test|dummy|changeme|sample|placeholder|your-.*-here)/i,
  /^sk-test/i, // Test API keys
  /^d-test/i, // Test template IDs
  /localhost/i, // Localhost URLs in production
];

/**
 * Check if a value is a placeholder
 */
export function isPlaceholder(value: string | undefined | null): boolean {
  if (!value || value.trim() === '') return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Mask sensitive values for logging
 */
export function maskSecret(value: string | undefined | null): string {
  if (!value) return '<empty>';
  if (value.length <= 8) return '***';

  const visibleChars = 4;
  const start = value.slice(0, visibleChars);
  const end = value.slice(-visibleChars);
  return `${start}...${end}`;
}

/**
 * Create a safe configuration object for logging (masks secrets)
 */
export function createSafeConfig(config: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    if (isSecretKey(key)) {
      safe[key] = typeof value === 'string' ? maskSecret(value) : '<redacted>';
    } else {
      safe[key] = value;
    }
  }

  return safe;
}

/**
 * Validate configuration against a schema
 */
export function validateConfig<T extends z.ZodType>(
  schema: T,
  data: unknown,
  options: ValidationOptions = {}
): ConfigValidationResult {
  const { throwOnError = false } = options;

  // Note: strict, allowUnknown, and warnOnMissing reserved for future use
  // Currently handled by Zod schema itself

  const result = schema.safeParse(data);
  const errors: ConfigValidationError[] = [];
  const warnings: ConfigValidationWarning[] = [];

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.push({
        path: issue.path.map(String),
        message: issue.message,
        code: issue.code,
      });
    });

    if (throwOnError) {
      const errorMessages = errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`Configuration validation failed:\n${errorMessages}`);
    }
  }

  // Check for placeholder values in production
  if (typeof data === 'object' && data !== null) {
    const env = (data as Record<string, unknown>).NODE_ENV as Environment;
    if (env === 'production') {
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        if (typeof value === 'string' && isPlaceholder(value)) {
          warnings.push({
            path: [key],
            message: `Placeholder value detected in production: "${value}"`,
            severity: isSecretKey(key) ? 'high' : 'medium',
          });
        }
      }
    }
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Enforce production secrets validation
 * Note: Skips validation during build phase to allow builds without runtime secrets
 */
export function enforceProductionSecrets(config: Record<string, unknown>): void {
  const env = config.NODE_ENV as Environment;
  if (env !== 'production') return;

  // Skip validation during Next.js build phase
  // BUILD_MODE is set during Next.js builds
  if (process.env.BUILD_MODE === '1' || process.env.NEXT_PHASE === 'phase-production-build') {
    // Silent during build - no need to log as this is expected behavior
    return;
  }

  const criticalSecrets = [
    'NEXTAUTH_SECRET',
    'MONGODB_URI',
    // API_KEY_ENCRYPTION_KEY is optional - removed from critical secrets
  ];

  const missingSecrets = criticalSecrets.filter((key) => {
    const value = config[key];
    return !value || (typeof value === 'string' && isPlaceholder(value));
  });

  if (missingSecrets.length > 0) {
    throw new Error(
      `Critical secrets misconfigured in production: ${missingSecrets.join(', ')}. ` +
        'Ensure they are set to secure, non-placeholder values.'
    );
  }

  // Ensure at least one AI provider is configured
  const aiProviderKeys = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_API_KEY',
    'GOOGLE_AI_API_KEY',
    'GROQ_API_KEY',
  ];

  const hasValidProvider = aiProviderKeys.some((key) => {
    const value = config[key];
    return value && typeof value === 'string' && !isPlaceholder(value);
  });

  if (!hasValidProvider) {
    throw new Error(
      'At least one AI provider API key must be configured in production ' +
        '(OpenAI, Anthropic, Google, or Groq).'
    );
  }
}

/**
 * Get configuration metadata
 */
export function getConfigMetadata(
  key: string,
  value: unknown,
  environment: Environment
): ConfigMetadata {
  return {
    key,
    value,
    source: {
      type: 'env',
    },
    isSecret: isSecretKey(key),
    isRequired: isRequiredKey(key, environment),
    description: getKeyDescription(key),
  };
}

/**
 * Check if a configuration key is required for the given environment
 */
export function isRequiredKey(key: string, environment: Environment): boolean {
  const alwaysRequired = ['NODE_ENV', 'MONGODB_URI', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];

  const productionRequired = [
    ...alwaysRequired,
    'NEXT_PUBLIC_APP_URL',
    // API_KEY_ENCRYPTION_KEY is optional
  ];

  if (environment === 'production') {
    return productionRequired.includes(key);
  }

  return alwaysRequired.includes(key);
}

/**
 * Get human-readable description for a configuration key
 */
export function getKeyDescription(key: string): string {
  const descriptions: Record<string, string> = {
    NODE_ENV: 'Application environment',
    MONGODB_URI: 'MongoDB connection string',
    NEXTAUTH_SECRET: 'Secret for NextAuth.js session encryption',
    NEXTAUTH_URL: 'Canonical URL of the application',
    NEXT_PUBLIC_APP_URL: 'Public-facing application URL',
    OPENAI_API_KEY: 'OpenAI API key for GPT models',
    ANTHROPIC_API_KEY: 'Anthropic API key for Claude models',
    GOOGLE_API_KEY: 'Google AI API key for Gemini models',
    REPLICATE_API_TOKEN: 'Replicate API token for model hosting',
    SENDGRID_API_KEY: 'SendGrid API key for email services',
    TWILIO_ACCOUNT_SID: 'Twilio account SID for SMS services',
    AWS_ACCESS_KEY_ID: 'AWS access key for cloud services',
  };

  return descriptions[key] || `Configuration key: ${key}`;
}

/**
 * Merge configurations with precedence (later configs override earlier ones)
 */
export function mergeConfigs<T extends Record<string, unknown>>(
  ...configs: Partial<T>[]
): T {
  return Object.assign({}, ...configs) as T;
}

/**
 * Get environment-specific defaults
 */
export function getEnvironmentDefaults(environment: Environment): Record<string, unknown> {
  return ENVIRONMENT_DEFAULTS[environment] || {};
}

/**
 * Parse comma-separated string to array
 */
export function parseCommaSeparated(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Parse string boolean to boolean
 */
export function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Parse string number to number
 */
export function parseNumber(value: string | undefined, defaultValue?: number): number | undefined {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ConfigValidationError[]): string {
  return errors
    .map((error) => {
      const path = error.path.length > 0 ? error.path.join('.') : 'root';
      return `  ❌ ${path}: ${error.message}`;
    })
    .join('\n');
}

/**
 * Format validation warnings for display
 */
export function formatValidationWarnings(warnings: ConfigValidationWarning[]): string {
  return warnings
    .map((warning) => {
      const icon = warning.severity === 'high' ? '⚠️' : warning.severity === 'medium' ? '⚡' : 'ℹ️';
      const path = warning.path.length > 0 ? warning.path.join('.') : 'root';
      return `  ${icon} ${path}: ${warning.message}`;
    })
    .join('\n');
}

/**
 * Check if configuration has changed
 */
export function hasConfigChanged(
  oldConfig: Record<string, unknown>,
  newConfig: Record<string, unknown>
): boolean {
  const oldKeys = Object.keys(oldConfig).sort();
  const newKeys = Object.keys(newConfig).sort();

  if (oldKeys.length !== newKeys.length) return true;
  if (oldKeys.join(',') !== newKeys.join(',')) return true;

  return oldKeys.some((key) => oldConfig[key] !== newConfig[key]);
}

/**
 * Get configuration differences
 */
export function getConfigDiff(
  oldConfig: Record<string, unknown>,
  newConfig: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const diff: Record<string, { old: unknown; new: unknown }> = {};
  const allKeys = new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)]);

  for (const key of allKeys) {
    if (oldConfig[key] !== newConfig[key]) {
      diff[key] = {
        old: oldConfig[key],
        new: newConfig[key],
      };
    }
  }

  return diff;
}

/**
 * Validate URL format
 */
export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Generate a random secret (for development/testing only)
 */
export function generateRandomSecret(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if running on server
 */
export function isServer(): boolean {
  return !isBrowser();
}

/**
 * Get safe public config (only NEXT_PUBLIC_ variables)
 */
export function getPublicConfig(config: Record<string, unknown>): Record<string, unknown> {
  const publicConfig: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    if (key.startsWith('NEXT_PUBLIC_')) {
      publicConfig[key] = value;
    }
  }

  return publicConfig;
}
