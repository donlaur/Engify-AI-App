/**
 * Prompt Library Page
 *
 * Browse and search prompts
 * Filter by category and role
 * 
 * Performance: Server-side rendering for instant load
 */

import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { LibraryClient } from '@/components/features/LibraryClient';
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

// SEO Metadata
export const metadata: Metadata = generateSEOMetadata({
  title: 'Prompt Library - 76+ Expert Prompts',
  description: 'Browse 76+ expert-crafted prompts for engineers, managers, designers, and PMs. Filter by role and category. Copy, customize, and use instantly.',
  keywords: [
    'prompt library',
    'AI prompts',
    'ChatGPT prompts',
    'prompt templates',
    'engineering prompts',
    'code generation prompts',
    'debugging prompts',
  ],
  canonical: '/library',
});

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
