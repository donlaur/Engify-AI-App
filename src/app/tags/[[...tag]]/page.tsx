/**
 * Tag Page with Catch-All Route
 * Handles tags with slashes (e.g., /tags/ci/cd -> /tags/ci%2Fcd)
 * Also handles single-segment tags for backwards compatibility
 */

import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { APP_URL } from '@/lib/constants';
import TagPageClient from '../[tag]/tag-page-client';
import {
  decodeTagFromUrl,
  getTagVariations,
  isValidTagUrl,
} from '@/lib/utils/tag-encoding';
import { promptRepository } from '@/lib/db/repositories/ContentService';
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';

async function getPromptsByTag(tag: string) {
  try {
    // Use repository instead of direct collection access
    const prompts = await promptRepository.findByTag(tag.toLowerCase());
    
    // Filter public prompts and sort
    const publicPrompts = prompts
      .filter((p) => p.isPublic !== false)
      .sort((a, b) => {
        // Sort by featured first, then by views
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.views || 0) - (a.views || 0);
      })
      .slice(0, 100);

    return publicPrompts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      content: p.content,
      category: p.category,
      role: p.role,
      pattern: p.pattern,
      tags: p.tags || [],
      isFeatured: p.isFeatured || false,
      views: p.views || 0,
      rating: p.rating || p.stats?.averageRating || 0,
      ratingCount: p.ratingCount || p.stats?.totalRatings || 0,
      createdAt: p.createdAt || new Date(),
    }));
  } catch (error) {
    console.error('Error fetching prompts by tag:', error);
    // Fallback to static data
    const allPrompts = getSeedPromptsWithTimestamps();
    return allPrompts.filter((p) =>
      p.tags && p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }
}

export async function generateMetadata({ params }: { params: Promise<{ tag?: string[] }> }): Promise<Metadata> {
  try {
    const { tag: tagArray } = await params;
    
    // If tag has multiple segments (e.g., ["ci", "cd"]), this is a multi-segment tag
    // We'll handle the redirect in the page component, but return basic metadata here
    if (tagArray && tagArray.length > 1) {
      return {
        title: 'Redirecting... | Engify.ai',
      };
    }
    
    // Single segment tag (normal case)
    const tag = tagArray?.[0] || '';
    
    // Validate tag URL format
    if (!isValidTagUrl(tag)) {
      return {
        title: 'Invalid Tag | Engify.ai',
        description: 'The requested tag URL is invalid.',
      };
    }

    // Decode and normalize tag from URL
    const { normalized } = decodeTagFromUrl(tag);

    // Get all tag variations for database lookup
    const tagVariations = getTagVariations(tag);
    
    // Try to find prompts with any of the tag variations
    const allPrompts = [];
    for (const tagVar of tagVariations) {
      const prompts = await getPromptsByTag(tagVar);
      allPrompts.push(...prompts);
    }
    
    // Remove duplicates based on prompt ID
    const uniquePrompts = Array.from(
      new Map(allPrompts.map(p => [p.id, p])).values()
    );

    // Normalize tag for display (title case)
    const displayTag = normalized
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const title = `${displayTag} - Prompt Engineering Prompts | Engify.ai`;
    const description = `Explore ${uniquePrompts.length} prompt${uniquePrompts.length !== 1 ? 's' : ''} tagged with "${displayTag}". Find prompts for ${displayTag.toLowerCase()} and improve your prompt engineering skills.`;
    
    // Use normalized tag for canonical URL (consistent, URL-safe)
    const normalizedUrlTag = encodeURIComponent(normalized);
    const url = `${APP_URL}/tags/${normalizedUrlTag}`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
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
      },
    };
  } catch (error) {
    console.error('Error generating tag metadata', error);
    return {
      title: 'Tag Not Found | Engify.ai',
      description: 'The requested tag could not be found.',
    };
  }
}

export default async function TagPageCatchAll({ params }: { params: Promise<{ tag?: string[] }> }) {
  try {
    const { tag: tagArray } = await params;
    
    // If tag has multiple segments (e.g., ["ci", "cd"]), redirect to encoded single-segment URL
    if (tagArray && tagArray.length > 1) {
      const joinedTag = tagArray.join('/');
      const encodedTag = encodeURIComponent(joinedTag);
      permanentRedirect(`/tags/${encodedTag}`);
    }
    
    const tag = tagArray?.[0] || '';
    
    // Validate tag URL format
    if (!isValidTagUrl(tag)) {
      console.warn('Invalid tag URL format', { tag });
      notFound();
    }

    // Decode and normalize tag from URL
    const { decoded, normalized } = decodeTagFromUrl(tag);
    
    // Get all tag variations for database lookup
    const tagVariations = getTagVariations(tag);
    
    // Try to find prompts with any of the tag variations
    const allPrompts = [];
    for (const tagVar of tagVariations) {
      const prompts = await getPromptsByTag(tagVar);
      allPrompts.push(...prompts);
    }
    
    // Remove duplicates based on prompt ID
    const uniquePrompts = Array.from(
      new Map(allPrompts.map(p => [p.id, p])).values()
    );

    // Normalize tag for display (title case)
    const displayTag = normalized
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Generate JSON-LD structured data
    const normalizedUrlTag = encodeURIComponent(normalized);
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${displayTag} Prompts`,
      description: `A collection of ${uniquePrompts.length} prompt engineering prompts tagged with "${displayTag}"`,
      url: `${APP_URL}/tags/${normalizedUrlTag}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: uniquePrompts.length,
        itemListElement: uniquePrompts.slice(0, 10).map((prompt, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Article',
            name: prompt.title,
            description: prompt.description,
            url: `${APP_URL}/prompts/${prompt.id || prompt.slug}`,
          },
        })),
      },
      about: {
        '@type': 'Thing',
        name: displayTag,
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <TagPageClient
          tag={normalized}
          displayTag={displayTag}
          taggedPrompts={uniquePrompts as any}
        />
      </>
    );
  } catch (error) {
    console.error('Error rendering tag page', error);
    notFound();
  }
}

