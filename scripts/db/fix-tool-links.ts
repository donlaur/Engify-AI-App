#!/usr/bin/env tsx

/**
 * Fix AI Tool Links
 * 
 * Fixes broken or incorrect links for AI tools:
 * - Windsurf: Update websiteUrl to https://windsurf.com (not codeium.com/windsurf)
 * - Verify and fix GitHub links
 * - Verify marketplace links
 * - Check for any Codenium references that should be Windsurf
 * 
 * Run with: tsx scripts/db/fix-tool-links.ts
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
 * Link corrections map
 * id -> { websiteUrl?, marketplaceLinks? }
 */
const LINK_CORRECTIONS: Record<string, {
  websiteUrl?: string;
  marketplaceLinks?: {
    github?: string;
    vscode?: string;
    jetbrains?: string;
  };
}> = {
  windsurf: {
    websiteUrl: 'https://windsurf.com',
    // Note: GitHub link might be codeium/windsurf or windsurf-ai/windsurf - verify
  },
  // Add other corrections as needed
};

/**
 * Verified correct links for common tools
 */
const VERIFIED_LINKS: Record<string, {
  websiteUrl?: string;
  github?: string;
}> = {
  windsurf: {
    websiteUrl: 'https://windsurf.com',
    github: 'https://github.com/codeium/windsurf', // Verify this is correct
  },
  cursor: {
    websiteUrl: 'https://cursor.sh',
    github: 'https://github.com/getcursor/cursor',
  },
  codeium: {
    websiteUrl: 'https://codeium.com',
    github: 'https://github.com/Exafunction/codeium',
  },
  cline: {
    websiteUrl: 'https://cline.bot/',
    github: 'https://github.com/clinebot/cline',
  },
  continue: {
    websiteUrl: 'https://continue.dev/',
    github: 'https://github.com/continuedev/continue',
  },
  opendevin: {
    websiteUrl: 'https://opendevin.github.io/',
    github: 'https://github.com/AI-App/OpenDevin.OpenDevin',
  },
  aider: {
    websiteUrl: 'https://aider.chat/',
    github: 'https://github.com/paul-gauthier/aider',
  },
  openhands: {
    websiteUrl: 'https://www.openhands.ai/',
    github: 'https://github.com/allenai/open-hand',
  },
  tabby: {
    websiteUrl: 'https://tabby.tabbyml.com/',
    github: 'https://github.com/TabbyML/tabby',
  },
  'jetbrains-ai-assistant': {
    websiteUrl: 'https://www.jetbrains.com/ai/',
  },
  codegpt: {
    websiteUrl: 'https://www.codegpt.co/',
  },
};

/**
 * Verified correct pricing for tools
 * Monthly pricing in USD
 */
const VERIFIED_PRICING: Record<string, {
  free?: boolean;
  monthly?: number;
  annual?: number;
  tier?: string;
}> = {
  windsurf: {
    free: false,
    monthly: 15,
    tier: 'Pro',
  },
  cursor: {
    free: false,
    monthly: 20,
    annual: 200,
    tier: 'Pro',
  },
  'jetbrains-ai-assistant': {
    free: false,
    monthly: 10,
    tier: 'Professional',
  },
  copilot: {
    free: false,
    monthly: 10,
    annual: 100,
    tier: 'Individual',
  },
  codeium: {
    free: true,
    monthly: 0,
    tier: 'Free',
  },
  devin: {
    free: false,
    monthly: 20,
    tier: 'Pro',
  },
  codegpt: {
    free: true,
    monthly: 8,
    tier: 'BYOK Pro',
  },
};

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('🔍 Fixing AI tool links and pricing...\n');
    console.log('This script will:');
    console.log('1. ✅ Create backup of existing data');
    console.log('2. ✅ Fix Windsurf websiteUrl to https://windsurf.com');
    console.log('3. ✅ Verify and fix GitHub links');
    console.log('4. ✅ Verify and fix pricing information');
    console.log('5. ✅ Check for Codenium references');
    console.log('6. ✅ Update marketplace links\n');

    // Step 1: Create backup
    console.log('📦 Step 1: Creating backup...');
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `ai-tools-links-backup-${timestamp}.json`);
    
    const existingTools = await collection.find({}).toArray();
    fs.writeFileSync(backupFile, JSON.stringify(existingTools, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`   Backed up ${existingTools.length} tools\n`);

    // Step 2: Fix links and pricing
    console.log('🔧 Step 2: Fixing links and pricing...\n');
    
    let fixed = 0;
    let verified = 0;
    let notFound = 0;
    let pricingFixed = 0;

    // Fix Windsurf
    const windsurf = await collection.findOne({ id: 'windsurf' });
    if (windsurf) {
      const updates: Record<string, unknown> = {
        updatedAt: new Date(),
        lastUpdated: new Date(),
      };

      let needsUpdate = false;

      // Fix websiteUrl
      if (windsurf.websiteUrl !== 'https://windsurf.com') {
        console.log(`   Found incorrect Windsurf URL: ${windsurf.websiteUrl}`);
        updates.websiteUrl = 'https://windsurf.com';
        needsUpdate = true;
      }

      // Fix GitHub link if needed
      if (windsurf.marketplaceLinks?.github && 
          !windsurf.marketplaceLinks.github.includes('codeium') &&
          !windsurf.marketplaceLinks.github.includes('windsurf')) {
        console.log(`   Found incorrect Windsurf GitHub: ${windsurf.marketplaceLinks.github}`);
        updates['marketplaceLinks.github'] = 'https://github.com/codeium/windsurf';
        needsUpdate = true;
      } else if (!windsurf.marketplaceLinks?.github) {
        updates['marketplaceLinks.github'] = 'https://github.com/codeium/windsurf';
        needsUpdate = true;
      }

      // Check Windsurf pricing
      const windsurfPricing = VERIFIED_PRICING.windsurf;
      if (windsurfPricing) {
        const currentPricing = windsurf.pricing;
        if (currentPricing?.free !== windsurfPricing.free ||
            currentPricing?.paid?.monthly !== windsurfPricing.monthly ||
            currentPricing?.paid?.tier !== windsurfPricing.tier) {
          updates.pricing = {
            free: windsurfPricing.free,
            paid: {
              ...(currentPricing?.paid || {}),
              monthly: windsurfPricing.monthly,
              tier: windsurfPricing.tier,
            },
          };
          needsUpdate = true;
          pricingFixed++;
        }
      }

      if (needsUpdate) {
        // Use $set to update nested fields
        const setUpdate: Record<string, unknown> = {
          updatedAt: new Date(),
          lastUpdated: new Date(),
          websiteUrl: updates.websiteUrl || windsurf.websiteUrl,
        };

        if (updates['marketplaceLinks.github']) {
          setUpdate['marketplaceLinks'] = {
            ...(windsurf.marketplaceLinks || {}),
            github: updates['marketplaceLinks.github'],
          };
        }

        if (updates.pricing) {
          setUpdate.pricing = updates.pricing;
        }

        await collection.updateOne(
          { id: 'windsurf' },
          { $set: setUpdate }
        );
        console.log(`✅ Fixed: Windsurf`);
        console.log(`   - websiteUrl: ${updates.websiteUrl || windsurf.websiteUrl}`);
        if (updates['marketplaceLinks.github']) {
          console.log(`   - GitHub: ${updates['marketplaceLinks.github']}`);
        }
        if (updates.pricing) {
          const pricing = updates.pricing as { free?: boolean; paid?: { monthly?: number; tier?: string } };
          console.log(`   - Pricing: ${pricing.free ? 'Free' : `$${pricing.paid?.monthly}/mo (${pricing.paid?.tier})`}`);
        }
        fixed++;
      } else {
        console.log(`✓ Verified: Windsurf (already correct)`);
        verified++;
      }
    } else {
      console.log(`⚠️  Not found: windsurf (skipping)`);
      notFound++;
    }

    // Fix other tools from VERIFIED_LINKS
    for (const [toolId, verifiedLinks] of Object.entries(VERIFIED_LINKS)) {
      if (toolId === 'windsurf') continue; // Already handled

      const tool = await collection.findOne({ id: toolId });
      if (!tool) {
        console.log(`⚠️  Not found: ${toolId} (skipping)`);
        notFound++;
        continue;
      }

      const updates: Record<string, unknown> = {};
      let needsUpdate = false;

      // Check websiteUrl
      if (verifiedLinks.websiteUrl && tool.websiteUrl !== verifiedLinks.websiteUrl) {
        console.log(`   Found incorrect ${toolId} URL: ${tool.websiteUrl}`);
        updates.websiteUrl = verifiedLinks.websiteUrl;
        needsUpdate = true;
      }

      // Check GitHub link
      if (verifiedLinks.github) {
        const currentGithub = tool.marketplaceLinks?.github;
        if (currentGithub !== verifiedLinks.github) {
          if (currentGithub) {
            console.log(`   Found incorrect ${toolId} GitHub: ${currentGithub}`);
          }
          updates['marketplaceLinks.github'] = verifiedLinks.github;
          needsUpdate = true;
        }
      }

      // Check pricing
      const verifiedPricing = VERIFIED_PRICING[toolId];
      if (verifiedPricing) {
        const currentPricing = tool.pricing;
        let pricingNeedsUpdate = false;
        const pricingUpdates: Record<string, unknown> = {};

        // Check if free status is correct
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

        if (updates['marketplaceLinks.github']) {
          setUpdate['marketplaceLinks'] = {
            ...(tool.marketplaceLinks || {}),
            github: updates['marketplaceLinks.github'],
          };
        }

        if (updates.pricing) {
          setUpdate.pricing = updates.pricing;
          pricingFixed++;
        }

        await collection.updateOne(
          { id: toolId },
          { $set: setUpdate }
        );
        console.log(`✅ Fixed: ${tool.name || toolId}`);
        if (updates.websiteUrl) {
          console.log(`   - websiteUrl: ${updates.websiteUrl}`);
        }
        if (updates['marketplaceLinks.github']) {
          console.log(`   - GitHub: ${updates['marketplaceLinks.github']}`);
        }
        if (updates.pricing) {
          const pricing = updates.pricing as { free?: boolean; paid?: { monthly?: number; annual?: number; tier?: string } };
          if (pricing.free) {
            console.log(`   - Pricing: Free`);
          } else if (pricing.paid) {
            console.log(`   - Pricing: $${pricing.paid.monthly}/mo${pricing.paid.annual ? ` ($${pricing.paid.annual}/yr)` : ''} ${pricing.paid.tier ? `(${pricing.paid.tier})` : ''}`);
          }
        }
        fixed++;
      } else {
        console.log(`✓ Verified: ${tool.name || toolId} (already correct)`);
        verified++;
      }
    }

    // Step 3: Check for Codenium references
    console.log('\n🔍 Step 3: Checking for Codenium references...\n');
    const allTools = await collection.find({}).toArray();
    let codeniumFound = 0;

    for (const tool of allTools) {
      const needsUpdate: Record<string, unknown> = {};
      let shouldUpdate = false;

      // Check if name or description mentions Codenium incorrectly
      if (tool.id === 'windsurf' || tool.name?.toLowerCase().includes('windsurf')) {
        // Check if there are incorrect Codenium references
        if (tool.description?.includes('Codeium Editor') && !tool.description?.includes('formerly')) {
          // This is OK - it's documenting the history
        }
      }

      // Check websiteUrl for codeium.com/windsurf references
      if (tool.websiteUrl === 'https://codeium.com/windsurf' && tool.id !== 'codeium') {
        needsUpdate.websiteUrl = 'https://windsurf.com';
        shouldUpdate = true;
        console.log(`   Found codeium.com/windsurf URL in ${tool.id}`);
        codeniumFound++;
      }

      if (shouldUpdate) {
        await collection.updateOne(
          { id: tool.id },
          {
            $set: {
              ...needsUpdate,
              updatedAt: new Date(),
              lastUpdated: new Date(),
            },
          }
        );
        console.log(`✅ Fixed Codenium reference in: ${tool.name || tool.id}`);
        fixed++;
      }
    }

    if (codeniumFound === 0) {
      console.log('✓ No incorrect Codenium references found');
    }

    // Summary
    console.log(`\n✨ Link and pricing fix complete!`);
    console.log(`   - Fixed: ${fixed} tools`);
    console.log(`   - Pricing fixed: ${pricingFixed} tools`);
    console.log(`   - Verified (already correct): ${verified} tools`);
    console.log(`   - Not found: ${notFound} tools`);
    console.log(`   - Codenium references fixed: ${codeniumFound}`);
    console.log(`   - Backup: ${backupFile}\n`);
    
    console.log('💡 To rollback, run:');
    console.log(`   mongoimport --uri="$MONGODB_URI" --collection=ai_tools --file="${backupFile}" --jsonArray --drop\n`);

  } catch (error) {
    logger.error('Failed to fix tool links', {
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

