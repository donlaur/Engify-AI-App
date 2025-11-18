#!/usr/bin/env tsx

/**
 * Update Claude Code with Web-Based Version Information
 * 
 * Updates Claude Code to note it's terminal-based with a new web-based version
 * 
 * Run with: tsx scripts/db/update-claude-code-web.ts
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

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('📝 Updating Claude Code with web-based version info...\n');

    const claudeCode = await collection.findOne({ id: 'claude-code' });
    if (claudeCode) {
      const updatedDescription = `Claude Code is Anthropic's agentic AI coding assistant built on the Claude LLM family. Originally terminal-based, Claude Code now offers both terminal-native execution and a web-based version, providing flexibility for different developer workflows. It excels at handling extensive codebases with significantly larger context windows, enabling better reasoning across multiple files and complex prompts. Claude Code operates natively in the terminal for command-line workflows, while the web version provides a browser-based interface for developers who prefer GUI interactions. For enterprise users, it offers robust integrations with critical deployment, database, monitoring, and version control tools including GitHub, DataDog, Stripe, and Circle CI.`;

      const updatedFeatures = [
        'Large context windows for multi-file reasoning',
        'Terminal-native execution and automation',
        'Web-based version (browser interface)',
        'Deep GitHub integration',
        'DevOps pipeline integration (DataDog, Stripe, Circle CI)',
        'Natural language orchestration of complex operations',
        'Multi-agent cooperation capabilities',
        'Enterprise-grade context awareness',
        'Flexible deployment (terminal or web)',
      ];

      await collection.updateOne(
        { id: 'claude-code' },
        {
          $set: {
            description: updatedDescription,
            features: updatedFeatures,
            tags: [...(claudeCode.tags || []).filter(t => t !== 'terminal'), 'terminal', 'web-based', 'browser'],
            badges: [...(claudeCode.badges || []), 'browser-based'],
            updatedAt: new Date(),
            lastUpdated: new Date(),
          },
        }
      );
      console.log(`✅ Updated: Claude Code (noted web-based version)`);
    } else {
      console.log(`⚠️  Claude Code not found in database`);
    }

    console.log(`\n✨ Update complete!\n`);

  } catch (error) {
    logger.error('Failed to update Claude Code', {
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

