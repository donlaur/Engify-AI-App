/**
 * Site Statistics - Single Source of Truth
 *
 * All numbers displayed across the site come from here.
 * Update once, reflects everywhere.
 */

import { playbookCategories } from '@/data/playbooks';

/**
 * Calculate total prompts from playbooks
 */
function calculateTotalPrompts() {
  return playbookCategories.reduce((total, category) => {
    return total + category.recipes.length;
  }, 0);
}

/**
 * Get real-time site statistics
 */
export function getSiteStats() {
  const playbookPrompts = calculateTotalPrompts();

  return {
    // Core metrics
    totalPrompts: playbookPrompts, // Dynamic from playbooks.ts (76 prompts)
    totalPatterns: 23, // Updated: 8 basic + 8 advanced + 7 production patterns
    totalArticles: 46, // 26 original + 10 Claude + 10 Gemini
    aiProviders: 4, // OpenAI, Anthropic Claude, Google Gemini, Groq

    // User metrics (will come from MongoDB later)
    totalUsers: 0,
    activeUsers: 0,

    // Engagement metrics
    promptViews: 0,
    promptCopies: 0,

    // Business metrics (SaaS Freemium Model)
    pricing: {
      free: 'Free Beta',      // Limited free tier during beta
      pro: '$29/mo',          // Individual professionals
      team: '$99/mo',         // Teams & companies
      enterprise: 'Custom',   // Enterprise pricing
    },

    // Feature counts
    roles: 6, // C-Level, Engineering Manager, Engineer, PM, Designer, QA
    blogPosts: 3,

    // Marketing copy
    tagline: 'Transform your team into AI power users',
    valueProps: {
      speed: '10x faster',
      success: '95% success rate',
      timeSaved: '2hrs saved per day',
    },
  };
}

/**
 * Get stats formatted for display
 */
export function getDisplayStats() {
  const stats = getSiteStats();

  return {
    prompts: {
      label: 'Expert Prompts',
      value: stats.totalPrompts.toString(),
      description: `${stats.totalPrompts}+ curated prompts`,
    },
    patterns: {
      label: 'Proven Patterns',
      value: stats.totalPatterns.toString(),
      description: `${stats.totalPatterns} battle-tested patterns`,
    },
    providers: {
      label: 'AI Providers',
      value: stats.aiProviders.toString(),
      description: 'OpenAI, Claude, Gemini, Groq',
    },
    pricing: {
      label: 'Starting At',
      value: stats.pricing.free,
      description: 'Free beta access available',
    },
  };
}

/**
 * Get stats for specific sections
 */
export function getHeroStats() {
  const stats = getSiteStats();
  return {
    totalPrompts: stats.totalPrompts,
    totalPatterns: stats.totalPatterns,
    tagline: stats.tagline,
  };
}

export function getFooterStats() {
  const stats = getSiteStats();
  return {
    totalPrompts: stats.totalPrompts,
    totalPatterns: stats.totalPatterns,
    roles: stats.roles,
  };
}
