import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Study: Building a Production SaaS in 7 Days with AI | Engify.ai',
  description:
    'Learn how to build enterprise-grade SaaS using AI augmented development. Git worktrees, multi-model strategy, automated guardrails, and systematic planning. Real commits, ADRs, and lessons learned.',
  keywords: [
    'AI augmented development',
    'build SaaS with AI',
    'Claude Sonnet 4.5',
    'Cursor IDE',
    'git worktrees',
    'enterprise SaaS development',
    'AI coding assistant case study',
    'production ready in 7 days',
    'systematic AI workflow',
    'pre-commit hooks',
  ],
  openGraph: {
    title: 'Case Study: Production SaaS Built in 7 Days Using AI',
    description:
      '1,357 commits, 12 ADRs, 620 tests. Learn the systematic process, guardrails, and multi-model AI strategy.',
    type: 'article',
  },
};

/**
 * Case Study: 7-Day SaaS Build with AI
 * 
 * SEO-optimized learning content showing real-world AI-augmented development
 */
export default function CaseStudyPage() {
  const tools = [
    {
      name: 'Cursor IDE',
      icon: Icons.code,
      role: 'Primary Development Environment',
      usage: 'Core development with Claude Sonnet 4.5 integration',
      affiliate: true,
    },
    {
      name: 'Claude Sonnet 4.5',
      icon: Icons.sparkles,
      role: 'Architecture & Core Development',
      usage: '80% of code generation, pattern design, refactoring',
      affiliate: false,
    },
    {
      name: 'GPT-4',
      icon: Icons.zap,
      role: 'Code Review & Optimization',
      usage: 'Red-hat reviews, quality audits, documentation',
      affiliate: false,
    },
    {
      name: 'Git Worktrees',
      icon: Icons.gitBranch,
      role: 'Parallel Development',
      usage: '3 simultaneous branches without conflicts',
      affiliate: false,
    },
  ];

  const dailyBreakdown = [
    {
      day: 'Day 1-2',
      focus: 'MVP Sprint',
      commits: '500+',
      achievements: [
        'Next.js 15 + TypeScript setup',
        'NextAuth v5 with MongoDB',
        '67 prompts in TypeScript files',
        'Shadcn UI components',
        'Basic routing and navigation',
      ],
      lessons: [
        'Start with TypeScript files, migrate to DB later',
        'Real auth from day 1 (not toy login)',
        'Ship working features over perfect architecture',
      ],
    },
    {
      day: 'Day 3-4',
      focus: 'Business Patterns',
      commits: '400+',
      achievements: [
        'Repository pattern implemented',
        'AI Provider Factory (5 providers)',
        'Enterprise RBAC (6 roles, 13 permissions)',
        'OpsHub admin dashboard',
        '91 repository tests',
      ],
      lessons: [
        'Add patterns when APIs stabilize',
        'Multi-tenant from the start (organizationId)',
        'Test business logic, not just units',
      ],
    },
    {
      day: 'Day 5',
      focus: 'Production Hardening',
      commits: '200+',
      achievements: [
        '620 passing tests',
        'RED metrics (p50/p95/p99)',
        'PII redaction (GDPR/SOC2)',
        'Rate limiting + replay protection',
        '3 incident playbooks',
        '4 ADRs documented',
      ],
      lessons: [
        'Observability is not optional',
        'Budget enforcement prevents runaway costs',
        'Document decisions as you make them',
      ],
    },
    {
      day: 'Day 6',
      focus: 'Content Quality',
      commits: '150+',
      achievements: [
        'Patterns migrated to MongoDB',
        '39 critical TODOs resolved',
        'Real achievements system',
        'Career recommendations API',
        'Site stats from database',
      ],
      lessons: [
        'Systematic TODO resolution > random fixes',
        'Migrate when patterns emerge, not day 1',
        'Real data builds trust',
      ],
    },
    {
      day: 'Day 7',
      focus: 'QA & Trust Signals',
      commits: '100+',
      achievements: [
        'Mock data removal (|| 76, || 23)',
        '12 QA issues fixed',
        'Pre-commit hooks for compliance',
        'UI/UX polish (dark mode, readability)',
        'Red Hat trust audit',
      ],
      lessons: [
        'Pattern audits catch systematic bugs',
        'Pre-commit hooks prevent regressions',
        'Fake data destroys credibility',
      ],
    },
  ];

  const keyTechniques = [
    {
      technique: 'Git Worktrees for Parallel Development',
      problem: 'Multiple AI agents causing merge conflicts',
      solution:
        'Created 3 separate worktrees (main, DRY improvements, QA polish) enabling simultaneous development',
      result: 'Zero merge conflicts despite 3 parallel branches',
      code: 'git worktree add ../JmZIo chore-day7-audit-qa-JmZIo',
    },
    {
      technique: 'Multi-Model AI Strategy',
      problem: 'One AI model is not optimal for all tasks',
      solution:
        'Claude for architecture, GPT-4 for reviews, Gemini for research',
      result: '20-30% faster by using model-specific strengths',
      code: null,
    },
    {
      technique: 'Pre-Commit Hooks as Guardrails',
      problem: 'Quality regression from rapid AI-assisted development',
      solution:
        'Automated checks for mock data, enterprise compliance, schema validation',
      result: 'Caught 15+ issues before they reached production',
      code: 'scripts/maintenance/check-enterprise-compliance.js',
    },
    {
      technique: 'ADRs for Every Decision',
      problem: 'Losing context on why decisions were made',
      solution:
        'Document architectural decisions in ADR format with context, decision, consequences',
      result: '12 ADRs created, zero "why did we do this?" questions',
      code: 'docs/development/ADR/001-ai-provider-interface.md',
    },
  ];

  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="border-white/20 bg-white/10 text-white"
            >
              <Icons.bookOpen className="mr-2 h-3 w-3" />
              Case Study
            </Badge>

            <h1 className="text-5xl font-bold text-white sm:text-6xl">
              Building Production SaaS
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                in 7 Days with AI
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              A systematic approach to AI-augmented development: real commits,
              real challenges, real solutions. Learn from 1,357 commits and 12
              architectural decisions.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-900 hover:bg-gray-100"
                asChild
              >
                <Link href="https://github.com/donlaur/Engify-AI-App" target="_blank">
                  <Icons.github className="mr-2 h-4 w-4" />
                  View Source Code
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white/90 text-purple-900 hover:bg-white"
                asChild
              >
                <Link href="/ai-workflow">
                  <Icons.target className="mr-2 h-4 w-4" />
                  See the Workflow
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Used */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Tools & Stack</h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            The right tools for the right job
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.name} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {tool.name}
                          {tool.affiliate && (
                            <Badge variant="secondary" className="text-xs">
                              Affiliate
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{tool.role}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tool.usage}</p>
                  {tool.affiliate && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      asChild
                    >
                      <Link href={`/tools/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        Learn More & Get Started →
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Want detailed reviews of each AI coding tool?{' '}
            <Link href="/tools" className="text-primary hover:underline">
              See our comprehensive tool comparisons →
            </Link>
          </p>
        </div>
      </section>

      {/* Daily Breakdown */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Day-by-Day Breakdown</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              How the 7 days unfolded in reality
            </p>
          </div>

          <div className="space-y-6">
            {dailyBreakdown.map((day, index) => (
              <Card key={day.day} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{day.day}</CardTitle>
                        <CardDescription className="text-lg">
                          Focus: {day.focus}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg">
                      {day.commits} commits
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="mb-3 font-semibold text-green-700 dark:text-green-400">
                        ✅ Achievements
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {day.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Icons.check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-3 font-semibold text-blue-700 dark:text-blue-400">
                        💡 Key Lessons
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {day.lessons.map((lesson, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Icons.lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                            <span>{lesson}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Techniques */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Key Techniques</h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            What made this approach different
          </p>
        </div>

        <div className="space-y-6">
          {keyTechniques.map((item) => (
            <Card key={item.technique} className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">{item.technique}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-600">
                        Problem
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.problem}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Solution
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.solution}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-600">
                        Result
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.result}
                      </p>
                    </div>
                  </div>
                  {item.code && (
                    <div className="rounded-md bg-slate-100 p-3 font-mono text-sm dark:bg-slate-800">
                      {item.code}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">By the Numbers</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Measurable outcomes from 7 days
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-5xl font-bold text-purple-600">1,357</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Total Commits
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-5xl font-bold text-blue-600">620</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Passing Tests
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-5xl font-bold text-pink-600">12</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  ADRs Documented
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-green-600">115+</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Documentation Pages
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-16">
        <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="space-y-6 py-12 text-center">
            <h2 className="text-3xl font-bold">
              Want to Build Like This?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Explore our AI tool reviews, workflow guides, and process documentation.
              Everything you need to implement AI-augmented development in your team.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/tools">
                  <Icons.wrench className="mr-2 h-5 w-5" />
                  Compare AI Coding Tools
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/ai-workflow">
                  <Icons.target className="mr-2 h-5 w-5" />
                  See Our Workflow
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}

