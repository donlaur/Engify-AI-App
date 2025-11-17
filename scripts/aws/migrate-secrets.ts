#!/usr/bin/env tsx
/**
 * AWS Secrets Manager Migration Script
 *
 * Reads secrets from .env.local and uploads them to AWS Secrets Manager.
 * This script does NOT delete the local .env.local file for safety.
 *
 * Usage:
 *   tsx scripts/aws/migrate-secrets.ts [options]
 *
 * Options:
 *   --secret-name <name>    Secret name in AWS (default: engify-ai/app-secrets)
 *   --region <region>       AWS region (default: us-east-1)
 *   --env-file <path>       Path to .env file (default: .env.local)
 *   --dry-run               Show what would be uploaded without uploading
 *   --validate              Validate after upload
 *
 * Prerequisites:
 *   - AWS credentials configured (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
 *   - .env.local file with secrets to migrate
 *
 * @example
 * ```bash
 * # Dry run (preview what would be uploaded)
 * tsx scripts/aws/migrate-secrets.ts --dry-run
 *
 * # Upload to AWS Secrets Manager
 * tsx scripts/aws/migrate-secrets.ts
 *
 * # Upload to custom secret name
 * tsx scripts/aws/migrate-secrets.ts --secret-name my-app/secrets
 * ```
 */

import * as fs from 'fs';
import * as path from 'path';
import { config as loadDotenv } from 'dotenv';
import {
  SecretsManagerClient,
  CreateSecretCommand,
  PutSecretValueCommand,
  DescribeSecretCommand,
} from '@aws-sdk/client-secrets-manager';
import type { AppSecrets } from '../../src/lib/aws/types';

/**
 * Parse command line arguments
 */
function parseArgs(): {
  secretName: string;
  region: string;
  envFile: string;
  dryRun: boolean;
  validate: boolean;
} {
  const args = process.argv.slice(2);
  const config = {
    secretName: 'engify-ai/app-secrets',
    region: 'us-east-1',
    envFile: '.env.local',
    dryRun: false,
    validate: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--secret-name':
        config.secretName = args[++i];
        break;
      case '--region':
        config.region = args[++i];
        break;
      case '--env-file':
        config.envFile = args[++i];
        break;
      case '--dry-run':
        config.dryRun = true;
        break;
      case '--validate':
        config.validate = true;
        break;
      case '--help':
      case '-h':
        console.log(`
AWS Secrets Manager Migration Script

Usage:
  tsx scripts/aws/migrate-secrets.ts [options]

Options:
  --secret-name <name>    Secret name in AWS (default: engify-ai/app-secrets)
  --region <region>       AWS region (default: us-east-1)
  --env-file <path>       Path to .env file (default: .env.local)
  --dry-run               Show what would be uploaded without uploading
  --validate              Validate after upload
  --help, -h              Show this help message

Examples:
  # Preview what would be uploaded
  tsx scripts/aws/migrate-secrets.ts --dry-run

  # Upload secrets to AWS
  tsx scripts/aws/migrate-secrets.ts

  # Upload with validation
  tsx scripts/aws/migrate-secrets.ts --validate
        `);
        process.exit(0);
    }
  }

  return config;
}

/**
 * Load environment file
 */
function loadEnvFile(envFilePath: string): Record<string, string> {
  const absolutePath = path.resolve(process.cwd(), envFilePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: Environment file not found: ${absolutePath}`);
    console.error('   Please create it or specify a different file with --env-file');
    process.exit(1);
  }

  console.log(`📂 Loading environment variables from: ${absolutePath}`);

  const result = loadDotenv({ path: absolutePath });

  if (result.error) {
    console.error('❌ Error loading environment file:', result.error);
    process.exit(1);
  }

  return result.parsed || {};
}

/**
 * Build secrets structure from environment variables
 */
function buildSecretsFromEnv(env: Record<string, string>): AppSecrets {
  const secrets: AppSecrets = {
    aiProviders: {
      OPENAI_API_KEY: env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
      GOOGLE_API_KEY: env.GOOGLE_API_KEY || env.GOOGLE_AI_API_KEY,
      GROQ_API_KEY: env.GROQ_API_KEY,
      REPLICATE_API_TOKEN: env.REPLICATE_API_TOKEN,
    },
    database: {
      MONGODB_URI: env.MONGODB_URI,
    },
    auth: {
      NEXTAUTH_SECRET: env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
      GITHUB_ID: env.GITHUB_ID,
      GITHUB_SECRET: env.GITHUB_SECRET,
    },
    email: {
      SENDGRID_API_KEY: env.SENDGRID_API_KEY,
      SENDGRID_WEBHOOK_PUBLIC_KEY: env.SENDGRID_WEBHOOK_PUBLIC_KEY,
    },
    sms: {
      TWILIO_ACCOUNT_SID: env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: env.TWILIO_AUTH_TOKEN,
      TWILIO_VERIFY_SERVICE_SID: env.TWILIO_VERIFY_SERVICE_SID,
    },
    queue: {
      QSTASH_TOKEN: env.QSTASH_TOKEN,
      CRON_SECRET: env.CRON_SECRET,
    },
    cache: {
      UPSTASH_REDIS_REST_URL: env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: env.UPSTASH_REDIS_REST_TOKEN,
      REDIS_PASSWORD: env.REDIS_PASSWORD,
    },
    security: {
      API_KEY_ENCRYPTION_KEY: env.API_KEY_ENCRYPTION_KEY,
      JIRA_TOKEN_ENCRYPTION_KEY: env.JIRA_TOKEN_ENCRYPTION_KEY,
    },
  };

  return secrets;
}

/**
 * Mask secret values for display
 */
function maskSecret(value: string | undefined): string {
  if (!value) return '(not set)';
  if (value.length <= 8) return '***';
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
}

/**
 * Display secrets summary (masked)
 */
function displaySecretsSummary(secrets: AppSecrets): void {
  console.log('\n📋 Secrets Summary (values are masked):');
  console.log('─────────────────────────────────────────────────────────');

  console.log('\n🤖 AI Providers:');
  console.log(`   OPENAI_API_KEY:      ${maskSecret(secrets.aiProviders.OPENAI_API_KEY)}`);
  console.log(`   ANTHROPIC_API_KEY:   ${maskSecret(secrets.aiProviders.ANTHROPIC_API_KEY)}`);
  console.log(`   GOOGLE_API_KEY:      ${maskSecret(secrets.aiProviders.GOOGLE_API_KEY)}`);
  console.log(`   GROQ_API_KEY:        ${maskSecret(secrets.aiProviders.GROQ_API_KEY)}`);
  console.log(`   REPLICATE_API_TOKEN: ${maskSecret(secrets.aiProviders.REPLICATE_API_TOKEN)}`);

  console.log('\n🗄️  Database:');
  console.log(`   MONGODB_URI:         ${maskSecret(secrets.database.MONGODB_URI)}`);

  console.log('\n🔐 Authentication:');
  console.log(`   NEXTAUTH_SECRET:     ${maskSecret(secrets.auth.NEXTAUTH_SECRET)}`);
  console.log(`   NEXTAUTH_URL:        ${secrets.auth.NEXTAUTH_URL || '(not set)'}`);
  console.log(`   GOOGLE_CLIENT_ID:    ${maskSecret(secrets.auth.GOOGLE_CLIENT_ID)}`);
  console.log(`   GOOGLE_CLIENT_SECRET:${maskSecret(secrets.auth.GOOGLE_CLIENT_SECRET)}`);
  console.log(`   GITHUB_ID:           ${maskSecret(secrets.auth.GITHUB_ID)}`);
  console.log(`   GITHUB_SECRET:       ${maskSecret(secrets.auth.GITHUB_SECRET)}`);

  console.log('\n📧 Email (SendGrid):');
  console.log(`   SENDGRID_API_KEY:    ${maskSecret(secrets.email.SENDGRID_API_KEY)}`);
  console.log(`   SENDGRID_WEBHOOK_PUBLIC_KEY: ${maskSecret(secrets.email.SENDGRID_WEBHOOK_PUBLIC_KEY)}`);

  console.log('\n📱 SMS (Twilio):');
  console.log(`   TWILIO_ACCOUNT_SID:  ${maskSecret(secrets.sms.TWILIO_ACCOUNT_SID)}`);
  console.log(`   TWILIO_AUTH_TOKEN:   ${maskSecret(secrets.sms.TWILIO_AUTH_TOKEN)}`);
  console.log(`   TWILIO_VERIFY_SERVICE_SID: ${maskSecret(secrets.sms.TWILIO_VERIFY_SERVICE_SID)}`);

  console.log('\n⚡ Queue (Upstash):');
  console.log(`   QSTASH_TOKEN:        ${maskSecret(secrets.queue.QSTASH_TOKEN)}`);
  console.log(`   CRON_SECRET:         ${maskSecret(secrets.queue.CRON_SECRET)}`);

  console.log('\n💾 Cache (Redis):');
  console.log(`   UPSTASH_REDIS_REST_URL: ${secrets.cache.UPSTASH_REDIS_REST_URL ? '(set)' : '(not set)'}`);
  console.log(`   UPSTASH_REDIS_REST_TOKEN: ${maskSecret(secrets.cache.UPSTASH_REDIS_REST_TOKEN)}`);
  console.log(`   REDIS_PASSWORD:      ${maskSecret(secrets.cache.REDIS_PASSWORD)}`);

  console.log('\n🔒 Security:');
  console.log(`   API_KEY_ENCRYPTION_KEY: ${maskSecret(secrets.security.API_KEY_ENCRYPTION_KEY)}`);
  console.log(`   JIRA_TOKEN_ENCRYPTION_KEY: ${maskSecret(secrets.security.JIRA_TOKEN_ENCRYPTION_KEY)}`);

  console.log('─────────────────────────────────────────────────────────\n');
}

/**
 * Check if secret exists in AWS
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
 * Upload secrets to AWS Secrets Manager
 */
async function uploadSecrets(
  secrets: AppSecrets,
  secretName: string,
  region: string,
  dryRun: boolean
): Promise<void> {
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made to AWS');
    displaySecretsSummary(secrets);
    console.log(`\n📤 Would upload to: ${secretName} (${region})`);
    console.log('   Run without --dry-run to actually upload');
    return;
  }

  // Verify AWS credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ Error: AWS credentials not found');
    console.error('   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    console.error('   Or configure AWS CLI with: aws configure');
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

  displaySecretsSummary(secrets);

  const secretString = JSON.stringify(secrets, null, 2);

  try {
    const exists = await secretExists(client, secretName);

    if (exists) {
      console.log(`📝 Updating existing secret: ${secretName}`);
      await client.send(
        new PutSecretValueCommand({
          SecretId: secretName,
          SecretString: secretString,
        })
      );
      console.log('✅ Secret updated successfully!');
    } else {
      console.log(`📝 Creating new secret: ${secretName}`);
      await client.send(
        new CreateSecretCommand({
          Name: secretName,
          SecretString: secretString,
          Description: 'Engify.ai application secrets (auto-migrated)',
        })
      );
      console.log('✅ Secret created successfully!');
    }

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`   Secret Name: ${secretName}`);
    console.log(`   Region: ${region}`);
  } catch (error) {
    console.error('\n❌ Failed to upload secrets to AWS:');
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
 * Validate uploaded secrets
 */
async function validateUploadedSecrets(secretName: string, region: string): Promise<void> {
  console.log(`\n🔍 Validating uploaded secrets...`);

  const { SecretsManagerService } = await import('../../src/lib/aws/secrets-manager');
  const secretsManager = new SecretsManagerService({ region, secretName });

  try {
    const secrets = await secretsManager.getSecretJSON<AppSecrets>(secretName);

    // Count configured services
    let configuredCount = 0;
    let totalFields = 0;

    for (const category of Object.values(secrets)) {
      for (const value of Object.values(category)) {
        totalFields++;
        if (value) configuredCount++;
      }
    }

    console.log(`✅ Validation successful!`);
    console.log(`   ${configuredCount} of ${totalFields} secrets are configured`);

    // List configured services
    const configured: string[] = [];
    if (secrets.aiProviders.OPENAI_API_KEY) configured.push('OpenAI');
    if (secrets.aiProviders.ANTHROPIC_API_KEY) configured.push('Anthropic');
    if (secrets.aiProviders.GOOGLE_API_KEY) configured.push('Google AI');
    if (secrets.database.MONGODB_URI) configured.push('MongoDB');
    if (secrets.email.SENDGRID_API_KEY) configured.push('SendGrid');
    if (secrets.cache.UPSTASH_REDIS_REST_URL) configured.push('Redis');

    if (configured.length > 0) {
      console.log(`   Configured services: ${configured.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Validation failed:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔐 AWS Secrets Manager Migration Script');
  console.log('========================================\n');

  const config = parseArgs();

  // Load environment file
  const env = loadEnvFile(config.envFile);

  // Build secrets structure
  const secrets = buildSecretsFromEnv(env);

  // Upload secrets
  await uploadSecrets(secrets, config.secretName, config.region, config.dryRun);

  // Validate if requested
  if (config.validate && !config.dryRun) {
    await validateUploadedSecrets(config.secretName, config.region);
  }

  if (!config.dryRun) {
    console.log('\n📝 Next Steps:');
    console.log('   1. Configure Vercel environment variables:');
    console.log('      - AWS_ACCESS_KEY_ID');
    console.log('      - AWS_SECRET_ACCESS_KEY');
    console.log(`      - AWS_REGION=${config.region}`);
    console.log(`      - AWS_SECRETS_NAME=${config.secretName}`);
    console.log('\n   2. Deploy your application to Vercel');
    console.log('\n   3. Your .env.local file has NOT been deleted (for safety)');
    console.log('      You can keep it for local development');
    console.log('\n   See AWS_SECRETS_SETUP.md for detailed instructions');
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
