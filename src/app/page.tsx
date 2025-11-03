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
import { getStats } from '@/lib/stats-cache';

const features = [
  {
    icon: Icons.sparkles,
    title: 'AI-Powered Learning',
    description:
      'Master prompt engineering with intelligent guidance and real-time feedback.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Icons.target,
    title: 'Battle-Tested Patterns',
    description:
      'Learn proven patterns used by top AI practitioners worldwide.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Icons.trophy,
    title: 'Gamified Progress',
    description: 'Unlock achievements, level up, and compete with your team.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Icons.zap,
    title: 'Instant Results',
    description:
      'See your prompts in action with multi-provider AI integration.',
    gradient: 'from-green-500 to-emerald-500',
  },
];

export default async function Home() {
  const data = await getStats();
  const allowSignup = process.env.NEXT_PUBLIC_ALLOW_SIGNUP === 'true';

  // Build stats for display
  const stats = [
    {
      label: 'Expert Prompts',
      value: `${data.prompts?.total || data.stats?.prompts || 0}+`,
    },
    {
      label: 'Proven Patterns',
      value: `${data.patterns?.total || data.stats?.patterns || 0}`,
    },
    { label: 'AI Providers', value: '4' },
    { label: 'Beta Access', value: 'Free' },
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
        .map(([name, count]) => ({
          name,
          icon: roleIcons[name as keyof typeof roleIcons] || Icons.code,
          count: `${count} prompts`,
        }))
        .slice(0, 4) // Show top 4 roles
    : [
        { name: 'Engineers', icon: Icons.code, count: '0 prompts' },
        { name: 'Managers', icon: Icons.users, count: '0 prompts' },
        { name: 'Designers', icon: Icons.palette, count: '0 prompts' },
        { name: 'PMs', icon: Icons.target, count: '0 prompts' },
      ];

  const siteStats = {
    totalPrompts: data.prompts?.total || data.stats?.prompts || 0,
    totalPatterns: data.patterns?.total || data.stats?.patterns || 0,
  };

  return (
    <MainLayout>
      {/* Hero Section - Vibrant Gradient like Vibe Code Careers */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-500 via-blue-600 via-purple-600 to-teal-500 dark:from-red-600 dark:via-blue-700 dark:via-purple-700 dark:to-teal-600">
        {/* Animated background gradient overlay - BEHIND content, not blocking clicks */}
        <div className="absolute inset-0 -z-10 bg-black/20" />

        <div className="container relative z-10 py-24 md:py-32">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-white/30 bg-black/30 backdrop-blur-sm"
            >
              <Icons.sparkles className="mr-2 h-3 w-3 text-white" />
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text font-bold text-transparent">
                BETA
              </span>
              <span className="ml-2 text-white">Free</span>
            </Badge>

            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Engify.ai
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-white">
              Engineering amplified with AI
            </p>

            <div className="flex justify-center pt-8">
              <div className="flex w-full max-w-md flex-col gap-4 sm:w-auto sm:flex-row">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-cyan-500 font-bold text-black hover:from-green-600 hover:to-cyan-600 sm:w-auto"
                  asChild
                >
                  <Link href="/prompts">
                    Browse Prompt Playbook
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto"
                  asChild
                >
                  <Link href="/signup">
                    {allowSignup ? 'Start Free' : 'Request Beta Access'}
                  </Link>
                </Button>
              </div>
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

      {/* Roles Section */}
      <section className="container bg-gradient-to-b from-white to-gray-50 py-12 dark:from-gray-950 dark:to-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-4xl font-bold">Built for Every Role</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Tailored prompts for your entire engineering organization
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
              <div className="space-y-6 p-12">
                <Badge className="border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Icons.github className="mr-2 h-3 w-3" />
                  Built in Public
                </Badge>
                <h2 className="text-3xl font-bold">Watch This Being Built</h2>
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
                <div className="flex gap-3 pt-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                    asChild
                  >
                    <Link href="/built-in-public">
                      <Icons.code className="mr-2 h-4 w-4" />
                      See How It&apos;s Built
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
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
              <h2 className="text-4xl font-bold text-white">
                Ready to Transform Your Team?
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-200">
                Master AI with {siteStats.totalPrompts} expert prompts. Start
                free today—no credit card required.
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
