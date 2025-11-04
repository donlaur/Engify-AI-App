'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import Link from 'next/link';
import type { Pattern } from '@/lib/db/schemas/pattern';
import { PatternPrompts } from '@/components/features/PatternPrompts';
import type { ReactNode } from 'react';

interface PatternDetailClientProps {
  pattern: Pattern;
  children?: ReactNode; // For server-rendered CrossContentLinks
}

export default function PatternDetailClient({ pattern, children }: PatternDetailClientProps) {
  const levelColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  // Convert pattern example to before/after format if needed
  const example = typeof pattern.example === 'string'
    ? { before: '', after: pattern.example, explanation: '' }
    : pattern.example || { before: '', after: '', explanation: '' };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <Icons.chevronRight className="h-4 w-4" />
          <Link href="/patterns" className="hover:text-primary">
            Patterns
          </Link>
          <Icons.chevronRight className="h-4 w-4" />
          <span className="text-foreground">{pattern.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold">{pattern.name}</h1>
              <p className="text-xl text-muted-foreground">
                {pattern.description}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={levelColors[pattern.level]}>
                {pattern.level}
              </Badge>
              <Badge variant="outline">{pattern.category}</Badge>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Full Description */}
          {(pattern.fullDescription || pattern.description) && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                <Icons.info className="h-6 w-6 text-blue-600" />
                What Is This Pattern?
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {pattern.fullDescription || pattern.description}
              </p>
            </section>
          )}

          {/* How It Works */}
          {pattern.howItWorks && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                <Icons.settings className="h-6 w-6 text-purple-600" />
                How It Works
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {pattern.howItWorks}
              </p>
            </section>
          )}

          {/* Use Cases */}
          {pattern.useCases && pattern.useCases.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                <Icons.check className="h-6 w-6 text-green-600" />
                When To Use This Pattern
              </h2>
              <ul className="space-y-2">
                {pattern.useCases.map((useCase, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icons.arrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-muted-foreground">{useCase}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Example */}
          {example.after && (
            <section className="rounded-lg border bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                <Icons.code className="h-6 w-6 text-orange-600" />
                Example
              </h2>

              <div className="space-y-4">
                {example.before && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        ❌ Before (Weak)
                      </Badge>
                    </div>
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                      <code className="text-sm text-red-900 dark:text-red-100">
                        {example.before}
                      </code>
                    </div>
                  </div>
                )}

                {/* After */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className="bg-green-600 text-xs">
                      ✅ After (Strong)
                    </Badge>
                  </div>
                  <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                    <code className="whitespace-pre-wrap text-sm text-green-900 dark:text-green-100">
                      {example.after}
                    </code>
                  </div>
                </div>

                {/* Explanation */}
                {example.explanation && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Why this works:</strong> {example.explanation}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Best Practices */}
          {pattern.bestPractices && pattern.bestPractices.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                <Icons.sparkles className="h-6 w-6 text-yellow-600" />
                Best Practices
              </h2>
              <ul className="space-y-2">
                {pattern.bestPractices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-muted-foreground">{practice}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Common Mistakes */}
          {pattern.commonMistakes && pattern.commonMistakes.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                <Icons.alertTriangle className="h-6 w-6 text-red-600" />
                Common Mistakes to Avoid
              </h2>
              <ul className="space-y-2">
                {pattern.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icons.x className="mt-1 h-4 w-4 flex-shrink-0 text-red-600" />
                    <span className="text-muted-foreground">{mistake}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related Patterns */}
          {pattern.relatedPatterns && pattern.relatedPatterns.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                <Icons.link className="h-6 w-6 text-blue-600" />
                Related Patterns
              </h2>
              <div className="flex flex-wrap gap-2">
                {pattern.relatedPatterns.map((relatedId) => (
                  <Link key={relatedId} href={`/patterns/${encodeURIComponent(relatedId)}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">
                      {relatedId}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Example Prompts Using This Pattern */}
        <PatternPrompts patternId={pattern.id} />

        {/* Cross-Content Links (Server Component - passed as children) */}
        {children}

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link href="/patterns">
              <Icons.arrowLeft className="mr-2 h-4 w-4" />
              Back to Patterns
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/prompts?pattern=${encodeURIComponent(pattern.id)}`}>
              <Icons.library className="mr-2 h-4 w-4" />
              View All Prompts Using This Pattern
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}

