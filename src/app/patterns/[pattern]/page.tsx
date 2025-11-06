import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { APP_URL } from '@/lib/constants';
import PatternDetailClient from './pattern-detail-client';
import {
  generatePatternMetadata,
  generateCourseSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/metadata';
import { patternRepository } from '@/lib/db/repositories/ContentService';
import { logger } from '@/lib/logging/logger';
import { CrossContentLinks } from '@/components/features/CrossContentLinks';

// Use ISR with MongoDB fallback (reliable in production)
// MongoDB is primary source - JSON is optional fast path
export const revalidate = 3600; // Revalidate every hour (ISR)
export const dynamicParams = true; // Allow dynamic params (patterns not pre-generated)

export async function generateMetadata({
  params,
}: {
  params: { pattern: string };
}): Promise<Metadata> {
  try {
    const patternSlug = decodeURIComponent(params.pattern);

    // For detail pages, use MongoDB directly to avoid DYNAMIC_SERVER_USAGE
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

    // For detail pages, use MongoDB directly to avoid DYNAMIC_SERVER_USAGE
    // JSON loading causes issues during static generation/ISR
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

    // Generate BreadcrumbList schema for navigation SEO
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: APP_URL },
      { name: 'Patterns', url: `${APP_URL}/patterns` },
      { name: pattern.name, url: `${APP_URL}/patterns/${encodeURIComponent(pattern.id)}` },
    ]);

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
        {/* BreadcrumbList Schema for navigation SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
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
        <PatternDetailClient pattern={pattern}>
          {/* Server Component: CrossContentLinks fetches data server-side */}
          <CrossContentLinks
            tags={pattern.tags || []}
            category={pattern.category}
            excludeId={pattern.id}
          />
        </PatternDetailClient>
      </>
    );
  } catch (error) {
    logger.error('Failed to load pattern detail page', { error, params });
    throw error; // Let Next.js error boundary handle it
  }
}
