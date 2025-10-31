import { Metadata } from 'next';
import { APP_URL } from '@/lib/constants';
import TagPageClient from './tag-page-client';
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  const displayTag = tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Get prompts with this tag
  const allPrompts = getSeedPromptsWithTimestamps();
  const taggedPrompts = allPrompts.filter((p) => 
    p.tags && p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );

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

  // Get prompts with this tag
  const allPrompts = getSeedPromptsWithTimestamps();
  const taggedPrompts = allPrompts.filter((p) => 
    p.tags && p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );

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
          url: `${APP_URL}/library/${prompt.id}`,
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
