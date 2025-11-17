#!/usr/bin/env tsx
/**
 * Rotate AWS Secret Helper Script
 *
 * Helps with secret rotation by backing up the current secret value
 * and updating it with a new value.
 *
 * Usage:
 *   tsx scripts/aws/rotate-secret.ts [options]
 *
 * Options:
 *   --name <name>           Secret name (required)
 *   --new-value <value>     New secret value (required, or use --generate)
 *   --generate              Generate a random secret value
 *   --length <number>       Length for generated secret (default: 32)
 *   --region <region>       AWS region (default: us-east-1)
 *   --backup                Create a backup of the old secret
 *   --no-verify             Skip verification step
 *
 * @example
 * ```bash
 * # Rotate a secret with a new value
 * tsx scripts/aws/rotate-secret.ts --name my-api-key --new-value "new-value"
 *
 * # Generate a random secret value
 * tsx scripts/aws/rotate-secret.ts --name my-secret --generate --length 64
 *
 * # Rotate with backup
 * tsx scripts/aws/rotate-secret.ts --name my-api-key --new-value "new" --backup
 * ```
 */

import crypto from 'crypto';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  PutSecretValueCommand,
  CreateSecretCommand,
  DescribeSecretCommand,
} from '@aws-sdk/client-secrets-manager';

/**
 * Parse command line arguments
 */
function parseArgs(): {
  name?: string;
  newValue?: string;
  generate: boolean;
  length: number;
  region: string;
  backup: boolean;
  verify: boolean;
} {
  const args = process.argv.slice(2);
  const config = {
    name: undefined as string | undefined,
    newValue: undefined as string | undefined,
    generate: false,
    length: 32,
    region: 'us-east-1',
    backup: false,
    verify: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--name':
        config.name = args[++i];
        break;
      case '--new-value':
        config.newValue = args[++i];
        break;
      case '--generate':
        config.generate = true;
        break;
      case '--length':
        config.length = parseInt(args[++i], 10);
        break;
      case '--region':
        config.region = args[++i];
        break;
      case '--backup':
        config.backup = true;
        break;
      case '--no-verify':
        config.verify = false;
        break;
      case '--help':
      case '-h':
        console.log(`
Rotate AWS Secret Helper Script

Usage:
  tsx scripts/aws/rotate-secret.ts [options]

Options:
  --name <name>           Secret name (required)
  --new-value <value>     New secret value (required, or use --generate)
  --generate              Generate a random secret value
  --length <number>       Length for generated secret (default: 32)
  --region <region>       AWS region (default: us-east-1)
  --backup                Create a backup of the old secret
  --no-verify             Skip verification step
  --help, -h              Show this help message

Examples:
  # Rotate a secret with a new value
  tsx scripts/aws/rotate-secret.ts --name my-api-key --new-value "new-value"

  # Generate a random secret value
  tsx scripts/aws/rotate-secret.ts --name my-secret --generate --length 64

  # Rotate with backup
  tsx scripts/aws/rotate-secret.ts --name my-api-key --new-value "new" --backup
        `);
        process.exit(0);
    }
  }

  return config;
}

/**
 * Validate arguments
 */
function validateArgs(config: ReturnType<typeof parseArgs>): void {
  if (!config.name) {
    console.error('❌ Error: --name is required');
    process.exit(1);
  }

  if (!config.newValue && !config.generate) {
    console.error('❌ Error: Either --new-value or --generate is required');
    process.exit(1);
  }

  if (config.newValue && config.generate) {
    console.error('❌ Error: Cannot specify both --new-value and --generate');
    process.exit(1);
  }

  if (config.length < 16) {
    console.error('❌ Error: Generated secret length must be at least 16 characters');
    process.exit(1);
  }
}

/**
 * Generate a random secret value
 */
function generateSecret(length: number): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * Mask secret value for display
 */
function maskSecret(value: string): string {
  if (value.length <= 8) return '***';
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
}

/**
 * Get current secret value
 */
async function getCurrentSecret(
  client: SecretsManagerClient,
  secretName: string
): Promise<{ value: string; version?: string }> {
  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);

    let value: string;
    if (response.SecretString) {
      value = response.SecretString;
    } else if (response.SecretBinary) {
      value = Buffer.from(response.SecretBinary as Uint8Array).toString('utf-8');
    } else {
      throw new Error('Secret has no string or binary value');
    }

    return {
      value,
      version: response.VersionId,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      throw new Error(`Secret "${secretName}" not found`);
    }
    throw error;
  }
}

/**
 * Create backup of current secret
 */
async function createBackup(
  client: SecretsManagerClient,
  originalName: string,
  value: string,
  version?: string
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${originalName}-backup-${timestamp}`;

  console.log(`📦 Creating backup: ${backupName}`);

  try {
    await client.send(
      new CreateSecretCommand({
        Name: backupName,
        SecretString: value,
        Description: `Backup of ${originalName} (version: ${version || 'unknown'}) created during rotation`,
        Tags: [
          { Key: 'Backup', Value: 'true' },
          { Key: 'OriginalSecret', Value: originalName },
          { Key: 'BackupDate', Value: new Date().toISOString() },
        ],
      })
    );

    console.log(`✅ Backup created: ${backupName}`);
    return backupName;
  } catch (error) {
    throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update secret with new value
 */
async function updateSecret(
  client: SecretsManagerClient,
  secretName: string,
  newValue: string
): Promise<void> {
  console.log(`🔄 Rotating secret: ${secretName}`);

  try {
    await client.send(
      new PutSecretValueCommand({
        SecretId: secretName,
        SecretString: newValue,
      })
    );

    console.log('✅ Secret rotated successfully!');
  } catch (error) {
    throw new Error(`Failed to rotate secret: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Verify secret was updated
 */
async function verifyRotation(
  client: SecretsManagerClient,
  secretName: string,
  expectedValue: string
): Promise<void> {
  console.log(`🔍 Verifying rotation...`);

  try {
    const { value } = await getCurrentSecret(client, secretName);

    if (value === expectedValue) {
      console.log('✅ Verification successful - secret matches expected value');
    } else {
      console.warn('⚠️  Warning: Retrieved secret does not match expected value');
      console.warn('   This could indicate a caching issue or concurrent update');
    }
  } catch (error) {
    console.error(`❌ Verification failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Rotate secret
 */
async function rotateSecret(
  name: string,
  newValue: string,
  region: string,
  shouldBackup: boolean,
  shouldVerify: boolean
): Promise<void> {
  // Verify AWS credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ Error: AWS credentials not found');
    console.error('   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  console.log(`\n☁️  Connecting to AWS Secrets Manager (${region})...`);

  const client = new SecretsManagerClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Get current secret value
    console.log(`📖 Reading current secret value...`);
    const { value: currentValue, version } = await getCurrentSecret(client, name);
    console.log(`   Current version: ${version || 'unknown'}`);
    console.log(`   Current value: ${maskSecret(currentValue)}`);

    // Create backup if requested
    let backupName: string | undefined;
    if (shouldBackup) {
      backupName = await createBackup(client, name, currentValue, version);
    }

    // Update secret
    await updateSecret(client, name, newValue);

    // Verify rotation if requested
    if (shouldVerify) {
      await verifyRotation(client, name, newValue);
    }

    console.log(`\n🎉 Secret rotation completed!`);
    console.log(`   Secret Name: ${name}`);
    console.log(`   Region: ${region}`);
    console.log(`   New Value: ${maskSecret(newValue)}`);
    if (backupName) {
      console.log(`   Backup: ${backupName}`);
    }

    console.log('\n📝 Next Steps:');
    console.log('   1. Update any applications using this secret');
    console.log('   2. Monitor logs for any authentication failures');
    console.log('   3. Wait for cache TTL to expire (15 minutes)');
    if (backupName) {
      console.log(`   4. Delete backup after verifying everything works: ${backupName}`);
    }
  } catch (error) {
    console.error('\n❌ Secret rotation failed:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);

      if (error.name === 'AccessDeniedException') {
        console.error('\n💡 Make sure your IAM user has the following permissions:');
        console.error('   - secretsmanager:GetSecretValue');
        console.error('   - secretsmanager:PutSecretValue');
        console.error('   - secretsmanager:CreateSecret (if using --backup)');
      }
    }
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 AWS Secrets Manager - Rotate Secret');
  console.log('=======================================\n');

  const config = parseArgs();
  validateArgs(config);

  let newValue = config.newValue;
  if (config.generate) {
    newValue = generateSecret(config.length);
    console.log(`🎲 Generated random secret (${config.length} characters)`);
  }

  await rotateSecret(config.name!, newValue!, config.region, config.backup, config.verify);
}

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
