#!/usr/bin/env tsx

/**
 * Verify AI Tools in Database
 * 
 * Lists all tools and their categories
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { aiToolService } from '@/lib/services/AIToolService';

async function verifyTools() {
  console.log('🔍 Verifying AI tools in database...\n');

  try {
    const tools = await aiToolService.findActive();

    console.log(`📊 Total tools: ${tools.length}\n`);

    // Group by category
    const byCategory: Record<string, typeof tools> = {};
    tools.forEach((tool) => {
      if (!byCategory[tool.category]) {
        byCategory[tool.category] = [];
      }
      byCategory[tool.category].push(tool);
    });

    console.log('📋 Tools by category:');
    Object.entries(byCategory).forEach(([category, categoryTools]) => {
      console.log(`\n  ${category.toUpperCase()} (${categoryTools.length}):`);
      categoryTools.forEach((tool) => {
        const pricing = tool.pricing.free
          ? 'Free'
          : `$${tool.pricing.paid?.monthly || 0}/mo`;
        console.log(`    - ${tool.name} (${pricing})`);
      });
    });

    console.log(`\n✅ Verification complete!`);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyTools()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

