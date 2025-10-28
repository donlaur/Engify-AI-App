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
import { RoleSelector } from '@/components/roles/RoleSelector';
import Link from 'next/link';

export default function ForManagersPage() {
  const managerChallenges = [
    {
      title: 'Team Velocity is Slowing Down',
      description: 'Sprint after sprint, velocity keeps dropping',
      solution: 'AI-assisted code generation and review speeds up delivery',
      promptId: 'cg-001',
    },
    {
      title: 'Code Review Bottlenecks',
      description: 'PRs sit for days waiting for review',
      solution: 'AI pre-reviews catch issues before human review',
      promptId: 'cg-001',
    },
    {
      title: 'Onboarding Takes Forever',
      description: 'New engineers take 3+ months to be productive',
      solution: 'AI-powered learning paths and code explanations',
      promptId: 'cg-012',
    },
    {
      title: 'Technical Debt is Growing',
      description: 'Team keeps saying "we need to refactor"',
      solution: 'AI identifies debt hotspots and suggests fixes',
      promptId: 'cg-005',
    },
  ];

  return (
    <MainLayout>
      <RoleSelector />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10" />

        <div className="container relative py-24">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-white/20 bg-white/10 text-white"
            >
              <Icons.users className="mr-2 h-3 w-3" />
              For Engineering Managers
            </Badge>

            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Lead Faster.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Ship Smarter.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              AI tools to unblock your team, speed up delivery, and hit your
              sprint goals.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="h-12 w-full fill-white">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Challenges */}
      <section className="container py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Your Challenges, Solved</h2>
            <p className="text-xl text-gray-600">
              Common engineering manager pain points and AI solutions
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {managerChallenges.map((item, i) => (
              <Card
                key={i}
                className="group border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-2xl"
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Icons.alertTriangle className="mr-2 inline h-5 w-5 text-orange-600" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-blue-900">
                      <Icons.lightbulb className="mr-2 inline h-4 w-4" />
                      AI Solution:
                    </p>
                    <p className="text-sm text-blue-800">{item.solution}</p>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/library/${item.promptId}`}>
                      View Prompt
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="mx-auto max-w-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="space-y-6 py-12 text-center">
            <Icons.users className="mx-auto h-16 w-16 text-blue-600" />
            <h2 className="text-4xl font-bold">Ready to Unblock Your Team?</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Join managers using AI to hit sprint goals and ship faster.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600"
                asChild
              >
                <Link href="/signup">
                  Start Free
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/library">Browse Prompts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
