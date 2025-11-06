/**
 * Pillar Pages Configuration
 * 
 * Central registry of all pillar pages for generation, audit, and linking scripts.
 * This ensures scripts know about all pillar pages and can reference them dynamically.
 */

export interface PillarPageConfig {
  id: string;
  slug: string;
  title: string;
  description: string;
  targetKeywords: string[];
  audience: 'practitioners' | 'engineering-leaders' | 'hybrid';
  category: 'masterclass' | 'guide' | 'strategy';
  level: 'beginner' | 'intermediate' | 'advanced';
  targetWordCount: number;
  status: 'complete' | 'in-progress' | 'planned';
  structure: 'static' | 'mongodb';
  filePath?: string; // For static files
  mongoId?: string; // For MongoDB-stored pages
  priority: 'high' | 'medium' | 'low';
  relatedRoles?: string[]; // Roles this pillar page targets
  relatedTags?: string[]; // Tags for finding related content
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * All Pillar Pages Configuration
 * 
 * Add new pillar pages here as they're created.
 * Scripts will automatically reference this list.
 */
export const PILLAR_PAGES: PillarPageConfig[] = [
  {
    id: 'prompt-engineering-masterclass',
    slug: 'prompt-engineering-masterclass',
    title: 'Prompt Engineering Masterclass: Complete Guide for Developers',
    description: 'Master prompt engineering with this comprehensive guide. Learn proven patterns, advanced techniques, and practical examples.',
    targetKeywords: [
      'prompt engineering training',
      'prompt engineering course',
      'prompt engineering tutorial',
      'AI prompt engineering',
      'prompt patterns',
      'chain of thought prompting',
      'few-shot learning',
      'prompt engineering for developers',
      'advanced prompt engineering',
      'prompt engineering techniques',
    ],
    audience: 'practitioners',
    category: 'masterclass',
    level: 'advanced',
    targetWordCount: 8000,
    status: 'complete',
    structure: 'static',
    filePath: 'src/app/learn/prompt-engineering-masterclass/page.tsx',
    priority: 'high',
    relatedRoles: ['engineer', 'senior-engineer', 'tech-lead', 'architect'],
    relatedTags: ['prompt-engineering', 'ai-patterns', 'prompt-patterns', 'chain-of-thought', 'few-shot'],
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-11-05'),
  },
  {
    id: 'ai-upskilling-program',
    slug: 'ai-upskilling-program-for-engineering-teams',
    title: 'AI Upskilling Program for Engineering Teams',
    description: 'A comprehensive guide for engineering leaders on building high-ROI AI training programs. Includes ROI frameworks, implementation strategies, and success metrics.',
    targetKeywords: [
      'corporate AI training programs',
      'AI upskilling for developers',
      'engineering team AI training',
      'AI training ROI',
      'engineering leader AI strategy',
      'corporate AI education',
    ],
    audience: 'engineering-leaders',
    category: 'strategy',
    level: 'intermediate',
    targetWordCount: 8000,
    status: 'planned',
    structure: 'mongodb', // Will be generated and stored in MongoDB
    priority: 'high',
    relatedRoles: ['engineering-director', 'vp-engineering', 'cto', 'engineering-manager'],
    relatedTags: ['leadership', 'training', 'upskilling', 'roi', 'strategy'],
  },
  {
    id: 'ai-assisted-software-development',
    slug: 'ultimate-guide-to-ai-assisted-software-development',
    title: 'Ultimate Guide to AI-Assisted Software Development',
    description: 'Comprehensive guide to integrating AI across the entire software development lifecycle. From requirements to deployment, learn how AI transforms engineering workflows.',
    targetKeywords: [
      'AI in software development',
      'AI-assisted coding',
      'AI software engineering',
      'AI development tools',
      'AI coding assistants',
      'AI in SDLC',
    ],
    audience: 'hybrid',
    category: 'guide',
    level: 'intermediate',
    targetWordCount: 10000,
    status: 'planned',
    structure: 'mongodb',
    priority: 'high',
    relatedRoles: ['engineer', 'senior-engineer', 'tech-lead', 'architect', 'engineering-director'],
    relatedTags: ['ai-tools', 'code-generation', 'ai-development', 'sdlc', 'software-engineering'],
  },
  {
    id: 'ai-first-engineering-organization',
    slug: 'building-an-ai-first-engineering-organization',
    title: 'Building an AI-First Engineering Organization',
    description: 'Transform your engineering organization into an AI-first powerhouse. Strategic guide for Directors, VPs, and CTOs on building AI-native teams, infrastructure, and culture.',
    targetKeywords: [
      'AI-first engineering',
      'AI-native company',
      'transforming engineering with AI',
      'AI transformation strategy',
      'building AI-first engineering team',
      'engineering director AI strategy',
      'VP engineering AI transformation',
    ],
    audience: 'engineering-leaders',
    category: 'strategy',
    level: 'advanced',
    targetWordCount: 8000,
    status: 'planned',
    structure: 'mongodb',
    priority: 'high',
    relatedRoles: ['engineering-director', 'vp-engineering', 'cto', 'product-director', 'vp-product'],
    relatedTags: ['leadership', 'transformation', 'ai-strategy', 'organizational-change', 'culture'],
  },
];

/**
 * Get pillar page by ID or slug
 */
export function getPillarPage(idOrSlug: string): PillarPageConfig | undefined {
  return PILLAR_PAGES.find(
    (page) => page.id === idOrSlug || page.slug === idOrSlug
  );
}

/**
 * Get all pillar pages by status
 */
export function getPillarPagesByStatus(
  status: PillarPageConfig['status']
): PillarPageConfig[] {
  return PILLAR_PAGES.filter((page) => page.status === status);
}

/**
 * Get all pillar pages by audience
 */
export function getPillarPagesByAudience(
  audience: PillarPageConfig['audience']
): PillarPageConfig[] {
  return PILLAR_PAGES.filter((page) => page.audience === audience);
}

/**
 * Get all pillar pages by category
 */
export function getPillarPagesByCategory(
  category: PillarPageConfig['category']
): PillarPageConfig[] {
  return PILLAR_PAGES.filter((page) => page.category === category);
}

/**
 * Get pillar pages that relate to a specific role
 */
export function getPillarPagesForRole(role: string): PillarPageConfig[] {
  return PILLAR_PAGES.filter(
    (page) =>
      page.relatedRoles?.includes(role) ||
      page.relatedRoles?.some((r) => role.includes(r))
  );
}

/**
 * Get pillar pages that relate to specific tags
 */
export function getPillarPagesByTags(tags: string[]): PillarPageConfig[] {
  return PILLAR_PAGES.filter((page) =>
    page.relatedTags?.some((tag) => tags.includes(tag))
  );
}

/**
 * Get all complete pillar pages (for linking)
 */
export function getCompletePillarPages(): PillarPageConfig[] {
  return PILLAR_PAGES.filter((page) => page.status === 'complete');
}

/**
 * Get all planned pillar pages (for generation)
 */
export function getPlannedPillarPages(): PillarPageConfig[] {
  return PILLAR_PAGES.filter((page) => page.status === 'planned');
}

