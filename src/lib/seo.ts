/**
 * SEO Utilities and Metadata
 * Comprehensive SEO configuration for all pages
 */

export interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const defaultSEO: SEOConfig = {
  title: 'Engify.ai - AI Guardrail Platform with Institutional Memory',
  description:
    'Operationalize AI guardrails across code, security, and delivery. Engify pairs documented workflows with automation hooks and memory so teams ship faster without regressions.',
  canonical: 'https://engify.ai',
  ogImage: 'https://engify.ai/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  keywords: [
    'AI guardrails',
    'guardrail automation',
    'engineering governance',
    'prompt governance',
    'ai risk management',
    'incident prevention',
    'software delivery controls',
    'compliance automation',
    'institutional memory',
    'engify',
  ],
  author: 'Engify.ai',
};

export const pageSEO: Record<string, SEOConfig> = {
  home: {
    title:
      'Engify.ai - Operationalize AI Guardrails with Engify Workflows',
    description:
      'Documented guardrail workflows, automation hooks, and institutional memory that prevent AI regressions. Ship responsibly with Engify.',
    keywords: [
      'AI guardrails',
      'guardrail automation',
      'engineering governance',
      'prompt governance',
      'ai risk management',
      'institutional memory',
    ],
  },

  audit: {
    title: 'Free Prompt Audit Tool - KERNEL Framework Analysis | Engify.ai',
    description:
      'Analyze your prompts for free using our KERNEL framework. Get instant quality scoring, issue detection, and auto-improved versions. No signup required.',
    keywords: [
      'prompt audit',
      'prompt analyzer',
      'KERNEL framework',
      'prompt quality',
      'free AI tool',
      'prompt checker',
      'prompt improvement',
    ],
    ogType: 'website',
  },

  workbench: {
    title: 'AI Workbench - Test Prompts Across 4 Providers | Engify.ai',
    description:
      'Test your prompts across OpenAI, Claude, Gemini, and Groq. Compare responses, speed, and costs side-by-side. Free testing with rate limits.',
    keywords: [
      'AI workbench',
      'prompt testing',
      'multi-provider testing',
      'OpenAI vs Claude',
      'AI comparison',
      'prompt playground',
    ],
  },

  library: {
    title:
      '100+ Expert Prompts Library - Role-Based & Pattern-Tagged | Engify.ai',
    description:
      'Browse 100+ expert-crafted prompts for engineers, managers, designers, and more. All tagged with proven patterns and KERNEL-compliant.',
    keywords: [
      'prompt library',
      'prompt templates',
      'AI prompts',
      'role-based prompts',
      'engineering prompts',
      'business prompts',
    ],
  },

  patterns: {
    title: '15 Proven Prompt Patterns - Complete Guide | Engify.ai',
    description:
      'Master 15 research-backed prompt patterns: Persona, Chain-of-Thought, RAG, Few-Shot, and more. Interactive examples and use cases.',
    keywords: [
      'prompt patterns',
      'chain of thought',
      'few-shot learning',
      'RAG prompting',
      'persona pattern',
      'prompt engineering techniques',
    ],
  },

  kernel: {
    title:
      'KERNEL Framework - 94% Success Rate, 58% Token Reduction | Engify.ai',
    description:
      'Learn our 6-principle KERNEL framework for enterprise-grade prompts. Proven results: 94% success rate and 58% token reduction.',
    keywords: [
      'KERNEL framework',
      'prompt quality',
      'enterprise prompts',
      'prompt optimization',
      'token reduction',
      'prompt success rate',
    ],
  },

  learning: {
    title:
      '68+ Learning Resources - Academic & Industry Best Practices | Engify.ai',
    description:
      'Comprehensive learning library with academic research, video courses, and tutorials. Validated by MIT, Wharton, and Vanderbilt.',
    keywords: [
      'prompt engineering course',
      'AI learning',
      'prompt tutorials',
      'academic research',
      'AI education',
      'prompt training',
    ],
  },

  aiCoding: {
    title:
      'AI Coding Tools Guide - Cursor, Windsurf, Copilot Reviews | Engify.ai',
    description:
      'Comprehensive reviews of 6 AI coding tools. Comparison matrix, use case guides, and expert ratings. Find the best tool for your needs.',
    keywords: [
      'AI coding tools',
      'Cursor review',
      'Windsurf Cascade',
      'GitHub Copilot',
      'AI code assistant',
      'coding AI comparison',
    ],
  },
};

/**
 * Generate structured data for SEO
 */
interface StructuredDataInput {
  title?: string;
  description?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateStructuredData(
  type: 'Organization' | 'WebSite' | 'Article' | 'Course',
  data?: StructuredDataInput
) {
  const baseUrl = 'https://engify.ai';

  const schemas: Record<string, Record<string, unknown>> = {
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Engify.ai',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description: 'Research-backed prompt engineering platform',
      sameAs: [
        'https://twitter.com/engify_ai',
        'https://linkedin.com/company/engify-ai',
        'https://github.com/donlaur/Engify-AI-App',
      ],
    },

    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Engify.ai',
      url: baseUrl,
      description: 'Master prompt engineering with research-backed patterns',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/library?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },

    Article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data?.title || defaultSEO.title,
      description: data?.description || defaultSEO.description,
      author: {
        '@type': 'Organization',
        name: 'Engify.ai',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Engify.ai',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
      datePublished: data?.publishedTime,
      dateModified: data?.modifiedTime,
    },

    Course: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: data?.title || 'Prompt Engineering Mastery',
      description:
        data?.description || 'Learn prompt engineering from basics to advanced',
      provider: {
        '@type': 'Organization',
        name: 'Engify.ai',
      },
    },
  };

  return schemas[type];
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(config: SEOConfig) {
  const canonical = config.canonical || defaultSEO.canonical;
  const ogImage = config.ogImage || defaultSEO.ogImage;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords?.join(', '),
    canonical,
    openGraph: {
      title: config.title,
      description: config.description,
      url: canonical,
      siteName: 'Engify.ai',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
      type: config.ogType || 'website',
    },
    twitter: {
      card: config.twitterCard || 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [ogImage],
      creator: '@engify_ai',
      site: '@engify_ai',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generate sitemap URLs
 */
export const sitemapUrls = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/audit', priority: 0.9, changefreq: 'weekly' },
  { url: '/workbench', priority: 0.9, changefreq: 'weekly' },
  { url: '/library', priority: 0.8, changefreq: 'daily' },
  { url: '/patterns', priority: 0.8, changefreq: 'weekly' },
  { url: '/kernel', priority: 0.8, changefreq: 'weekly' },
  { url: '/learning', priority: 0.7, changefreq: 'weekly' },
  { url: '/ai-coding', priority: 0.7, changefreq: 'weekly' },
  { url: '/pattern-playground', priority: 0.6, changefreq: 'weekly' },
];
