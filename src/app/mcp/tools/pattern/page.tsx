/**
 * Pattern Tool Page
 * Curated code patterns that work
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Pattern Tool - Curated Code Patterns That Work | Engify MCP',
  description:
    '50+ battle-tested code patterns for TypeScript, Python, React, and APIs. Select patterns by task, inject into your code, and get coaching feedback on your implementations.',
  openGraph: {
    title: 'Pattern Tool - Curated Code Patterns That Work | Engify MCP',
    description:
      '50+ battle-tested code patterns for TypeScript, Python, React, and APIs.',
    url: 'https://engify.ai/mcp/tools/pattern',
  },
};
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, AlertCircle } from 'lucide-react';

const painPoints = [
  {
    title: '"AI reinvents the wheel badly"',
    description:
      "Every time you ask for error handling, you get a different approach. AI doesn't know your team's established patterns.",
  },
  {
    title: '"Inconsistent code across the team"',
    description:
      'Five developers, five different ways to handle the same problem. Code reviews become debates about style.',
  },
  {
    title: '"Best practices are scattered"',
    description:
      "Knowledge lives in docs, Slack threads, and senior engineers' heads. No single source of truth for \"how we do things.\"",
  },
  {
    title: '"New devs don\'t know the conventions"',
    description:
      "Onboarding takes weeks. Junior devs submit PRs that don't match established patterns.",
  },
];

const patternCategories = [
  {
    name: 'TypeScript',
    abbrev: 'TS',
    items: [
      'Result type error handling',
      'Discriminated unions',
      'Type guards',
      'Builder patterns',
      'Dependency injection',
    ],
    color: 'blue',
  },
  {
    name: 'Python',
    abbrev: 'PY',
    items: [
      'Context managers',
      'Dataclasses',
      'Async patterns',
      'Protocol types',
      'Pydantic validation',
    ],
    color: 'yellow',
  },
  {
    name: 'React',
    abbrev: 'RX',
    items: [
      'Custom hooks',
      'Compound components',
      'Render props',
      'Error boundaries',
      'Optimistic updates',
    ],
    color: 'cyan',
  },
  {
    name: 'API Design',
    abbrev: 'API',
    items: [
      'REST conventions',
      'Error responses',
      'Pagination',
      'Rate limiting',
      'Versioning',
    ],
    color: 'green',
  },
  {
    name: 'Universal',
    abbrev: '*',
    items: [
      'Input validation',
      'Logging',
      'Configuration',
      'Retry logic',
      'Feature flags',
    ],
    color: 'purple',
  },
  {
    name: 'Go',
    abbrev: 'GO',
    items: [
      'Error wrapping',
      'Context handling',
      'Interface design',
      'Concurrency',
      'Testing patterns',
    ],
    color: 'teal',
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Select by Task',
    description:
      'Describe what you\'re building. Get matching patterns ranked by relevance.',
    code: `pattern({ action: 'select', task: 'add authentication to API' })
// Returns: JWT auth, session management, middleware patterns`,
  },
  {
    step: 2,
    title: 'Inject Pattern',
    description:
      'Apply a pattern to your existing code with context-aware modifications.',
    code: `pattern({
  action: 'inject',
  patternId: 'TS-ERR-001',
  code: '...'
})`,
  },
  {
    step: 3,
    title: 'Get Coaching',
    description:
      'Submit code for pattern review. Get scored on adherence with specific suggestions.',
    code: `pattern({
  action: 'coach',
  code: '...',
  filePath: 'src/auth.ts'
})
// Returns: { score: 85, suggestions: [...], praise: [...] }`,
  },
];

const feedbackLoop = [
  'AI suggests a pattern',
  'You modify or reject it',
  'System learns from your correction',
  'New patterns emerge from repeated behaviors',
];

const colorClasses: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  green: { bg: 'bg-green-500/20', text: 'text-green-400' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-400' },
};

export default function PatternToolPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-500/20">
              <Layers className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold md:text-5xl">pattern</h1>
              <p className="text-lg text-blue-300">
                Curated code patterns that work
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-xl text-muted-foreground">
            50+ battle-tested patterns for error handling, API design,
            authentication, and more. Select by task, inject into code, and get
            coaching feedback on your implementations.
          </p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">Problems This Solves</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {painPoints.map((point) => (
              <Card key={point.title}>
                <CardContent className="pt-6">
                  <AlertCircle className="mb-3 h-6 w-6 text-red-400" />
                  <h3 className="mb-2 font-semibold">{point.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {point.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pattern Categories */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">Pattern Library</h2>
          <p className="mb-8 text-muted-foreground">
            Organized by language and domain. Each pattern includes rationale,
            examples, and anti-patterns to avoid.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {patternCategories.map((category) => {
              const colors = colorClasses[category.color];
              return (
                <Card key={category.name}>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg font-mono font-bold ${colors.bg} ${colors.text}`}
                      >
                        {category.abbrev}
                      </div>
                      <h3 className="font-semibold">{category.name}</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {category.items.map((item) => (
                        <li key={item}>&#x2022; {item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">How It Works</h2>
          <div className="space-y-6">
            {howItWorks.map((step) => (
              <Card key={step.step}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">
                      {step.step}
                    </span>
                    <h3 className="font-semibold text-blue-400">{step.title}</h3>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm">
                    <code className="text-green-400">{step.code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Loop */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">Learns From Your Team</h2>
          <p className="mb-8 text-muted-foreground">
            Pattern discovery finds new patterns from your team&apos;s code
            corrections and preferences.
          </p>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-3 font-semibold">Feedback Loop</h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    {feedbackLoop.map((item, i) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400">
                          {i + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex-1">
                  <h3 className="mb-3 font-semibold">Team Metrics</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Track which patterns your team uses most, acceptance rates,
                    and adoption across projects.
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm">
                    <code className="text-green-400">{`pattern({
  action: 'metrics',
  teamId: 'platform-team'
})`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold">
            Consistent patterns, better code
          </h2>
          <p className="mb-8 text-muted-foreground">
            Stop debating style. Start using proven patterns your whole team can
            follow.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600" asChild>
              <Link href="/mcp#get-started">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/mcp">View All Tools</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
