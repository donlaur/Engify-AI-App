/**
 * Prompt Library Page
 *
 * Browse and search prompts
 * Filter by category and role
 * 
 * Performance: Server-side rendering for instant load
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { LibraryClient } from '@/components/features/LibraryClient';
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';

// Server Component - renders instantly with static data
export default function LibraryPage() {
  // Use static seed data for instant load
  const prompts = getSeedPromptsWithTimestamps();

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Prompt Library</h1>
          <p className="text-lg text-muted-foreground">
            Browse and discover proven prompts for your workflow
          </p>
        </div>

        {/* Client-side filtering component */}
        <LibraryClient initialPrompts={prompts} />
      </div>
    </MainLayout>
  );
}
