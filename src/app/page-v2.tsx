/**
 * Homepage Variant V2 - Showcasing Current Value + Coming Soon
 * 
 * This variant:
 * - Highlights what's available NOW (education, patterns, prompts, workflows, guardrails)
 * - Mentions new product coming with finer line
 * - Better matches inner pages
 * - Surfaces education content prominently
 * 
 * To test: Rename page.tsx to page-old.tsx and this to page.tsx
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
import { getServerStats } from '@/lib/server-stats';
import { loadWorkflowsFromJson } from '@/lib/workflows/load-workflows-from-json';
import type { Metadata } from 'next';
import { PreloadContentJson } from '@/components/features/PreloadContentJson';

export const metadata: Metadata = {
  title: 'Engify.ai - AI Engineering Resources: Prompts, Patterns, Workflows & Education',
  description:
    'Free AI engineering resources: 300+ expert prompts, 23 proven patterns, 96+ guardrail workflows, and comprehensive education. Research-backed content for engineers, managers, and product teams.',
  keywords: [
    'AI engineering',
    'prompt engineering',
    'AI patterns',
    'guardrails',
    'workflows',
    'AI education',
    'engineering management',
    'AI best practices',
  ],
  openGraph: {
    title: 'Engify.ai - AI Engineering Resources: Prompts, Patterns, Workflows & Education',
    description:
      'Free AI engineering resources: research-backed prompts, proven patterns, production workflows, and comprehensive education for modern engineering teams.',
    type: 'website',
    siteName: 'Engify.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engify.ai - AI Engineering Resources: Prompts, Patterns, Workflows & Education',
    description:
      'Free AI engineering resources: research-backed prompts, proven patterns, production workflows, and comprehensive education for modern engineering teams.',
    creator: '@engifyai',
  },
};

export default async function HomeV2() {
  const [data, workflows] = await Promise.all([getServerStats(), loadWorkflowsFromJson()]);

  const guardrailCount = workflows.length || 20;
  const promptCount = data.prompts?.total || 300;
  const patternCount = 23; // From patterns.json
  const learningResourceCount = data.learningResources?.total || 50;

  // Main value sections available NOW
  const valueSections = [
    {
      title: 'Prompts Library',
      description: `${promptCount}+ research-backed prompts for engineers, managers, and product teams`,
      icon: Icons.sparkles,
      href: '/prompts',
      gradient: 'from-blue-500 to-cyan-500',
      badge: `${promptCount}+ Prompts`,
      features: ['Role-based prompts', 'Pattern-tested', 'Free to use'],
    },
    {
      title: 'AI Patterns',
      description: '23 proven prompt patterns with examples, use cases, and best practices',
      icon: Icons.layers,
      href: '/patterns',
      gradient: 'from-purple-500 to-pink-500',
      badge: '23 Patterns',
      features: ['Chain-of-thought', 'Few-shot learning', 'Role prompting'],
    },
    {
      title: 'Guardrail Workflows',
      description: `${guardrailCount}+ production-ready workflows to prevent AI regressions`,
      icon: Icons.shield,
      href: '/workflows',
      gradient: 'from-green-500 to-emerald-500',
      badge: `${guardrailCount}+ Workflows`,
      features: ['Manual checklists', 'Automation hooks', 'Research citations'],
    },
    {
      title: 'Education Hub',
      description: 'Comprehensive guides, tutorials, and learning resources for AI engineering',
      icon: Icons.book,
      href: '/learn',
      gradient: 'from-orange-500 to-red-500',
      badge: `${learningResourceCount}+ Resources`,
      features: ['Tutorials', 'Best practices', 'AI model guides'],
    },
    {
      title: 'Pain Points',
      description: 'Common AI-assisted development issues and how to prevent them',
      icon: Icons.alertCircle,
      href: '/workflows/pain-points',
      gradient: 'from-yellow-500 to-amber-500',
      badge: '31 Pain Points',
      features: ['Real incidents', 'Prevention strategies', 'Team solutions'],
    },
    {
      title: 'Recommendations',
      description: 'Actionable recommendations for improving AI-assisted development',
      icon: Icons.lightbulb,
      href: '/workflows/recommendations',
      gradient: 'from-indigo-500 to-purple-500',
      badge: '24 Recommendations',
      features: ['Best practices', 'Implementation guides', 'Success stories'],
    },
  ];

  // Build role stats from data
  const roleIcons = {
    Engineers: Icons.code,
    Managers: Icons.users,
    Designers: Icons.palette,
    'Product Managers': Icons.target,
    PMs: Icons.target,
  };

  const roles = data.prompts?.byRole
    ? Object.entries(data.prompts.byRole)
        .filter(([name]) => name && name !== 'null' && name !== 'undefined')
        .map(([name, count]) => ({
          name,
          icon: roleIcons[name as keyof typeof roleIcons] || Icons.code,
          count: `${count} prompts`,
        }))
        .slice(0, 4)
    : [
        { name: 'Engineers', icon: Icons.code, count: '0 prompts' },
        { name: 'Managers', icon: Icons.users, count: '0 prompts' },
        { name: 'Designers', icon: Icons.palette, count: '0 prompts' },
        { name: 'PMs', icon: Icons.target, count: '0 prompts' },
      ];

  return (
    <MainLayout>
      <PreloadContentJson />
      
      {/* Hero Section - Updated messaging */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-500 via-blue-600 via-purple-600 to-teal-500 dark:from-red-600 dark:via-blue-700 dark:via-purple-700 dark:to-teal-600">
        <div className="absolute inset-0 -z-10 bg-black/20" />

        <div className="container relative z-10 py-24 md:py-32">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Ship AI Guardrails With Institutional Memory
            </h1>

            <p className="mx-auto max-w-3xl text-xl font-semibold leading-relaxed text-white sm:text-2xl">
              Stop AI slop before it merges. Turn manual guardrails into always-on automation.
            </p>

            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/90">
              {`${promptCount}+ prompts • ${patternCount} patterns • ${guardrailCount}+ workflows • ${learningResourceCount}+ learning resources`}
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-cyan-500 font-bold text-black hover:from-green-600 hover:to-cyan-600"
                asChild
              >
                <Link href="/prompts">
                  Explore Prompts
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 font-semibold text-white hover:bg-white/20"
                asChild
              >
                <Link href="/learn">
                  Start Learning
                  <Icons.book className="ml-2 h-4 w-4" />
                </Link>
              </Button>
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

      {/* Value Sections - What's Available NOW */}
      <section className="container bg-white py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Everything You Need to Master AI Engineering</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Free, research-backed resources available right now
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {valueSections.map((section, i) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.title}
                  className="group animate-fade-in border-2 transition-all duration-300 hover:-translate-y-2 hover:border-transparent hover:shadow-2xl"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Link href={section.href} className="block">
                    <CardHeader>
                      <div
                        className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${section.gradient} transition-transform group-hover:scale-110`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                        <Badge className={`bg-gradient-to-r ${section.gradient} text-white`}>
                          {section.badge}
                        </Badge>
                      </div>
                      <CardDescription className="text-base text-gray-700 dark:text-gray-300">
                        {section.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        {section.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Icons.check className="h-4 w-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coming Soon - New Product (Finer Line) */}
      <section className="container bg-gradient-to-b from-white to-gray-50 py-16 dark:from-gray-950 dark:to-gray-900">
        <div className="mx-auto max-w-5xl">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 shadow-lg dark:border-purple-800 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-cyan-900/30">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
                <div className="flex-shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                    <Icons.rocket className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-center gap-2 lg:justify-start">
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                      Coming Soon
                    </Badge>
                  </div>
                  <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                    AI Guardrails Platform
                  </h2>
                  <p className="mb-4 text-lg text-gray-700 dark:text-gray-300">
                    We&apos;re building an enterprise platform to operationalize guardrails with institutional memory, automation hooks, and incident recall. 
                    <span className="font-semibold"> In the meantime, explore our free workflows, patterns, and education resources above.</span>
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                    <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                      Automation Hooks
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                      Institutional Memory
                    </Badge>
                    <Badge variant="outline" className="border-cyan-300 text-cyan-700 dark:border-cyan-700 dark:text-cyan-300">
                      Incident Recall
                    </Badge>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/30"
                    asChild
                  >
                    <Link href="/workflows">
                      Explore Workflows
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Roles Section */}
      <section className="container bg-white py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-4xl font-bold">Built for Every Role</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Tailored prompts and resources for your entire engineering organization
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {roles.map((role, i) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.name}
                  className="group animate-fade-in border-2 transition-all duration-300 hover:-translate-y-2 hover:border-purple-200 hover:shadow-2xl"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CardHeader className="pb-4 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 transition-transform group-hover:scale-110">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{role.name}</CardTitle>
                    <CardDescription className="font-semibold text-purple-600">
                      {role.count}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
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
                    Get instant, accurate answers powered by RAG (Retrieval-Augmented Generation). Our chatbot searches through {promptCount}+ expert prompts and {patternCount} proven patterns to give you context-aware responses with source citations.
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

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 py-24">
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />

        <div className="container relative">
          <Card className="mx-auto max-w-3xl border-white/20 bg-white/10 backdrop-blur-sm">
            <CardContent className="space-y-6 py-12 text-center">
              <Icons.trophy className="mx-auto h-16 w-16 text-white" />
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Start Learning AI Engineering Today
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-200 sm:text-xl">
                Access {promptCount}+ prompts, {patternCount} patterns, {guardrailCount}+ workflows, and comprehensive education—all free.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-white text-purple-900 hover:bg-gray-100"
                  asChild
                >
                  <Link href="/prompts">
                    Explore Prompts
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  asChild
                >
                  <Link href="/learn">
                    Start Learning
                    <Icons.book className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}

