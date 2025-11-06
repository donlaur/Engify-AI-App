/**
 * AI Summary: Prompt Library Page - Browse and filter prompts by category and role
 * Server-side rendered page with dynamic SEO metadata. Fetches prompts from MongoDB,
 * displays stats (total prompts, categories, roles), and provides filtering/search.
 * Includes JSON-LD structured data for SEO. Part of Day 7 QA improvements.
 * Last updated: 2025-11-02
 */

import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { LibraryClient } from '@/components/features/LibraryClient';
import { promptRepository } from '@/lib/db/repositories/ContentService';
import { getServerStats } from '@/lib/server-stats';
import { getPromptSlug } from '@/lib/utils/slug';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

// Dynamic SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  const data = await getServerStats();
  const promptCount = data.prompts?.total || data.stats?.prompts || 0;
  const categoryCount = data.prompts?.uniqueCategories?.length || 0;
  const roleCount = data.prompts?.uniqueRoles?.length || 0;

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
  // Fetch prompts directly from MongoDB (reliable, no JSON loading issues)
  const prompts = await promptRepository.getAll();

  // Sort prompts alphabetically by default (server-side)
  const sortedPrompts = [...prompts].sort((a, b) => 
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  );

  // Calculate stats from actual prompts (more reliable than cache during active filter rollout)
  const uniqueCategories = [...new Set(sortedPrompts.map((p) => p.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b)); // Alphabetical sort
  
  const uniqueRoles = [...new Set(sortedPrompts.map((p) => p.role).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b)); // Alphabetical sort

  // Calculate category counts from actual prompts
  const categoryStats = sortedPrompts.reduce((acc, prompt) => {
    if (prompt.category) {
      acc[prompt.category] = (acc[prompt.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate role counts from actual prompts
  const roleStats = sortedPrompts.reduce((acc, prompt) => {
    if (prompt.role) {
      acc[prompt.role] = (acc[prompt.role] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalPrompts = sortedPrompts.length;

  // Generate JSON-LD structured data for SEO - include ALL prompts
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Prompt Library',
    description: `Browse ${totalPrompts} expert prompts for engineering teams`,
    url: `${APP_URL}/prompts`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalPrompts,
      itemListElement: sortedPrompts.map((prompt, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          name: prompt.title,
          description: prompt.description,
          url: `${APP_URL}/prompts/${getPromptSlug(prompt)}`,
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
            <h1 className="mb-2 text-4xl font-bold">Prompt Playbooks</h1>
            <p className="text-lg text-muted-foreground">
              Browse and discover {totalPrompts} proven prompt playbooks for your
              workflow
            </p>
          </div>

          {/* Client-side filtering component */}
          <LibraryClient
            initialPrompts={sortedPrompts as never}
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
