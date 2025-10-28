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

const roles = [
  { name: 'Engineers', icon: Icons.code, count: '24 prompts' },
  { name: 'Managers', icon: Icons.users, count: '18 prompts' },
  { name: 'Designers', icon: Icons.palette, count: '12 prompts' },
  { name: 'PMs', icon: Icons.target, count: '15 prompts' },
];

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
    title: '15 Proven Patterns',
    description:
      'Learn battle-tested patterns used by top AI practitioners worldwide.',
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

async function getStats() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stats`,
    {
      next: { revalidate: 300 }, // Cache for 5 minutes
    }
  );
  if (!res.ok)
    return { stats: { prompts: 0, patterns: 23, pathways: 0, users: 0 } };
  return res.json();
}

export default async function Home() {
  const data = await getStats();

  const siteStats = {
    totalPrompts: data.stats.prompts,
    totalPatterns: data.stats.patterns,
    totalArticles: 46,
    aiProviders: 4,
  };

  const stats = [
    { label: 'Expert Prompts', value: `${data.stats.prompts}+` },
    { label: 'Proven Patterns', value: '23' },
    { label: 'AI Providers', value: '4' },
    { label: 'Starting At', value: 'Free Beta' },
  ];

  return (
    <MainLayout>
      {/* Hero Section - Vibrant Gradient like Vibe Code Careers */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-500 via-blue-600 via-purple-600 to-teal-500 dark:from-red-600 dark:via-blue-700 dark:via-purple-700 dark:to-teal-600">
        {/* Animated background gradient overlay */}
        <div className="absolute inset-0 bg-black/20" />

        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-white/30 bg-black/30 text-white backdrop-blur-sm"
            >
              <Icons.sparkles className="mr-2 h-3 w-3" />⚡ AI-Powered Prompt
              Engineering is Taking Off 🚀
            </Badge>

            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Amplify Engineers with{' '}
              <span className="bg-gradient-to-r from-green-300 to-cyan-300 bg-clip-text text-transparent">
                AI Power
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-white">
              {siteStats.totalPrompts}+ expert prompts,{' '}
              {siteStats.totalPatterns} battle-tested patterns, and gamified
              learning. Transform your team&apos;s capabilities with Engify.ai
            </p>

            {/* MCP Section */}
            <div className="container py-16">
              <div className="mx-auto max-w-4xl">
                <div className="mb-12 text-center">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                    <Icons.zap className="h-4 w-4" />
                    Model Context Protocol
                  </div>
                  <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    Powered by MCP
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    We use the Model Context Protocol to connect AI to your
                    tools, data, and workflows
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <Icons.alertTriangle className="mb-4 h-8 w-8 text-purple-600" />
                      <h3 className="mb-2 font-semibold">Sentry Integration</h3>
                      <p className="text-sm text-muted-foreground">
                        Query errors, analyze trends, get AI-powered fixes
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <Icons.database className="mb-4 h-8 w-8 text-blue-600" />
                      <h3 className="mb-2 font-semibold">Database Access</h3>
                      <p className="text-sm text-muted-foreground">
                        Natural language queries over our prompt library
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <Icons.code className="mb-4 h-8 w-8 text-green-600" />
                      <h3 className="mb-2 font-semibold">GitHub Integration</h3>
                      <p className="text-sm text-muted-foreground">
                        Create issues, review PRs, all through AI
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 pt-8">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-black/80 p-8 backdrop-blur-sm">
                <h3 className="mb-2 text-2xl font-bold text-white">
                  Get the Latest{' '}
                  <span className="text-green-400">Prompt Engineering</span>{' '}
                  Tips
                </h3>
                <p className="mb-4 text-white/80">Right in Your Inbox</p>
                <div className="flex justify-center gap-2">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-cyan-500 font-bold text-black hover:from-green-600 hover:to-cyan-600"
                    asChild
                  >
                    <Link href="/library">
                      Browse {siteStats.totalPrompts} Prompts
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    asChild
                  >
                    <Link href="/signup">Start Free</Link>
                  </Button>
                </div>
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
      <section className="container bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Built for Every Role</h2>
            <p className="text-xl text-gray-600">
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
      <section className="container bg-white py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Everything You Need to Master AI
            </h2>
            <p className="text-xl text-gray-600">
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
                    <CardDescription className="text-base text-gray-600">
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
      <section className="container bg-white py-20">
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
                <p className="text-lg text-gray-600">
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
                      <div className="text-sm text-gray-600">
                        Cursor, Claude, modern AI tools
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icons.check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <div className="font-semibold">Production Quality</div>
                      <div className="text-sm text-gray-600">
                        Real auth, DB, APIs
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icons.check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <div className="font-semibold">Rapid Iteration</div>
                      <div className="text-sm text-gray-600">
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
                    <Link href="/signup">Try Free</Link>
                  </Button>
                </div>
                <div className="border-t pt-4 text-sm text-gray-500">
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
                  Start Learning Now
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
