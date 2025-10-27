import Link from 'next/link';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';

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
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
            <Icons.sparkles className="mr-2 h-4 w-4" />
            Master AI Prompt Engineering
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Transform Your Team into{' '}
            <span className="text-primary">AI Power Users</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Progressive, gamified learning platform that teaches prompt
            engineering through hands-on practice with real AI models.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/api/auth/signin">
                Get Started Free
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/learn">Learn More</Link>
            </Button>
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

      {/* CTA Section */}
      <section className="container py-24">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="space-y-6 p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto max-w-2xl text-xl opacity-90">
              Join thousands of teams already using Engify.ai to unlock the full
              potential of AI.
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
