#!/usr/bin/env tsx

/**
 * Seed AI Tools from Static Data
 *
 * Seeds AI development tools from affiliate links data
 *
 * Usage:
 *   tsx scripts/db/seed-ai-tools.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { affiliateLinks } from '@/data/affiliate-links';
import { aiToolService } from '@/lib/services/AIToolService';
import { AITool } from '@/lib/db/schemas/ai-tool';
import { generateSlug } from '@/lib/utils/slug';
import { logger } from '@/lib/logging/logger';

/**
 * Tool definitions with detailed information
 */
const TOOL_DEFINITIONS: Record<string, Partial<AITool>> = {
  cursor: {
    name: 'Cursor',
    tagline: 'The AI-first code editor',
    description:
      'Cursor is an AI-powered code editor built on VSCode. It features native Claude integration, Composer mode for multi-file edits, and excellent context awareness.',
    category: 'ide',
    pricing: {
      free: false,
      paid: {
        monthly: 20,
        annual: 200,
        tier: 'Pro',
      },
    },
    features: [
      'Native Claude Sonnet 4.5 integration',
      'Composer mode for multi-file edits',
      'Codebase indexing',
      'VSCode fork (familiar UX)',
      'Excellent context awareness',
    ],
    pros: [
      'Best AI integration',
      'Multi-file editing',
      'Familiar VSCode interface',
      'Great for full-stack development',
    ],
    cons: [
      'Subscription required for best models',
      'Can be resource-intensive',
      'Occasional context window issues',
    ],
    rating: 4.5,
    reviewCount: 0,
    tags: ['ide', 'vscode', 'claude', 'paid', 'popular'],
    icon: 'code',
  },
  windsurf: {
    name: 'Windsurf',
    tagline: 'AI-powered development environment',
    description:
      'Windsurf is an AI-powered IDE from Codeium, focusing on fast UI generation and React/Next.js development.',
    category: 'ide',
    pricing: {
      free: false,
      paid: {
        monthly: 15,
        tier: 'Pro',
      },
    },
    features: [
      'Fast UI generation',
      'Good React/Next.js support',
      'Clean interface',
      'Lower pricing than competitors',
    ],
    pros: ['Lower cost', 'Fast generation', 'Good for frontend'],
    cons: [
      'Newer tool (less mature)',
      'Smaller community',
      'Limited backend support',
    ],
    rating: 4.0,
    reviewCount: 0,
    tags: ['ide', 'codeium', 'frontend', 'paid'],
    icon: 'zap',
  },
  copilot: {
    name: 'GitHub Copilot',
    tagline: 'AI pair programmer from GitHub',
    description:
      'GitHub Copilot is the original AI coding assistant, integrated directly into popular IDEs.',
    category: 'code-assistant',
    pricing: {
      free: false,
      paid: {
        monthly: 10,
        annual: 100,
        tier: 'Individual',
      },
    },
    features: [
      'IDE integration',
      'Multi-language support',
      'Large community',
      'Enterprise features',
    ],
    pros: ['Widely supported', 'Reliable', 'Enterprise-ready'],
    cons: [
      'More expensive',
      'Less AI features than competitors',
      'GitHub integration required',
    ],
    rating: 4.2,
    reviewCount: 0,
    tags: ['code-assistant', 'github', 'paid', 'enterprise'],
    icon: 'github',
  },
  codeium: {
    name: 'Codeium',
    tagline: 'Free AI coding assistant',
    description:
      'Codeium provides free AI coding assistance with IDE integrations.',
    category: 'code-assistant',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Free',
      },
    },
    features: [
      'Free tier available',
      'IDE integrations',
      'Multi-language support',
    ],
    pros: ['Free option', 'Good performance', 'Multiple IDE support'],
    cons: ['Paid features limited', 'Smaller model options'],
    rating: 4.0,
    reviewCount: 0,
    tags: ['code-assistant', 'free', 'ide-integration'],
    icon: 'sparkles',
  },
  tabnine: {
    name: 'Tabnine',
    tagline: 'AI code completion',
    description:
      'Tabnine provides AI-powered code completion with privacy-focused options.',
    category: 'code-assistant',
    pricing: {
      free: false,
      paid: {
        monthly: 12,
        tier: 'Pro',
      },
    },
    features: [
      'Privacy-focused',
      'On-premise options',
      'Multiple IDE support',
      'Enterprise features',
    ],
    pros: ['Privacy options', 'Enterprise-ready', 'On-premise available'],
    cons: ['Less AI features', 'More expensive'],
    rating: 3.8,
    reviewCount: 0,
    tags: ['code-assistant', 'privacy', 'enterprise', 'paid'],
    icon: 'shield',
  },
  replit: {
    name: 'Replit AI',
    tagline: 'AI-powered browser IDE',
    description:
      'Replit provides a browser-based IDE with AI assistance for prototyping and education.',
    category: 'builder',
    pricing: {
      free: true,
      paid: {
        monthly: 20,
        tier: 'Core',
      },
    },
    features: [
      'Browser-based',
      'AI assistance',
      'Deployment included',
      'Educational focus',
    ],
    pros: ['No installation', 'Easy deployment', 'Good for education'],
    cons: ['Limited for production', 'Browser limitations'],
    rating: 3.7,
    reviewCount: 0,
    tags: ['builder', 'browser', 'education', 'free-tier'],
    icon: 'globe',
  },
};

async function seedAITools() {
  console.log('🚀 Seeding AI tools from affiliate links...\n');

  try {
    const tools: AITool[] = [];

    for (const [key, affiliateLink] of Object.entries(affiliateLinks)) {
      // Skip AI providers (they're models, not tools)
      if (['openai', 'anthropic', 'groq'].includes(key)) {
        continue;
      }

      const definition = TOOL_DEFINITIONS[key];
      if (!definition) {
        console.warn(`⚠️  No definition found for ${key}, skipping`);
        continue;
      }

      const slug = generateSlug(definition.name || affiliateLink.tool);

      const tool: AITool = {
        id: key,
        slug,
        name: definition.name || affiliateLink.tool,
        tagline: definition.tagline,
        description:
          definition.description ||
          `${affiliateLink.tool} - AI development tool`,
        category: definition.category || 'other',
        pricing: definition.pricing || { free: false },
        features: definition.features || [],
        pros: definition.pros || [],
        cons: definition.cons || [],
        affiliateLink: affiliateLink.referralUrl || affiliateLink.baseUrl,
        websiteUrl: affiliateLink.baseUrl,
        rating: definition.rating,
        reviewCount: definition.reviewCount || 0,
        status: affiliateLink.status === 'active' ? 'active' : 'active', // Default to active
        tags: definition.tags || [],
        icon: definition.icon,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tools.push(tool);
    }

    console.log(`📊 Found ${tools.length} tools to seed\n`);

    // Show examples
    console.log('📋 Tools to seed:');
    tools.forEach((tool) => {
      console.log(`   ✅ ${tool.name} (${tool.category})`);
      console.log(`      slug: ${tool.slug}`);
      console.log(
        `      pricing: ${tool.pricing.free ? 'Free' : '$' + (tool.pricing.paid?.monthly || 0) + '/mo'}`
      );
    });
    console.log('');

    // Bulk upsert
    let created = 0;
    let updated = 0;

    for (const tool of tools) {
      const existing = await aiToolService.findById(tool.id);
      if (existing) {
        if (existing._id) {
          await aiToolService.updateOne(existing._id.toString(), tool);
          updated++;
        }
      } else {
        await aiToolService.create(tool);
        created++;
      }
    }

    console.log(`✨ Seed complete!`);
    console.log(`   - Created: ${created} tools`);
    console.log(`   - Updated: ${updated} tools`);
    console.log(`   - Total: ${tools.length} tools\n`);
  } catch (error) {
    logger.error('Failed to seed AI tools', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seedAITools()
  .then(() => {
    console.log('✅ AI tools seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ AI tools seed failed:', error);
    process.exit(1);
  });
