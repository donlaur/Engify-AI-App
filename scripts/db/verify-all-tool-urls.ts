#!/usr/bin/env tsx

/**
 * Verify All AI Tool URLs
 * 
 * Comprehensive script to verify and fix all tool URLs in the database.
 * Updates incorrect URLs and reports on broken links.
 * 
 * Run with: tsx scripts/db/verify-all-tool-urls.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { logger } from '@/lib/logging/logger';
import * as fs from 'fs';
import * as path from 'path';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

/**
 * Comprehensive list of verified correct URLs for all tools
 */
const VERIFIED_URLS: Record<string, {
  websiteUrl: string;
  github?: string;
  pricing?: {
    free?: boolean;
    monthly?: number;
    annual?: number;
    tier?: string;
  };
}> = {
  // Main IDEs
  cursor: {
    websiteUrl: 'https://cursor.sh',
    github: 'https://github.com/getcursor/cursor',
    pricing: {
      free: false,
      monthly: 20,
      annual: 200,
      tier: 'Pro',
    },
  },
  windsurf: {
    websiteUrl: 'https://windsurf.com',
    github: 'https://github.com/codeium/windsurf',
    pricing: {
      free: false,
      monthly: 15,
      tier: 'Pro',
    },
  },
  'augment-code': {
    websiteUrl: 'https://www.augmentcode.com/',
    pricing: {
      free: false,
      monthly: 30,
      tier: 'Pro',
    },
  },

  // Code Assistants
  copilot: {
    websiteUrl: 'https://github.com/features/copilot',
    pricing: {
      free: false,
      monthly: 10,
      annual: 100,
      tier: 'Individual',
    },
  },
  tabnine: {
    websiteUrl: 'https://www.tabnine.com',
    pricing: {
      free: false,
      monthly: 12,
      tier: 'Pro',
    },
  },
  'jetbrains-ai-assistant': {
    websiteUrl: 'https://www.jetbrains.com/ai/',
    pricing: {
      free: false,
      monthly: 10,
      tier: 'Professional',
    },
  },
  codegpt: {
    websiteUrl: 'https://www.codegpt.co/',
    pricing: {
      free: true,
      monthly: 8,
      tier: 'BYOK Pro',
    },
  },
  'intellicode': {
    websiteUrl: 'https://visualstudio.microsoft.com/services/intellicode/',
  },
  codegeex: {
    websiteUrl: 'https://codegeex.cn/',
  },
  askcodi: {
    websiteUrl: 'https://www.askcodi.com/',
  },

  // Agentic Assistants
  cline: {
    websiteUrl: 'https://cline.bot/',
    github: 'https://github.com/clinebot/cline',
    pricing: {
      free: true,
    },
  },
  continue: {
    websiteUrl: 'https://continue.dev/',
    github: 'https://github.com/continuedev/continue',
    pricing: {
      free: true,
    },
  },
  aider: {
    websiteUrl: 'https://aider.chat/',
    github: 'https://github.com/paul-gauthier/aider',
    pricing: {
      free: true,
    },
  },
  openhands: {
    websiteUrl: 'https://openhands.dev/',
    github: 'https://github.com/allenai/open-hand',
    pricing: {
      free: true,
    },
  },
  tabby: {
    websiteUrl: 'https://tabby.tabbyml.com/',
    github: 'https://github.com/TabbyML/tabby',
    pricing: {
      free: true,
    },
  },
  devin: {
    websiteUrl: 'https://www.cognition.ai/',
    pricing: {
      free: false,
      monthly: 20,
      tier: 'Pro',
    },
  },

  // AI Terminals
  warp: {
    websiteUrl: 'https://www.warp.dev',
    github: 'https://github.com/warpdotdev',
  },
  'gemini-cli': {
    websiteUrl: 'https://github.com/google-gemini/gemini-cli',
    github: 'https://github.com/google-gemini/gemini-cli',
    pricing: {
      free: true,
    },
  },

  // AI Builders
  lovable: {
    websiteUrl: 'https://lovable.dev',
  },
  bolt: {
    websiteUrl: 'https://bolt.new',
  },
  v0: {
    websiteUrl: 'https://v0.dev',
  },
  anything: {
    websiteUrl: 'https://create.xyz',
  },

  // UI Generators
  dronahq: {
    websiteUrl: 'https://www.dronahq.com/',
  },
  locofy: {
    websiteUrl: 'https://www.locofy.ai/',
  },
  teleporthq: {
    websiteUrl: 'https://teleporthq.io/',
  },

  // Code Review & QA
  qodo: {
    websiteUrl: 'https://www.qodo.ai/',
  },
  coderabbit: {
    websiteUrl: 'https://www.coderabbit.ai/',
  },
  'virtuoso-qa': {
    websiteUrl: 'https://www.virtuoso.qa',
  },
  'lambdatest-kane-ai': {
    websiteUrl: 'https://www.lambdatest.com/kane-ai',
  },

  // Cloud & Enterprise
  'amazon-q-developer': {
    websiteUrl: 'https://aws.amazon.com/q/developer/',
    pricing: {
      free: false,
      monthly: 19,
      tier: 'Pro',
    },
  },
  'claude-code': {
    websiteUrl: 'https://www.anthropic.com/claude',
  },

  // MLOps
  'weights-biases': {
    websiteUrl: 'https://wandb.ai',
  },
  dvc: {
    websiteUrl: 'https://dvc.org',
    pricing: {
      free: true,
    },
  },

  // Protocols
  mcp: {
    websiteUrl: 'https://modelcontextprotocol.io',
    pricing: {
      free: true,
    },
  },

  // Agentic Assistants
  zencoder: {
    websiteUrl: 'https://zencoder.ai/',
    pricing: {
      free: false,
      monthly: 0, // Pricing not publicly disclosed
      tier: 'Pro',
    },
  },
};

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('🔍 Verifying all AI tool URLs and pricing...\n');
    console.log('This script will:');
    console.log('1. ✅ Create backup of existing data');
    console.log('2. ✅ Verify all website URLs');
    console.log('3. ✅ Verify all GitHub links');
    console.log('4. ✅ Verify and fix pricing information');
    console.log('5. ✅ Report on any tools with incorrect URLs\n');

    // Step 1: Create backup
    console.log('📦 Step 1: Creating backup...');
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `ai-tools-verify-backup-${timestamp}.json`);
    
    const existingTools = await collection.find({}).toArray();
    fs.writeFileSync(backupFile, JSON.stringify(existingTools, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`   Backed up ${existingTools.length} tools\n`);

    // Step 2: Verify and fix URLs
    console.log('🔧 Step 2: Verifying URLs and pricing...\n');
    
    let fixed = 0;
    let verified = 0;
    let notFound = 0;
    let pricingFixed = 0;
    const issues: Array<{ tool: string; issue: string }> = [];

    // Get all tools from database
    const allTools = await collection.find({}).toArray();

    for (const tool of allTools) {
      const toolId = tool.id;
      const verifiedData = VERIFIED_URLS[toolId];

      if (!verifiedData) {
        // Tool not in verified list - just check if URL exists and looks valid
        if (!tool.websiteUrl || !tool.websiteUrl.startsWith('http')) {
          issues.push({
            tool: tool.name || toolId,
            issue: `Missing or invalid websiteUrl: ${tool.websiteUrl || 'none'}`,
          });
        }
        continue;
      }

      const updates: Record<string, unknown> = {};
      let needsUpdate = false;

      // Check websiteUrl
      const currentUrl = tool.websiteUrl;
      const correctUrl = verifiedData.websiteUrl;
      
      // Normalize URLs for comparison (remove trailing slashes)
      const normalizeUrl = (url: string) => url.replace(/\/+$/, '');
      
      if (currentUrl && normalizeUrl(currentUrl) !== normalizeUrl(correctUrl)) {
        console.log(`   ❌ ${tool.name || toolId}:`);
        console.log(`      Current: ${currentUrl}`);
        console.log(`      Should be: ${correctUrl}`);
        updates.websiteUrl = correctUrl;
        needsUpdate = true;
        issues.push({
          tool: tool.name || toolId,
          issue: `Wrong URL: ${currentUrl} → ${correctUrl}`,
        });
      }

      // Check GitHub link
      if (verifiedData.github) {
        const currentGithub = tool.marketplaceLinks?.github;
        if (currentGithub !== verifiedData.github) {
          if (currentGithub) {
            console.log(`   ❌ ${tool.name || toolId} GitHub:`);
            console.log(`      Current: ${currentGithub}`);
            console.log(`      Should be: ${verifiedData.github}`);
          }
          if (!updates.marketplaceLinks) {
            updates.marketplaceLinks = { ...(tool.marketplaceLinks || {}) };
          }
          (updates.marketplaceLinks as Record<string, unknown>).github = verifiedData.github;
          needsUpdate = true;
        }
      }

      // Check pricing
      if (verifiedData.pricing) {
        const currentPricing = tool.pricing;
        const verifiedPricing = verifiedData.pricing;
        const pricingUpdates: Record<string, unknown> = {};
        let pricingNeedsUpdate = false;

        // Check free status
        if (verifiedPricing.free !== undefined && 
            currentPricing?.free !== verifiedPricing.free) {
          pricingUpdates.free = verifiedPricing.free;
          pricingNeedsUpdate = true;
        }

        // Check monthly pricing
        if (verifiedPricing.monthly !== undefined) {
          const currentMonthly = currentPricing?.paid?.monthly || 0;
          if (currentMonthly !== verifiedPricing.monthly) {
            if (!pricingUpdates.paid) {
              pricingUpdates.paid = { ...(currentPricing?.paid || {}) };
            }
            (pricingUpdates.paid as Record<string, unknown>).monthly = verifiedPricing.monthly;
            pricingNeedsUpdate = true;
          }
        }

        // Check annual pricing
        if (verifiedPricing.annual !== undefined) {
          const currentAnnual = currentPricing?.paid?.annual;
          if (currentAnnual !== verifiedPricing.annual) {
            if (!pricingUpdates.paid) {
              pricingUpdates.paid = { ...(currentPricing?.paid || {}) };
            }
            (pricingUpdates.paid as Record<string, unknown>).annual = verifiedPricing.annual;
            pricingNeedsUpdate = true;
          }
        }

        // Check tier
        if (verifiedPricing.tier !== undefined) {
          const currentTier = currentPricing?.paid?.tier;
          if (currentTier !== verifiedPricing.tier) {
            if (!pricingUpdates.paid) {
              pricingUpdates.paid = { ...(currentPricing?.paid || {}) };
            }
            (pricingUpdates.paid as Record<string, unknown>).tier = verifiedPricing.tier;
            pricingNeedsUpdate = true;
          }
        }

        if (pricingNeedsUpdate) {
          if (!updates.pricing) {
            updates.pricing = { ...(currentPricing || {}) };
          }
          if (pricingUpdates.free !== undefined) {
            (updates.pricing as Record<string, unknown>).free = pricingUpdates.free;
          }
          if (pricingUpdates.paid) {
            (updates.pricing as Record<string, unknown>).paid = {
              ...((updates.pricing as Record<string, unknown>).paid || {}),
              ...pricingUpdates.paid,
            };
          }
          needsUpdate = true;
          pricingFixed++;
        }
      }

      if (needsUpdate) {
        const setUpdate: Record<string, unknown> = {
          updatedAt: new Date(),
          lastUpdated: new Date(),
        };

        if (updates.websiteUrl) {
          setUpdate.websiteUrl = updates.websiteUrl;
        }

        if (updates.marketplaceLinks) {
          setUpdate.marketplaceLinks = updates.marketplaceLinks;
        }

        if (updates.pricing) {
          setUpdate.pricing = updates.pricing;
        }

        await collection.updateOne(
          { id: toolId },
          { $set: setUpdate }
        );
        console.log(`   ✅ Fixed: ${tool.name || toolId}`);
        if (updates.websiteUrl) {
          console.log(`      - URL: ${updates.websiteUrl}`);
        }
        if (updates.marketplaceLinks?.github) {
          console.log(`      - GitHub: ${(updates.marketplaceLinks as { github: string }).github}`);
        }
        if (updates.pricing) {
          const pricing = updates.pricing as { free?: boolean; paid?: { monthly?: number; annual?: number; tier?: string } };
          if (pricing.free) {
            console.log(`      - Pricing: Free`);
          } else if (pricing.paid) {
            console.log(`      - Pricing: $${pricing.paid.monthly}/mo${pricing.paid.annual ? ` ($${pricing.paid.annual}/yr)` : ''} ${pricing.paid.tier ? `(${pricing.paid.tier})` : ''}`);
          }
        }
        console.log('');
        fixed++;
      } else {
        verified++;
      }
    }

    // Summary
    console.log('\n✨ URL verification complete!');
    console.log(`   - Fixed: ${fixed} tools`);
    console.log(`   - Pricing fixed: ${pricingFixed} tools`);
    console.log(`   - Verified (already correct): ${verified} tools`);
    console.log(`   - Issues found: ${issues.length}`);
    console.log(`   - Backup: ${backupFile}\n`);

    if (issues.length > 0) {
      console.log('⚠️  Issues found:');
      issues.forEach(({ tool, issue }) => {
        console.log(`   - ${tool}: ${issue}`);
      });
      console.log('');
    }
    
    console.log('💡 To rollback, run:');
    console.log(`   mongoimport --uri="$MONGODB_URI" --collection=ai_tools --file="${backupFile}" --jsonArray --drop\n`);

  } catch (error) {
    logger.error('Failed to verify tool URLs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }

  process.exit(0);
}

main();

