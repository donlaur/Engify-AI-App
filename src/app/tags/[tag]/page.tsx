import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { APP_URL } from '@/lib/constants';
import TagPageClient from './tag-page-client';
import { getMongoDb } from '@/lib/db/mongodb';

async function getPromptsByTag(tag: string) {
  try {
    const db = await getMongoDb();
    const collection = db.collection('prompts');
    
    // Use MongoDB index for efficient tag filtering
    const prompts = await collection
      .find({
        tags: { $in: [tag.toLowerCase()] },
        isPublic: true,
      })
      .sort({ isFeatured: -1, views: -1 })
      .limit(100)
      .toArray();

    return prompts.map((p) => ({
      id: p.id || p._id.toString(),
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
    const { getSeedPromptsWithTimestamps } = await import('@/data/seed-prompts');
    const allPrompts = getSeedPromptsWithTimestamps();
    return allPrompts.filter((p) => 
      p.tags && p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }
}

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  try {
    const tag = decodeURIComponent(params.tag);
    
    // Normalize tag for display
    const normalizedTag = tag.replace(/\//g, '-');
    const displayTag = normalizedTag
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Get prompts with this tag (try both original and normalized)
    const taggedPrompts = await getPromptsByTag(tag);
    const normalizedPrompts = tag !== normalizedTag ? await getPromptsByTag(normalizedTag) : [];
    const allPrompts = [...taggedPrompts, ...normalizedPrompts];
    const uniquePrompts = Array.from(
      new Map(allPrompts.map(p => [p.id, p])).values()
    );

    const title = `${displayTag} - Prompt Engineering Prompts | Engify.ai`;
    const description = `Explore ${uniquePrompts.length} prompt${uniquePrompts.length !== 1 ? 's' : ''} tagged with "${displayTag}". Find prompts for ${displayTag.toLowerCase()} and improve your prompt engineering skills.`;
    const url = `${APP_URL}/tags/${encodeURIComponent(tag)}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
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
    keywords: [
      'prompt engineering',
      'AI prompts',
      displayTag.toLowerCase(),
      'prompt library',
      'AI tools',
      'prompt templates',
    ],
  };
  } catch (error) {
    // Return fallback metadata on error
    return {
      title: 'Tag Not Found | Engify.ai',
      description: 'The requested tag could not be found.',
    };
  }
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  try {
    const tag = decodeURIComponent(params.tag);
    
    // Normalize tag: replace slashes with hyphens for URL compatibility
    // Tags like "CI/CD integration" become "CI-CD integration"
    const normalizedTag = tag.replace(/\//g, '-');
    
    const displayTag = normalizedTag
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Get prompts with this tag from MongoDB
    // Try both the original tag and normalized version
    const taggedPrompts = await getPromptsByTag(tag);
    const normalizedPrompts = tag !== normalizedTag ? await getPromptsByTag(normalizedTag) : [];
    const allPrompts = [...taggedPrompts, ...normalizedPrompts];
    
    // Remove duplicates based on prompt ID
    const uniquePrompts = Array.from(
      new Map(allPrompts.map(p => [p.id, p])).values()
    );

    // Generate JSON-LD structured data
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${displayTag} Prompts`,
      description: `A collection of ${uniquePrompts.length} prompt engineering prompts tagged with "${displayTag}"`,
      url: `${APP_URL}/tags/${encodeURIComponent(tag)}`,
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
          url: `${APP_URL}/library/${prompt.id || prompt.slug}`,
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
      <TagPageClient tag={tag} displayTag={displayTag} taggedPrompts={uniquePrompts} />
    </>
  );
  } catch (error) {
    console.error('Error loading tag page:', params.tag, error);
    // Return 404 for invalid tags
    notFound();
  }
}
