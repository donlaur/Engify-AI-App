import type { Metadata } from 'next';
import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import {
  loadGuardrailsFromJson,
} from '@/lib/workflows/load-guardrails-from-json';
import { GuardrailsClient } from './GuardrailsClient';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

export const revalidate = 3600; // Revalidate once per hour

export async function generateMetadata(): Promise<Metadata> {
  const guardrails = await loadGuardrailsFromJson();
  const title = `${guardrails.length} AI Guardrails: Prevention Patterns for Production Safety | Engify.ai`;
  const description =
    'Browse 70+ automated guardrails that prevent AI-generated code issues. Filter by severity (critical, high, medium) and category (data integrity, security, performance, availability, financial, integration, testing).';

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/guardrails`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/guardrails`,
      type: 'website',
      siteName: 'Engify.ai',
      images: [
        {
          url: `${APP_URL}/og-images/default.png`,
          width: 1200,
          height: 630,
          alt: 'AI Guardrails Library',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${APP_URL}/og-images/default.png`],
    },
    keywords: [
      'ai guardrails',
      'automated guardrails',
      'ai code quality',
      'prevention patterns',
      'ai safety automation',
      'data integrity guardrails',
      'security guardrails',
      'performance guardrails',
      'production safety',
      'code quality gates',
      'ai code review',
      'automated testing',
      'ai workflow automation',
      'financial guardrails',
      'integration testing',
    ],
    authors: [{ name: 'Donnie Laur' }],
  };
}

export default async function GuardrailsPage() {
  const allGuardrails = await loadGuardrailsFromJson();
  const guardrails = allGuardrails.filter((w) => w.status === 'published');

  // Calculate subcategory stats
  const subcategoryStats = guardrails.reduce((acc, guardrail) => {
    if (guardrail.subcategory) {
      acc[guardrail.subcategory] = (acc[guardrail.subcategory] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate severity stats
  const severityStats = guardrails.reduce((acc, guardrail) => {
    if (guardrail.severity) {
      acc[guardrail.severity] = (acc[guardrail.severity] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Get unique subcategories and severities
  const uniqueSubcategories = [...new Set(guardrails.map((g) => g.subcategory).filter(Boolean))].sort() as string[];
  const uniqueSeverities = [...new Set(guardrails.map((g) => g.severity).filter(Boolean))].sort() as string[];

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI Guardrails Library',
    description: `Browse ${guardrails.length} automated guardrails that prevent AI-generated code issues before they reach production.`,
    url: `${APP_URL}/guardrails`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: guardrails.length,
      itemListElement: guardrails.slice(0, 50).map((guardrail, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'HowTo',
          name: guardrail.title,
          description: guardrail.problemStatement,
          url: `${APP_URL}/workflows/${guardrail.category}/${guardrail.slug}`,
          about: {
            '@type': 'Thing',
            name: guardrail.subcategory || 'Guardrail',
          },
        },
      })),
    },
    about: {
      '@type': 'Thing',
      name: 'AI Guardrails and Prevention Patterns',
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
        <div className="container py-10">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <Icons.chevronRight className="h-4 w-4" />
            <Link href="/workflows" className="hover:text-primary">
              Workflows
            </Link>
            <Icons.chevronRight className="h-4 w-4" />
            <span className="text-foreground">Guardrails</span>
          </nav>

          <header className="mb-12 rounded-xl border bg-gradient-to-br from-primary/10 via-background to-background p-10 text-center">
            <div className="mx-auto max-w-3xl space-y-4">
              <h1 className="text-4xl font-bold md:text-5xl">
                AI Guardrails: Prevention Patterns for Production Safety
              </h1>
              <p className="text-lg text-muted-foreground">
                Automated quality gates that enforce workflow checklists automatically. Transform manual
                processes into always-on automation that prevents pain points before code reaches production.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" variant="outline">
                  <Link href="/workflows">
                    <Icons.arrowLeft className="mr-2 h-4 w-4" /> Back to Workflows
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/workflows/pain-points">View Pain Points</Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 text-center">
              <div className="text-3xl font-bold">{guardrails.length}</div>
              <div className="text-sm text-muted-foreground">Total Guardrails</div>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center">
              <div className="text-3xl font-bold">{uniqueSubcategories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center">
              <div className="text-3xl font-bold">
                {severityStats.critical || 0}
              </div>
              <div className="text-sm text-muted-foreground">Critical Severity</div>
            </div>
          </div>

          {/* Guardrails Library */}
          <section id="guardrails-library" className="mb-16">
            <GuardrailsClient
              initialGuardrails={guardrails}
              subcategoryStats={subcategoryStats}
              severityStats={severityStats}
              uniqueSubcategories={uniqueSubcategories}
              uniqueSeverities={uniqueSeverities}
            />
          </section>
        </div>
      </MainLayout>
    </>
  );
}

