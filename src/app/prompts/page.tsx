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
import { generateMetaTags, pageSEO } from '@/lib/seo';
import { getAllPrompts } from '@/lib/prompts/mongodb-prompts';
import { getStats } from '@/lib/stats-cache';

// SEO Metadata
export const metadata: Metadata = generateMetaTags(pageSEO.library) as Metadata;

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

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Prompt Library</h1>
          <p className="text-lg text-muted-foreground">
            Browse and discover {totalPrompts} proven prompts for your workflow
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
  );
}
