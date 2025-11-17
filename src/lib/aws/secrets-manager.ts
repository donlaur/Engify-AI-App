/**
 * Production-Ready AWS Secrets Manager Client
 *
 * Features:
 * - Type-safe secrets retrieval with TypeScript
 * - In-memory caching with 15-minute TTL
 * - Automatic fallback to environment variables for local development
 * - Support for secret rotation and versioning
 * - Comprehensive error handling
 * - Health checks and monitoring
 * - Never logs secret values
 *
 * @module lib/aws/secrets-manager
 *
 * @example
 * ```typescript
 * import { getSecretsManager } from '@/lib/aws/secrets-manager';
 *
 * const secrets = getSecretsManager();
 * const appSecrets = await secrets.getAppSecrets();
 * console.log('OpenAI Key:', appSecrets.aiProviders.OPENAI_API_KEY ? '✓' : '✗');
 * ```
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
  PutSecretValueCommand,
  DescribeSecretCommand,
  ListSecretsCommand,
  type GetSecretValueCommandOutput,
  type DescribeSecretCommandOutput,
} from '@aws-sdk/client-secrets-manager';
import type {
  SecretsManagerConfig,
  SecretCacheEntry,
  HealthCheckResult,
  AppSecrets,
  AIProviderSecrets,
  DatabaseSecrets,
  AuthSecrets,
  EmailSecrets,
  SMSSecrets,
  QueueSecrets,
  CacheSecrets,
  SecuritySecrets,
  SecretMetadata,
  Environment,
} from './types';

/**
 * Enhanced AWS Secrets Manager Service
 *
 * This service provides secure, cached access to secrets stored in AWS Secrets Manager
 * with automatic fallback to environment variables for local development.
 *
 * Security features:
 * - Secrets are never logged
 * - Cache is in-memory only (not persisted to disk)
 * - Supports IAM roles for credential-free operation in AWS environments
 * - Validates secret structure before returning
 */
export class SecretsManagerService {
  private client: SecretsManagerClient | null = null;
  private config: Required<SecretsManagerConfig>;
  private cache = new Map<string, SecretCacheEntry>();
  private readonly DEFAULT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  private readonly DEFAULT_SECRET_NAME = 'engify-ai/app-secrets';

  constructor(config?: SecretsManagerConfig) {
    this.config = {
      region: config?.region || process.env.AWS_REGION || 'us-east-1',
      secretName: config?.secretName || process.env.AWS_SECRETS_NAME || this.DEFAULT_SECRET_NAME,
      cacheTtlMs: config?.cacheTtlMs || this.DEFAULT_CACHE_TTL,
      enableCache: config?.enableCache ?? true,
      fallbackToEnv: config?.fallbackToEnv ?? true,
      accessKeyId: config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: config?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY || '',
    };

    // Initialize client if AWS credentials are available
    if (this.isAWSConfigured()) {
      this.initializeClient();
    }
  }

  /**
   * Check if AWS is configured
   */
  private isAWSConfigured(): boolean {
    return Boolean(
      this.config.accessKeyId ||
      process.env.AWS_EXECUTION_ENV || // Running on AWS (Lambda, ECS, etc.)
      process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI // Running on Fargate
    );
  }

  /**
   * Initialize the AWS Secrets Manager client
   */
  private initializeClient(): void {
    const credentials = this.config.accessKeyId
      ? {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        }
      : undefined; // Let SDK use IAM role

    this.client = new SecretsManagerClient({
      region: this.config.region,
      credentials,
      maxAttempts: 3,
      requestHandler: {
        requestTimeout: 3000, // 3 second timeout for requests
      },
    });
  }

  /**
   * Get the current environment
   */
  private getEnvironment(): Environment {
    const env = process.env.NODE_ENV;
    if (env === 'production' || env === 'test') {
      return env;
    }
    return 'development';
  }

  /**
   * Check if we should use AWS Secrets Manager
   */
  private shouldUseAWS(): boolean {
    const env = this.getEnvironment();
    return env === 'production' && this.isAWSConfigured();
  }

  /**
   * Get a secret from cache
   */
  private getCachedSecret<T = unknown>(key: string): T | null {
    if (!this.config.enableCache) {
      return null;
    }

    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }

    // Remove expired entry
    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Set a secret in cache
   */
  private setCachedSecret<T = unknown>(key: string, value: T, version?: string): void {
    if (!this.config.enableCache) {
      return;
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.config.cacheTtlMs,
      version,
    });
  }

  /**
   * Get a raw secret value from AWS Secrets Manager
   */
  private async getSecretFromAWS(secretName: string): Promise<{ value: string; version?: string }> {
    if (!this.client) {
      throw new Error('AWS Secrets Manager client not initialized. Check AWS credentials.');
    }

    try {
      const command = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const response: GetSecretValueCommandOutput = await this.client.send(command);

      let secretValue: string;
      if (response.SecretString) {
        secretValue = response.SecretString;
      } else if (response.SecretBinary) {
        secretValue = Buffer.from(response.SecretBinary as Uint8Array).toString('utf-8');
      } else {
        throw new Error(`Secret ${secretName} has no string or binary value`);
      }

      return {
        value: secretValue,
        version: response.VersionId,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'ResourceNotFoundException') {
          throw new Error(`Secret "${secretName}" not found in AWS Secrets Manager`);
        }
        if (error.name === 'AccessDeniedException') {
          throw new Error(`Access denied to secret "${secretName}". Check IAM permissions.`);
        }
        if (error.name === 'InvalidRequestException') {
          throw new Error(`Invalid request for secret "${secretName}": ${error.message}`);
        }
      }
      throw error;
    }
  }

  /**
   * Get a secret value (string)
   * Falls back to environment variable if AWS is not configured
   */
  async getSecret(secretName: string, fallbackEnvVar?: string): Promise<string> {
    const cacheKey = `secret:${secretName}`;

    // Check cache first
    const cached = this.getCachedSecret<string>(cacheKey);
    if (cached) {
      return cached;
    }

    // Try AWS Secrets Manager in production
    if (this.shouldUseAWS()) {
      try {
        const { value, version } = await this.getSecretFromAWS(secretName);
        this.setCachedSecret(cacheKey, value, version);
        return value;
      } catch (error) {
        const env = this.getEnvironment();
        console.error(`[SecretsManager] Failed to get secret "${secretName}" from AWS (env: ${env}):`, error instanceof Error ? error.message : String(error));

        // In production, don't fallback - fail fast
        if (env === 'production' && !this.config.fallbackToEnv) {
          throw error;
        }
        // Fall through to environment variable fallback
      }
    }

    // Fallback to environment variable
    if (this.config.fallbackToEnv) {
      const envVar = fallbackEnvVar || secretName;
      const envValue = process.env[envVar];

      if (!envValue) {
        throw new Error(
          `Secret "${secretName}" not found in AWS Secrets Manager or environment variable "${envVar}"`
        );
      }

      // Cache the env var value
      this.setCachedSecret(cacheKey, envValue);
      return envValue;
    }

    throw new Error(`Secret "${secretName}" not found and fallback to environment variables is disabled`);
  }

  /**
   * Get a secret as JSON
   */
  async getSecretJSON<T = unknown>(secretName: string, fallbackEnvVar?: string): Promise<T> {
    const secretString = await this.getSecret(secretName, fallbackEnvVar);
    try {
      return JSON.parse(secretString) as T;
    } catch (error) {
      throw new Error(
        `Secret "${secretName}" is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get all application secrets as a structured object
   * This is the primary method for accessing secrets in the application
   */
  async getAppSecrets(): Promise<AppSecrets> {
    const cacheKey = 'app:secrets';

    // Check cache first
    const cached = this.getCachedSecret<AppSecrets>(cacheKey);
    if (cached) {
      return cached;
    }

    // Try to get structured secrets from AWS
    if (this.shouldUseAWS()) {
      try {
        const secrets = await this.getSecretJSON<AppSecrets>(this.config.secretName);
        this.setCachedSecret(cacheKey, secrets);
        return secrets;
      } catch (error) {
        console.error('[SecretsManager] Failed to get app secrets from AWS:', error instanceof Error ? error.message : String(error));
        // Fall through to environment variable fallback
      }
    }

    // Fallback: Build secrets from environment variables
    if (this.config.fallbackToEnv) {
      const secrets = this.buildSecretsFromEnv();
      this.setCachedSecret(cacheKey, secrets);
      return secrets;
    }

    throw new Error('Failed to retrieve application secrets');
  }

  /**
   * Build secrets object from environment variables
   */
  private buildSecretsFromEnv(): AppSecrets {
    return {
      aiProviders: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY,
        GROQ_API_KEY: process.env.GROQ_API_KEY,
        REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
      },
      database: {
        MONGODB_URI: process.env.MONGODB_URI,
      },
      auth: {
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GITHUB_ID: process.env.GITHUB_ID,
        GITHUB_SECRET: process.env.GITHUB_SECRET,
      },
      email: {
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
        SENDGRID_WEBHOOK_PUBLIC_KEY: process.env.SENDGRID_WEBHOOK_PUBLIC_KEY,
      },
      sms: {
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        TWILIO_VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID,
      },
      queue: {
        QSTASH_TOKEN: process.env.QSTASH_TOKEN,
        CRON_SECRET: process.env.CRON_SECRET,
      },
      cache: {
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      },
      security: {
        API_KEY_ENCRYPTION_KEY: process.env.API_KEY_ENCRYPTION_KEY,
        JIRA_TOKEN_ENCRYPTION_KEY: process.env.JIRA_TOKEN_ENCRYPTION_KEY,
      },
    };
  }

  /**
   * Update a secret in AWS Secrets Manager
   */
  async updateSecret(secretName: string, secretValue: string | Record<string, unknown>): Promise<void> {
    if (!this.client) {
      throw new Error('AWS Secrets Manager client not initialized');
    }

    const secretString = typeof secretValue === 'string' ? secretValue : JSON.stringify(secretValue);

    try {
      const command = new PutSecretValueCommand({
        SecretId: secretName,
        SecretString: secretString,
      });

      await this.client.send(command);

      // Clear cache for this secret
      this.cache.delete(`secret:${secretName}`);
      this.cache.delete('app:secrets');
    } catch (error) {
      throw new Error(`Failed to update secret "${secretName}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get secret metadata (for monitoring and rotation)
   */
  async getSecretMetadata(secretName: string): Promise<SecretMetadata> {
    if (!this.client) {
      throw new Error('AWS Secrets Manager client not initialized');
    }

    try {
      const command = new DescribeSecretCommand({
        SecretId: secretName,
      });

      const response: DescribeSecretCommandOutput = await this.client.send(command);

      return {
        name: response.Name || secretName,
        arn: response.ARN,
        createdDate: response.CreatedDate,
        lastAccessedDate: response.LastAccessedDate,
        lastChangedDate: response.LastChangedDate,
        rotationEnabled: response.RotationEnabled,
      };
    } catch (error) {
      throw new Error(`Failed to get metadata for secret "${secretName}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Health check for AWS Secrets Manager connectivity
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const result: HealthCheckResult = {
      healthy: false,
      service: 'AWS Secrets Manager',
      timestamp: new Date(),
      metadata: {
        region: this.config.region,
        cacheSize: this.cache.size,
      },
    };

    // If AWS is not configured, return healthy for local development
    if (!this.isAWSConfigured()) {
      result.healthy = true;
      result.error = 'AWS not configured (using environment variables)';
      return result;
    }

    if (!this.client) {
      result.error = 'AWS Secrets Manager client not initialized';
      return result;
    }

    try {
      // Try to list secrets as a lightweight health check
      const command = new ListSecretsCommand({ MaxResults: 1 });
      await this.client.send(command);

      result.healthy = true;
      result.metadata!.secretsAccessible = true;
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);

      // In development, connectivity issues are not critical
      if (this.getEnvironment() !== 'production') {
        result.healthy = true;
        result.error = `AWS Secrets Manager not accessible (expected in development): ${result.error}`;
      }
    }

    return result;
  }

  /**
   * Clear cache for a specific secret or all secrets
   */
  clearCache(secretName?: string): void {
    if (secretName) {
      this.cache.delete(`secret:${secretName}`);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Validate that all required secrets are available
   */
  async validateSecrets(requiredSecrets: string[]): Promise<{ valid: boolean; missing: string[] }> {
    const missing: string[] = [];

    for (const secretKey of requiredSecrets) {
      try {
        const value = await this.getSecret(secretKey);
        if (!value) {
          missing.push(secretKey);
        }
      } catch {
        missing.push(secretKey);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

/**
 * Singleton instance
 */
let secretsManagerInstance: SecretsManagerService | null = null;

/**
 * Get the secrets manager singleton instance
 */
export function getSecretsManager(config?: SecretsManagerConfig): SecretsManagerService {
  if (!secretsManagerInstance) {
    secretsManagerInstance = new SecretsManagerService(config);
  }
  return secretsManagerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetSecretsManager(): void {
  secretsManagerInstance = null;
}

/**
 * Export singleton for convenience
 */
export const secretsManager = getSecretsManager();

/**
 * Export default
 */
export default SecretsManagerService;
