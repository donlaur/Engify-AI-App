#!/usr/bin/env tsx

/**
 * Seed Devin and Missing AI IDE Tools
 * 
 * Adds:
 * - Devin (AI software engineer)
 * - Cline (Local agent for VS Code)
 * - Continue (Open-source Copilot alternative)
 * 
 * Also updates Amazon Q Developer to note CodeWhisperer migration
 * 
 * Run with: tsx scripts/db/seed-devin-and-missing-tools.ts
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

const NEW_TOOLS = [
  {
    id: 'devin',
    name: 'Devin',
    tagline: 'AI software engineer that can build and deploy applications end-to-end',
    description: 'Devin is an AI software engineer created by Cognition AI that can plan, code, and execute complex software engineering tasks autonomously. Unlike traditional code assistants, Devin can work on entire projects, handle multi-step reasoning, and even deploy applications. It represents a new class of AI agents capable of end-to-end software development, from planning to execution to deployment.',
    category: 'ide',
    pricing: {
      free: false,
      paid: {
        monthly: 0, // Pricing TBD - likely enterprise
        tier: 'Enterprise',
      },
    },
    features: [
      'Autonomous software engineering',
      'End-to-end project development',
      'Multi-step reasoning and planning',
      'Code generation and execution',
      'Application deployment',
      'Full project context awareness',
      'Autonomous workflow execution',
    ],
    pros: [
      'Revolutionary autonomous capabilities',
      'Can handle entire projects',
      'End-to-end development workflow',
      'Advanced reasoning capabilities',
      'Deployment automation',
    ],
    cons: [
      'Very new technology',
      'Limited availability',
      'May require oversight',
      'Enterprise-focused pricing',
    ],
    tags: ['ide', 'ai-engineer', 'autonomous', 'cognition', 'enterprise', 'agentic'],
    icon: 'code',
    websiteUrl: 'https://www.cognition.ai/',
    badges: ['enterprise'],
    supportedModels: ['Cognition AI'],
    agentCapabilities: ['test-generation', 'refactoring', 'file-creation', 'deployment', 'planning'],
  },

  {
    id: 'cline',
    name: 'Cline',
    tagline: 'Local AI agent for VS Code with autonomous workflows',
    description: 'Cline is a local AI agent extension for VS Code that provides autonomous workflows and context-aware actions. Unlike cloud-based assistants, Cline runs locally, providing privacy-focused AI assistance. It can handle complex multi-step tasks, understand project context, and execute autonomous workflows directly within VS Code.',
    category: 'code-assistant',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Open Source',
      },
    },
    features: [
      'Local AI agent for VS Code',
      'Autonomous workflows',
      'Context-aware actions',
      'Privacy-focused (local execution)',
      'Multi-step task handling',
      'Project context understanding',
      'VS Code extension',
    ],
    pros: [
      'Completely local (privacy-focused)',
      'Open-source',
      'Autonomous capabilities',
      'VS Code integration',
      'No cloud dependency',
    ],
    cons: [
      'Requires local model setup',
      'May be resource-intensive',
      'Limited to VS Code',
      'Community-driven support',
    ],
    tags: ['code-assistant', 'vscode', 'local', 'open-source', 'autonomous', 'privacy'],
    icon: 'code',
    websiteUrl: 'https://github.com/clinebot/cline',
    badges: ['vscode-plugin', 'open-source', 'free'],
    supportedModels: ['Local models', 'Ollama', 'LM Studio'],
    agentCapabilities: ['test-generation', 'refactoring', 'file-creation', 'autonomous-workflows'],
    marketplaceLinks: {
      vscode: 'https://marketplace.visualstudio.com/items?itemName=cline',
      github: 'https://github.com/clinebot/cline',
    },
  },

  {
    id: 'continue',
    name: 'Continue',
    tagline: 'Open-source Copilot alternative with local and cloud model support',
    description: 'Continue is an open-source alternative to GitHub Copilot that provides chat, context-aware completions, and can run fully locally. It supports both local models (via Ollama, LM Studio) and cloud models (OpenAI, Anthropic, Google). Continue offers a privacy-focused option for developers who want AI assistance without sending code to cloud services, while still supporting cloud models when needed.',
    category: 'code-assistant',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Open Source',
      },
    },
    features: [
      'Open-source Copilot alternative',
      'Chat interface',
      'Context-aware completions',
      'Fully local execution option',
      'Cloud model support (OpenAI, Anthropic, Google)',
      'VS Code extension',
      'Privacy-focused',
      'Multi-model support',
    ],
    pros: [
      'Completely open-source',
      'Privacy-focused (local option)',
      'Flexible model support',
      'Free to use',
      'Active development',
    ],
    cons: [
      'Requires setup for local models',
      'May be less polished than commercial tools',
      'Community-driven support',
      'Local models may be slower',
    ],
    tags: ['code-assistant', 'open-source', 'local', 'privacy', 'copilot-alternative', 'vscode'],
    icon: 'code',
    websiteUrl: 'https://continue.dev/',
    badges: ['vscode-plugin', 'open-source', 'free'],
    supportedModels: ['GPT-4', 'Claude', 'Gemini', 'Ollama', 'LM Studio', 'Local models'],
    agentCapabilities: ['code-completion', 'chat', 'context-aware-suggestions'],
    marketplaceLinks: {
      vscode: 'https://marketplace.visualstudio.com/items?itemName=Continue.continue',
      github: 'https://github.com/continuedev/continue',
    },
  },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('📝 Seeding Devin and missing AI IDE tools...\n');

    let created = 0;
    let updated = 0;

    // Add new tools
    for (const toolData of NEW_TOOLS) {
      const existing = await collection.findOne({ id: toolData.id });

      const tool = {
        ...toolData,
        slug: generateSlug(toolData.name),
        status: 'active' as const,
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date(),
        lastUpdated: new Date(),
      };

      if (existing) {
        await collection.updateOne(
          { id: toolData.id },
          {
            $set: {
              ...tool,
              _id: existing._id,
            },
          }
        );
        console.log(`✅ Updated: ${toolData.name}`);
        updated++;
      } else {
        await collection.insertOne(tool);
        console.log(`✨ Created: ${toolData.name}`);
        created++;
      }
    }

    // Update Amazon Q Developer to note CodeWhisperer migration
    const amazonQ = await collection.findOne({ id: 'amazon-q-developer' });
    if (amazonQ) {
      await collection.updateOne(
        { id: 'amazon-q-developer' },
        {
          $set: {
            description: amazonQ.description + ' Note: Amazon Q Developer is the evolution of Amazon CodeWhisperer, which has been rebranded and enhanced with additional capabilities.',
            tags: [...(amazonQ.tags || []), 'codewhisperer-evolution'],
            updatedAt: new Date(),
            lastUpdated: new Date(),
          },
        }
      );
      console.log(`✅ Updated: Amazon Q Developer (noted CodeWhisperer migration)`);
    }

    console.log(`\n✨ Seeding complete!`);
    console.log(`   - Created: ${created} tools`);
    console.log(`   - Updated: ${updated} tools\n`);

  } catch (error) {
    logger.error('Failed to seed Devin and missing tools', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }

  process.exit(0);
}

main();

