/**
 * AWS Secrets Manager Service
 *
 * Secure retrieval of secrets from AWS Secrets Manager
 * Falls back to environment variables for local development
 */

interface SecretsManagerConfig {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export class SecretsManagerService {
  private region: string;
  private cachedSecrets: Map<string, { value: string; expiresAt: number }> =
    new Map();
  private cacheTtl = 5 * 60 * 1000; // 5 minutes cache

  constructor(config?: SecretsManagerConfig) {
    this.region = config?.region || process.env.AWS_REGION || 'us-east-1';
  }

  /**
   * Get secret from AWS Secrets Manager or environment variables
   * Caches results for 5 minutes
   */
  async getSecret(
    secretName: string,
    fallbackEnvVar?: string
  ): Promise<string> {
    // Check cache first
    const cached = this.cachedSecrets.get(secretName);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    // In production, use AWS Secrets Manager
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.AWS_ACCESS_KEY_ID
    ) {
      try {
        const secret = await this.getSecretFromAWS(secretName);
        this.cachedSecrets.set(secretName, {
          value: secret,
          expiresAt: Date.now() + this.cacheTtl,
        });
        return secret;
      } catch (error) {
        console.error(`Failed to get secret ${secretName} from AWS:`, error);
        // Fall through to environment variable fallback
      }
    }

    // Fallback to environment variable (dev/local)
    const envVar = fallbackEnvVar || secretName;
    const envValue = process.env[envVar];

    if (!envValue) {
      throw new Error(
        `Secret ${secretName} not found in AWS Secrets Manager or environment variable ${envVar}`
      );
    }

    // Cache the env var value
    this.cachedSecrets.set(secretName, {
      value: envValue,
      expiresAt: Date.now() + this.cacheTtl,
    });

    return envValue;
  }

  /**
   * Get secret from AWS Secrets Manager
   * Note: Requires AWS SDK v3 to be installed: npm install @aws-sdk/client-secrets-manager
   * Supports IAM roles (when running on EC2/Lambda) or explicit credentials
   */
  private async getSecretFromAWS(secretName: string): Promise<string> {
    // Dynamic import to avoid requiring AWS SDK in development
    try {
      const { SecretsManagerClient, GetSecretValueCommand } = await import(
        '@aws-sdk/client-secrets-manager'
      );

      // Build credentials - supports IAM roles, environment variables, or explicit config
      const credentials = process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
          }
        : undefined; // Let SDK use IAM role (for EC2/Lambda/ECS)

      const client = new SecretsManagerClient({
        region: this.region,
        credentials,
        // Retry configuration
        maxAttempts: 3,
      });

      const command = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const response = await client.send(command);

      if (response.SecretString) {
        return response.SecretString;
      }

      if (response.SecretBinary) {
        return Buffer.from(response.SecretBinary as Uint8Array).toString(
          'utf-8'
        );
      }

      throw new Error(`Secret ${secretName} has no string or binary value`);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === 'ResourceNotFoundException'
      ) {
        throw new Error(
          `Secret ${secretName} not found in AWS Secrets Manager`
        );
      }
      throw error;
    }
  }

  /**
   * Get and parse JSON secret from AWS Secrets Manager
   * Useful for secrets that store multiple values (e.g., database credentials)
   */
  async getSecretJSON<T = unknown>(
    secretName: string,
    fallbackEnvVar?: string
  ): Promise<T> {
    const secretString = await this.getSecret(secretName, fallbackEnvVar);
    try {
      return JSON.parse(secretString) as T;
    } catch (error) {
      throw new Error(
        `Secret ${secretName} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if AWS Secrets Manager is available and accessible
   * Useful for health checks and startup validation
   */
  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    // Test with a dummy secret name to check connectivity
    // This won't fail if the secret doesn't exist, just if we can't reach AWS
    try {
      const { SecretsManagerClient } = await import(
        '@aws-sdk/client-secrets-manager'
      );

      const client = new SecretsManagerClient({
        region: this.region,
        maxAttempts: 1, // Fast failure for health checks
      });

      // Use ListSecrets as a lightweight health check (no permissions needed)
      // But if we have permissions, we can check a known secret
      if (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_EXECUTION_ENV) {
        // We're either configured or running on AWS - try to list secrets (will fail gracefully if no permissions)
        const { ListSecretsCommand } = await import(
          '@aws-sdk/client-secrets-manager'
        );
        await client.send(new ListSecretsCommand({ MaxResults: 1 }));
      }

      return { healthy: true };
    } catch (error) {
      // In development, this is expected if AWS is not configured
      if (process.env.NODE_ENV !== 'production') {
        return {
          healthy: false,
          error: `AWS Secrets Manager not accessible (expected in development): ${error instanceof Error ? error.message : String(error)}`,
        };
      }
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Clear cache for a specific secret or all secrets
   */
  clearCache(secretName?: string): void {
    if (secretName) {
      this.cachedSecrets.delete(secretName);
    } else {
      this.cachedSecrets.clear();
    }
  }
}

// Export singleton instance
export const secretsManager = new SecretsManagerService();
