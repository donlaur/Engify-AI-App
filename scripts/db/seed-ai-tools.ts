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
        creditsPerMonth: undefined, // Unlimited usage (model selection affects cost)
        creditsUnit: 'unlimited',
        unlimited: true,
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
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
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
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
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
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
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
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
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
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
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
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
    tags: ['builder', 'browser', 'education', 'free-tier'],
    icon: 'globe',
  },
  warp: {
    name: 'Warp Terminal',
    tagline: 'AI-powered terminal',
    description:
      'Warp is a modern, AI-powered terminal with natural language commands, command history search, and team collaboration features.',
    category: 'ai-terminal',
    pricing: {
      free: true,
      paid: {
        monthly: 15,
        tier: 'Team',
      },
    },
    features: [
      'AI command suggestions',
      'Natural language to shell commands',
      'Modern UI with blocks',
      'Command history with AI search',
      'Team collaboration',
    ],
    pros: [
      'Beautiful modern UI',
      'AI-powered workflow',
      'Great for DevOps',
      'Command history search',
    ],
    cons: [
      'macOS only (limited platform support)',
      'Terminal-focused (not full IDE)',
      'Some features require subscription',
    ],
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
    tags: ['terminal', 'ai-terminal', 'devops', 'macos'],
    icon: 'terminal',
  },
  lovable: {
    name: 'Lovable',
    tagline: 'AI app builder from prompts',
    description:
      'Lovable (formerly GPT Engineer) builds full React applications from natural language prompts. Generates clean, production-ready code with Tailwind CSS.',
    category: 'builder',
    pricing: {
      free: false,
      paid: {
        monthly: 20,
        tier: 'Pro',
        creditsPerMonth: 1500, // Credits/month
        creditsUnit: 'credits',
        unlimited: false,
      },
    },
    features: [
      'Builds full apps from prompts',
      'React + Tailwind output',
      'Fast prototyping',
      'Export to GitHub',
      'Great for MVPs',
    ],
    pros: [
      'Full app generation',
      'Clean code output',
      'Great for MVPs',
      'GitHub integration',
    ],
    cons: [
      'Less control than traditional IDEs',
      'Generated code needs cleanup',
      'Limited customization',
      'Newer tool (less mature)',
    ],
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
    tags: ['builder', 'react', 'mvp', 'no-code'],
    icon: 'heart',
  },
  bolt: {
    name: 'Bolt.new',
    tagline: 'AI-powered web app builder',
    description:
      'Bolt.new is a fast AI-powered web app builder that creates full-stack applications from simple prompts. Features instant preview and deployment.',
    category: 'builder',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Free',
      },
    },
    features: [
      'Instant app generation',
      'Full-stack applications',
      'Real-time preview',
      'One-click deployment',
      'Fast iteration',
    ],
    pros: [
      'Very fast',
      'Free tier available',
      'Good for prototyping',
      'Easy deployment',
    ],
    cons: [
      'Limited customization',
      'Newer tool',
      'Less control than coding',
      'Platform dependency',
    ],
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
    tags: ['builder', 'full-stack', 'free', 'prototyping'],
    icon: 'zap',
  },
  v0: {
    name: 'v0.dev',
    tagline: 'AI-powered UI generation',
    description:
      'v0.dev by Vercel generates React components with Tailwind CSS and shadcn/ui. Perfect for rapid UI prototyping and component generation.',
    category: 'ui-generator',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Credits',
        creditsPerMonth: 500, // Free tier credits
        creditsUnit: 'credits',
        unlimited: false,
      },
    },
    features: [
      'Generates React components instantly',
      'Tailwind + shadcn/ui output',
      'Iterative refinement',
      'Copy-paste ready code',
      'Great for UI prototyping',
    ],
    pros: [
      'Excellent UI generation',
      'Production-ready code',
      'Free tier available',
      'Vercel ecosystem',
    ],
    cons: [
      'UI-only (no backend)',
      'Credit-based pricing',
      'Can be expensive for heavy use',
      'Limited to React/Next.js',
    ],
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
    tags: ['ui-generator', 'react', 'tailwind', 'vercel'],
    icon: 'sparkles',
  },
  claudeCode: {
    name: 'Claude Code',
    tagline: 'AI-powered coding assistant by Anthropic',
    description:
      'Claude Code is Anthropic\'s AI-powered coding assistant available for Claude Pro and Max users. Features advanced code understanding, generation, debugging, and refactoring capabilities.',
    category: 'code-assistant',
    pricing: {
      free: false,
      paid: {
        monthly: 20,
        tier: 'Claude Pro',
      },
    },
    features: [
      'Advanced code understanding',
      'Multi-language support (Python, JavaScript, Java, Rust, C++)',
      'Code generation from natural language',
      'Debugging and bug fixing',
      'Code refactoring and optimization',
      'Test generation',
      'Documentation generation',
      'Large context window (200K tokens)',
    ],
    pros: [
      'Excellent reasoning ability',
      'Best for architecture and planning',
      'Large context window',
      'Accurate code generation',
      'Great for code review',
    ],
    cons: [
      'Web-based interface (not IDE integration)',
      'Manual copy/paste workflow',
      'No codebase awareness',
      'Requires Claude Pro subscription',
      'Less integrated than IDE tools',
    ],
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
    tags: ['code-assistant', 'anthropic', 'claude', 'paid', 'web-based'],
    icon: 'sparkles',
  },
  geminiStudio: {
    name: 'Gemini AI Studio',
    tagline: 'Build apps from natural language',
    description:
      'Gemini AI Studio features Vibe Coding, allowing you to create AI-powered applications by describing your ideas in natural language. Powered by Google\'s Gemini models, it handles setup and configuration automatically.',
    category: 'builder',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Free',
      },
    },
    features: [
      'Vibe coding - describe apps in natural language',
      'Automatic model and API configuration',
      'Rapid prototyping',
      'Annotation mode for intuitive modifications',
      'App Gallery with examples',
      'I\'m Feeling Lucky button for inspiration',
      'Powered by Gemini models',
      'Web-based interface',
    ],
    pros: [
      'Free to use',
      'No coding knowledge required',
      'Fast prototyping',
      'Google ecosystem',
      'Intuitive interface',
      'Great for beginners',
    ],
    cons: [
      'Web-based only',
      'Limited customization',
      'Newer feature',
      'Less control than traditional IDEs',
      'Gemini model limitations',
    ],
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
    tags: ['builder', 'google', 'gemini', 'free', 'vibe-coding', 'no-code'],
    icon: 'zap',
  },
  mcp: {
    name: 'Model Context Protocol',
    tagline: 'Standard for AI tool integration',
    description:
      'Model Context Protocol (MCP) by Anthropic is an open protocol for connecting AI models to external tools and data sources. Enables secure, standardized tool integration.',
    category: 'protocol',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Open Source',
      },
    },
    features: [
      'Open protocol standard',
      'Secure tool integration',
      'Standardized APIs',
      'Multi-model support',
      'Extensible architecture',
    ],
    pros: [
      'Open standard',
      'Secure by design',
      'Multi-model support',
      'Great for tool builders',
    ],
    cons: [
      'Newer protocol',
      'Learning curve',
      'Requires implementation',
      'Smaller ecosystem',
    ],
    // rating: undefined, // Start at 0 - no reviews yet
    // reviewCount: 0, // Default schema value
    tags: ['protocol', 'framework', 'anthropic', 'integration'],
    icon: 'puzzle',
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
        affiliateLink: affiliateLink.referralUrl, // Only set if referral URL exists
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

    // Add MCP separately (it's a protocol, not in affiliate links)
    const mcpDefinition = TOOL_DEFINITIONS.mcp;
    if (mcpDefinition) {
      const existingMcp = await aiToolService.findById('mcp');
      const slug = generateSlug(mcpDefinition.name || 'Model Context Protocol');
      const mcpTool: AITool = {
        id: 'mcp',
        slug,
        name: mcpDefinition.name || 'Model Context Protocol',
        tagline: mcpDefinition.tagline,
        description: mcpDefinition.description || 'Model Context Protocol for AI tool integration',
        category: mcpDefinition.category || 'protocol',
        pricing: mcpDefinition.pricing || { free: true },
        features: mcpDefinition.features || [],
        pros: mcpDefinition.pros || [],
        cons: mcpDefinition.cons || [],
        websiteUrl: 'https://modelcontextprotocol.io',
        rating: mcpDefinition.rating,
        reviewCount: mcpDefinition.reviewCount || 0,
        status: 'active',
        tags: mcpDefinition.tags || [],
        icon: mcpDefinition.icon,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (existingMcp) {
        if (existingMcp._id) {
          await aiToolService.updateOne(existingMcp._id.toString(), mcpTool);
          updated++;
        }
      } else {
        await aiToolService.create(mcpTool);
        created++;
      }
    }

    console.log(`✨ Seed complete!`);
    console.log(`   - Created: ${created} tools`);
    console.log(`   - Updated: ${updated} tools`);
    console.log(`   - Total: ${tools.length + (mcpDefinition ? 1 : 0)} tools\n`);
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
