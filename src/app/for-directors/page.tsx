'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { directorPriorities, directorChallenges } from '@/data/director-insights';
import Link from 'next/link';

export default function ForDirectorsPage() {
  const criticalPriorities = directorPriorities.filter((p) => p.importance === 'critical');

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />
        
        <div className="container relative py-24">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge variant="secondary" className="mb-4 border-white/20 bg-white/10 text-white">
              <Icons.briefcase className="mr-2 h-3 w-3" />
              For Directors of Engineering
            </Badge>
            
            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-6xl">
              AI Adoption Challenges?
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                We&apos;ve Been There.
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              Based on real conversations with engineering leaders. Tackle the challenges you&apos;re facing right now.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="h-12 w-full fill-white">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Critical Priorities */}
      <section className="container py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">What Directors Are Asking</h2>
            <p className="text-xl text-gray-600">
              Real priorities from engineering leaders at aviation, fintech, and enterprise companies
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {criticalPriorities.map((priority) => (
              <Card key={priority.id} className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-200">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                    <Icons.target className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{priority.title}</CardTitle>
                  <CardDescription className="text-base">
                    {priority.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-gray-700">Key Questions:</p>
                    <ul className="space-y-1">
                      {priority.keyQuestions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <Icons.check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {priority.relatedPrompts && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/library">
                        View Related Prompts
                        <Icons.arrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Common Challenges */}
      <section className="bg-gray-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold">Sound Familiar?</h2>
              <p className="text-xl text-gray-600">
                Common challenges and how AI can help
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {directorChallenges.map((item, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Icons.alertTriangle className="mr-2 inline h-5 w-5 text-orange-600" />
                      {item.challenge}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-green-50 p-4">
                      <p className="mb-2 text-sm font-semibold text-green-900">
                        <Icons.lightbulb className="mr-2 inline h-4 w-4" />
                        AI Solution:
                      </p>
                      <p className="text-sm text-green-800">{item.aiSolution}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="mx-auto max-w-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="space-y-6 py-12 text-center">
            <Icons.trophy className="mx-auto h-16 w-16 text-purple-600" />
            <h2 className="text-4xl font-bold">Ready to Lead AI Adoption?</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Get the prompts, patterns, and playbooks engineering leaders are using to transform their teams.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600" asChild>
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
