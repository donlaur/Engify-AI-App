/**
 * AI Summary: Homepage - Main landing page with stats, features, and CTAs
 * Displays real-time platform statistics from MongoDB, showcases key features,
 * and provides navigation to prompts library and signup. Server-side rendered
 * with ISR for optimal performance. Part of Day 7 QA improvements.
 * Last updated: 2025-11-02
 */

import Link from 'next/link';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { loadWorkflowsFromJson } from '@/lib/workflows/load-workflows-from-json';
import type { Metadata } from 'next';
import { PreloadContentJson } from '@/components/features/PreloadContentJson';
import { PainPointJourneySlider } from '@/components/homepage/PainPointJourneySlider';

export const metadata: Metadata = {
  title: 'Engify.ai - Operationalize AI Guardrails With Institutional Memory',
  description:
    'Document the manual guardrails you run today and automate them tomorrow. Engify pairs production-ready workflows, enforcement hooks, and incident memory so teams ship responsibly.',
  keywords: [
    'AI guardrails',
    'guardrail automation',
    'engineering governance',
    'prompt governance',
    'ai risk management',
    'institutional memory',
    'software delivery controls',
    'compliance automation',
  ],
  openGraph: {
    title: 'Engify.ai - Operationalize AI Guardrails With Institutional Memory',
    description:
      'Production guardrail workflows, automation handoffs, and incident memory—everything you need to prevent AI regressions.',
    type: 'website',
    siteName: 'Engify.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engify.ai - Operationalize AI Guardrails With Institutional Memory',
    description:
      'Production guardrail workflows, automation handoffs, and incident memory—everything you need to prevent AI regressions.',
    creator: '@engifyai',
  },
};

const features = [
  {
    icon: Icons.shield,
    title: 'Production Guardrails',
    description:
      'Documented workflows anchored in audits, incidents, and daily engineering practice.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Icons.gitCompare,
    title: 'Automation Hooks',
    description:
      'Pre-built handoffs for pre-commit, CI/CD, and MCP agents so enforcement is a toggle, not a rewrite.',
    gradient: 'from-purple-500 to-fuchsia-500',
  },
  {
    icon: Icons.database,
    title: 'Institutional Memory',
    description:
      'Capture every incident, checklist decision, and regression warning—then surface it when teams need it.',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    icon: Icons.flag,
    title: 'Compliance Evidence',
    description:
      'Research citations, audit trails, and coverage views that satisfy security, platform, and leadership.',
    gradient: 'from-amber-500 to-orange-500',
  },
];

const allowSignup = process.env.NEXT_PUBLIC_ALLOW_SIGNUP === 'true';

export default async function Home() {
  // Load workflows data (server stats removed as no longer used after hero section redesign)
  const workflows = await loadWorkflowsFromJson();

  const guardrailCount = workflows.length || 20;
  const manualChecklistSteps = workflows.reduce((acc, workflow) => acc + workflow.manualChecklist.length, 0);
  const automationHooks = workflows.filter((workflow) => Boolean(workflow.automationTeaser)).length;
  const researchCitations = workflows.reduce(
    (acc, workflow) => acc + (workflow.researchCitations?.length ?? 0),
    0
  );

  const stats = [
    {
      label: 'Guardrail Workflows',
      value: `${guardrailCount}`,
    },
    {
      label: 'Checklist Steps Documented',
      value: `${manualChecklistSteps}+`,
    },
    {
      label: 'Automation Hooks Ready',
      value: `${Math.max(automationHooks, 1)}`,
    },
    {
      label: 'Research Citations',
      value: `${Math.max(researchCitations, 1)}+`,
    },
  ];

  // Role stats code removed - was previously used for displaying role-based prompts
  // This data structure is no longer needed after the hero section redesign

  return (
    <MainLayout>
      <PreloadContentJson />
      {/* Hero Section - Vibrant Gradient like Vibe Code Careers */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-500 via-blue-600 via-purple-600 to-teal-500 dark:from-red-600 dark:via-blue-700 dark:via-purple-700 dark:to-teal-600">
        {/* Animated background gradient overlay - BEHIND content, not blocking clicks */}
        <div className="absolute inset-0 -z-10 bg-black/20" />

        <div className="container relative z-10 py-24 md:py-32">
          <div className="mx-auto max-w-5xl space-y-12 text-center">
            <div className="space-y-6">
              <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-7xl">
                Amplify Your Engineering Org with AI-Native Workflows
              </h1>

              <p className="mx-auto max-w-3xl text-xl font-semibold leading-relaxed text-white sm:text-2xl">
                Whether you&apos;re an engineer shipping code or a director scaling teams, learn the patterns and guardrails for AI-native software engineering. Study {guardrailCount}+ workflows tailored to your role.
              </p>
            </div>

            {/* 4-Role Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Engineers */}
              <Link
                href="/for-engineers"
                className="group rounded-xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20"
              >
                <div className="mb-4 flex justify-center">
                  <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-3">
                    <Icons.code className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Engineers</h3>
                <p className="text-sm text-white/80">
                  Ship AI code with confidence
                </p>
                <div className="mt-4 flex items-center justify-center text-white/60 transition-colors group-hover:text-white">
                  <span className="text-sm font-semibold">Get Started</span>
                  <Icons.arrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>

              {/* Engineering Managers */}
              <Link
                href="/for-managers"
                className="group rounded-xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20"
              >
                <div className="mb-4 flex justify-center">
                  <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-3">
                    <Icons.users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Eng Managers</h3>
                <p className="text-sm text-white/80">
                  Lead AI-native teams with confidence
                </p>
                <div className="mt-4 flex items-center justify-center text-white/60 transition-colors group-hover:text-white">
                  <span className="text-sm font-semibold">Get Started</span>
                  <Icons.arrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>

              {/* Directors/VPs */}
              <Link
                href="/for-engineering-directors"
                className="group rounded-xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20"
              >
                <div className="mb-4 flex justify-center">
                  <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-500 p-3">
                    <Icons.trendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Directors & VPs</h3>
                <p className="text-sm text-white/80">
                  Scale org-wide AI adoption safely
                </p>
                <div className="mt-4 flex items-center justify-center text-white/60 transition-colors group-hover:text-white">
                  <span className="text-sm font-semibold">Get Started</span>
                  <Icons.arrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>

              {/* Product Teams */}
              <Link
                href="/for-pms"
                className="group rounded-xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20"
              >
                <div className="mb-4 flex justify-center">
                  <div className="rounded-lg bg-gradient-to-br from-green-500 to-teal-500 p-3">
                    <Icons.target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Product Teams</h3>
                <p className="text-sm text-white/80">
                  Build faster with AI guardrails
                </p>
                <div className="mt-4 flex items-center justify-center text-white/60 transition-colors group-hover:text-white">
                  <span className="text-sm font-semibold">Get Started</span>
                  <Icons.arrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="h-12 w-full fill-white">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container bg-white py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="animate-fade-in text-center"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-6xl font-bold text-transparent">
                  {stat.value}
                </div>
                <p className="text-base font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RAG Chatbot CTA */}
      <section className="container bg-gradient-to-b from-white to-gray-50 py-16 dark:from-gray-950 dark:to-gray-900">
        <div className="mx-auto max-w-5xl">
          <Card className="overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 shadow-2xl dark:border-purple-800 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-cyan-900/30">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
                <div className="flex-shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                    <Icons.sparkles className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="mb-3 text-4xl font-bold text-gray-900 dark:text-white">
                    Ask Our AI Assistant Anything
                  </h2>
                  <p className="mb-4 text-lg text-gray-700 dark:text-gray-300">
                    Get instant, accurate answers powered by RAG (Retrieval-Augmented Generation). Our chatbot searches through 300+ expert prompts and 23 proven patterns to give you context-aware responses with source citations.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                      <Icons.database className="mr-1 h-3 w-3" />
                      MongoDB Vector Search
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      <Icons.check className="mr-1 h-3 w-3" />
                      Source Citations
                    </Badge>
                    <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
                      <Icons.zap className="mr-1 h-3 w-3" />
                      Real-Time Answers
                    </Badge>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    size="lg"
                    asChild
                    className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-lg font-bold hover:from-purple-700 hover:to-blue-700"
                  >
                    <Link href="/rag-chat">
                      <Icons.sparkles className="mr-2 h-5 w-5" />
                      Try AI Assistant
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pain Point Journey Section */}
      <section className="container bg-gradient-to-b from-white to-gray-50 py-16 dark:from-gray-950 dark:to-gray-900">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              From Pain Points to Production-Ready Code
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              See how recommendations and guardrails solve real engineering problems
            </p>
          </div>

          <PainPointJourneySlider role="engineers" />
        </div>
      </section>

      {/* Features Section */}
      <section className="container bg-white py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Everything You Need to Master AI
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              From beginner to expert, we&apos;ve got you covered
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group animate-fade-in overflow-hidden border-2 transition-all duration-300 hover:border-transparent hover:shadow-2xl"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-5`}
                  />
                  <CardHeader>
                    <div
                      className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${feature.gradient}`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base text-gray-700 dark:text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Built in Public Section */}
      <section className="container bg-white py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl">
          <Card className="overflow-hidden border-2 border-purple-200">
            <div className="grid md:grid-cols-2">
              <div className="flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 p-12">
                <div className="space-y-6 text-center">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm">
                    <Icons.code className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-6xl font-bold text-white">350+</div>
                    <div className="text-xl text-gray-200">Commits Today</div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div>✓ Real Auth</div>
                    <div>✓ AI Integration</div>
                    <div>✓ Production Ready</div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 p-6 sm:p-8 md:p-12">
                <Badge className="border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Icons.github className="mr-2 h-3 w-3" />
                  Built in Public
                </Badge>
                <h2 className="text-2xl font-bold sm:text-3xl">Watch This Being Built</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Built using AI-augmented development. See the code, follow the
                  commits, learn how modern teams ship fast.
                </p>
                <div className="rounded-lg bg-blue-50 p-4 text-sm">
                  <p className="mb-1 font-semibold text-blue-900">
                    The Philosophy:
                  </p>
                  <p className="text-blue-800">
                    Start with TypeScript files, not databases. UI can be
                    rebuilt in minutes. Ship fast, validate, then optimize. This
                    is modern rapid prototyping.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Icons.check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <div className="font-semibold">
                        AI-Augmented Development
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Cursor, Claude, modern AI tools
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icons.check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <div className="font-semibold">Production Quality</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Real auth, DB, APIs
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icons.check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <div className="font-semibold">Rapid Iteration</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Ship fast, learn faster
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 sm:w-auto"
                    asChild
                  >
                    <Link href="/built-in-public">
                      <Icons.code className="mr-2 h-4 w-4" />
                      See How It&apos;s Built
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                    <Link href="/signup">
                      {allowSignup ? 'Try Free' : 'Request Access'}
                    </Link>
                  </Button>
                </div>
                <div className="border-t pt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    Part of the{' '}
                    <span className="font-semibold">HireLadder.ai</span>{' '}
                    ecosystem - AI-powered career tools for engineers (resume
                    builder coming soon)
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 py-24">
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />

        <div className="container relative">
          <Card className="mx-auto max-w-3xl border-white/20 bg-white/10 backdrop-blur-sm">
            <CardContent className="space-y-6 py-12 text-center">
              <Icons.trophy className="mx-auto h-16 w-16 text-white" />
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Transform Your Team?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-200 sm:text-xl">
                Master AI guardrails with {guardrailCount}+ production workflows and
                automation hooks ready to deploy.
              </p>
              <Button
                size="lg"
                className="bg-white text-purple-900 hover:bg-gray-100"
                asChild
              >
                <Link href="/signup">
                  {allowSignup ? 'Start Learning Now' : 'Request Beta Access'}
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
