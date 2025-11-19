/**
 * Add Google Antigravity to AI Tools
 * 
 * Google Antigravity is an agent-first coding tool built for Gemini 3 Pro
 * Launched November 18, 2025
 * 
 * Sources:
 * - https://antigravity.google/
 * - https://www.theverge.com/news/822833/google-antigravity-ide-coding-agent-gemini-3-pro
 * - https://simonwillison.net/2025/Nov/18/google-antigravity/
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { generateSlug } from '@/lib/utils/slug';
import { logger } from '@/lib/logging/logger';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

const ANTIGRAVITY_TOOL = {
  id: 'google-antigravity',
  name: 'Google Antigravity',
  tagline: 'Agent-first coding tool built for Gemini 3 Pro',
  description: `Google Antigravity is an agent-first development tool designed for an "agent-first future." Built specifically for Gemini 3 Pro (and supporting Claude Sonnet 4.5 and GPT-OSS), Antigravity provides multiple agents with direct access to the editor, terminal, and browser.

Key differentiators include its dual-view interface: the default Editor view offers a familiar IDE experience similar to Cursor and GitHub Copilot, while the Manager view acts as "mission control" for spawning, orchestrating, and observing multiple agents across multiple workspaces in parallel.

Antigravity introduces "Artifacts" - Markdown documents automatically created as agents work, including task lists, implementation plans, and walkthrough reports that verify both the work done and planned. This provides easier verification than full lists of model actions and tool calls.

The tool features deep browser integration via a Chrome extension (similar to Playwright MCP), allowing agents to directly test web applications they're building. Agents can learn from past work, retaining specific code snippets or steps required for certain tasks. Users can leave comments on specific Artifacts for agents to incorporate without interrupting their workflow.

Currently available in free public preview with generous rate limits for Gemini 3 Pro that refresh every five hours. Compatible with Windows, macOS, and Linux.`,
  category: 'Agentic Assistant' as const,
  pricing: {
    free: true,
    paid: {
      monthly: undefined,
      annual: undefined,
      tier: 'Preview',
      creditsPerMonth: undefined,
      unlimited: false,
    },
    tokenPricing: undefined,
    alternativePricing: {
      model: 'other' as const,
      unitName: 'Rate-limited requests',
      costPerUnit: 0,
      baseMinimum: 0,
      includedUnits: undefined, // "Generous rate limits" - refresh every 5 hours
    },
  },
  features: [
    'Multiple agent orchestration',
    'Manager view for mission control',
    'Editor view (traditional IDE)',
    'Browser integration via Chrome extension',
    'Artifacts (task lists, plans, walkthrough reports)',
    'Direct access to editor, terminal, and browser',
    'Comment system for feedback on Artifacts',
    'Learn from past work',
    'Multi-workspace support',
    'Cross-platform (Windows, macOS, Linux)',
  ],
  pros: [
    'Free preview with generous rate limits',
    'Agent-first design optimized for autonomous workflows',
    'Unique Manager view for multi-agent orchestration',
    'Artifacts provide transparent verification of agent work',
    'Deep browser integration for end-to-end testing',
    'Built specifically for Gemini 3 Pro',
    'Can learn from past work and retain code snippets',
    'Non-intrusive feedback system via Artifacts',
  ],
  cons: [
    'Still in preview - may have stability issues',
    'Rate limits may affect power users',
    'Requires Google account sign-in',
    'New tool - less community support than established alternatives',
    'Browser extension required for full functionality',
  ],
  tags: [
    'agentic-assistant',
    'ide',
    'gemini-3',
    'multi-agent',
    'browser-integration',
    'free-preview',
    'google',
    'artifacts',
    'mission-control',
  ],
  icon: 'sparkles',
  websiteUrl: 'https://antigravity.google/',
  badges: ['free', 'github-integration'],
  supportedModels: ['Gemini 3 Pro', 'Claude Sonnet 4.5', 'GPT-OSS'],
  agentCapabilities: [
    'code-generation',
    'multi-file-editing',
    'browser-testing',
    'terminal-access',
    'artifact-creation',
    'task-planning',
    'workflow-orchestration',
    'learning-from-past-work',
  ],
  marketplaceLinks: {
    github: undefined, // Desktop application, not on GitHub
  },
  inspiredBy: undefined, // Original Google tool
  alternatives: ['cursor', 'windsurf', 'claude-code', 'devin'],
  cloneType: undefined,
  status: 'active' as const,
};

async function main() {
  const client = new MongoClient(MONGODB_URI!);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('📝 Adding Google Antigravity tool...\n');

    const existing = await collection.findOne({ id: 'google-antigravity' });

    const tool = {
      ...ANTIGRAVITY_TOOL,
      slug: generateSlug(ANTIGRAVITY_TOOL.name),
      status: 'active' as const,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
      lastUpdated: new Date(),
    };

    if (existing) {
      await collection.updateOne(
        { id: 'google-antigravity' },
        {
          $set: {
            ...tool,
            _id: existing._id,
          },
        }
      );
      console.log(`✅ Updated: Google Antigravity`);
    } else {
      await collection.insertOne(tool);
      console.log(`✨ Created: Google Antigravity`);
    }

    console.log(`\n✨ Complete!\n`);

  } catch (error) {
    logger.error('Failed to add Google Antigravity', {
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

