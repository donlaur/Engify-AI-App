import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { APP_URL } from '@/lib/constants';
import PatternDetailClient from './pattern-detail-client';
import {
  generatePatternMetadata,
  generateCourseSchema,
} from '@/lib/seo/metadata';
import { patternRepository } from '@/lib/db/repositories/ContentService';
import { logger } from '@/lib/logging/logger';

// Mark as dynamic to prevent DYNAMIC_SERVER_USAGE errors
// MongoDB operations trigger dynamic detection, so we must explicitly mark as dynamic
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: { pattern: string };
}): Promise<Metadata> {
  try {
    const patternSlug = decodeURIComponent(params.pattern);
    const pattern = await patternRepository.getById(patternSlug);

    if (!pattern) {
      return {
        title: 'Pattern Not Found | Engify.ai',
        description: 'The requested pattern could not be found.',
      };
    }

    return generatePatternMetadata({
      key: pattern.id,
      title: pattern.name,
      description: pattern.description,
      benefits: pattern.bestPractices || [],
    });
  } catch (error) {
    logger.error('Failed to generate pattern metadata', { error, params });
    return {
      title: 'Pattern | Engify.ai',
      description: 'Explore prompt engineering patterns.',
    };
  }
}

export default async function PatternDetailPage({
  params,
}: {
  params: { pattern: string };
}) {
  try {
    const patternSlug = decodeURIComponent(params.pattern);
    const pattern = await patternRepository.getById(patternSlug);

    if (!pattern) {
      notFound();
    }

  // Generate Course schema for rich results
  const courseSchema = generateCourseSchema(
    {
      key: pattern.id,
      title: pattern.name,
      description: pattern.description,
      benefits: pattern.bestPractices || [],
    },
    `${APP_URL}/patterns/${encodeURIComponent(pattern.id)}`
  );

  // Also include Article schema for additional SEO
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: pattern.name,
    description: pattern.description,
    url: `${APP_URL}/patterns/${encodeURIComponent(pattern.id)}`,
    author: {
      '@type': 'Organization',
      name: 'Engify.ai',
      url: APP_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Engify.ai',
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${APP_URL}/patterns/${encodeURIComponent(pattern.id)}`,
    },
    about: {
      '@type': 'Thing',
      name: 'Prompt Engineering',
      description: 'The practice of crafting effective prompts for AI models',
    },
    keywords: [
      'prompt engineering',
      'AI patterns',
      pattern.name.toLowerCase(),
      'prompt patterns',
    ].join(', '),
  };

  return (
    <>
      {/* Course Schema for rich results */}
      <script
        type="application/ld+json"
        // SECURITY: JSON-LD is safe - it's JSON.stringify of our own data, no user input
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      {/* Article Schema for additional SEO */}
      <script
        type="application/ld+json"
        // SECURITY: JSON-LD is safe - it's JSON.stringify of our own data, no user input
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <PatternDetailClient pattern={pattern} />
    </>
  );
  } catch (error) {
    logger.error('Failed to load pattern detail page', { error, params });
    throw error; // Let Next.js error boundary handle it
  }
}
