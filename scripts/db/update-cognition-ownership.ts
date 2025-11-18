#!/usr/bin/env tsx

/**
 * Update Cognition Ownership Information
 * 
 * Updates:
 * - Devin: Note that Cognition AI is the company behind Devin
 * - Windsurf: Note that Cognition (creators of Devin) acquired Windsurf in July 2025
 * 
 * Run with: tsx scripts/db/update-cognition-ownership.ts
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

    console.log('📝 Updating Cognition ownership information...\n');

    // Update Devin
    const devin = await collection.findOne({ id: 'devin' });
    if (devin) {
      const updatedDescription = `Devin is an AI software engineer created by Cognition AI, a company focused on autonomous AI agents. Devin can plan, code, and execute complex software engineering tasks autonomously. Unlike traditional code assistants, Devin can work on entire projects, handle multi-step reasoning, and even deploy applications. Devin represents a new class of AI agents capable of end-to-end software development, from planning to execution to deployment. Devin uses Agent Compute Units (ACUs) as its pricing model - a normalized measure of computing resources including VM time, model inference, and networking bandwidth. Devin has demonstrated significant real-world impact, including helping Nubank achieve 8-12x efficiency gains and 20x cost savings on large-scale code migrations. Cognition AI also owns Windsurf (formerly Codeium Editor), which was acquired in July 2025.`;

      await collection.updateOne(
        { id: 'devin' },
        {
          $set: {
            description: updatedDescription,
            tags: [...(devin.tags || []).filter(t => t !== 'cognition'), 'cognition-ai', 'cognition'],
            updatedAt: new Date(),
            lastUpdated: new Date(),
          },
        }
      );
      console.log(`✅ Updated: Devin (noted Cognition AI as company)`);
    }

    // Update Windsurf
    const windsurf = await collection.findOne({ id: 'windsurf' });
    if (windsurf) {
      const updatedDescription = `Windsurf (formerly Codeium Editor) is an AI-native IDE that was acquired by Cognition AI (creators of Devin) in July 2025. Its key differentiator is "Cascade" - automatic context analysis that chooses the right files without manual tagging. More beginner-friendly than Cursor, it aims for automation over control with "AI flow" that guides the heavy lifting. Windsurf offers better value at $15/mo vs Cursor's $20/mo. As part of the Cognition AI portfolio alongside Devin, Windsurf benefits from shared technology and integration opportunities.`;

      await collection.updateOne(
        { id: 'windsurf' },
        {
          $set: {
            description: updatedDescription,
            tagline: windsurf.tagline || 'AI-powered development environment | Owned by Cognition AI',
            tags: [...(windsurf.tags || []).filter(t => !['cognition', 'devin'].includes(t)), 'cognition-ai', 'cognition-owned', 'devin-company'],
            updatedAt: new Date(),
            lastUpdated: new Date(),
          },
        }
      );
      console.log(`✅ Updated: Windsurf (noted Cognition AI ownership)`);
    }

    console.log(`\n✨ Update complete!\n`);

  } catch (error) {
    logger.error('Failed to update Cognition ownership', {
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

