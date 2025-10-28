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

export default function ForDataScientistsPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />

        <div className="container relative py-24">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-white/20 bg-white/10 text-white"
            >
              <Icons.database className="mr-2 h-3 w-3" />
              For Data Scientists
            </Badge>

            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Stop Spending 80% of Your Time
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                On Data Cleaning
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              AI-powered prompts to automate data janitoring, accelerate
              analysis, and translate insights for stakeholders.
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
          <h2 className="mb-4 text-4xl font-bold">Your Biggest Challenges</h2>
          <p className="text-xl text-gray-600">
            Based on research: Data scientists spend 80% of time on data
            preparation
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 transition-all hover:border-blue-200">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                <Icons.database className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Data Janitoring</CardTitle>
              <CardDescription>
                80% of your time spent collecting, cleaning, and organizing
                messy datasets
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-all hover:border-purple-200">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                <Icons.brain className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Model Validation</CardTitle>
              <CardDescription>
                Complex, iterative process of testing algorithms and debugging
                unexpected results
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-all hover:border-pink-200">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-red-600">
                <Icons.users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Stakeholder Translation</CardTitle>
              <CardDescription>
                Translating complex statistical findings into clear business
                recommendations
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Solutions */}
      <section className="bg-gray-50 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">AI-Powered Solutions</h2>
            <p className="text-xl text-gray-600">
              Prompts designed specifically for data science workflows
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.code className="h-5 w-5 text-blue-600" />
                  Data Cleaning Automation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Generate Python scripts to clean messy datasets. Uses KERNEL
                  framework + Chain-of-Thought for transparent, debuggable code.
                </p>
                <Badge>KERNEL Framework</Badge>
                <Badge className="ml-2">Chain-of-Thought</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.sparkles className="h-5 w-5 text-purple-600" />
                  Executive Summary Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Transform technical findings into business narratives. Removes
                  jargon, focuses on impact, provides recommendations.
                </p>
                <Badge>Critique & Improve</Badge>
                <Badge className="ml-2">Audience Persona</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.target className="h-5 w-5 text-pink-600" />
                  Exploratory Data Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Generate initial insights and visualizations. Identifies
                  patterns, outliers, and correlations automatically.
                </p>
                <Badge>Few-Shot</Badge>
                <Badge className="ml-2">Template</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.check className="h-5 w-5 text-green-600" />
                  Model Validation Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Systematic approach to testing model accuracy, identifying
                  bias, and debugging unexpected behavior.
                </p>
                <Badge>Hypothesis Testing</Badge>
                <Badge className="ml-2">Cognitive Verifier</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="mx-auto max-w-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="space-y-6 py-12 text-center">
            <Icons.trophy className="mx-auto h-16 w-16 text-blue-600" />
            <h2 className="text-4xl font-bold">
              Ready to Automate Data Janitoring?
            </h2>
            <p className="text-xl text-gray-600">
              Join data scientists using AI to spend less time cleaning and more
              time discovering insights.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600"
                asChild
              >
                <Link href="/library">
                  Browse Prompts
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
