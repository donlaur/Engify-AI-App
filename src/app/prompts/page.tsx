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

  // Get stats from cache
  const data = await getStats();

  // Category counts for display
  const categoryStats = data.categories || [];
  const totalPrompts = data.stats.prompts;

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Prompt Library</h1>
          <p className="text-lg text-muted-foreground">
            Browse and discover {totalPrompts} proven prompts for your workflow
          </p>

          {/* Category counts */}
          {Object.keys(categoryStats).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(categoryStats).map(([category, count]) => (
                <div
                  key={category}
                  className="rounded-full bg-muted px-3 py-1 text-sm"
                >
                  <span className="font-medium capitalize">
                    {category.replace('-', ' ')}
                  </span>
                  <span className="ml-1 text-muted-foreground">
                    ({String(count)})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client-side filtering component */}
        <LibraryClient initialPrompts={prompts as never} />
      </div>
    </MainLayout>
  );
}
