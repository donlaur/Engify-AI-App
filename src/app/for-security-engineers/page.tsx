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

export default function ForSecurityEngineersPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-900 via-orange-900 to-slate-900">
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10" />

        <div className="container relative py-24">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-white/20 bg-white/10 text-white"
            >
              <Icons.shield className="mr-2 h-3 w-3" />
              For Security Engineers
            </Badge>

            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Combat Alert Fatigue.
              <br />
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Triage with Confidence.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              AI-powered prompts for incident response, threat analysis, and
              translating technical risks into business impact.
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
          <h2 className="mb-4 text-4xl font-bold">Your Daily Battles</h2>
          <p className="text-xl text-gray-600">
            The challenges every security engineer faces
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 transition-all hover:border-red-200">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-orange-600">
                <Icons.alertTriangle className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Alert Fatigue</CardTitle>
              <CardDescription>
                Drowning in alerts from multiple tools. Critical threats buried
                in noise.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-all hover:border-orange-200">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-yellow-600">
                <Icons.clock className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Incident Pressure</CardTitle>
              <CardDescription>
                High-stress decision-making during live breaches. Every second
                counts.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-all hover:border-yellow-200">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-600 to-red-600">
                <Icons.refresh className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Evolving Threats</CardTitle>
              <CardDescription>
                Constant pressure to stay current on latest vulnerabilities and
                attack vectors
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Solutions */}
      <section className="bg-gray-50 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">AI-Powered Defense</h2>
            <p className="text-xl text-gray-600">
              Prompts built for security operations
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.target className="h-5 w-5 text-red-600" />
                  Alert Triage Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Structured approach to analyzing high-priority alerts.
                  Generate hypotheses, outline investigation steps, complete
                  triage template.
                </p>
                <Badge>Hypothesis Testing</Badge>
                <Badge className="ml-2">Template</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.shield className="h-5 w-5 text-orange-600" />
                  Threat Intelligence Brief
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Generate threat briefs on APT groups. Analyze TTPs, assess
                  relevance to your environment, provide mitigation
                  recommendations.
                </p>
                <Badge>RAG</Badge>
                <Badge className="ml-2">Persona</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.file className="h-5 w-5 text-yellow-600" />
                  Incident Report Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Transform technical incident details into executive summaries.
                  Quantify business impact, remove jargon, provide clear
                  recommendations.
                </p>
                <Badge>Audience Persona</Badge>
                <Badge className="ml-2">Template</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.check className="h-5 w-5 text-green-600" />
                  Vulnerability Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Systematic vulnerability analysis. Assess severity, identify
                  attack vectors, prioritize remediation, estimate business
                  risk.
                </p>
                <Badge>KERNEL Framework</Badge>
                <Badge className="ml-2">Chain-of-Thought</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="mx-auto max-w-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="space-y-6 py-12 text-center">
            <Icons.shield className="mx-auto h-16 w-16 text-red-600" />
            <h2 className="text-4xl font-bold">
              Ready to Strengthen Your Defenses?
            </h2>
            <p className="text-xl text-gray-600">
              Join security teams using AI to triage faster, respond smarter,
              and communicate clearer.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-600 to-orange-600"
                asChild
              >
                <Link href="/library">
                  Browse Security Prompts
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
