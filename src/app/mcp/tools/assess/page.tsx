/**
 * Assess Tool Page
 * Code quality in one call
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Assess Tool - Code Quality in One Call | Engify MCP',
  description:
    'Security, quality, documentation, and pattern checks in a single tool call. Catch vulnerabilities, anti-patterns, and technical debt before they reach production.',
  openGraph: {
    title: 'Assess Tool - Code Quality in One Call | Engify MCP',
    description:
      'Security, quality, documentation, and pattern checks in a single tool call.',
    url: 'https://engify.ai/mcp/tools/assess',
  },
};
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Database,
  FileText,
} from 'lucide-react';

const painPoints = [
  {
    title: '"AI generates insecure code"',
    description:
      'SQL injection, XSS, command injection - AI assistants write vulnerable code because they optimize for functionality, not security.',
  },
  {
    title: '"Too many linters to configure"',
    description:
      "ESLint, Prettier, SonarQube, Semgrep - each with their own config. You need one unified assessment, not 5 different tools.",
  },
  {
    title: '"Quality checks happen too late"',
    description:
      "CI/CD catches issues after you've committed. By then, you've context-switched. You need feedback while the code is fresh in your mind.",
  },
  {
    title: '"AI hallucinates database fields"',
    description:
      "AI invents columns that don't exist. Without schema validation, you don't catch it until runtime.",
  },
];

const checkTypes = [
  {
    name: 'Security',
    items: [
      'SQL injection patterns',
      'XSS vulnerabilities',
      'Command injection',
      'Hardcoded secrets',
      'Insecure dependencies',
    ],
    icon: Lock,
    color: 'red',
  },
  {
    name: 'Quality',
    items: [
      'Empty catch blocks',
      'Missing await',
      'Unused variables',
      'Console.log pollution',
      'Code complexity',
    ],
    icon: CheckCircle2,
    color: 'green',
  },
  {
    name: 'Schema',
    items: [
      'Validates against Drizzle/Prisma schemas',
      'Catches hallucinated columns',
      'Type mismatches',
      'Missing relations',
    ],
    icon: Database,
    color: 'blue',
  },
  {
    name: 'Documentation',
    items: [
      'JSDoc coverage',
      'Missing parameter docs',
      'Undocumented exports',
      'Outdated examples',
    ],
    icon: FileText,
    color: 'purple',
  },
];

const modes = [
  {
    name: 'Prototype',
    branches: 'feature/*, poc/*',
    behavior: 'Warnings only - explore freely',
    color: 'yellow',
  },
  {
    name: 'Development',
    branches: 'develop, dev/*',
    behavior: 'Blocks critical issues',
    color: 'blue',
  },
  {
    name: 'Staging',
    branches: 'staging/*, release/*',
    behavior: 'Blocks high severity +',
    color: 'orange',
  },
  {
    name: 'Production',
    branches: 'main, master',
    behavior: 'Blocks medium severity +',
    color: 'red',
  },
];

const usageExamples = [
  {
    title: 'Basic Assessment',
    description: 'Auto-detects file type and runs all relevant checks.',
    code: `assess({
  code: '...',
  filePath: 'src/api/users.ts'
})`,
  },
  {
    title: 'Specific Checks',
    description: 'Run only security and schema validation.',
    code: `assess({
  code: '...',
  checks: ['security', 'schema'],
  schemaFile: 'db/schema.ts'
})`,
  },
  {
    title: 'Project-Wide Assessment',
    description: 'Assess all TypeScript files and get aggregate metrics.',
    code: `assess_project({
  pattern: 'src/**/*.ts',
  checks: 'auto'
})`,
  },
];

const colorClasses: Record<string, { bg: string; text: string; badge: string }> = {
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    badge: 'bg-red-500/20 text-red-300',
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    badge: 'bg-green-500/20 text-green-300',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    badge: 'bg-purple-500/20 text-purple-300',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-500',
    badge: 'bg-yellow-500/20 text-yellow-300',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
    badge: 'bg-orange-500/20 text-orange-300',
  },
};

export default function AssessToolPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-500/20">
              <Shield className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold md:text-5xl">assess</h1>
              <p className="text-lg text-green-300">Code quality in one call</p>
            </div>
          </div>
          <p className="max-w-2xl text-xl text-muted-foreground">
            Security vulnerabilities, quality issues, missing docs, and
            anti-patterns - all checked in a single tool call with pass/fail
            results and actionable feedback.
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
                  <AlertTriangle className="mb-3 h-6 w-6 text-red-400" />
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

      {/* Check Types */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">What Gets Checked</h2>
          <p className="mb-8 text-muted-foreground">
            Auto-detects file type and runs relevant checks. You can also
            specify exactly which checks to run.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {checkTypes.map((check) => {
              const colors = colorClasses[check.color];
              const Icon = check.icon;
              return (
                <Card key={check.name}>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <h3 className="font-semibold">{check.name}</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {check.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className={`mt-1 ${colors.text}`}>&#x2022;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Development Modes */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">Adaptive Strictness</h2>
          <p className="mb-8 text-muted-foreground">
            Different phases of development need different guardrails. Assess
            automatically adjusts based on your git branch.
          </p>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-4 text-left font-medium">Mode</th>
                    <th className="p-4 text-left font-medium">Branches</th>
                    <th className="p-4 text-left font-medium">Behavior</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {modes.map((mode) => {
                    const colors = colorClasses[mode.color];
                    return (
                      <tr key={mode.name}>
                        <td className="p-4">
                          <span
                            className={`rounded px-2 py-1 text-xs ${colors.badge}`}
                          >
                            {mode.name}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {mode.branches}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {mode.behavior}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">Usage</h2>
          <div className="space-y-6">
            {usageExamples.map((example) => (
              <Card key={example.title}>
                <CardContent className="pt-6">
                  <h3 className="mb-3 font-semibold text-green-400">
                    {example.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {example.description}
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm">
                    <code className="text-green-400">{example.code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold">
            Catch issues before they ship
          </h2>
          <p className="mb-8 text-muted-foreground">
            Get unified code quality checks directly in your AI-assisted
            workflow.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-green-500 hover:bg-green-600" asChild>
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
