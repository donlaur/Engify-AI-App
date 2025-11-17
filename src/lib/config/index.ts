/**
 * Centralized Configuration Management
 *
 * This module provides a robust, type-safe configuration system for the Engify AI application.
 * It validates all environment variables at startup, provides helpful error messages,
 * and organizes configuration by domain.
 *
 * @module config
 *
 * @example
 * ```typescript
 * import { config, getConfig } from '@/lib/config';
 *
 * // Access configuration
 * const dbUri = config.database.MONGODB_URI;
 * const aiKey = config.aiProviders.OPENAI_API_KEY;
 *
 * // Use helper functions
 * if (config.helpers.isProduction()) {
 *   // Production-specific logic
 * }
 *
 * if (config.helpers.hasAIProvider('openai')) {
 *   // OpenAI is configured
 * }
 * ```
 */

import {
  flatConfigSchema,
  coreConfigSchema,
  databaseConfigSchema,
  authConfigSchema,
  aiProvidersConfigSchema,
  emailConfigSchema,
  smsConfigSchema,
  queueConfigSchema,
  cacheConfigSchema,
  awsConfigSchema,
  securityConfigSchema,
  contentCreationConfigSchema,
  ragConfigSchema,
  featureFlagsConfigSchema,
  analyticsConfigSchema,
  type FlatConfig,
  type CoreConfig,
  type DatabaseConfig,
  type AuthConfig,
  type AIProvidersConfig,
  type EmailConfig,
  type SMSConfig,
  type QueueConfig,
  type CacheConfig,
  type AWSConfig,
  type SecurityConfig,
  type ContentCreationConfig,
  type RAGConfig,
  type FeatureFlagsConfig,
  type AnalyticsConfig,
} from './schema';
import {
  validateConfig,
  enforceProductionSecrets,
  createSafeConfig,
  formatValidationErrors,
  formatValidationWarnings,
  isPlaceholder,
  maskSecret,
} from './utils';
import type { Environment, AIProvider } from './types';

/**
 * Configuration class that holds all validated configuration
 */
class Configuration {
  private _flatConfig: FlatConfig;
  private _isValidated = false;

  // Domain-specific configs
  public core: CoreConfig;
  public database: DatabaseConfig;
  public auth: AuthConfig;
  public aiProviders: AIProvidersConfig;
  public email: EmailConfig;
  public sms: SMSConfig;
  public queue: QueueConfig;
  public cache: CacheConfig;
  public aws: AWSConfig;
  public security: SecurityConfig;
  public contentCreation: ContentCreationConfig;
  public rag: RAGConfig;
  public featureFlags: FeatureFlagsConfig;
  public analytics: AnalyticsConfig;

  constructor() {
    // Validate and parse all configuration at startup
    this._flatConfig = this.validateAndParse();

    // Parse domain-specific configs
    this.core = coreConfigSchema.parse(process.env);
    this.database = databaseConfigSchema.parse(process.env);
    this.auth = authConfigSchema.parse(process.env);
    this.aiProviders = aiProvidersConfigSchema.parse(process.env);
    this.email = emailConfigSchema.parse(process.env);
    this.sms = smsConfigSchema.parse(process.env);
    this.queue = queueConfigSchema.parse(process.env);
    this.cache = cacheConfigSchema.parse(process.env);
    this.aws = awsConfigSchema.parse(process.env);
    this.security = securityConfigSchema.parse(process.env);
    this.contentCreation = contentCreationConfigSchema.parse(process.env);
    this.rag = ragConfigSchema.parse(process.env);
    this.featureFlags = featureFlagsConfigSchema.parse(process.env);
    this.analytics = analyticsConfigSchema.parse(process.env);

    this._isValidated = true;

    // Log configuration status
    this.logConfigurationStatus();
  }

  /**
   * Validate and parse environment configuration
   */
  private validateAndParse(): FlatConfig {
    const result = validateConfig(flatConfigSchema, process.env, {
      throwOnError: false,
      warnOnMissing: true,
    });

    // Display errors
    if (result.errors && result.errors.length > 0) {
      console.error('❌ Configuration validation failed:');
      console.error(formatValidationErrors(result.errors));
      console.error('\nPlease check your .env file and ensure all required variables are set.');
      console.error('See .env.example for reference.\n');
      throw new Error('Configuration validation failed');
    }

    // Display warnings
    if (result.warnings && result.warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      console.warn(formatValidationWarnings(result.warnings));
      console.warn('');
    }

    // Parse the configuration
    const parsed = flatConfigSchema.parse(process.env);

    // Enforce production secrets
    try {
      enforceProductionSecrets(parsed as unknown as Record<string, unknown>);
    } catch (error) {
      console.error('❌ Production security validation failed:');
      console.error(error instanceof Error ? error.message : String(error));
      throw error;
    }

    return parsed;
  }

  /**
   * Log configuration status (safe for production)
   */
  private logConfigurationStatus(): void {
    if (this.core.NODE_ENV === 'test') return; // Skip logging in tests

    console.log('✅ Configuration loaded successfully');
    console.log(`   Environment: ${this.core.NODE_ENV}`);
    console.log(`   App URL: ${this.core.NEXT_PUBLIC_APP_URL}`);

    // Log configured AI providers (without exposing keys)
    const providers = this.helpers.getConfiguredAIProviders();
    if (providers.length > 0) {
      console.log(`   AI Providers: ${providers.join(', ')}`);
    }

    // Log feature flags
    const flags = this.helpers.getEnabledFeatureFlags();
    if (flags.length > 0) {
      console.log(`   Feature Flags: ${flags.join(', ')}`);
    }
  }

  /**
   * Get the flat configuration object (for backward compatibility)
   */
  public get flat(): FlatConfig {
    return this._flatConfig;
  }

  /**
   * Get a safe version of the configuration (with secrets masked)
   */
  public getSafeConfig(): Record<string, unknown> {
    return createSafeConfig(this._flatConfig as unknown as Record<string, unknown>);
  }

  /**
   * Check if configuration is validated
   */
  public get isValidated(): boolean {
    return this._isValidated;
  }

  /**
   * Helper functions for common configuration checks
   */
  public helpers = {
    /**
     * Check if we're in production
     */
    isProduction: (): boolean => {
      return this.core.NODE_ENV === 'production';
    },

    /**
     * Check if we're in development
     */
    isDevelopment: (): boolean => {
      return this.core.NODE_ENV === 'development';
    },

    /**
     * Check if we're in test environment
     */
    isTest: (): boolean => {
      return this.core.NODE_ENV === 'test';
    },

    /**
     * Check if a specific AI provider is configured
     */
    hasAIProvider: (provider: AIProvider): boolean => {
      const keyMap: Record<AIProvider, keyof AIProvidersConfig> = {
        openai: 'OPENAI_API_KEY',
        anthropic: 'ANTHROPIC_API_KEY',
        google: 'GOOGLE_API_KEY',
        groq: 'GROQ_API_KEY',
        replicate: 'REPLICATE_API_TOKEN',
      };

      const key = keyMap[provider];
      const value = this.aiProviders[key];
      return Boolean(value && !isPlaceholder(value as string));
    },

    /**
     * Get all configured AI providers
     */
    getConfiguredAIProviders: (): AIProvider[] => {
      const providers: AIProvider[] = [];
      const providerList: AIProvider[] = ['openai', 'anthropic', 'google', 'groq', 'replicate'];

      for (const provider of providerList) {
        if (this.helpers.hasAIProvider(provider)) {
          providers.push(provider);
        }
      }

      return providers;
    },

    /**
     * Check if OAuth is configured
     */
    hasOAuth: (): boolean => {
      return Boolean(
        this.auth.GOOGLE_CLIENT_ID &&
        this.auth.GOOGLE_CLIENT_SECRET
      );
    },

    /**
     * Check if email service is configured
     */
    hasEmailService: (): boolean => {
      return Boolean(
        this.email.SENDGRID_API_KEY &&
        !isPlaceholder(this.email.SENDGRID_API_KEY)
      );
    },

    /**
     * Check if SMS service is configured
     */
    hasSMSService: (): boolean => {
      return Boolean(
        this.sms.TWILIO_ACCOUNT_SID &&
        this.sms.TWILIO_AUTH_TOKEN
      );
    },

    /**
     * Check if Redis cache is configured
     */
    hasRedisCache: (): boolean => {
      return Boolean(
        this.cache.UPSTASH_REDIS_REST_URL ||
        this.cache.REDIS_HOST
      );
    },

    /**
     * Check if a feature flag is enabled
     */
    isFeatureEnabled: (feature: keyof FeatureFlagsConfig): boolean => {
      return Boolean(this.featureFlags[feature]);
    },

    /**
     * Get all enabled feature flags
     */
    getEnabledFeatureFlags: (): string[] => {
      const flags: string[] = [];
      for (const [key, value] of Object.entries(this.featureFlags)) {
        if (value === true) {
          flags.push(key);
        }
      }
      return flags;
    },

    /**
     * Get admin session max age in seconds
     */
    getAdminSessionMaxAge: (): number => {
      const minutes = this.auth.ADMIN_SESSION_MAX_AGE_MINUTES ?? 60;
      return minutes * 60;
    },

    /**
     * Check if admin MFA is required
     */
    isAdminMFARequired: (): boolean => {
      return Boolean(this.auth.ADMIN_MFA_REQUIRED);
    },

    /**
     * Get AI provider timeout in milliseconds
     */
    getAIProviderTimeout: (): number => {
      return this.aiProviders.AI_PROVIDER_TIMEOUT_MS ?? 45000;
    },

    /**
     * Get AI provider max retries
     */
    getAIProviderMaxRetries: (): number => {
      return this.aiProviders.AI_PROVIDER_MAX_RETRIES ?? 1;
    },

    /**
     * Check if image generation is enabled
     */
    isImageGenerationEnabled: (): boolean => {
      return Boolean(this.aiProviders.IMAGE_GENERATION_ENABLED);
    },

    /**
     * Check if RAG is enabled
     */
    isRAGEnabled: (): boolean => {
      return Boolean(this.rag.RAG_INDEX_ENABLED);
    },
  };
}

/**
 * Singleton configuration instance
 * Validates configuration at module load time
 */
let configInstance: Configuration | null = null;

/**
 * Get the configuration instance
 * Creates and validates configuration on first access
 */
export function getConfig(): Configuration {
  if (!configInstance) {
    configInstance = new Configuration();
  }
  return configInstance;
}

/**
 * Pre-initialized configuration instance for convenience
 * Use this for direct access to configuration values
 */
export const config = getConfig();

/**
 * Re-export types and utilities
 */
export type {
  FlatConfig,
  CoreConfig,
  DatabaseConfig,
  AuthConfig,
  AIProvidersConfig,
  EmailConfig,
  SMSConfig,
  QueueConfig,
  CacheConfig,
  AWSConfig,
  SecurityConfig,
  ContentCreationConfig,
  RAGConfig,
  FeatureFlagsConfig,
  AnalyticsConfig,
  Environment,
  AIProvider,
};

export {
  validateConfig,
  enforceProductionSecrets,
  createSafeConfig,
  formatValidationErrors,
  formatValidationWarnings,
  isPlaceholder,
  maskSecret,
};

// Re-export schemas for testing and custom validation
export * from './schema';
export * from './types';
export * from './utils';

/**
 * Default export for convenience
 */
export default config;
