import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { APP_URL } from '@/lib/constants';
import PatternDetailClient from './pattern-detail-client';
import {
  generatePatternMetadata,
  generateCourseSchema,
} from '@/lib/seo/metadata';
import { patternRepository } from '@/lib/db/repositories/ContentService';
import { loadPatternFromJson } from '@/lib/patterns/load-patterns-from-json';
import { logger } from '@/lib/logging/logger';

// Use ISR with static JSON (best performance + SEO)
// Static JSON loads fast (no cold starts), ISR caches HTML (perfect SEO)
export const revalidate = 3600; // Revalidate every hour (ISR)
export const dynamicParams = true; // Allow dynamic params (patterns not pre-generated)

export async function generateMetadata({
  params,
}: {
  params: { pattern: string };
}): Promise<Metadata> {
  try {
    const patternSlug = decodeURIComponent(params.pattern);
    
    // Try static JSON first (fast, no cold starts), then MongoDB fallback
    let pattern;
    try {
      pattern = await Promise.race([
        loadPatternFromJson(patternSlug),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Pattern fetch timeout')), 8000)
        ),
      ]);
      
      // If not found in JSON, try MongoDB
      if (!pattern) {
        pattern = await patternRepository.getById(patternSlug);
      }
    } catch (error) {
      logger.error('Failed to generate pattern metadata', { error, params });
      // Fallback to MongoDB
      try {
        pattern = await patternRepository.getById(patternSlug);
      } catch (dbError) {
        logger.error('MongoDB fallback also failed', { dbError, params });
        return {
          title: 'Pattern | Engify.ai',
          description: 'Explore prompt engineering patterns.',
        };
      }
    }

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
    
    // Try static JSON first (fast, no cold starts), then MongoDB fallback
    let pattern;
    try {
      pattern = await Promise.race([
        loadPatternFromJson(patternSlug),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Pattern fetch timeout')), 8000)
        ),
      ]);
      
      // If not found in JSON, try MongoDB
      if (!pattern) {
        pattern = await patternRepository.getById(patternSlug);
      }
    } catch (error) {
      logger.error('Failed to load pattern from JSON, trying MongoDB fallback', {
        error: error instanceof Error ? error.message : 'Unknown error',
        patternSlug,
      });
      // Fallback to MongoDB
      try {
        pattern = await patternRepository.getById(patternSlug);
      } catch (dbError) {
        logger.error('MongoDB fallback also failed', { dbError, patternSlug });
        notFound();
      }
    }

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
