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
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';

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

export default function Home() {
  const prompts = getSeedPromptsWithTimestamps();
  const totalPrompts = prompts.length;

  const stats = [
    { label: 'Prompt Templates', value: totalPrompts.toString() },
    { label: 'Proven Patterns', value: '15' },
    { label: 'AI Providers', value: '3' },
    { label: 'Free Forever', value: '$0' },
  ];

  return (
    <MainLayout>
      {/* Hero Section - Dark with Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background gradient */}
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />

        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-white/20 bg-white/10 text-white"
            >
              <Icons.sparkles className="mr-2 h-3 w-3" />
              Master AI Prompt Engineering
            </Badge>

            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Transform Engineers into{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                AI Power Users
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              {totalPrompts}+ expert prompts, 15 battle-tested patterns, and
              gamified learning. Amplify your team&apos;s capabilities with
              Engify.ai
            </p>

            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Button
                size="lg"
                className="border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                asChild
              >
                <Link href="/library">
                  Browse {totalPrompts} Prompts
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/signup">Start Free</Link>
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

      {/* Stats Section */}
      <section className="container bg-white py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="animate-fade-in text-center"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-5xl font-bold text-transparent">
                  {stat.value}
                </div>
                <p className="text-sm font-medium uppercase tracking-wide text-gray-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section - Jellyfish style */}
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
                Join 1,200+ engineers mastering AI with {totalPrompts} expert
                prompts. Start free today—no credit card required.
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
