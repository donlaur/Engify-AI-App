#!/usr/bin/env tsx
/**
 * Create AWS Secret Helper Script
 *
 * Helper script to create individual secrets or update specific fields
 * in the main application secrets.
 *
 * Usage:
 *   tsx scripts/aws/create-secret.ts [options]
 *
 * Options:
 *   --name <name>           Secret name (required)
 *   --value <value>         Secret value (required, or use --file)
 *   --file <path>           Read secret value from file
 *   --description <text>    Secret description
 *   --region <region>       AWS region (default: us-east-1)
 *   --update               Update existing secret if it exists
 *
 * @example
 * ```bash
 * # Create a simple secret
 * tsx scripts/aws/create-secret.ts --name my-api-key --value "sk-xxx"
 *
 * # Create a secret from file
 * tsx scripts/aws/create-secret.ts --name my-cert --file ./cert.pem
 *
 * # Update an existing secret
 * tsx scripts/aws/create-secret.ts --name my-api-key --value "sk-new" --update
 * ```
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  SecretsManagerClient,
  CreateSecretCommand,
  PutSecretValueCommand,
  DescribeSecretCommand,
} from '@aws-sdk/client-secrets-manager';

/**
 * Parse command line arguments
 */
function parseArgs(): {
  name?: string;
  value?: string;
  file?: string;
  description?: string;
  region: string;
  update: boolean;
} {
  const args = process.argv.slice(2);
  const config = {
    name: undefined as string | undefined,
    value: undefined as string | undefined,
    file: undefined as string | undefined,
    description: undefined as string | undefined,
    region: 'us-east-1',
    update: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--name':
        config.name = args[++i];
        break;
      case '--value':
        config.value = args[++i];
        break;
      case '--file':
        config.file = args[++i];
        break;
      case '--description':
        config.description = args[++i];
        break;
      case '--region':
        config.region = args[++i];
        break;
      case '--update':
        config.update = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Create AWS Secret Helper Script

Usage:
  tsx scripts/aws/create-secret.ts [options]

Options:
  --name <name>           Secret name (required)
  --value <value>         Secret value (required, or use --file)
  --file <path>           Read secret value from file
  --description <text>    Secret description
  --region <region>       AWS region (default: us-east-1)
  --update                Update existing secret if it exists
  --help, -h              Show this help message

Examples:
  # Create a simple secret
  tsx scripts/aws/create-secret.ts --name my-api-key --value "sk-xxx"

  # Create a secret from file
  tsx scripts/aws/create-secret.ts --name my-cert --file ./cert.pem

  # Update an existing secret
  tsx scripts/aws/create-secret.ts --name my-api-key --value "sk-new" --update
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

  if (!config.value && !config.file) {
    console.error('❌ Error: Either --value or --file is required');
    process.exit(1);
  }

  if (config.value && config.file) {
    console.error('❌ Error: Cannot specify both --value and --file');
    process.exit(1);
  }
}

/**
 * Get secret value
 */
function getSecretValue(config: ReturnType<typeof parseArgs>): string {
  if (config.value) {
    return config.value;
  }

  if (config.file) {
    const filePath = path.resolve(process.cwd(), config.file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: File not found: ${filePath}`);
      process.exit(1);
    }
    return fs.readFileSync(filePath, 'utf-8');
  }

  throw new Error('No value or file specified');
}

/**
 * Check if secret exists
 */
async function secretExists(client: SecretsManagerClient, secretName: string): Promise<boolean> {
  try {
    await client.send(new DescribeSecretCommand({ SecretId: secretName }));
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

/**
 * Create or update secret
 */
async function createOrUpdateSecret(
  name: string,
  value: string,
  description: string | undefined,
  region: string,
  allowUpdate: boolean
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
    const exists = await secretExists(client, name);

    if (exists && !allowUpdate) {
      console.error(`❌ Error: Secret "${name}" already exists`);
      console.error('   Use --update to update an existing secret');
      process.exit(1);
    }

    if (exists) {
      console.log(`📝 Updating existing secret: ${name}`);
      await client.send(
        new PutSecretValueCommand({
          SecretId: name,
          SecretString: value,
        })
      );
      console.log('✅ Secret updated successfully!');
    } else {
      console.log(`📝 Creating new secret: ${name}`);
      await client.send(
        new CreateSecretCommand({
          Name: name,
          SecretString: value,
          Description: description || `Created by create-secret.ts`,
        })
      );
      console.log('✅ Secret created successfully!');
    }

    console.log(`\n🎉 Operation completed!`);
    console.log(`   Secret Name: ${name}`);
    console.log(`   Region: ${region}`);
    console.log(`   Value Length: ${value.length} characters`);
  } catch (error) {
    console.error('\n❌ Failed to create/update secret:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);

      if (error.name === 'AccessDeniedException') {
        console.error('\n💡 Make sure your IAM user has the following permissions:');
        console.error('   - secretsmanager:CreateSecret');
        console.error('   - secretsmanager:PutSecretValue');
        console.error('   - secretsmanager:DescribeSecret');
      }
    }
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔐 AWS Secrets Manager - Create Secret');
  console.log('=======================================\n');

  const config = parseArgs();
  validateArgs(config);

  const secretValue = getSecretValue(config);

  await createOrUpdateSecret(
    config.name!,
    secretValue,
    config.description,
    config.region,
    config.update
  );
}

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
