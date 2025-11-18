#!/usr/bin/env tsx

/**
 * Enhance Warp Terminal Tool with Comprehensive Content
 * 
 * Adds detailed hubContent, improved description, and links to warp.dev
 * Run with: tsx scripts/db/enhance-warp-tool.ts
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

const WARP_ENHANCEMENTS = {
  description: `Warp is a modern, AI-powered terminal that reimagines the command-line experience. Built from the ground up for speed and intelligence, Warp combines a beautiful modern UI with powerful AI features that help developers work faster and more efficiently. From natural language command generation to intelligent command history search, Warp transforms how developers interact with the terminal.`,
  
  features: [
    'AI command suggestions and natural language to shell commands',
    'Modern UI with blocks-based output (easier to read and navigate)',
    'Intelligent command history with AI-powered search',
    'Team collaboration features for shared workflows',
    'Multi-platform support (macOS, Linux, Windows)',
    'Built-in AI coding agent (Warp ADE - Agentic Development Environment)',
    'Context-aware coding with codebase embeddings',
    'MCP (Model Context Protocol) integration',
    'Full software lifecycle support from one app',
    'Zero Data Retention (ZDR) and BYO LLM options for enterprise',
  ],

  pros: [
    'Beautiful modern UI that makes terminal output readable',
    'AI-powered workflow saves developers an hour per day on average',
    'Ranked #1 coding agent (Terminal-Bench, SWE-bench Verified)',
    'Full software lifecycle from one app (code, deploy, debug)',
    'Context-aware coding with codebase embeddings',
    'Enterprise-grade security with ZDR and BYO LLM options',
    'Trusted by over 500,000 engineers at leading companies',
    'Mixed-model approach outperforms single-model solutions',
    'MCP integration for external context (Linear, Figma, Slack, Sentry)',
    'WARP.md files for agent behavior control (compatible with agents.md)',
  ],

  cons: [
    'Some advanced features require Team subscription ($15/month)',
    'Learning curve for users accustomed to traditional terminals',
    'Resource-intensive compared to basic terminal emulators',
    'AI features require internet connection',
  ],

  tags: [
    'terminal',
    'ai-terminal',
    'devops',
    'macos',
    'linux',
    'windows',
    'ai-agent',
    'coding-agent',
    'developer-tools',
    'command-line',
    'shell',
    'warp-dev',
  ],

  websiteUrl: 'https://www.warp.dev',
  
  hubContent: {
    gettingStarted: [
      {
        id: '1',
        title: 'Download and Install',
        description: 'Download Warp from warp.dev for your platform (macOS, Linux, or Windows). Installation is straightforward and takes just a few minutes.',
        order: 1,
      },
      {
        id: '2',
        title: 'Configure Your Shell',
        description: 'Warp works with your existing shell (zsh, bash, fish). Configure your preferred shell in Warp settings.',
        order: 2,
      },
      {
        id: '3',
        title: 'Enable AI Features',
        description: 'Sign up for a Warp account to access AI features. Free tier includes basic AI assistance, Team plan ($15/month) unlocks advanced features.',
        order: 3,
      },
      {
        id: '4',
        title: 'Try Natural Language Commands',
        description: 'Start using Warp\'s AI by typing natural language descriptions of what you want to do. Warp will suggest shell commands.',
        order: 4,
      },
      {
        id: '5',
        title: 'Explore Command History',
        description: 'Use Warp\'s AI-powered command history search to find previous commands quickly. Much faster than scrolling through terminal history.',
        order: 5,
      },
    ],
    gettingStartedHeading: 'Getting Started with Warp Terminal',
    gettingStartedProTip: 'Warp saves developers an average of one hour per day. Start with basic AI command suggestions and gradually explore advanced features like the coding agent and MCP integrations.',
    
    officialResources: [
      {
        id: '1',
        title: 'Warp.dev Official Website',
        url: 'https://www.warp.dev',
        description: 'Official Warp terminal website with downloads, features, and documentation',
        order: 1,
      },
      {
        id: '2',
        title: 'Warp Documentation',
        url: 'https://docs.warp.dev',
        description: 'Comprehensive documentation for Warp terminal features and configuration',
        order: 2,
      },
      {
        id: '3',
        title: 'Warp Blog',
        url: 'https://www.warp.dev/blog',
        description: 'Latest updates, features, and developer stories from the Warp team',
        order: 3,
      },
      {
        id: '4',
        title: 'Warp on GitHub',
        url: 'https://github.com/warpdotdev',
        description: 'Open source components and community contributions',
        order: 4,
      },
      {
        id: '5',
        title: 'Warp Pricing',
        url: 'https://www.warp.dev/pricing',
        description: 'Pricing plans and feature comparison',
        order: 5,
      },
    ],
    
    communityResources: [
      {
        id: '1',
        title: 'Warp Discord Community',
        url: 'https://discord.gg/warp',
        description: 'Join the Warp community on Discord for support and discussions',
        order: 1,
      },
      {
        id: '2',
        title: 'Warp Twitter/X',
        url: 'https://twitter.com/warpdotdev',
        description: 'Follow Warp for updates and announcements',
        order: 2,
      },
    ],
    communityHeading: 'Warp Terminal Resources',
    communityCallout: 'Warp is actively developed and has a strong community. The official resources above are the best place to get started, and the community Discord is great for getting help and sharing tips.',
    
    problems: [
      {
        id: '1',
        title: 'Terminal Output is Hard to Read',
        issue: 'Traditional terminals show output as continuous text, making it difficult to distinguish between commands, output, and errors.',
        impact: 'Developers waste time scrolling and searching through terminal output to find specific information.',
        engifySolution: 'Engify workflows help you structure terminal workflows and use Warp\'s block-based output to make terminal sessions more readable and navigable.',
        order: 1,
      },
      {
        id: '2',
        title: 'Forgetting Shell Commands',
        issue: 'Developers often forget exact command syntax or flags, requiring frequent documentation lookups.',
        impact: 'Slows down development workflow and breaks focus.',
        engifySolution: 'Engify provides prompt templates for common shell operations, and Warp\'s AI command suggestions help you generate commands from natural language descriptions.',
        order: 2,
      },
      {
        id: '3',
        title: 'Command History is Hard to Search',
        issue: 'Traditional terminal history search is limited and requires exact matches or complex grep patterns.',
        impact: 'Finding previous commands takes time and interrupts workflow.',
        engifySolution: 'Warp\'s AI-powered command history search understands context and intent, making it easy to find commands even if you don\'t remember the exact syntax.',
        order: 3,
      },
    ],
    problemsHeading: 'Common Terminal Problems (And How Warp + Engify Help)',
  },
};

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    const existing = await collection.findOne({ id: 'warp' });

    if (!existing) {
      console.error('❌ Warp tool not found in database. Please seed it first.');
      process.exit(1);
    }

    console.log('📝 Enhancing Warp Terminal tool with comprehensive content...\n');

    // Update Warp tool with enhancements
    const updateResult = await collection.updateOne(
      { id: 'warp' },
      {
        $set: {
          description: WARP_ENHANCEMENTS.description,
          features: WARP_ENHANCEMENTS.features,
          pros: WARP_ENHANCEMENTS.pros,
          cons: WARP_ENHANCEMENTS.cons,
          tags: WARP_ENHANCEMENTS.tags,
          websiteUrl: WARP_ENHANCEMENTS.websiteUrl,
          hubContent: WARP_ENHANCEMENTS.hubContent,
          lastUpdated: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log('✅ Successfully enhanced Warp Terminal tool!');
      console.log(`   - Updated description (${WARP_ENHANCEMENTS.description.length} chars)`);
      console.log(`   - Added ${WARP_ENHANCEMENTS.features.length} features`);
      console.log(`   - Added ${WARP_ENHANCEMENTS.pros.length} pros`);
      console.log(`   - Added ${WARP_ENHANCEMENTS.cons.length} cons`);
      console.log(`   - Added ${WARP_ENHANCEMENTS.tags.length} tags`);
      console.log(`   - Added comprehensive hubContent`);
      console.log(`   - Added website URL: ${WARP_ENHANCEMENTS.websiteUrl}\n`);
    } else {
      console.log('⚠️  No changes made (tool may already be up to date)');
    }

    console.log('✨ Enhancement complete!\n');
    console.log('💡 View the enhanced page at: https://engify.ai/learn/ai-tools/warp\n');

  } catch (error) {
    logger.error('Failed to enhance Warp tool', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Enhancement failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }

  process.exit(0);
}

main();

