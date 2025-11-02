/**
 * Prompt Library Page
 *
 * Browse and search prompts
 * Filter by category and role
 *
 * Performance: Server-side rendering with MongoDB data
 */

import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { LibraryClient } from '@/components/features/LibraryClient';
import { getAllPrompts } from '@/lib/prompts/mongodb-prompts';
import { getStats } from '@/lib/stats-cache';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

// Dynamic SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  const data = await getStats();
  const promptCount = data.prompts?.total || data.stats?.prompts || 100;
  const categoryCount = data.prompts?.uniqueCategories?.length || 6;
  const roleCount = data.prompts?.uniqueRoles?.length || 7;

  const title = `${promptCount}+ Expert Prompts Library - ${categoryCount} Categories, ${roleCount} Roles | Engify.ai`;
  const description = `Browse ${promptCount}+ expert-crafted prompts across ${categoryCount} categories and ${roleCount} roles. All prompts are tagged with proven patterns and KERNEL-compliant. Free access during beta.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/prompts`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/prompts`,
      type: 'website',
      siteName: 'Engify.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: [
      'prompt library',
      'prompt templates',
      'AI prompts',
      'role-based prompts',
      'engineering prompts',
      'business prompts',
      'prompt engineering',
      'ChatGPT prompts',
      'Claude prompts',
    ],
  };
}

// Server Component
export default async function LibraryPage() {
  // Fetch prompts from MongoDB (production content)
  const prompts = await getAllPrompts();

  // Get stats from Redis cache (includes unique categories/roles)
  const data = await getStats();

  // Use cached unique categories and roles (or fallback to extraction)
  const uniqueCategories = data.prompts?.uniqueCategories || [
    ...new Set(prompts.map((p) => p.category).filter(Boolean)),
  ];
  const uniqueRoles = data.prompts?.uniqueRoles || [
    ...new Set(prompts.map((p) => p.role).filter(Boolean)),
  ];

  // Category and role counts (from Redis cache)
  const categoryStats = data.prompts?.byCategory || {};
  const roleStats = data.prompts?.byRole || {};
  const totalPrompts =
    data.prompts?.total || data.stats?.prompts || prompts.length;

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Prompt Library',
    description: `Browse ${totalPrompts} expert prompts for engineering teams`,
    url: `${APP_URL}/prompts`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalPrompts,
      itemListElement: prompts.slice(0, 10).map((prompt, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          name: prompt.title,
          description: prompt.description,
          url: `${APP_URL}/prompts/${prompt.id}`,
        },
      })),
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
      <MainLayout>
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">Prompt Library</h1>
            <p className="text-lg text-muted-foreground">
              Browse and discover {totalPrompts} proven prompts for your
              workflow
            </p>
          </div>

          {/* Client-side filtering component */}
          <LibraryClient
            initialPrompts={prompts as never}
            categoryStats={categoryStats}
            roleStats={roleStats}
            uniqueCategories={uniqueCategories}
            uniqueRoles={uniqueRoles}
          />
        </div>
      </MainLayout>
    </>
  );
}
