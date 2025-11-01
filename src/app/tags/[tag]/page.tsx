import { Metadata } from 'next';
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
  const tag = decodeURIComponent(params.tag);
  const displayTag = tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Get prompts with this tag
  const taggedPrompts = await getPromptsByTag(tag);

  const title = `${displayTag} - Prompt Engineering Prompts | Engify.ai`;
  const description = `Explore ${taggedPrompts.length} prompt${taggedPrompts.length !== 1 ? 's' : ''} tagged with "${displayTag}". Find prompts for ${displayTag.toLowerCase()} and improve your prompt engineering skills.`;
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
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const displayTag = tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Get prompts with this tag from MongoDB
  const taggedPrompts = await getPromptsByTag(tag);

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${displayTag} Prompts`,
    description: `A collection of ${taggedPrompts.length} prompt engineering prompts tagged with "${displayTag}"`,
    url: `${APP_URL}/tags/${encodeURIComponent(tag)}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: taggedPrompts.length,
      itemListElement: taggedPrompts.slice(0, 10).map((prompt, index) => ({
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
      <TagPageClient tag={tag} displayTag={displayTag} taggedPrompts={taggedPrompts} />
    </>
  );
}
