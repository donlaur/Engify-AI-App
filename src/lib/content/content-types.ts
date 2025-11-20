/**
 * Content Type Definitions
 * Defines all content types with their configurations for AI-assisted generation
 */

export interface ContentTypeConfig {
  id: string;
  name: string;
  description: string;
  targetWordCount: number;
  agents: ('seo' | 'sme' | 'agile' | 'editor')[];
  features: {
    codeExamples?: boolean;
    faqs?: boolean;
    internalLinks?: boolean;
    metaDescription?: boolean;
    images?: boolean;
    diagrams?: boolean;
  };
  estimatedCost: number; // USD
  estimatedTime: number; // minutes
  recommendedModel: {
    seo?: string; // Model ID from MongoDB
    sme?: string;
    agile?: string;
    editor?: string;
  };
}

export const CONTENT_TYPES: Record<string, ContentTypeConfig> = {
  'pillar-page': {
    id: 'pillar-page',
    name: 'Pillar Page',
    description: 'SEO anchor page (8,000+ words)',
    targetWordCount: 8000,
    agents: ['seo', 'sme', 'agile', 'editor'],
    features: {
      codeExamples: true,
      faqs: true,
      internalLinks: true,
      metaDescription: true,
    },
    estimatedCost: 0.25,
    estimatedTime: 10,
    recommendedModel: {
      seo: 'gpt-4o-mini',
      sme: 'gpt-4o', // Higher quality for technical accuracy
      agile: 'gpt-4o-mini',
      editor: 'gpt-4o-mini',
    },
  },
  'hub-spoke': {
    id: 'hub-spoke',
    name: 'Hub & Spoke',
    description: '1 hub + 5-10 spokes',
    targetWordCount: 3000,
    agents: ['seo', 'sme', 'editor'],
    features: {
      internalLinks: true,
      metaDescription: true,
    },
    estimatedCost: 1.50,
    estimatedTime: 60,
    recommendedModel: {
      seo: 'gpt-4o-mini',
      sme: 'gpt-4o',
      editor: 'gpt-4o-mini',
    },
  },
  'tutorial': {
    id: 'tutorial',
    name: 'Tutorial Article',
    description: 'Step-by-step guide (1,500-3,000 words)',
    targetWordCount: 2000,
    agents: ['sme', 'editor'],
    features: {
      codeExamples: true,
      images: true,
    },
    estimatedCost: 0.10,
    estimatedTime: 5,
    recommendedModel: {
      sme: 'gpt-4o',
      editor: 'gpt-4o-mini',
    },
  },
  'guide': {
    id: 'guide',
    name: 'Guide Article',
    description: 'Comprehensive reference (2,000-4,000 words)',
    targetWordCount: 3000,
    agents: ['sme', 'editor'],
    features: {
      codeExamples: true,
      faqs: true,
    },
    estimatedCost: 0.15,
    estimatedTime: 7,
    recommendedModel: {
      sme: 'gpt-4o',
      editor: 'gpt-4o-mini',
    },
  },
  'news': {
    id: 'news',
    name: 'News Update',
    description: 'Short news/update (300-800 words)',
    targetWordCount: 500,
    agents: ['editor'],
    features: {},
    estimatedCost: 0.02,
    estimatedTime: 2,
    recommendedModel: {
      editor: 'gpt-4o-mini',
    },
  },
  'case-study': {
    id: 'case-study',
    name: 'Case Study',
    description: 'Real-world example (1,500-2,500 words)',
    targetWordCount: 2000,
    agents: ['sme', 'editor'],
    features: {
      images: true,
    },
    estimatedCost: 0.10,
    estimatedTime: 5,
    recommendedModel: {
      sme: 'gpt-4o',
      editor: 'gpt-4o-mini',
    },
  },
  'comparison': {
    id: 'comparison',
    name: 'Comparison Article',
    description: 'Compare tools/approaches (1,500-2,500 words)',
    targetWordCount: 2000,
    agents: ['sme', 'editor'],
    features: {
      codeExamples: true,
    },
    estimatedCost: 0.10,
    estimatedTime: 5,
    recommendedModel: {
      sme: 'gpt-4o',
      editor: 'gpt-4o-mini',
    },
  },
  'best-practices': {
    id: 'best-practices',
    name: 'Best Practices',
    description: 'Actionable recommendations (1,000-2,000 words)',
    targetWordCount: 1500,
    agents: ['sme', 'agile', 'editor'],
    features: {
      codeExamples: true,
    },
    estimatedCost: 0.08,
    estimatedTime: 4,
    recommendedModel: {
      sme: 'gpt-4o-mini',
      agile: 'gpt-4o-mini',
      editor: 'gpt-4o-mini',
    },
  },
};

/**
 * Get content type configuration by ID
 */
export function getContentType(id: string): ContentTypeConfig | undefined {
  return CONTENT_TYPES[id];
}

/**
 * Get all content type configurations
 */
export function getAllContentTypes(): ContentTypeConfig[] {
  return Object.values(CONTENT_TYPES);
}

/**
 * Get content types by agent requirement
 */
export function getContentTypesByAgent(agent: 'seo' | 'sme' | 'agile' | 'editor'): ContentTypeConfig[] {
  return Object.values(CONTENT_TYPES).filter(type => type.agents.includes(agent));
}

/**
 * Get content types by estimated cost range
 */
export function getContentTypesByCostRange(minCost: number, maxCost: number): ContentTypeConfig[] {
  return Object.values(CONTENT_TYPES).filter(
    type => type.estimatedCost >= minCost && type.estimatedCost <= maxCost
  );
}
