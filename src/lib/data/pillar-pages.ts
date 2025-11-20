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
    description: 'A comprehensive strategic playbook for engineering leaders on building high-ROI AI training programs. Includes ROI frameworks, implementation strategies, build vs. buy analysis, and success metrics.',
    targetKeywords: [
      'corporate AI training programs',
      'AI upskilling for developers',
      'engineering team AI training',
      'AI training ROI',
      'engineering leader AI strategy',
      'corporate AI education',
      // High-priority strategic keywords (from Gemini research)
      'measuring AI impact engineering team',
      'AI competency framework for engineers',
      'build vs buy AI training',
      'CTO guide to AI adoption',
      'integrating AI into SDLC training',
      'AI upskilling case study engineering',
      'how to calculate ROI on employee AI adoption',
      'what metrics measure AI impact on developer productivity',
      'AI implementation roadmap for enterprise',
      'challenges of AI implementation in engineering',
      'AI training for software developers vs data scientists',
      'GenAI upskilling for software engineers topics',
      'AI-first leadership development',
      'AI adoption psychological safety',
    ],
    audience: 'engineering-leaders',
    category: 'strategy',
    level: 'intermediate',
    targetWordCount: 8000,
    status: 'complete',
    structure: 'mongodb',
    priority: 'high',
    relatedRoles: ['engineering-director', 'vp-engineering', 'cto', 'engineering-manager'],
    relatedTags: ['leadership', 'training', 'upskilling', 'roi', 'strategy'],
    updatedAt: new Date('2025-11-06'),
  },
  {
    id: 'ultimate-guide-ai-assisted-development',
    slug: 'ultimate-guide-to-ai-assisted-software-development',
    title: 'Ultimate Guide to AI-Assisted Software Development',
    description: 'The definitive guide to integrating AI across the entire software development lifecycle. From SDLC frameworks to enterprise ROI, security, and tool comparisons. Addresses the "tip of the iceberg" reality and provides strategic frameworks for engineers, architects, and directors.',
    targetKeywords: [
      // Core keywords
      'AI in software development',
      'AI-assisted coding',
      'AI software engineering',
      'AI development tools',
      'AI coding assistants',
      // High-priority SDLC keywords (from Gemini research)
      'AI in SDLC',
      'AI-driven development lifecycle',
      'AI-DLC',
      'AI across software development lifecycle',
      'generative AI in SDLC',
      // Legacy code & modernization
      'AI for legacy code',
      'AI-powered code modernization',
      'AI code refactoring',
      // Enterprise & ROI keywords
      'AI development tool ROI',
      'measuring AI developer productivity',
      'on-premise vs cloud AI coding tools',
      'AI-generated code security',
      'securing AI coding assistants',
      'Shadow AI',
      'AI code vulnerabilities',
      // Tool comparison keywords
      'GitHub Copilot vs Amazon Q Developer',
      'Cursor vs Copilot',
      'best open source AI coding assistant',
      'AI coding assistant context vs IQ',
      'AI-powered code review tools',
      // Advanced concepts
      'AI agentic coding framework',
      'AI-autonomous development',
      'AI agents for coding',
      'RAG retrieval augmented generation',
      'prompt engineering for developers',
      // Question-based queries
      'will AI replace software engineers',
      'is AI-generated code secure',
      'AI coding copyright risks',
      'what is AI-driven development lifecycle',
      'how does AI handle legacy code refactoring',
    ],
    audience: 'hybrid',
    category: 'guide',
    level: 'intermediate',
    targetWordCount: 15000, // Updated from 10k to 15k per research recommendation
    status: 'complete',
    structure: 'mongodb',
    priority: 'high',
    relatedRoles: ['engineer', 'senior-engineer', 'tech-lead', 'architect', 'engineering-director'],
    relatedTags: ['ai-tools', 'code-generation', 'ai-development', 'sdlc', 'software-engineering', 'ai-security', 'roi', 'devops'],
    updatedAt: new Date('2025-11-06'),
  },
  {
    id: 'ai-first-engineering-organization',
    slug: 'building-an-ai-first-engineering-organization',
    title: 'Building an AI-First Engineering Organization',
    description: 'Transform your engineering organization into an AI-first powerhouse. Strategic playbook for Directors, VPs, and CTOs on building AI-native teams, infrastructure, culture, and measurement frameworks. Covers verifiability metrics, context engineering, and organizational transformation.',
    targetKeywords: [
      'AI-first engineering',
      'AI-native company',
      'transforming engineering with AI',
      'AI transformation strategy',
      'building AI-first engineering team',
      'engineering director AI strategy',
      'VP engineering AI transformation',
      // High-priority strategic keywords (from Gemini research)
      'AI-first vs AI-native',
      'AI engineering KPIs',
      'AI transformation roadmap',
      'AI engineering team structure',
      'MLOps and data governance strategy',
      'AI maturity model',
      'what is context engineering',
      'what is AI verifiability',
      'centralized vs decentralized AI team',
      'CTO playbook for AI transformation',
      'common pitfalls AI transformation',
      'role of product director in AI',
      'agentic AI',
      'confidence velocity',
      'reasoning transparency',
      'data lineage',
      'AI governance framework',
      'federated learning',
      'change management AI adoption',
    ],
    audience: 'engineering-leaders',
    category: 'strategy',
    level: 'advanced',
    targetWordCount: 8000,
    status: 'complete',
    structure: 'mongodb',
    priority: 'high',
    relatedRoles: ['engineering-director', 'vp-engineering', 'cto', 'product-director', 'vp-product'],
    relatedTags: ['leadership', 'transformation', 'ai-strategy', 'organizational-change', 'culture'],
    updatedAt: new Date('2025-11-06'),
  },
  {
    id: 'ai-enabled-sdlc',
    slug: 'ai-sdlc',
    title: 'AI-Enabled Software Development Lifecycle (AI-SDLC): The Complete Guide',
    description: 'Learn what an AI-enabled software development lifecycle is, how it improves planning and execution, and how to implement AI-SDLC using patterns, guardrails, memory layers, and PBVR workflows.',
    targetKeywords: [
      'ai-enabled software development lifecycle',
      'ai-sdlc',
      'ai-enabled sdlc',
      'ai-augmented software development',
      'ai software development lifecycle framework',
      'ai in sdlc',
      'software development lifecycle with ai',
      'pbvr cycle',
      'ai memory layer',
      'guardrails for ai development',
    ],
    audience: 'hybrid',
    category: 'guide',
    level: 'intermediate',
    targetWordCount: 8000,
    status: 'complete',
    structure: 'static',
    filePath: 'src/app/ai-sdlc/page.tsx',
    priority: 'high',
    relatedRoles: ['engineer', 'senior-engineer', 'tech-lead', 'architect', 'engineering-manager', 'engineering-director'],
    relatedTags: ['ai-sdlc', 'pbvr', 'memory-layer', 'guardrails', 'workflows', 'patterns'],
    createdAt: new Date('2025-11-20'),
    updatedAt: new Date('2025-11-20'),
  },
  {
    id: 'ai-enabled-agile',
    slug: 'ai-enabled-agile',
    title: 'AI-Enabled Agile: How to Use AI in Sprints, Ceremonies, and Backlog Workflows',
    description: 'A practical guide to AI-Enabled Agile. Learn how to use AI in sprint planning, backlog grooming, standups, retrospectives, and Agile workflows using Engify patterns, memory, and guardrails.',
    targetKeywords: [
      'ai in agile software development',
      'ai-enabled agile',
      'ai-augmented agile',
      'ai in agile ceremonies',
      'ai sprint planning',
      'ai backlog grooming',
      'ai standup workflow',
      'ai retrospectives',
      'how agile works with ai',
      'ai-enabled agile workflows',
    ],
    audience: 'practitioners',
    category: 'guide',
    level: 'intermediate',
    targetWordCount: 6000,
    status: 'complete',
    structure: 'static',
    filePath: 'src/app/ai-enabled-agile/page.tsx',
    priority: 'high',
    relatedRoles: ['scrum-master', 'product-manager', 'engineering-manager', 'tech-lead', 'engineer'],
    relatedTags: ['agile', 'scrum', 'sprint-planning', 'ceremonies', 'pbvr', 'wsjf'],
    createdAt: new Date('2025-11-20'),
    updatedAt: new Date('2025-11-20'),
  },
  {
    id: 'ai-estimation-reality-check',
    slug: 'ai-estimation-reality-check',
    title: 'AI Time Estimation Reality Check: Why AI Gets Timelines Wrong and How to Fix It',
    description: 'AI time estimates are often wrong by 10–20×. Learn how to use Engify\'s MCP estimator, PBVR cycles, and historical baselines to generate more realistic timelines for software projects.',
    targetKeywords: [
      'ai time estimation',
      'ai estimation reality check',
      'time estimation with ai',
      'ai enabled estimation for software projects',
      'ai project estimation',
      'wsjf prioritization',
      'ai capacity planning',
      'ai roadmap planning',
      'why ai estimates fail',
      '5 percent rule ai estimation',
    ],
    audience: 'hybrid',
    category: 'guide',
    level: 'intermediate',
    targetWordCount: 5000,
    status: 'planned',
    structure: 'static',
    priority: 'high',
    relatedRoles: ['product-manager', 'engineering-manager', 'tech-lead', 'scrum-master'],
    relatedTags: ['estimation', 'wsjf', 'planning', 'capacity-planning', 'mcp'],
    createdAt: new Date('2025-11-20'),
  },
  {
    id: 'ai-assisted-engineering-workflows',
    slug: 'ai-workflows',
    title: 'AI-Assisted Engineering Workflows: Patterns, Guardrails, and PBVR',
    description: 'Learn how engineers use AI in day-to-day work with safe, predictable workflows: PBVR cycles, guardrails, AI PR reviews, test generation, documentation, refactoring, and more.',
    targetKeywords: [
      'ai assisted software engineering workflows',
      'ai engineering workflows',
      'patterns for ai assisted engineers',
      'guardrails for ai assisted development',
      'pbvr cycle',
      'ai pr review',
      'ai test generation',
      'ai documentation workflow',
      'ai refactoring workflow',
      'ai debugging workflow',
    ],
    audience: 'practitioners',
    category: 'guide',
    level: 'intermediate',
    targetWordCount: 7000,
    status: 'planned',
    structure: 'static',
    priority: 'high',
    relatedRoles: ['engineer', 'senior-engineer', 'tech-lead'],
    relatedTags: ['workflows', 'pbvr', 'patterns', 'guardrails', 'pr-review', 'testing', 'documentation'],
    createdAt: new Date('2025-11-20'),
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

