/**
 * Monitor Tool Page
 * Proactive code quality feedback
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Monitor Tool - Proactive Code Quality Feedback | Engify MCP',
  description:
    'Get real-time quality feedback as you code. Monitor watches your changes, scores quality, detects issues early, and suggests patterns - without slowing you down.',
  openGraph: {
    title: 'Monitor Tool - Proactive Code Quality Feedback | Engify MCP',
    description:
      'Get real-time quality feedback as you code without slowing you down.',
    url: 'https://engify.ai/mcp/tools/monitor',
  },
};
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Eye,
  AlertCircle,
  BarChart3,
  AlertTriangle,
  Brain,
  Layers,
} from 'lucide-react';

const painPoints = [
  {
    title: '"Quality checks are an afterthought"',
    description:
      "You run linters after you're done. By then you've written 100 lines with the same anti-pattern repeated throughout.",
  },
  {
    title: '"Can\'t see quality trends"',
    description:
      "Is code quality improving or degrading? You only know when tech debt becomes painful. No leading indicators.",
  },
  {
    title: '"Missing context for issues"',
    description:
      'Linter says "complex function." But what triggered it? What were you trying to do? No history to learn from.',
  },
  {
    title: '"Pattern suggestions come too late"',
    description:
      "Code review catches missing patterns after you've shipped the PR. Should have known about the better approach while writing.",
  },
];

const features = [
  {
    name: 'Quality Scoring',
    description:
      'Returns a 0-10 score for each code change based on security, complexity, and adherence to patterns.',
    icon: BarChart3,
    color: 'green',
  },
  {
    name: 'Issue Detection',
    description:
      'Surfaces problems immediately. Security issues, missing error handling, complexity spikes - caught as you type.',
    icon: AlertTriangle,
    color: 'red',
  },
  {
    name: 'Memory Logging',
    description:
      'Automatically saves quality snapshots to memory. Build a history of how files evolve over time.',
    icon: Brain,
    color: 'purple',
  },
  {
    name: 'Pattern Suggestions',
    description:
      "Recommends relevant patterns when it spots opportunities. Error handling needed? Here's the pattern.",
    icon: Layers,
    color: 'blue',
  },
];

const triggers = [
  {
    name: 'create',
    description:
      'Run when a new file is created. Checks initial structure and catches bad patterns before they spread.',
    color: 'green',
    hint: 'New file written',
  },
  {
    name: 'edit',
    description:
      'Run after edits. Most common trigger. Tracks how quality changes with each modification.',
    color: 'yellow',
    hint: 'File modified',
  },
  {
    name: 'save',
    description:
      'Run on save for checkpoint-style monitoring. Less frequent but captures "finished" states.',
    color: 'blue',
    hint: 'File saved',
  },
];

const colorClasses: Record<string, { bg: string; text: string; dot: string }> = {
  green: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' },
};

export default function MonitorToolPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-orange-500/20">
              <Eye className="h-8 w-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold md:text-5xl">monitor</h1>
              <p className="text-lg text-orange-300">
                Proactive code quality feedback
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-xl text-muted-foreground">
            Get quality scores as you write code. Monitor watches your changes,
            catches issues early, logs insights to memory, and suggests relevant
            patterns - all without slowing you down.
          </p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">Problems This Solves</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {painPoints.map((point) => (
              <Card key={point.title}>
                <CardContent className="pt-6">
                  <AlertCircle className="mb-3 h-6 w-6 text-red-400" />
                  <h3 className="mb-2 font-semibold">{point.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {point.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What It Does */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">What It Does</h2>
          <p className="mb-8 text-muted-foreground">
            Monitor is designed to run after code changes. It&apos;s lightweight
            and non-blocking.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => {
              const colors = colorClasses[feature.color];
              const Icon = feature.icon;
              return (
                <Card key={feature.name}>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <h3 className="font-semibold">{feature.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trigger Actions */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">Trigger Actions</h2>
          <div className="space-y-4">
            {triggers.map((trigger) => {
              const colors = colorClasses[trigger.color];
              return (
                <Card key={trigger.name}>
                  <CardContent className="pt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${colors.dot}`} />
                        <h3 className="font-semibold text-orange-400">
                          {trigger.name}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500">
                        {trigger.hint}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {trigger.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Usage */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">Usage</h2>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="mb-3 font-semibold text-orange-400">
                Basic Monitoring
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Pass the code and what triggered the check.
              </p>
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm">
                <code className="text-green-400">{`monitor({
  code: '... your code ...',
  action: 'edit',
  filePath: 'src/api/users.ts',
  language: 'typescript'
})`}</code>
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 font-semibold text-orange-400">
                Example Response
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm">
                <code className="text-slate-300">{`{
  "score": 7.5,
  "issues": [
    {
      "severity": "medium",
      "message": "Empty catch block - errors are being swallowed",
      "line": 42
    }
  ],
  "suggestions": [
    {
      "patternId": "TS-ERR-001",
      "description": "Consider using Result type for error handling"
    }
  ],
  "logged": true
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold">
            Quality feedback in real-time
          </h2>
          <p className="mb-8 text-muted-foreground">
            Catch issues as you write, not after you&apos;ve shipped.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600" asChild>
              <Link href="/mcp#get-started">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/mcp">View All Tools</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
