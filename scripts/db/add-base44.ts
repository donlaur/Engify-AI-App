#!/usr/bin/env tsx

/**
 * Add Base44 Tool
 * 
 * Base44 is an AI app builder that lets you build apps with AI in minutes
 * Pricing: Free tier, paid plans from $20/month
 * 
 * Run with: tsx scripts/db/add-base44.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { logger } from '@/lib/logging/logger';
import { generateSlug } from '@/lib/utils/slug';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

const BASE44_TOOL = {
  id: 'base44',
  name: 'Base44',
  tagline: 'Build powerful apps fast with AI. No code needed.',
  description: `Base44 is an AI-powered app builder that enables you to build applications in minutes by simply describing what you want. Base44 helps you build, host, and launch your app with no code and no setup required. The platform includes built-in backend functionality including user login, data storage, and permissions - all handled automatically. Base44 is designed for rapid prototyping and app development, allowing you to "dream big and build fast" by converting your vision into a functional application through natural language descriptions.`,
  category: 'builder',
  pricing: {
    free: true,
    paid: {
      monthly: 20,
      tier: 'Paid',
    },
    alternativePricing: {
      model: 'other',
      unitName: 'credits',
      costPerUnit: undefined, // Need to check pricing page for details
      baseMinimum: 20,
    },
  },
  features: [
    'Text-to-app generation',
    'No code required',
    'Built-in backend (authentication, database, permissions)',
    'Built-in integrations',
    'Automatic hosting and deployment',
    'Rapid prototyping',
    'Natural language app creation',
    'Ready-to-launch applications',
  ],
  pros: [
    'Very fast app creation',
    'No code knowledge required',
    'Built-in backend infrastructure',
    'Free tier available',
    'Automatic hosting',
    'Rapid prototyping capabilities',
  ],
  cons: [
    'May have limitations for complex apps',
    'Pricing scales with usage',
    'Less control than custom development',
    'Dependent on platform capabilities',
  ],
  tags: ['builder', 'text-to-app', 'no-code', 'rapid-prototyping', 'ai-app-builder'],
  icon: 'sparkles',
  websiteUrl: 'https://base44.com/',
  badges: ['free', 'browser-based'],
  supportedModels: ['AI-powered'],
  agentCapabilities: ['app-generation', 'backend-setup', 'deployment'],
};

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('📝 Adding Base44 tool...\n');

    const existing = await collection.findOne({ id: 'base44' });

    const tool = {
      ...BASE44_TOOL,
      slug: generateSlug(BASE44_TOOL.name),
      status: 'active' as const,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
      lastUpdated: new Date(),
    };

    if (existing) {
      await collection.updateOne(
        { id: 'base44' },
        {
          $set: {
            ...tool,
            _id: existing._id,
          },
        }
      );
      console.log(`✅ Updated: Base44`);
    } else {
      await collection.insertOne(tool);
      console.log(`✨ Created: Base44`);
    }

    console.log(`\n✨ Complete!\n`);

  } catch (error) {
    logger.error('Failed to add Base44', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }

  process.exit(0);
}

main();

