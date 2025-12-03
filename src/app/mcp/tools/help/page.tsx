/**
 * Help Tool Page
 * Guidance, discovery & setup
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Help Tool - Guidance, Discovery & Setup | Engify MCP',
  description:
    'Your starting point for Engify MCP tools. Get guidance on which tool to use, detailed documentation for each, and setup wizards for hooks, CI, and preferences.',
  openGraph: {
    title: 'Help Tool - Guidance, Discovery & Setup | Engify MCP',
    description:
      'Your starting point for Engify MCP tools. Get guidance, docs, and setup wizards.',
    url: 'https://engify.ai/mcp/tools/help',
  },
};
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Search, FileText, Link2, Settings } from 'lucide-react';

const capabilities = [
  {
    name: 'Tool Discovery',
    description:
      'Not sure which tool to use? Describe your task and get a recommendation.',
    code: `help({ task: 'validate my API endpoints' })
// Suggests: assess with API checks`,
    icon: Search,
    color: 'blue',
  },
  {
    name: 'Detailed Documentation',
    description:
      'Get complete documentation for any tool, including all parameters and examples.',
    code: `help({ tool: 'assess' })
// Returns full docs for assess tool`,
    icon: FileText,
    color: 'green',
  },
  {
    name: 'External Tool Recommendations',
    description:
      'Get suggestions for external tools that complement Engify - ESLint, TypeDoc, etc.',
    code: `help({ tool: 'tools' })
// Lists recommended external tools`,
    icon: Link2,
    color: 'purple',
  },
  {
    name: 'Setup Wizards',
    description:
      'Interactive setup for git hooks, CI pipelines, and coding preferences.',
    code: `help({ action: 'setup' })
// Runs full onboarding wizard`,
    icon: Settings,
    color: 'orange',
  },
];

const setupTargets = [
  {
    name: 'onboarding',
    description:
      'Complete setup wizard. Installs hooks, generates CI, captures preferences.',
    code: "help({ action: 'setup', target: 'onboarding' })",
    badge: 'Full wizard',
  },
  {
    name: 'hooks',
    description: 'Install git hooks for pre-commit and pre-push quality gates.',
    code: `help({
  action: 'setup',
  target: 'hooks',
  options: { hooks: ['pre-commit', 'pre-push'] }
})`,
  },
  {
    name: 'ci',
    description:
      'Generate GitHub Actions or GitLab CI workflows with quality gates.',
    code: `help({
  action: 'setup',
  target: 'ci',
  options: { ciProvider: 'github-actions', threshold: 7 }
})`,
  },
  {
    name: 'preferences',
    description:
      'Capture your coding preferences - verbosity, pet peeves, testing style.',
    code: `help({
  action: 'setup',
  target: 'preferences',
  preferences: {
    verbosity: 'peer',
    dry: true,
    testing: 'tdd',
    petPeeves: ['mock-data', 'over-engineering']
  }
})`,
  },
  {
    name: 'claude-code',
    description: 'Configure MCP server settings for Claude Code integration.',
    code: "help({ action: 'setup', target: 'claude-code' })",
  },
  {
    name: 'status',
    description: "Check what's already set up and what's missing.",
    code: "help({ action: 'setup', target: 'status' })",
  },
];

const preferences = [
  {
    name: 'verbosity',
    options: 'teacher, peer, code-only',
    description: 'How much explanation you want',
  },
  {
    name: 'testing',
    options: 'tdd, after, parallel, skip',
    description: 'When tests are written',
  },
  {
    name: 'typeStrictness',
    options: 'strict, loose',
    description: 'Type safety level',
  },
  {
    name: 'controlFlow',
    options: 'early-return, nested',
    description: 'Preferred code structure',
  },
  {
    name: 'dry',
    options: 'true, false',
    description: 'Enforce DRY strictly',
  },
  {
    name: 'autonomy',
    options: 'ask-first, just-do-it',
    description: 'Should AI ask before big changes',
  },
  {
    name: 'mode',
    options: 'prototype, production',
    description: 'Speed vs quality tradeoff',
  },
  {
    name: 'petPeeves',
    options: 'mock-data, over-engineering, ...',
    description: 'Behaviors to avoid',
  },
];

const colorClasses: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  green: { bg: 'bg-green-500/10', text: 'text-green-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
};

export default function HelpToolPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-pink-500/20">
              <HelpCircle className="h-8 w-8 text-pink-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold md:text-5xl">help</h1>
              <p className="text-lg text-pink-300">
                Guidance, discovery &amp; setup
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-xl text-muted-foreground">
            Your starting point for Engify tools. Get guidance on which tool to
            use, detailed documentation, and setup wizards for hooks, CI, and
            preferences.
          </p>
        </div>
      </section>

      {/* What You Can Do */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">What You Can Do</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {capabilities.map((cap) => {
              const colors = colorClasses[cap.color];
              const Icon = cap.icon;
              return (
                <Card key={cap.name}>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <h3 className="font-semibold">{cap.name}</h3>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {cap.description}
                    </p>
                    <pre className="overflow-x-auto rounded bg-slate-950 p-3 text-sm">
                      <code className="text-green-400">{cap.code}</code>
                    </pre>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Setup Targets */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">Setup Targets</h2>
          <p className="mb-8 text-muted-foreground">
            Configure specific aspects of your development environment.
          </p>
          <div className="space-y-4">
            {setupTargets.map((target) => (
              <Card key={target.name}>
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-pink-400">{target.name}</h3>
                    {target.badge && (
                      <span className="rounded bg-pink-500/20 px-2 py-1 text-xs text-pink-300">
                        {target.badge}
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {target.description}
                  </p>
                  <pre className="overflow-x-auto rounded bg-slate-950 p-3 text-sm">
                    <code className="text-green-400">{target.code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preference Options */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">Preference Options</h2>
          <p className="mb-8 text-muted-foreground">
            Customize how AI assistants work with you.
          </p>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-4 text-left font-medium">Preference</th>
                    <th className="p-4 text-left font-medium">Options</th>
                    <th className="p-4 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preferences.map((pref) => (
                    <tr key={pref.name}>
                      <td className="p-4 text-pink-400">{pref.name}</td>
                      <td className="p-4 text-muted-foreground">{pref.options}</td>
                      <td className="p-4 text-muted-foreground">
                        {pref.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready to get started?</h2>
          <p className="mb-8 text-muted-foreground">
            Run the help tool to discover what&apos;s available and set up your
            environment.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-pink-500 hover:bg-pink-600" asChild>
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
