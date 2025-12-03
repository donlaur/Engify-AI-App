/**
 * Memory Tool Page
 * AI context that persists across sessions
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Memory Tool - AI Context That Persists | Engify MCP',
  description:
    'Stop repeating yourself to AI. The memory tool stores your preferences, decisions, and project context across coding sessions. Three memory types: Episodic, Semantic, and Procedural.',
  openGraph: {
    title: 'Memory Tool - AI Context That Persists | Engify MCP',
    description:
      'Stop repeating yourself to AI. Store preferences, decisions, and project context across coding sessions.',
    url: 'https://engify.ai/mcp/tools/memory',
  },
};
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Clock, BookOpen, Workflow, AlertCircle } from 'lucide-react';

const painPoints = [
  {
    title: '"AI keeps forgetting my preferences"',
    description:
      "Every new chat starts fresh. You have to re-explain that you prefer early returns, hate mocks, and want TypeScript strict mode.",
  },
  {
    title: '"Context gets lost mid-project"',
    description:
      "Long projects hit context limits. AI forgets decisions made hours ago and suggests approaches you already rejected.",
  },
  {
    title: '"Can\'t resume where I left off"',
    description:
      "Close your IDE, come back tomorrow, and you're starting from scratch. No continuity between sessions.",
  },
  {
    title: '"Team knowledge doesn\'t stick"',
    description:
      "Each developer teaches AI the same project conventions. No shared understanding of architecture decisions or coding standards.",
  },
];

const memoryTypes = [
  {
    name: 'Episodic Memory',
    description:
      'What happened and when. Time-ordered experiences like sessions, debugging logs, and assessment results.',
    examples: [
      'Session on Nov 15: Fixed authentication bug in /api/login',
      'Code assessment: 3 security issues found in payment.ts',
      'Debugging session: Memory leak traced to event listeners',
    ],
    icon: Clock,
    color: 'blue',
  },
  {
    name: 'Semantic Memory',
    description:
      'Facts and knowledge. Conceptual information like preferences, architecture decisions, and domain knowledge.',
    examples: [
      'User prefers early returns over nested conditionals',
      'Project uses Drizzle ORM with PostgreSQL',
      'ADR-012: Chose JWT over session cookies for auth',
    ],
    icon: BookOpen,
    color: 'green',
  },
  {
    name: 'Procedural Memory',
    description:
      'How to do things. Recipes, workflows, and step-by-step processes that can be reused.',
    examples: [
      'Deploy to production: build, test, docker push, k8s apply',
      'Setup new microservice: scaffold, env vars, health check, CI',
      'Stripe integration: API key, webhook secret, test mode first',
    ],
    icon: Workflow,
    color: 'orange',
  },
];

const keyActions = [
  {
    name: 'session_start',
    description:
      'Run this first in every session. Loads your previous context, preferences, and recent work.',
    example: "memory({ action: 'session_start' })",
    badge: 'Essential',
  },
  {
    name: 'search',
    description:
      'Find relevant memories before asking the user. Semantic search across all memory types.',
    example: "memory({ action: 'search', query: 'authentication approach' })",
    badge: 'High Use',
  },
  {
    name: 'add',
    description:
      'Store new knowledge. Memory type is auto-detected or can be specified.',
    example: "memory({ action: 'add', text: 'User prefers Zod for validation' })",
  },
  {
    name: 'session_end',
    description:
      'Save a summary when done. Captures what was accomplished for the next session.',
    example: "memory({ action: 'session_end', summary: 'Completed auth refactor' })",
  },
];

const scopes = [
  {
    name: 'Personal',
    description:
      'Your private preferences, habits, and personal workflow notes. Only you can see these.',
    color: 'blue',
  },
  {
    name: 'Repo',
    description:
      'Project-specific decisions, architecture notes, and codebase conventions. Shared with project collaborators.',
    color: 'green',
  },
  {
    name: 'Team',
    description:
      'Team coding standards, shared patterns, and cross-project knowledge. Available to all team members.',
    color: 'yellow',
  },
  {
    name: 'Org',
    description:
      'Organization-wide policies, security requirements, and enterprise standards. Accessible company-wide.',
    color: 'purple',
  },
];

const colorClasses: Record<string, { bg: string; text: string; dot: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-400' },
  green: { bg: 'bg-green-500/10', text: 'text-green-500', dot: 'bg-green-400' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', dot: 'bg-orange-400' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', dot: 'bg-yellow-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', dot: 'bg-purple-400' },
};

export default function MemoryToolPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-500/20">
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold md:text-5xl">memory</h1>
              <p className="text-lg text-purple-300">
                AI context that persists across sessions
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-xl text-muted-foreground">
            Stop repeating yourself. The memory tool stores your preferences,
            decisions, and project context so AI assistants remember what
            matters to you.
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

      {/* Memory Types */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">Three Types of Memory</h2>
          <p className="mb-8 text-muted-foreground">
            Inspired by cognitive science research (CoALA framework), memories
            are automatically classified for optimal retrieval.
          </p>
          <div className="space-y-6">
            {memoryTypes.map((type) => {
              const colors = colorClasses[type.color];
              const Icon = type.icon;
              return (
                <Card key={type.name}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${colors.bg}`}
                      >
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className={`mb-2 text-xl font-semibold ${colors.text}`}>
                          {type.name}
                        </h3>
                        <p className="mb-3 text-foreground">
                          <strong>{type.description.split('.')[0]}.</strong>{' '}
                          {type.description.split('.').slice(1).join('.')}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          <p className="mb-2 font-medium">Examples:</p>
                          <ul className="list-inside list-disc space-y-1">
                            {type.examples.map((example) => (
                              <li key={example}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Actions */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">Key Actions</h2>
          <div className="space-y-4">
            {keyActions.map((action) => (
              <Card key={action.name}>
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-purple-400">
                      {action.name}
                    </h3>
                    {action.badge && (
                      <span className="rounded bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                  <pre className="overflow-x-auto rounded bg-slate-950 p-3 text-sm">
                    <code className="text-green-400">{action.example}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Memory Scopes */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">Memory Scopes</h2>
          <p className="mb-8 text-muted-foreground">
            Control who can access memories. Personal stays private; shared
            scopes enable team knowledge.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {scopes.map((scope) => {
              const colors = colorClasses[scope.color];
              return (
                <Card key={scope.name}>
                  <CardContent className="pt-6">
                    <h3 className="mb-2 flex items-center gap-2 font-semibold">
                      <span className={`h-3 w-3 rounded-full ${colors.dot}`} />
                      {scope.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {scope.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold">
            Ready to stop repeating yourself?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Connect your IDE and start building persistent context today.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-purple-500 hover:bg-purple-600" asChild>
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
