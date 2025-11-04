/**
 * SEO Metadata Utilities - Programmatic Templates
 *
 * Creates unique, SEO-optimized metadata for all content types
 * following the training platform positioning strategy.
 *
 * Templates ensure:
 * - Unique meta descriptions (150-160 chars)
 * - Keyword-rich titles
 * - Training platform focus
 * - Schema markup support
 */

import type { Metadata } from 'next';
import { APP_URL } from '@/lib/constants';

// Training-focused keyword phrases
const TRAINING_KEYWORDS = [
  'AI training platform',
  'engineering teams',
  'prompt engineering training',
  'developer training',
  'corporate AI training',
];

/**
 * Generate unique metadata for prompt pages
 * Template: [Prompt Name] | A Proven AI Prompt for [Use Case] | Engify.ai
 */
export function generatePromptMetadata(
  prompt: {
    title: string;
    description: string;
    category: string;
    role?: string | null;
    pattern?: string | null;
    tags?: string[];
    views?: number;
    rating?: number;
  },
  categoryLabel: string,
  roleLabel: string | null,
  patternLabel: string | null
): Metadata {
  // Build title: [Prompt Name] | A Proven AI Prompt for [Use Case] | Engify.ai
  const useCase = roleLabel
    ? `${categoryLabel} for ${roleLabel.toLowerCase()}s`
    : categoryLabel;

  const title = `${prompt.title} | A Proven AI Prompt for ${useCase} | Engify.ai`;

  // Build unique description (150-160 chars)
  // Template: Learn to use the [Prompt Name] prompt to solve [Problem]. Get examples and best practices from Engify.ai, the AI training platform for engineering teams.
  const descriptionParts: string[] = [];

  // Start with learning angle
  descriptionParts.push(`Learn to use the "${prompt.title}" prompt`);

  // Add specific use case
  if (roleLabel) {
    descriptionParts.push(
      `to solve ${categoryLabel.toLowerCase()} challenges for ${roleLabel.toLowerCase()}s`
    );
  } else {
    descriptionParts.push(`for ${categoryLabel.toLowerCase()}`);
  }

  // Add pattern context if available
  if (patternLabel) {
    descriptionParts.push(`using the ${patternLabel} pattern`);
  }

  // Add training platform CTA
  descriptionParts.push(
    'Get examples and best practices from Engify.ai, the AI training platform for engineering teams.'
  );

  let description = descriptionParts.join('. ');

  // Ensure length is optimal (150-160 chars)
  if (description.length > 160) {
    // Trim intelligently
    description = description.substring(0, 157) + '...';
  } else if (description.length < 120) {
    // Add more context if too short
    description +=
      ' Master prompt engineering with structured learning paths and proven patterns.';
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }
  }

  const slug = prompt.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const url = `${APP_URL}/prompts/${slug}`;

  // Build keywords array
  const keywords = [
    prompt.title,
    `${prompt.title} prompt`,
    categoryLabel,
    `${categoryLabel} prompt`,
    ...(roleLabel
      ? [`${roleLabel} prompts`, `prompts for ${roleLabel.toLowerCase()}s`]
      : []),
    ...(patternLabel
      ? [patternLabel, `${patternLabel.toLowerCase()} pattern`]
      : []),
    ...TRAINING_KEYWORDS,
    'prompt engineering training',
    'AI prompt template',
    ...(prompt.tags || []),
  ].filter(Boolean);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    keywords,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'Engify.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@engifyai',
    },
  };
}

/**
 * Generate unique metadata for pattern pages
 * Template: The [Pattern Name] Pattern | Master this Prompt Engineering Technique | Engify.ai
 */
export function generatePatternMetadata(pattern: {
  key: string;
  title: string;
  description: string;
  benefits?: string[];
}): Metadata {
  // Build title: The [Pattern Name] Pattern | Master this Prompt Engineering Technique | Engify.ai
  const title = `The ${pattern.title} Pattern | Master this Prompt Engineering Technique | Engify.ai`;

  // Build unique description (150-160 chars)
  // Template: A complete guide to the [Pattern Name] prompt engineering pattern. Understand how it works, see examples, and learn how to apply it to your engineering workflow with Engify.ai.
  let description = `A complete guide to the ${pattern.title} prompt engineering pattern. `;
  description += pattern.description;

  // Add training angle
  if (pattern.benefits && pattern.benefits.length > 0) {
    description += ` Learn ${pattern.benefits.length} key benefits: ${pattern.benefits.slice(0, 2).join(', ')}.`;
  }

  description +=
    ' Master this technique with Engify.ai, the AI training platform for engineering teams.';

  // Ensure optimal length
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  const url = `${APP_URL}/patterns/${pattern.key}`;

  const keywords = [
    pattern.title,
    `${pattern.title} pattern`,
    'prompt engineering',
    'prompt patterns',
    'AI prompt techniques',
    ...TRAINING_KEYWORDS,
    'prompt engineering training',
    'developer training',
  ];

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    keywords,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'Engify.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@engifyai',
    },
  };
}

/**
 * Generate unique metadata for collection pages
 * Template: Expert AI Prompts for [Topic] | Engify.ai
 */
export function generateCollectionMetadata(
  topic: string,
  promptCount: number
): Metadata {
  const title = `Expert AI Prompts for ${topic} | Engify.ai`;

  // Build unique description
  let description = `A curated collection of ${promptCount} battle-tested AI prompts for ${topic.toLowerCase()}. `;
  description += `Improve your team's productivity with these expert templates from Engify.ai, the AI training platform for engineering teams.`;

  // Ensure optimal length
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const url = `${APP_URL}/collections/${slug}`;

  const keywords = [
    `AI prompts for ${topic.toLowerCase()}`,
    `${topic} prompts`,
    'prompt templates',
    ...TRAINING_KEYWORDS,
    'prompt engineering training',
  ];

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    keywords,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Engify.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@engifyai',
    },
  };
}

/**
 * Generate HowTo schema for prompt pages
 * Structured data for rich results in search
 */
export function generateHowToSchema(
  prompt: {
    title: string;
    description: string;
    content: string;
    category: string;
    role?: string | null;
  },
  categoryLabel: string,
  roleLabel: string | null,
  url: string
) {
  // Extract steps from prompt content if structured
  const steps: Array<{ '@type': string; text: string; position: number }> = [];

  // Try to parse structured steps from content
  const stepMatches = prompt.content.match(/Step \d+[:\-]?\s*(.+)/gi);
  if (stepMatches && stepMatches.length > 0) {
    stepMatches.forEach((match, index) => {
      const text = match.replace(/Step \d+[:\-]?\s*/i, '').trim();
      if (text) {
        steps.push({
          '@type': 'HowToStep',
          text,
          position: index + 1,
        });
      }
    });
  } else {
    // Fallback: create steps from content structure
    const paragraphs = prompt.content
      .split('\n\n')
      .filter((p) => p.trim().length > 50);
    paragraphs.slice(0, 5).forEach((para, index) => {
      steps.push({
        '@type': 'HowToStep',
        text: para.trim().substring(0, 200),
        position: index + 1,
      });
    });
  }

  // If no steps found, create a single step
  if (steps.length === 0) {
    steps.push({
      '@type': 'HowToStep',
      text: prompt.description || prompt.content.substring(0, 200),
      position: 1,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: prompt.title,
    description: prompt.description,
    step: steps,
    totalTime: 'PT5M', // Estimated 5 minutes
    tool: {
      '@type': 'HowToTool',
      name: 'AI Assistant',
      description: 'ChatGPT, Claude, Gemini, or other AI model',
    },
    ...(roleLabel && {
      audience: {
        '@type': 'Audience',
        audienceType: roleLabel,
      },
    }),
    about: {
      '@type': 'Thing',
      name: categoryLabel,
    },
    url,
  };
}

/**
 * Generate Course schema for pattern pages
 * Structured data for rich results in search
 */
export function generateCourseSchema(
  pattern: {
    key: string;
    title: string;
    description: string;
    benefits?: string[];
  },
  url: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${pattern.title} Prompt Engineering Pattern`,
    description: pattern.description,
    provider: {
      '@type': 'Organization',
      name: 'Engify.ai',
      url: APP_URL,
    },
    courseCode: pattern.key,
    educationalLevel: 'Advanced',
    teaches: [
      'Prompt Engineering',
      pattern.title,
      ...(pattern.benefits || []).map((b) =>
        b.replace(/Improved|Higher|Better|Reduced/i, '').trim()
      ),
    ].filter(Boolean),
    url,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor: {
        '@type': 'Organization',
        name: 'Engify.ai',
      },
    },
  };
}

/**
 * Generate FAQPage schema
 * For pillar pages and key landing pages
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
