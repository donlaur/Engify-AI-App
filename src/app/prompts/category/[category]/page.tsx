import { Metadata } from 'next';
import { APP_URL } from '@/lib/constants';
import CategoryPageClient from './category-page-client';
import { loadPromptsFromJson } from '@/lib/prompts/load-prompts-from-json';

const CATEGORY_INFO: Record<string, { title: string; description: string }> = {
  'code-generation': {
    title: 'Code Generation',
    description:
      'Prompts for generating, reviewing, and improving code across multiple languages and frameworks.',
  },
  debugging: {
    title: 'Debugging',
    description:
      'Expert debugging assistance, error analysis, and troubleshooting prompts.',
  },
  documentation: {
    title: 'Documentation',
    description:
      'Create comprehensive documentation, API docs, technical writing, and knowledge base content.',
  },
  testing: {
    title: 'Testing',
    description:
      'Test generation, test strategy, quality assurance, and testing automation prompts.',
  },
  refactoring: {
    title: 'Refactoring',
    description:
      'Code refactoring, optimization, and modernization prompts for improving code quality.',
  },
  architecture: {
    title: 'Architecture',
    description:
      'System design, architecture decisions, technical strategy, and system planning prompts.',
  },
  learning: {
    title: 'Learning',
    description:
      'Educational prompts for learning new technologies, concepts, and best practices.',
  },
  general: {
    title: 'General',
    description:
      'General-purpose prompts for various engineering and product management tasks.',
  },
};

async function getPromptsByCategory(category: string) {
  try {
    // Use JSON first to avoid MongoDB timeouts
    const allPrompts = await loadPromptsFromJson();
    
    // Filter by category
    const prompts = allPrompts
      .filter((p) => p.category?.toLowerCase() === category.toLowerCase() && p.isPublic !== false)
      .sort((a, b) => {
        // Sort by featured first, then views
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.views || 0) - (a.views || 0);
      })
      .slice(0, 100);

    return prompts.map((p) => ({
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
    console.error('Error fetching prompts by category:', error);
    // Return empty array if JSON loading fails (app handles empty state)
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categoryParam } = await params;
  const category = decodeURIComponent(categoryParam);
  const categoryInfo = CATEGORY_INFO[category] || {
    title: category
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    description: `Explore prompt engineering prompts in the ${category} category.`,
  };

  // Get prompts in this category from MongoDB
  const categoryPrompts = await getPromptsByCategory(category);

  const title = `${categoryInfo.title} Prompts - Prompt Engineering Library | Engify.ai`;
  const description = `${categoryInfo.description} Browse ${categoryPrompts.length} prompt${categoryPrompts.length !== 1 ? 's' : ''} in this category.`;
  const url = `${APP_URL}/library/category/${encodeURIComponent(category)}`;

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
      categoryInfo.title.toLowerCase(),
      'prompt library',
      'AI tools',
      'prompt templates',
    ],
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryParam } = await params;
  const category = decodeURIComponent(categoryParam);
  const categoryInfo = CATEGORY_INFO[category] || {
    title: category
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    description: `Explore prompts in the ${category} category.`,
  };

  // Get prompts in this category from MongoDB
  const categoryPrompts = await getPromptsByCategory(category);

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryInfo.title} Prompts`,
    description: categoryInfo.description,
    url: `${APP_URL}/library/category/${encodeURIComponent(category)}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categoryPrompts.length,
      itemListElement: categoryPrompts.slice(0, 10).map((prompt, index) => ({
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
      name: categoryInfo.title,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // SECURITY: JSON-LD is safe - it's JSON.stringify of our own data, no user input
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPageClient
        category={category}
        categoryInfo={categoryInfo}
        categoryPrompts={categoryPrompts as any as any}
      />
    </>
  );
}
