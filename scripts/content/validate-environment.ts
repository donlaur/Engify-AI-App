/**
 * Environment Validation Script
 * Validates that all required environment variables are set before running tests
 * 
 * Usage:
 *   pnpm exec tsx scripts/content/validate-environment.ts
 */

import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

interface EnvCheck {
  name: string;
  required: boolean;
  description: string;
  present: boolean;
  masked?: string;
}

const ENV_CHECKS: Omit<EnvCheck, 'present' | 'masked'>[] = [
  {
    name: 'MONGODB_URI',
    required: true,
    description: 'MongoDB connection string for data storage',
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key for GPT model testing',
  },
  {
    name: 'GOOGLE_API_KEY',
    required: false,
    description: 'Google AI API key for Gemini model testing',
  },
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    description: 'Anthropic API key for Claude model testing',
  },
  {
    name: 'NODE_ENV',
    required: false,
    description: 'Environment (development/production)',
  },
];

function maskSecret(value: string): string {
  if (value.length <= 8) return '***';
  return value.substring(0, 4) + '...' + value.substring(value.length - 4);
}

function checkEnvironment(): EnvCheck[] {
  return ENV_CHECKS.map((check) => {
    const value = process.env[check.name];
    const present = !!value && value.length > 0;

    return {
      ...check,
      present,
      masked: present ? maskSecret(value!) : undefined,
    };
  });
}

function printResults(checks: EnvCheck[]): void {
  console.log('\n🔐 ENVIRONMENT VALIDATION\n');
  console.log('=' .repeat(70));

  let hasErrors = false;

  checks.forEach((check) => {
    const icon = check.present ? '✅' : check.required ? '❌' : '⚠️ ';
    const status = check.present ? 'SET' : 'MISSING';
    const value = check.present ? ` (${check.masked})` : '';

    console.log(`\n${icon} ${check.name}`);
    console.log(`   Status: ${status}${value}`);
    console.log(`   ${check.description}`);

    if (check.required && !check.present) {
      hasErrors = true;
      console.log('   ⚠️  REQUIRED - Add to .env.local');
    }
  });

  console.log('\n' + '='.repeat(70));

  // Check for .env.local file
  const envLocalPath = join(process.cwd(), '.env.local');
  const envLocalExists = existsSync(envLocalPath);

  console.log('\n📁 Configuration Files:\n');
  console.log(`   .env.local: ${envLocalExists ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`   .env.example: ✅ EXISTS (template)`);

  if (!envLocalExists) {
    console.log('\n💡 TIP: Copy .env.example to .env.local and add your credentials');
    console.log('   cp .env.example .env.local\n');
    hasErrors = true;
  }

  // Summary
  const requiredChecks = checks.filter((c) => c.required);
  const missingRequired = requiredChecks.filter((c) => !c.present);
  const optionalPresent = checks.filter((c) => !c.required && c.present);

  console.log('\n📊 Summary:\n');
  console.log(`   Required: ${requiredChecks.length - missingRequired.length}/${requiredChecks.length} ✅`);
  console.log(`   Optional: ${optionalPresent.length}/${checks.length - requiredChecks.length} present`);

  if (hasErrors) {
    console.log('\n❌ VALIDATION FAILED\n');
    console.log('   Missing required environment variables.');
    console.log('   Please configure .env.local before running tests.\n');
    process.exit(1);
  } else {
    console.log('\n✅ VALIDATION PASSED\n');
    console.log('   All required environment variables are set.\n');
    console.log('   Ready to run: pnpm exec tsx scripts/content/test-prompts-multi-model.ts --dry-run\n');
  }
}

// Validate MongoDB URI format
function validateMongoUri(uri: string): boolean {
  const validPrefixes = ['mongodb://', 'mongodb+srv://'];
  return validPrefixes.some((prefix) => uri.startsWith(prefix));
}

function advancedValidation(): void {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && !validateMongoUri(mongoUri)) {
    console.log('\n⚠️  WARNING: MONGODB_URI format may be invalid');
    console.log('   Expected: mongodb:// or mongodb+srv://');
  }

  // Check for common mistakes
  if (mongoUri?.includes('username:password')) {
    console.log('\n⚠️  WARNING: MONGODB_URI contains placeholder credentials');
    console.log('   Replace username:password with actual credentials');
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.includes('your-')) {
    console.log('\n⚠️  WARNING: OPENAI_API_KEY contains placeholder value');
  }

  const googleKey = process.env.GOOGLE_API_KEY;
  if (googleKey && googleKey.includes('your-')) {
    console.log('\n⚠️  WARNING: GOOGLE_API_KEY contains placeholder value');
  }
}

// Main execution
const checks = checkEnvironment();
printResults(checks);
advancedValidation();

