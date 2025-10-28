/**
 * MCP (Model Context Protocol) Page
 * Explains MCP and how it integrates with Engify.ai
 */

'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import Link from 'next/link';

export default function MCPPage() {
  return (
    <MainLayout>
      <div className="container py-12">
        {/* Hero */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-200">
            <Icons.zap className="h-4 w-4" />
            Model Context Protocol
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Connect AI to Your Tools
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              with MCP
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            The Model Context Protocol (MCP) is an open standard that lets AI
            assistants connect to your tools, data, and workflows. We use it to
            integrate Sentry, databases, and more.
          </p>
        </div>

        {/* What is MCP */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.info className="h-6 w-6 text-blue-600" />
              What is MCP?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              MCP is like USB for AI - a universal standard that lets AI
              assistants connect to any tool or data source. Instead of building
              custom integrations for every tool, MCP provides one protocol that
              works everywhere.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <Icons.database className="mb-2 h-8 w-8 text-green-600" />
                <h3 className="mb-2 font-semibold">Connect to Data</h3>
                <p className="text-sm text-muted-foreground">
                  Access databases, files, APIs, and more
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <Icons.settings className="mb-2 h-8 w-8 text-blue-600" />
                <h3 className="mb-2 font-semibold">Use Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Execute actions, run commands, automate workflows
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <Icons.zap className="mb-2 h-8 w-8 text-purple-600" />
                <h3 className="mb-2 font-semibold">Stay Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Controlled access, audit logs, permissions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use MCP */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.sparkles className="h-6 w-6 text-purple-600" />
              How Engify.ai Uses MCP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Icons.alertTriangle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Sentry Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI can query Sentry errors, analyze trends, and suggest
                    fixes directly from your error monitoring data.
                  </p>
                  <code className="mt-2 inline-block rounded bg-muted px-2 py-1 text-xs">
                    https://mcp.sentry.dev/mcp/laurs-classic-corgis/javascript-nextjs-g6
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Icons.database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Database Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Query our prompt library, analyze usage patterns, and get
                    insights without writing SQL.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Icons.code className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">GitHub Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Access repos, create issues, review PRs - all through
                    natural language.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Use Cases */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.lightbulb className="h-6 w-6 text-yellow-600" />
              Example Use Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="mb-2 font-medium">
                  🐛 &quot;Show me all errors from the last hour&quot;
                </p>
                <p className="text-sm text-muted-foreground">
                  AI queries Sentry via MCP, analyzes errors, and shows you the
                  top issues with suggested fixes.
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="mb-2 font-medium">
                  📊 &quot;What are the most popular prompts?&quot;
                </p>
                <p className="text-sm text-muted-foreground">
                  AI queries MongoDB via MCP, aggregates usage data, and shows
                  trending prompts by role.
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="mb-2 font-medium">
                  🚀 &quot;Create a GitHub issue for this bug&quot;
                </p>
                <p className="text-sm text-muted-foreground">
                  AI uses GitHub MCP to create an issue with context, labels,
                  and assignees.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.rocket className="h-6 w-6 text-green-600" />
              Get Started with MCP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Want to use MCP in your own projects? Here&apos;s how:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icons.check className="h-5 w-5 text-green-600" />
                <span>
                  Install an MCP-compatible AI assistant (Claude, Windsurf,
                  etc.)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.check className="h-5 w-5 text-green-600" />
                <span>Configure MCP servers in your settings</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.check className="h-5 w-5 text-green-600" />
                <span>Start asking questions about your tools and data</span>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button asChild>
                <a
                  href="https://modelcontextprotocol.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icons.externalLink className="mr-2 h-4 w-4" />
                  Learn More About MCP
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/library">
                  Browse Our Prompts
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
