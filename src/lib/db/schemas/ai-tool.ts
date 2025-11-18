/**
 * AI Tool Schema
 * Validation for AI development tools stored in MongoDB
 */

import { z } from 'zod';

export const AIToolSchema = z.object({
  _id: z.string().optional(),
  id: z.string(), // Unique identifier: 'cursor', 'windsurf', etc.
  slug: z.string(), // URL-friendly slug for SEO
  name: z.string(), // Display name: 'Cursor'
  tagline: z.string().optional(), // Short description
  description: z.string(), // Full description
  category: z
    .enum([
      'ide', // Full IDEs: Cursor, Windsurf, Zed
      'code-assistant', // IDE plugins: Copilot, Codeium, Tabnine
      'ai-terminal', // AI-powered terminals: Warp
      'agentic-assistant', // Agentic/Terminal-Native: Claude Code, Amazon Q Developer
      'cloud-optimized', // Cloud-Optimized: Amazon Q Developer (AWS), Google Cloud AI
      'builder', // AI app builders: Lovable, Bolt, Replit
      'ui-generator', // UI component generators: v0.dev
      'ai-testing-qa', // AI Testing & QA: Virtuoso QA, LambdaTest KaneAI, BrowserStack
      'code-review', // AI Code Review & Quality: Qodo, CodeRabbit, Snyk DeepCode
      'mlops', // MLOps & Tracking: W&B, DVC, Delta Lake
      'internal-tooling', // AI Internal Tooling: Superblocks, Replit (AI features)
      'protocol', // Protocols/frameworks: MCP (Model Context Protocol)
      'framework', // Development frameworks: LangChain, CrewAI
      'other',
    ])
    .default('other'),
  pricing: z
    .object({
      free: z.boolean().default(false),
      paid: z
        .object({
          monthly: z.number().optional(),
          annual: z.number().optional(),
          tier: z.string().optional(), // 'Pro', 'Enterprise', etc.
          creditsPerMonth: z.number().optional(), // Monthly credits/tokens included
          creditsUnit: z.string().optional(), // 'credits', 'tokens', 'requests', 'messages'
          unlimited: z.boolean().default(false), // True if unlimited credits
        })
        .optional(),
      // Token-based pricing (for tools that charge per token)
      tokenPricing: z
        .object({
          inputCostPer1M: z.number().optional(), // Cost per 1M input tokens
          outputCostPer1M: z.number().optional(), // Cost per 1M output tokens
          model: z.string().optional(), // Which model this pricing applies to (e.g., 'GPT-4', 'Claude 3.5 Sonnet')
          creditsPer1MTokens: z.number().optional(), // If tool uses credits, conversion rate
        })
        .optional(),
      // Alternative pricing models (for tools that don't use tokens)
      alternativePricing: z
        .object({
          model: z.enum(['acu', 'lines-of-code', 'requests', 'compute-units', 'other']).optional(), // Pricing model type
          unitName: z.string().optional(), // e.g., 'ACU', 'LOC', 'Request'
          costPerUnit: z.number().optional(), // Cost per unit (e.g., $2.25 per ACU)
          baseMinimum: z.number().optional(), // Minimum charge (e.g., $20 minimum)
          includedUnits: z.number().optional(), // Units included in base plan
        })
        .optional(),
    })
    .default({ free: false }),
  features: z.array(z.string()).default([]),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  affiliateLink: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).default(0),
  status: z.enum(['active', 'deprecated', 'sunset']).default('active'),
  lastUpdated: z.date().optional(),
  tags: z.array(z.string()).default([]),
  icon: z.string().optional(), // Icon name/key
  organizationId: z.string().optional(), // Multi-tenant support (null = system-wide)
  
  // Enhanced metadata for SEO and categorization
  badges: z.array(z.enum([
    'vscode-plugin',
    'open-source',
    'enterprise',
    'free',
    'jetbrains-plugin',
    'github-integration',
    'cli-tool',
    'browser-based',
  ])).default([]), // Badges: VS Code plugin, open-source, etc.
  supportedModels: z.array(z.string()).default([]), // e.g., ['GPT-4', 'Claude', 'Gemini']
  agentCapabilities: z.array(z.string()).default([]), // e.g., ['test-generation', 'refactoring', 'file-creation']
  marketplaceLinks: z.object({
    vscode: z.string().url().optional(), // VS Code Marketplace URL
    jetbrains: z.string().url().optional(), // JetBrains Marketplace URL
    github: z.string().url().optional(), // GitHub repository URL
  }).optional(),
  
  // Tool relationships and categorization
  inspiredBy: z.string().optional(), // ID of tool this is inspired by/clone of (e.g., 'cline' for Cline clones)
  alternatives: z.array(z.string()).default([]), // IDs of alternative tools
  cloneType: z.enum(['original', 'clone', 'alternative', 'inspired']).optional(), // Relationship type
  
  // Hub Content (for SEO content hubs)
  hubContent: z.object({
    // Section 5: Related Prompts
    relatedPrompts: z.array(z.string()).default([]), // Prompt IDs
    promptsHeading: z.string().optional(),
    
    // Section 6: Related Patterns
    relatedPatterns: z.array(z.string()).default([]), // Pattern IDs
    patternsHeading: z.string().optional(),
    
    // Section 7: Problems & Solutions
    problems: z.array(z.object({
      id: z.string(),
      title: z.string(),
      issue: z.string(),
      impact: z.string(),
      engifySolution: z.string(),
      order: z.number(),
    })).default([]),
    problemsHeading: z.string().optional(),
    
    // Section 8: Articles
    articles: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      slug: z.string().optional(), // When published
      status: z.enum(['coming_soon', 'published']).default('coming_soon'),
      order: z.number(),
    })).default([]),
    articlesHeading: z.string().optional(),
    
    // Section 9: Getting Started
    gettingStarted: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      order: z.number(),
    })).default([]),
    gettingStartedHeading: z.string().optional(),
    gettingStartedProTip: z.string().optional(),
    
    // Section 10: Community Resources
    officialResources: z.array(z.object({
      id: z.string(),
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      order: z.number(),
    })).default([]),
    communityResources: z.array(z.object({
      id: z.string(),
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      order: z.number(),
    })).default([]),
    communityHeading: z.string().optional(),
    communityCallout: z.string().optional(),
  }).optional(), // Optional so existing tools don't break
  
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type AITool = z.infer<typeof AIToolSchema>;

// Export sub-types for convenience
export type HubProblem = NonNullable<AITool['hubContent']>['problems'][number];
export type HubArticle = NonNullable<AITool['hubContent']>['articles'][number];
export type HubGettingStartedStep = NonNullable<AITool['hubContent']>['gettingStarted'][number];
export type HubResource = NonNullable<AITool['hubContent']>['officialResources'][number];
