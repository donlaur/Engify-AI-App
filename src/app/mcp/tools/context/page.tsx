/**
 * Context Tool Page
 * Easy-mode session management
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Context Tool - Simple Session Management | Engify MCP',
  description:
    'The easy-mode memory interface. Load session context, search for answers, save insights, and end sessions with summaries - all with minimal syntax.',
  openGraph: {
    title: 'Context Tool - Simple Session Management | Engify MCP',
    description:
      'The easy-mode memory interface for AI-assisted development.',
    url: 'https://engify.ai/mcp/tools/context',
  },
};
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Upload, Search, Save, CheckCircle } from 'lucide-react';

const comparisonContext = [
  { text: '4 simple actions', included: true },
  { text: 'Minimal parameters', included: true },
  { text: 'Quick to learn', included: true },
  { text: 'Auto-loads git state', included: true },
  { text: 'No memory scopes', included: false },
  { text: 'No checkpoints', included: false },
];

const comparisonMemory = [
  { text: '40+ actions', included: true },
  { text: 'Fine-grained control', included: true },
  { text: 'Memory scopes (personal/team/org)', included: true },
  { text: 'Checkpoints', included: true },
  { text: 'Ideas & features tracking', included: true },
  { text: 'Schema scanning', included: true },
];

const actions = [
  {
    name: 'load',
    subtitle: 'Start your session',
    description:
      'Loads previous session context, git state, and your preferences. Run this first.',
    code: "context()  // or context({ action: 'load' })",
    icon: Upload,
  },
  {
    name: 'search',
    subtitle: 'Find information',
    description:
      'Semantic search across all your memories. Faster than asking the user.',
    code: "context({ action: 'search', query: 'auth implementation' })",
    icon: Search,
  },
  {
    name: 'save',
    subtitle: 'Store something',
    description: 'Save an insight, decision, or piece of knowledge for later.',
    code: "context({ action: 'save', text: 'Decided to use Zod for API validation' })",
    icon: Save,
  },
  {
    name: 'end',
    subtitle: 'Wrap up session',
    description:
      "Save a summary for next time. What you accomplished, what's pending.",
    code: "context({ action: 'end', summary: 'Completed API auth. Next: add refresh tokens.' })",
    icon: CheckCircle,
  },
];

const workflowSteps = [
  {
    step: 1,
    description: 'Start session (loads your context)',
    code: 'context()',
  },
  {
    step: 2,
    description: "Check if you've solved this before",
    code: "context({ action: 'search', query: 'rate limiting' })",
  },
  {
    step: 3,
    description: 'Work on your feature...',
    note: '(AI remembers your preferences from loaded context)',
  },
  {
    step: 4,
    description: 'Save a learning along the way',
    code: "context({ action: 'save', text: 'Redis rate limiter needs sliding window for bursts' })",
  },
  {
    step: 5,
    description: 'End with a summary',
    code: "context({ action: 'end', summary: 'Rate limiting done. Need to add bypass for internal services.' })",
  },
];

export default function ContextToolPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-yellow-500/20">
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold md:text-5xl">context</h1>
              <p className="text-lg text-yellow-300">
                Easy-mode session management
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-xl text-muted-foreground">
            A simplified wrapper around the memory tool. Four actions, minimal
            syntax, maximum productivity. Perfect for quick sessions.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">Memory vs Context</h2>
          <p className="mb-8 text-muted-foreground">
            Same underlying system, different interfaces. Use{' '}
            <code className="text-yellow-400">context</code> for speed,{' '}
            <code className="text-purple-400">memory</code> for power.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-yellow-500/30">
              <CardContent className="pt-6">
                <h3 className="mb-4 font-semibold text-yellow-400">context</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {comparisonContext.map((item) => (
                    <li key={item.text} className="flex items-start gap-2">
                      <span
                        className={
                          item.included ? 'text-green-400' : 'text-slate-600'
                        }
                      >
                        {item.included ? '✓' : '✗'}
                      </span>
                      {item.text}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-slate-500">
                  Best for: Individual sessions, quick tasks
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30">
              <CardContent className="pt-6">
                <h3 className="mb-4 font-semibold text-purple-400">memory</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {comparisonMemory.map((item) => (
                    <li key={item.text} className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-slate-500">
                  Best for: Team workflows, complex projects
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Four Actions */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">Four Actions</h2>
          <div className="space-y-6">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Card key={action.name}>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-400">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-yellow-400">
                          {action.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {action.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {action.description}
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-sm">
                      <code className="text-green-400">{action.code}</code>
                    </pre>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Typical Workflow */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">Typical Session</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {workflowSteps.map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-sm text-yellow-400">
                      {item.step}
                    </span>
                    <div className="flex-1">
                      <p className="mb-2 text-foreground">{item.description}</p>
                      {item.note && (
                        <p className="text-sm text-slate-500">{item.note}</p>
                      )}
                      {item.code && (
                        <pre className="overflow-x-auto rounded bg-slate-950 p-3 text-sm">
                          <code className="text-green-400">{item.code}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold">
            Simple context, powerful results
          </h2>
          <p className="mb-8 text-muted-foreground">
            Four actions. Zero learning curve. Full session continuity.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-yellow-500 text-slate-900 hover:bg-yellow-400"
              asChild
            >
              <Link href="/mcp#get-started">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/mcp/tools/memory">Full Memory Tool</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
