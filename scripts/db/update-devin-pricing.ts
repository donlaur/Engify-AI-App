#!/usr/bin/env tsx

/**
 * Update Devin Pricing Information
 * 
 * Updates Devin with correct pricing from https://devin.ai/pricing
 * 
 * Pricing:
 * - Core: Pay as you go, starting at $20, $2.25 per ACU
 * - Team: $500/month, includes 250 ACUs ($2.00 per ACU)
 * - Enterprise: Custom pricing
 * 
 * ACU (Agent Compute Unit) is Devin's unit of work
 * 
 * Run with: tsx scripts/db/update-devin-pricing.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { logger } from '@/lib/logging/logger';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

const DEVIN_PRICING_UPDATE = {
  pricing: {
    free: false,
    paid: {
      monthly: 20, // Core plan minimum
      annual: undefined,
      tier: 'Core',
      creditsPerMonth: undefined,
      creditsUnit: 'ACU', // Agent Compute Units
      unlimited: false,
    },
    // Devin uses ACU-based pricing, not traditional token pricing
    alternativePricing: {
      model: 'acu',
      unitName: 'ACU',
      costPerUnit: 2.25, // $2.25 per ACU (Core plan), $2.00 per ACU (Team plan)
      baseMinimum: 20, // $20 minimum charge
      includedUnits: undefined, // Team plan includes 250 ACUs, but that's in $500/month plan
    },
    // Note: ACU consumption varies by task complexity, codebase size, session runtime
    tokenPricing: undefined, // Not applicable - uses ACU pricing instead
  },
  description: `Devin is an AI software engineer created by Cognition AI that can plan, code, and execute complex software engineering tasks autonomously. Unlike traditional code assistants, Devin can work on entire projects, handle multi-step reasoning, and even deploy applications. Devin represents a new class of AI agents capable of end-to-end software development, from planning to execution to deployment. Devin uses Agent Compute Units (ACUs) as its pricing model - a normalized measure of computing resources including VM time, model inference, and networking bandwidth. Devin has demonstrated significant real-world impact, including helping Nubank achieve 8-12x efficiency gains and 20x cost savings on large-scale code migrations.`,
  features: [
    'Autonomous software engineering',
    'End-to-end project development',
    'Multi-step reasoning and planning',
    'Code generation and execution',
    'Application deployment',
    'Full project context awareness',
    'Autonomous workflow execution',
    'Devin IDE',
    'Ask Devin (chat interface)',
    'Devin Wiki',
    'Devin API',
    'Learns over time',
    'Slack integration',
    'GitHub integration',
    'Custom git provider support',
  ],
  pros: [
    'Revolutionary autonomous capabilities',
    'Can handle entire projects autonomously',
    'End-to-end development workflow',
    'Advanced reasoning capabilities',
    'Deployment automation',
    'Proven real-world results (8-12x efficiency gains)',
    'Learns and improves over time',
    'Enterprise-grade capabilities available',
  ],
  cons: [
    'Not free - pay-as-you-go starting at $20',
    'ACU pricing can be complex to estimate',
    'Requires understanding of ACU consumption',
    'Enterprise features require custom pricing',
    'May require oversight for complex system changes',
  ],
  tags: ['ide', 'ai-engineer', 'autonomous', 'cognition', 'enterprise', 'agentic', 'acu-pricing'],
  badges: ['enterprise'],
  supportedModels: ['Devin (Cognition AI)', 'Devin Enterprise'],
  agentCapabilities: [
    'test-generation',
    'refactoring',
    'file-creation',
    'deployment',
    'planning',
    'autonomous-workflows',
    'project-scale-execution',
  ],
};

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('📝 Updating Devin pricing information...\n');

    const devin = await collection.findOne({ id: 'devin' });
    
    if (!devin) {
      console.error('❌ Devin tool not found in database. Please seed it first.');
      process.exit(1);
    }

    await collection.updateOne(
      { id: 'devin' },
      {
        $set: {
          ...DEVIN_PRICING_UPDATE,
          _id: devin._id,
          id: 'devin',
          slug: devin.slug || 'devin',
          name: 'Devin',
          tagline: devin.tagline || 'AI software engineer that can build and deploy applications end-to-end',
          category: devin.category || 'ide',
          websiteUrl: devin.websiteUrl || 'https://www.cognition.ai/',
          createdAt: devin.createdAt || new Date(),
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
      }
    );

    console.log('✅ Updated: Devin');
    console.log('   - Pricing: Core plan starting at $20 (pay-as-you-go, $2.25/ACU)');
    console.log('   - Team plan: $500/month (includes 250 ACUs at $2.00/ACU)');
    console.log('   - Enterprise: Custom pricing');
    console.log('   - ACU (Agent Compute Unit) is Devin\'s unit of work\n');

  } catch (error) {
    logger.error('Failed to update Devin pricing', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }

  process.exit(0);
}

main();

