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
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';
import { generateMetaTags, pageSEO } from '@/lib/seo';
import { PromptService } from '@/lib/services/PromptService';
import { getQuickStats } from '@/lib/services/StatsService';

// SEO Metadata
export const metadata: Metadata = generateMetaTags(pageSEO.library) as Metadata;

// Server Component - queries MongoDB for real data
export default async function LibraryPage() {
  // Get prompts from MongoDB using service
  let prompts;
  let stats;

  try {
    const promptService = new PromptService();
    const promptsData = await promptService.find({ isPublic: true });

    // Convert to format expected by client - schema mismatch between MongoDB and client types
    prompts = promptsData.map((p) => {
      const doc = p as unknown as Record<string, unknown>;
      return {
        ...p,
        id: doc._id?.toString() || '',
        views: ((doc.stats as Record<string, unknown>)?.views as number) || 0,
        rating:
          ((doc.stats as Record<string, unknown>)?.averageRating as number) ||
          0,
        ratingCount:
          ((doc.stats as Record<string, unknown>)?.ratings as unknown[])
            ?.length || 0,
        createdAt: (doc.createdAt as Date) || new Date(),
        updatedAt: (doc.updatedAt as Date) || new Date(),
      };
    });

    // Get category counts
    stats = await getQuickStats();
  } catch (error) {
    console.error(
      'Failed to fetch prompts from MongoDB, using seed data:',
      error
    );
    prompts = getSeedPromptsWithTimestamps();
    stats = null;
  }

  // Category counts for display
  const categoryStats = stats?.prompts.byCategory || {};
  const totalPrompts = stats?.prompts.total || prompts.length;

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
                  <span className="ml-1 text-muted-foreground">({count})</span>
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
