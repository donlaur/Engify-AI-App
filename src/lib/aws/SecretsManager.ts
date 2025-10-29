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
   */
  private async getSecretFromAWS(secretName: string): Promise<string> {
    // Dynamic import to avoid requiring AWS SDK in development
    try {
      const { SecretsManagerClient, GetSecretValueCommand } = await import(
        '@aws-sdk/client-secrets-manager'
      );

      const client = new SecretsManagerClient({
        region: this.region,
        credentials: process.env.AWS_ACCESS_KEY_ID
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            }
          : undefined,
      });

      const command = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const response = await client.send(command);

      if (response.SecretString) {
        return response.SecretString;
      }

      if (response.SecretBinary) {
        return Buffer.from(response.SecretBinary).toString('utf-8');
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
