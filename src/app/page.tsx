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

const features = [
  {
    icon: Icons.sparkles,
    title: 'AI-Powered Learning',
    description:
      'Master prompt engineering with intelligent guidance and real-time feedback.',
  },
  {
    icon: Icons.target,
    title: '15 Proven Patterns',
    description:
      'Learn battle-tested patterns used by top AI practitioners worldwide.',
  },
  {
    icon: Icons.trophy,
    title: 'Gamified Progress',
    description: 'Unlock achievements, level up, and compete with your team.',
  },
  {
    icon: Icons.zap,
    title: 'Instant Results',
    description:
      'See your prompts in action with multi-provider AI integration.',
  },
];

export default function Home() {
  const prompts = getSeedPromptsWithTimestamps();
  const totalPrompts = prompts.length;

  const stats = [
    {
      label: 'Prompt Templates',
      value: totalPrompts.toString(),
      icon: Icons.library,
    },
    { label: 'Proven Patterns', value: '15', icon: Icons.sparkles },
    { label: 'AI Providers', value: '3', icon: Icons.zap },
    { label: 'Free Forever', value: '$0', icon: Icons.heart },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <Badge variant="secondary" className="mb-4">
            <Icons.sparkles className="mr-2 h-3 w-3" />
            Master AI Prompt Engineering
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Transform Your Team into{' '}
            <span className="text-primary">AI Power Users</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Master AI prompt engineering with {totalPrompts} expert-curated
            prompts, 15 battle-tested patterns, and gamified learning. Join
            thousands of developers leveling up their AI skills.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/library">
                Browse {totalPrompts} Prompts
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/learn">Start Learning</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="text-center">
                  <CardContent className="pt-6">
                    <Icon className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <div className="mb-1 text-3xl font-bold">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container bg-muted/50 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Master AI
            </h2>
            <p className="text-xl text-muted-foreground">
              From beginner to expert, we&apos;ve got you covered
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="container bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 text-sm font-semibold text-primary">
            TRUSTED BY TEAMS AT
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="text-2xl font-bold">Google</div>
            <div className="text-2xl font-bold">Microsoft</div>
            <div className="text-2xl font-bold">Amazon</div>
            <div className="text-2xl font-bold">Meta</div>
            <div className="text-2xl font-bold">Stripe</div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            * Individual developers from these companies use Engify.ai
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Is Engify.ai really free?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! All {totalPrompts} prompts, 15 patterns, and learning
                  pathways are 100% free forever. We believe in making AI
                  education accessible to everyone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Do I need AI experience to use this?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Not at all! Our content is designed for all skill levels, from
                  beginners to experts. Start with our learning pathways and
                  progress at your own pace.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Which AI providers do you support?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our prompts work with ChatGPT, Claude, Gemini, and other major
                  AI providers. The patterns are universal and can be adapted to
                  any AI model.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I use these prompts for my team?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! Share prompts with your team, adapt them to your
                  needs, and use them in your work. That&apos;s exactly what
                  they&apos;re designed for.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <Card className="mx-auto max-w-3xl border-primary/20 bg-primary/5">
          <CardContent className="space-y-6 py-12 text-center">
            <Icons.trophy className="mx-auto h-12 w-12 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Transform Your Team?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Join thousands of developers mastering AI with {totalPrompts}{' '}
              expert prompts. Start free today—no credit card required.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/api/auth/signin">
                Start Learning Now
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
