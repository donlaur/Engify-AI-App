#!/usr/bin/env tsx

/**
 * SAFE AI Tools Content Update - 2025 Market Data
 * 
 * This script:
 * 1. Creates a backup of existing data FIRST
 * 2. Only updates specific content fields
 * 3. Never deletes or overwrites structural data
 * 4. Can be rolled back if needed
 * 
 * Usage:
 *   tsx scripts/db/update-ai-tools-2025-safe.ts
 */

// Load environment variables FIRST
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { logger } from '@/lib/logging/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Content updates for 2025 - ONLY updates these specific fields:
 * - tagline
 * - description  
 * - pros
 * - cons
 * - features
 * - tags
 * - pricing (only if structure matches)
 */
const CONTENT_UPDATES_2025 = {
  cursor: {
    tagline: '$9.9B AI IDE - Power tool with granular control | 500M+ ARR',
    description: 'Cursor is an AI-first code editor from Anysphere ($9.9B valuation, $500M+ ARR). Built as a VS Code fork with native AI features for "agentic" programming. Features @Codebase (project-wide Q&A), Composer mode (multi-file refactoring), and View Details (see AI plan before accepting). Used by 50%+ of Fortune 500. A "power tool" requiring manual context management but offering precise control.',
    pros: [
      'Massive productivity gains (4x faster projects)',
      'Excellent for repetitive tasks (renaming, imports, boilerplate)',
      'Granular control over AI actions',
      'Enterprise-ready (Fortune 500 adoption)',
      'Multi-file refactoring with Composer',
    ],
    cons: [
      'Steep learning curve (manual @ context system)',
      'Can be time sink cleaning up AI mistakes',
      'AI can hallucinate and modify files unexpectedly',
      'May lead to skill degradation',
      'Expensive for power users ($200/mo Ultra)',
    ],
    features: [
      '@Codebase project-wide Q&A',
      'Composer mode for multi-file refactoring',
      'View Details (see AI plan before accepting)',
      'Multiple models (OpenAI, Claude)',
      'Used by 50%+ of Fortune 500',
      'Granular @ symbol context control',
    ],
    tags: ['ai-ide', 'power-tool', 'enterprise', 'cursor', 'anysphere', '2025', 'fortune-500'],
  },
  
  windsurf: {
    tagline: 'Beginner-friendly AI IDE with Cascade auto-context | Acquired by Cognition (Devin)',
    description: 'Windsurf (formerly Codeium Editor) is an AI-native IDE acquired by Cognition (creators of Devin) in July 2025. Its key differentiator is "Cascade" - automatic context analysis that chooses the right files without manual tagging. More beginner-friendly than Cursor, it aims for automation over control with "AI flow" that guides the heavy lifting. Better value at $15/mo vs Cursor\'s $20/mo.',
    pros: [
      'Beginner-friendly (easier than Cursor)',
      'Automatic context with Cascade (no manual @-tagging)',
      'Seamless VS Code import',
      'Better value ($15/mo vs Cursor $20/mo)',
      'Good for complex backend structures',
    ],
    cons: [
      'Loses context frequently (reported by users)',
      'Quality feels "throttled" after trial',
      'Buggy and confusing (user reports)',
      'Newer tool (less mature than Cursor)',
      'Acquired company (integration with Devin pending)',
    ],
    features: [
      'Cascade automatic context indexing',
      'AI flow guided development',
      'VS Code compatibility',
      'Built-in deploy/preview features',
      'Integrated with Devin agent (parent company)',
    ],
    tags: ['ai-ide', 'beginner-friendly', 'windsurf', 'codeium', 'cognition', 'devin', '2025'],
  },
  
  copilot: {
    tagline: 'GitHub Copilot - Ecosystem lock-in strategy | Microsoft/OpenAI',
    description: 'GitHub Copilot is the market-leading AI pair programmer from GitHub/Microsoft/OpenAI. First to popularize AI code assistance at scale. Its competitive advantage is ecosystem integration - not just an assistant, but the AI layer of the entire GitHub platform (PRs, CLI, Mobile). Strong enterprise adoption with top-down sales motion. Freemium model with 5 pricing tiers.',
    pros: [
      'Wildly more efficient (user reports)',
      'Deep GitHub ecosystem integration (PRs, CLI, Mobile)',
      'Enterprise-ready with strong adoption',
      'Learning tool (explain function)',
      'Free tier available (2k completions/month)',
    ],
    cons: [
      'Feels like "overconfident intern" (common complaint)',
      'Privacy concerns (sends code to cloud)',
      'More expensive than alternatives',
      'Requires GitHub ecosystem',
      'Less powerful than newer AI IDEs',
    ],
    features: [
      'IDE integration (VS Code, JetBrains, etc.)',
      'GitHub CLI integration',
      'Pull request summaries',
      'GitHub Mobile support',
      'Multi-language support',
      'Enterprise IP indemnification',
    ],
    tags: ['code-assistant', 'github', 'microsoft', 'openai', 'enterprise', 'ecosystem', '2025'],
  },
  
  tabnine: {
    tagline: 'Privacy-first AI assistant - Air-gapped, on-premise | Regulated industries',
    description: 'Tabnine is the only major AI code assistant offering truly "air-gapped," on-premise deployment. Differentiates on privacy - ideal for highly regulated industries (finance, healthcare, government) that cannot risk code leaving their network. Allows training on private repos. Discontinued free plan in April 2025 to focus on enterprise. $55M funding.',
    pros: [
      'Privacy-first (air-gapped, on-premise)',
      'Enterprise-ready for regulated industries',
      'Train on private repositories',
      'IP indemnification',
      'Zero data retention options',
    ],
    cons: [
      'Seen as "cheap knockoff of Copilot"',
      'Poor coding suggestions (G2 reviews)',
      'High memory usage',
      'Irrelevant responses',
      'No free plan (discontinued April 2025)',
    ],
    features: [
      'On-premise/air-gapped deployment',
      'Private model training',
      'AI agents for test generation',
      'Code review agent',
      'Multiple IDE support',
      'VPC and SaaS options',
    ],
    tags: ['code-assistant', 'privacy', 'enterprise', 'on-premise', 'regulated', 'tabnine', '2025'],
  },
  
  warp: {
    tagline: 'AI-powered terminal - $67M funding | Controversial mandatory login',
    description: 'Warp is a modern, Rust-based terminal reimagined with AI and a block-based UI. $67M funding from Sequoia, GV, Sam Altman. Strategy: fast terminal (bait) → cloud AI agent (product). Mandatory login enables cloud features but violates terminal purist ethos. Polarizing: "favourite AI tool" vs "uninstalled due to AI crap." Recent pricing change caused backlash.',
    pros: [
      'Beautiful modern UI with blocks',
      'AI agent mode (better than Claude Code per users)',
      'Favourite AI tool for learning and debugging',
      'Fast (Rust-based)',
      'Team collaboration (Warp Drive)',
    ],
    cons: [
      'Mandatory login (major user backlash)',
      'Closed-source (violates terminal ethos)',
      'Recent pricing change angered users',
      'macOS only',
      '"Don\'t need AI in my CLI" sentiment',
    ],
    features: [
      'Block-based UI (group commands/outputs)',
      'AI agent mode (natural language → commands)',
      'Warp Drive (team knowledge sharing)',
      'Model Context Protocol (MCP) support',
      'Mixed-model approach (OpenAI, Anthropic, Google)',
    ],
    tags: ['ai-terminal', 'warp', 'rust', 'controversial', 'macos', 'sequoia', '2025'],
  },
  
  replit: {
    tagline: 'All-in-one AI platform - $3B valuation | Lock-in strategy',
    description: 'Replit is an all-in-one browser-based IDE, AI agent, and hosting platform. $3B valuation (Sept 2025), $522M raised. Zero-setup environment makes it fast for prototyping and education. Lock-in is the business model: "can\'t extract code" is #1 complaint. Unpredictable credit costs where AI charges for its own mistakes. "AI keeps getting dumber" sentiment.',
    pros: [
      'Zero-setup (frictionless development)',
      'Fast from idea to live app',
      'Fantastic for collaboration and teams',
      'Non-coders built fully functioning platforms',
      'All-in-one stack (IDE + DB + hosting)',
    ],
    cons: [
      'Vendor lock-in ("can\'t extract code")',
      'Unpredictable costs (AI charges for mistakes)',
      '"AI keeps getting dumber"',
      'Migration is very painful',
      'Not for serious production apps',
    ],
    features: [
      'Browser-based collaborative IDE',
      'Replit Agent (AI collaborator)',
      'Built-in databases and auth',
      'One-click deployment',
      'Zero-setup environment',
    ],
    tags: ['builder', 'replit', 'lock-in', 'education', 'prototyping', '3b-valuation', '2025'],
  },
  
  lovable: {
    tagline: 'AI app builder for non-tech founders - $50M ARR (May 2025)',
    description: 'Lovable (fka GPT Engineer App) generates full-stack React + Node.js apps from natural language. Explosive growth: $50M ARR (May 2025), up from $17M (Feb 2025). Targets non-technical founders. Chat interface abstracts away code. Case study: founder hit $456k ARR with Lovable-built app. Credit-based pricing with rollovers.',
    pros: [
      'Blown away by "build via prompting"',
      'Extremely fast to MVP',
      'Non-technical founder friendly',
      '2-way GitHub integration',
      'Credit rollovers (vs Bolt\'s tokens)',
    ],
    cons: [
      'Apps look less professional than Bolt out of gate',
      'Credit-based pricing',
      'Limited for complex apps',
      'Newer tool',
    ],
    features: [
      'React + Tailwind + Node.js generation',
      'Chat interface for iteration',
      'Live preview',
      'GitHub sync',
      'Custom domains',
      'Credit rollover system',
    ],
    tags: ['builder', 'lovable', 'no-code', 'non-technical', '50m-arr', 'mvp', '2025'],
  },
  
  bolt: {
    tagline: 'AI app builder for developers - StackBlitz WebContainers | Token burn issue',
    description: 'Bolt.new is an AI-powered browser IDE from StackBlitz using WebContainers (full Node.js in browser). Targets developers with full code control. Key feature: "diffs" - modifies only necessary lines vs rewriting files. Major con: token burn rate extremely high (11M tokens in 8hrs reported). Launched quietly Oct 2024, added mobile (Feb 2025) and Figma (March 2025).',
    pros: [
      'Faster initial generation than Lovable',
      'Slightly better design',
      'Diffs feature (significant advantage)',
      'Maximum developer control',
      'Full-stack + mobile (Expo) support',
    ],
    cons: [
      'Token burn rate extremely high',
      'Unpredictable costs (25k tokens per query)',
      'Expensive for heavy use',
      'Token-based pricing confusing',
    ],
    features: [
      'WebContainers (Node.js in browser)',
      'Diffs (line-level updates)',
      'Full-stack web apps',
      'Native mobile (Expo)',
      'Figma integration',
      'In-browser IDE',
    ],
    tags: ['builder', 'bolt', 'stackblitz', 'developers', 'webcontainers', 'expensive', '2025'],
  },
  
  v0: {
    tagline: 'Vercel UI generator - React/shadcn | Pricing backlash (May 2025)',
    description: 'v0.dev is Vercel\'s AI-powered UI generator creating React + Tailwind + shadcn/ui components. Ecosystem play to promote Vercel stack and drive hosting sales. May 2025 pricing change caused extreme backlash: moved from "10 messages/day" to "$5 credits" - users felt it was a "massive downgrade." Output is "really generic" and "breaks down on long files."',
    pros: [
      'A lot of fun to use',
      'Super handy in a pinch',
      'Perfect for Vercel/shadcn ecosystem',
      'Iterative refinement',
    ],
    cons: [
      'Really generic output',
      'Breaks down heavily on long files',
      'May 2025 pricing change (major backlash)',
      'Credit-based pricing confusing',
      'Heavily dependent on prompt quality',
    ],
    features: [
      'React + Tailwind + shadcn/ui generation',
      'Iterative forking',
      'One-click Vercel deployment',
      'Figma import (Premium)',
      'API access (Premium)',
    ],
    tags: ['ui-generator', 'v0', 'vercel', 'react', 'shadcn', 'pricing-backlash', '2025'],
  },
};

async function main() {
  console.log('🔒 SAFE AI Tools Update - 2025 Market Data\n');
  console.log('This script will:');
  console.log('1. ✅ Create backup of existing data');
  console.log('2. ✅ Only update content fields (tagline, description, pros, cons, features)');
  console.log('3. ✅ Never delete or overwrite structural data');
  console.log('4. ✅ Can be rolled back\n');

  try {
    const db = await getMongoDb();
    const collection = db.collection('ai_tools');

    // Step 1: Create backup
    console.log('📦 Step 1: Creating backup...');
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `ai-tools-backup-${timestamp}.json`);
    
    const existingTools = await collection.find({}).toArray();
    fs.writeFileSync(backupFile, JSON.stringify(existingTools, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`   Backed up ${existingTools.length} tools\n`);

    // Step 2: Update only content fields
    console.log('📝 Step 2: Updating content fields...\n');
    
    let updated = 0;
    let notFound = 0;

    for (const [toolId, updates] of Object.entries(CONTENT_UPDATES_2025)) {
      const existing = await collection.findOne({ id: toolId });
      
      if (existing) {
        // Only update the specific content fields
        const updateFields: any = {
          updatedAt: new Date(),
          lastUpdated: new Date(),
        };

        if (updates.tagline) updateFields.tagline = updates.tagline;
        if (updates.description) updateFields.description = updates.description;
        if (updates.pros) updateFields.pros = updates.pros;
        if (updates.cons) updateFields.cons = updates.cons;
        if (updates.features) updateFields.features = updates.features;
        if (updates.tags) updateFields.tags = updates.tags;

        await collection.updateOne(
          { id: toolId },
          { $set: updateFields }
        );

        console.log(`✅ Updated: ${existing.name}`);
        console.log(`   - Tagline: ${updates.tagline?.substring(0, 60)}...`);
        updated++;
      } else {
        console.log(`⚠️  Not found: ${toolId} (skipping)`);
        notFound++;
      }
    }

    console.log(`\n✨ Update complete!`);
    console.log(`   - Updated: ${updated} tools`);
    console.log(`   - Not found: ${notFound} tools`);
    console.log(`   - Backup: ${backupFile}\n`);
    
    console.log('💡 To rollback, run:');
    console.log(`   mongoimport --uri="$MONGODB_URI" --collection=ai_tools --file="${backupFile}" --jsonArray --drop\n`);

  } catch (error) {
    logger.error('Failed to update AI tools', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Update failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
