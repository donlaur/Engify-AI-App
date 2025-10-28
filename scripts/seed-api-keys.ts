#!/usr/bin/env tsx
/**
 * Seed API Keys to MongoDB
 * 
 * Loads API keys from .env.local and stores them securely in MongoDB
 * Run this once to migrate from env vars to database storage
 */

import 'dotenv/config';
import { apiKeyService } from '../src/lib/services/ApiKeyService';
import { AI_MODELS } from '../src/lib/config/ai-models';

async function seedApiKeys() {
  console.log('🔑 Seeding API Keys to MongoDB...\n');

  const keys = [
    {
      provider: 'openai' as const,
      apiKey: process.env.OPENAI_API_KEY,
      keyName: 'OpenAI Production Key',
      allowedModels: AI_MODELS.filter(m => m.provider === 'openai').map(m => m.id),
      monthlyUsageLimit: 1000000, // 1M requests/month
    },
    {
      provider: 'anthropic' as const,
      apiKey: process.env.ANTHROPIC_API_KEY,
      keyName: 'Anthropic Production Key',
      allowedModels: AI_MODELS.filter(m => m.provider === 'anthropic').map(m => m.id),
      monthlyUsageLimit: 1000000,
    },
    {
      provider: 'google' as const,
      apiKey: process.env.GOOGLE_API_KEY,
      keyName: 'Google AI Production Key',
      allowedModels: AI_MODELS.filter(m => m.provider === 'google').map(m => m.id),
      monthlyUsageLimit: 1000000,
    },
    {
      provider: 'groq' as const,
      apiKey: process.env.GROQ_API_KEY,
      keyName: 'Groq Production Key',
      allowedModels: AI_MODELS.filter(m => m.provider === 'groq').map(m => m.id),
      monthlyUsageLimit: 1000000,
    },
  ];

  let stored = 0;
  let skipped = 0;

  for (const key of keys) {
    if (!key.apiKey) {
      console.log(`⏭️  Skipping ${key.provider} - no API key in .env.local`);
      skipped++;
      continue;
    }

    try {
      const keyId = await apiKeyService.storeKey(
        key.provider,
        key.apiKey,
        key.keyName,
        key.allowedModels,
        'system',
        {
          monthlyUsageLimit: key.monthlyUsageLimit,
          notes: 'Migrated from .env.local',
        }
      );

      console.log(`✅ Stored ${key.provider} key (${key.allowedModels.length} models allowed)`);
      console.log(`   Key ID: ${keyId}`);
      console.log(`   Models: ${key.allowedModels.join(', ')}\n`);
      stored++;
    } catch (error: any) {
      console.error(`❌ Failed to store ${key.provider} key:`, error.message);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Stored: ${stored} keys`);
  console.log(`   ⏭️  Skipped: ${skipped} keys`);
  console.log(`\n🎉 Done! API keys are now managed in MongoDB.`);
  console.log(`\n⚠️  IMPORTANT: You can now remove API keys from .env.local for better security.`);
  console.log(`   The system will fetch them from MongoDB instead.`);
  
  process.exit(0);
}

seedApiKeys().catch((error) => {
  console.error('❌ Failed to seed API keys:', error);
  process.exit(1);
});
