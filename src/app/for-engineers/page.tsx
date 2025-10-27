'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { RoleSelector } from '@/components/roles/RoleSelector';
import Link from 'next/link';

export default function ForEngineersPage() {
  const engineerChallenges = [
    {
      title: 'Code Reviews Taking Too Long',
      description: 'Spending hours on code reviews instead of building features',
      solution: 'AI-assisted code review prompts that catch issues faster',
      promptId: 'cg-001',
    },
    {
      title: 'Writing Documentation',
      description: 'Documentation is tedious and often gets skipped',
      solution: 'Generate comprehensive docs from code with AI',
      promptId: 'cg-007',
    },
    {
      title: 'Debugging Complex Issues',
      description: 'Spending days tracking down root causes',
      solution: 'AI-powered debugging assistant with systematic approach',
      promptId: 'cg-004',
    },
    {
      title: 'Learning New Technologies',
      description: 'Overwhelming amount of new tools and frameworks',
      solution: 'Personalized learning paths with AI tutoring',
      promptId: 'cg-012',
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
            <Badge variant="secondary" className="mb-4 border-white/20 bg-white/10 text-white">
              <Icons.code className="mr-2 h-3 w-3" />
              For Software Engineers
            </Badge>
            
            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Code Faster.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Ship Better.
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              AI prompts built by engineers, for engineers. Stop reinventing the wheel—use proven patterns.
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
            <h2 className="mb-4 text-4xl font-bold">Sound Familiar?</h2>
            <p className="text-xl text-gray-600">
              Common engineering challenges and how AI can help
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {engineerChallenges.map((item, i) => (
              <Card key={i} className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-200">
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
            <Icons.code className="mx-auto h-16 w-16 text-blue-600" />
            <h2 className="text-4xl font-bold">Ready to Level Up?</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Join engineers using AI to ship faster, debug smarter, and learn continuously.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600" asChild>
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
