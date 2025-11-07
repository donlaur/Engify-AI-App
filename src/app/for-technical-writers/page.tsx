'use client';

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
import Link from 'next/link';

// ISR: Regenerate every hour, don't generate at build time
export const revalidate = 3600; // 1 hour
export const dynamic = 'force-static';

export default function ForTechnicalWritersPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-teal-900 to-slate-900">
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-green-500/10 via-teal-500/10 to-blue-500/10" />

        <div className="container relative py-24">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-white/20 bg-white/10 text-white"
            >
              <Icons.file className="mr-2 h-3 w-3" />
              For Technical Writers
            </Badge>

            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Break the SME Bottleneck.
              <br />
              <span className="bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                Write with Confidence.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              AI-powered prompts to extract knowledge from SMEs, maintain
              consistency, and keep pace with agile development.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="h-12 w-full fill-white">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Pain Points */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Your Daily Struggles</h2>
          <p className="text-xl text-gray-600">
            The challenges that slow you down
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 transition-all hover:border-green-200">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-teal-600">
                <Icons.users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>SME Bottleneck</CardTitle>
              <CardDescription>
                Waiting for busy engineers to review docs and answer questions.
                Delays pile up.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-all hover:border-teal-200">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-blue-600">
                <Icons.refresh className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Agile Pace</CardTitle>
              <CardDescription>
                Features change constantly. Last-minute updates require
                documentation rewrites on tight deadlines.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-all hover:border-blue-200">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-green-600">
                <Icons.check className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Consistency Chaos</CardTitle>
              <CardDescription>
                Maintaining consistent style and structure across large doc sets
                with multiple contributors
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Solutions */}
      <section className="bg-gray-50 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              AI-Powered Documentation
            </h2>
            <p className="text-xl text-gray-600">
              Prompts designed for technical writing workflows
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.help className="h-5 w-5 text-green-600" />
                  SME Interview Prep
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Generate structured interview questions to extract all needed
                  information in one 30-minute session. No more back-and-forth.
                </p>
                <Badge>Question Refinement</Badge>
                <Badge className="ml-2">Template</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.palette className="h-5 w-5 text-teal-600" />
                  Style Consistency Enforcer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Provide style guide examples, AI rewrites content to match.
                  Ensures consistent voice, tone, and formatting across all
                  docs.
                </p>
                <Badge>Few-Shot</Badge>
                <Badge className="ml-2">Critique & Improve</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.file className="h-5 w-5 text-blue-600" />
                  API Documentation Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Transform raw endpoint specs into complete API docs. Includes
                  examples, error codes, authentication, and best practices.
                </p>
                <Badge>Template</Badge>
                <Badge className="ml-2">KERNEL Framework</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.sparkles className="h-5 w-5 text-purple-600" />
                  Draft from SME Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Turn messy engineer notes into polished documentation. AI
                  structures content, fills gaps, and applies your style guide.
                </p>
                <Badge>Critique & Improve</Badge>
                <Badge className="ml-2">Persona</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="mx-auto max-w-3xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
          <CardContent className="space-y-6 py-12 text-center">
            <Icons.file className="mx-auto h-16 w-16 text-green-600" />
            <h2 className="text-4xl font-bold">Ready to Write Faster?</h2>
            <p className="text-xl text-gray-600">
              Join technical writers using AI to break bottlenecks and maintain
              quality at agile speed.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-teal-600"
                asChild
              >
                <Link href="/prompts">
                  Browse Writing Prompts
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/patterns">Learn Patterns</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
