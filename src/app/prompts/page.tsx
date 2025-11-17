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
import { loadPromptsFromJson } from '@/lib/prompts/load-prompts-from-json';
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
  // Load from static JSON (fast, no MongoDB at build time)
  const prompts = await loadPromptsFromJson();

  // Sort prompts alphabetically by default (server-side)
  const sortedPrompts = [...prompts].sort((a, b) => 
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  );

  // Calculate stats from actual prompts (more reliable than cache during active filter rollout)
  const uniqueCategories = [...new Set(sortedPrompts.map((p) => p.category).filter(Boolean))]
    .sort((a, b) => (a as string).localeCompare(b as string)); // Alphabetical sort

  const uniqueRoles = [...new Set(sortedPrompts.map((p) => p.role).filter(Boolean))]
    .sort((a, b) => (a as string).localeCompare(b as string)); // Alphabetical sort

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

  // Calculate unique patterns and pattern stats
  const uniquePatterns = [...new Set(sortedPrompts.map((p) => p.pattern).filter(Boolean))]
    .sort((a, b) => (a || '').localeCompare(b || ''));
  
  const patternStats = sortedPrompts.reduce((acc, prompt) => {
    if (prompt.pattern) {
      acc[prompt.pattern] = (acc[prompt.pattern] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

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
          {/* Hero Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold">Prompt Playbooks</h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Browse and discover {totalPrompts} proven prompt playbooks for your workflow.
              Expert-crafted prompts for engineers, managers, directors, and product teams.
            </p>
          </div>

          {/* Why Use Prompts Section */}
          <div className="mb-8 rounded-lg border bg-card p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-bold">Why Use Proven Prompts?</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-lg font-semibold">⚡ Save Time & Increase Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Well-crafted prompts produce better results faster. Our prompts are battle-tested 
                  and optimized for clarity, specificity, and actionable outputs.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">🎯 Role-Specific Solutions</h3>
                <p className="text-sm text-muted-foreground">
                  Find prompts tailored to your role—from individual contributors to engineering directors. 
                  Each prompt addresses real-world challenges specific to your responsibilities.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">📚 Learn Best Practices</h3>
                <p className="text-sm text-muted-foreground">
                  Every prompt follows proven patterns like Chain-of-Thought, KERNEL Framework, 
                  and structured reasoning. Learn by example and improve your prompt engineering skills.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">🔄 Consistent Results</h3>
                <p className="text-sm text-muted-foreground">
                  Proven prompts deliver reliable, high-quality outputs. No more trial and error— 
                  use prompts that have been refined through real-world application.
                </p>
              </div>
            </div>
          </div>

          {/* Types of Prompts Section */}
          <div className="mb-8 rounded-lg border bg-card p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-bold">Types of Prompts</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="mb-2 text-lg font-semibold">🔧 Code Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Generate code, refactor legacy systems, write tests, and create documentation. 
                  Perfect for accelerating development workflows.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">📊 Architecture & Design</h3>
                <p className="text-sm text-muted-foreground">
                  System design, technical decisions, scalability planning, and architecture reviews. 
                  Essential for senior engineers and architects.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">👥 Leadership & Management</h3>
                <p className="text-sm text-muted-foreground">
                  1-on-1s, performance reviews, team building, and strategic planning. 
                  Designed for managers, directors, and VPs.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">🐛 Debugging & Troubleshooting</h3>
                <p className="text-sm text-muted-foreground">
                  Root cause analysis, error diagnosis, performance optimization, and incident response. 
                  Critical for on-call engineers and SREs.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">📈 Product & Strategy</h3>
                <p className="text-sm text-muted-foreground">
                  PRDs, roadmaps, user research, A/B testing, and product strategy. 
                  Tailored for product managers and product directors.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">🔍 Code Review & Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Automated code reviews, security audits, best practices, and quality gates. 
                  Improve code quality and catch issues early.
                </p>
              </div>
            </div>
          </div>

          {/* Compact Stats */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="text-2xl font-bold">{totalPrompts}</div>
              <div className="text-xs text-muted-foreground">Total Prompts</div>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="text-2xl font-bold">{uniqueCategories.length}</div>
              <div className="text-xs text-muted-foreground">Categories</div>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="text-2xl font-bold">{uniqueRoles.length}</div>
              <div className="text-xs text-muted-foreground">Roles</div>
            </div>
          </div>

          {/* Client-side filtering component */}
          <LibraryClient
            initialPrompts={sortedPrompts as never as any}
            categoryStats={categoryStats}
            roleStats={roleStats}
            patternStats={patternStats}
            uniqueCategories={uniqueCategories}
            uniqueRoles={uniqueRoles}
            uniquePatterns={uniquePatterns}
          />
        </div>
      </MainLayout>
    </>
  );
}
