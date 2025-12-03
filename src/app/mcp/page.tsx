/**
 * MCP Server - Main landing page
 * AI-powered code quality tools for your IDE
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'MCP Server - AI Code Quality Tools | Engify.ai',
  description:
    'Production-ready MCP tools for code assessment, memory management, and pattern-based development. Works with Claude Code, Cursor, and any MCP-compatible client.',
  keywords: [
    'MCP server',
    'Model Context Protocol',
    'Claude Code',
    'Cursor AI',
    'code assessment',
    'AI memory',
    'code patterns',
    'code quality',
  ],
  openGraph: {
    title: 'MCP Server - AI Code Quality Tools | Engify.ai',
    description:
      'Production-ready MCP tools for code assessment, memory management, and pattern-based development.',
    url: 'https://engify.ai/mcp',
    type: 'website',
  },
};
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Shield,
  Layers,
  Zap,
  Eye,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

const tools = [
  {
    name: 'memory',
    description:
      'Stores your preferences, decisions, and project context persistently across coding sessions.',
    useFor:
      'Starting sessions, saving learnings, searching past decisions, and maintaining continuity between conversations.',
    example: "memory({ action: 'session_start' })",
    href: '/mcp/tools/memory',
    icon: Brain,
    color: 'purple',
  },
  {
    name: 'assess',
    description:
      'Scans code for security vulnerabilities, quality issues, missing documentation, and anti-patterns.',
    useFor:
      'Pre-commit checks, code reviews, identifying technical debt, and ensuring consistent quality standards.',
    example: "assess({ code: '...', checks: 'auto' })",
    href: '/mcp/tools/assess',
    icon: Shield,
    color: 'green',
  },
  {
    name: 'pattern',
    description:
      'Provides 50+ curated code patterns for TypeScript, Python, React, and APIs that you can inject into your code.',
    useFor:
      'Error handling, API design, authentication flows, and applying consistent team conventions.',
    example: "pattern({ action: 'select', task: '...' })",
    href: '/mcp/tools/pattern',
    icon: Layers,
    color: 'blue',
  },
  {
    name: 'context',
    description:
      'A simplified interface to the memory system for quick load, search, save, and end-session operations.',
    useFor:
      'Fast session setup, quick knowledge lookups, and saving insights without complex syntax.',
    example: "context({ action: 'load' })",
    href: '/mcp/tools/context',
    icon: Zap,
    color: 'yellow',
  },
  {
    name: 'monitor',
    description:
      'Automatically watches code changes, scores quality, detects issues, and suggests improvements.',
    useFor:
      'Continuous quality feedback while coding, catching issues early, and learning from patterns.',
    example: "monitor({ code: '...', action: 'edit' })",
    href: '/mcp/tools/monitor',
    icon: Eye,
    color: 'orange',
  },
  {
    name: 'help',
    description:
      'Provides guidance on which tool to use, detailed documentation, and setup instructions.',
    useFor:
      'Learning the tools, getting task-based recommendations, and troubleshooting setup issues.',
    example: "help({ tool: 'assess' })",
    href: '/mcp/tools/help',
    icon: HelpCircle,
    color: 'pink',
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    border: 'hover:border-purple-500/50',
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    border: 'hover:border-green-500/50',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'hover:border-blue-500/50',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-500',
    border: 'hover:border-yellow-500/50',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
    border: 'hover:border-orange-500/50',
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-500',
    border: 'hover:border-pink-500/50',
  },
};

export default function MCPPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-6xl">
            AI-Powered Code Quality
            <br />
            <span className="text-primary">For Your IDE</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Production-ready MCP tools for code assessment, memory management,
            and pattern-based development. Works with Claude Code, Cursor, and
            any MCP-compatible client.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#get-started">Connect Your IDE</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#tools">Explore Tools</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="scroll-mt-20 py-20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold">Available Tools</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            Six core tools to enhance your AI-assisted development workflow
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const colors = colorClasses[tool.color];
              const Icon = tool.icon;
              return (
                <Link key={tool.name} href={tool.href}>
                  <Card
                    className={`h-full transition-all hover:-translate-y-0.5 hover:shadow-lg ${colors.border}`}
                  >
                    <CardHeader>
                      <div
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg}`}
                      >
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <CardTitle className="text-xl">{tool.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex h-full flex-col space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          What it does:
                        </span>{' '}
                        {tool.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Use it for:
                        </span>{' '}
                        {tool.useFor}
                      </p>
                      <div className="mt-auto space-y-3 pt-2">
                        <code className="block overflow-x-auto rounded bg-muted px-2 py-1.5 text-xs">
                          {tool.example}
                        </code>
                        <div className={`flex items-center text-sm font-medium ${colors.text}`}>
                          Learn more
                          <span className="ml-1">&rarr;</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section id="get-started" className="scroll-mt-20 bg-muted/50 py-20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold">Get Started</h2>
          <p className="mb-12 text-center text-muted-foreground">
            Connect to the MCP server in three steps
          </p>

          <div className="space-y-8">
            {/* Step 1 */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 flex items-center gap-3 text-xl font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    1
                  </span>
                  Get Your API Token
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Sign in to your Engify dashboard to get your personal API
                  token. This authenticates your IDE with the MCP server.
                </p>
                <Button asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 flex items-center gap-3 text-xl font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    2
                  </span>
                  Configure Your IDE
                </h3>

                <div className="space-y-6">
                  {/* Claude Code */}
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-medium">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-orange-500/20 text-xs font-bold text-orange-500">
                        C
                      </span>
                      Claude Code
                    </h4>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Add to your MCP settings file:
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm">
                      <code className="text-green-400">{`{
  "mcpServers": {
    "engify": {
      "url": "https://mcp.engify.ai",
      "transport": "http"
    }
  }
}`}</code>
                    </pre>
                  </div>

                  {/* Cursor */}
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-medium">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/20 text-xs font-bold text-blue-500">
                        &#9654;
                      </span>
                      Cursor
                    </h4>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Add to <code className="rounded bg-muted px-1">.cursor/mcp.json</code>:
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm">
                      <code className="text-green-400">{`{
  "servers": {
    "engify": {
      "url": "https://mcp.engify.ai"
    }
  }
}`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 flex items-center gap-3 text-xl font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    3
                  </span>
                  Test Your Connection
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Verify the server is accessible:
                </p>
                <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm">
                  <code className="text-slate-300">
                    curl https://mcp.engify.ai/health
                    <br />
                    <span className="text-green-400">
                      # {`{"status":"ok","version":"0.3.1"}`}
                    </span>
                  </code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="api" className="scroll-mt-20 py-20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold">API Reference</h2>
          <p className="mb-12 text-center text-muted-foreground">
            Direct HTTP access for testing and integration
          </p>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-4 text-left font-medium">Endpoint</th>
                    <th className="p-4 text-left font-medium">Method</th>
                    <th className="p-4 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-4">
                      <code className="text-primary">/health</code>
                    </td>
                    <td className="p-4 text-muted-foreground">GET</td>
                    <td className="p-4 text-muted-foreground">
                      Basic health check
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">
                      <code className="text-primary">/healthz</code>
                    </td>
                    <td className="p-4 text-muted-foreground">GET</td>
                    <td className="p-4 text-muted-foreground">
                      Detailed health with dependency status
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">
                      <code className="text-primary">/tools</code>
                    </td>
                    <td className="p-4 text-muted-foreground">GET</td>
                    <td className="p-4 text-muted-foreground">
                      List all available tools with schemas
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">
                      <code className="text-primary">/tools/{'{name}'}</code>
                    </td>
                    <td className="p-4 text-muted-foreground">POST</td>
                    <td className="p-4 text-muted-foreground">
                      Call a specific tool with arguments
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">
                      <code className="text-primary">/prompts</code>
                    </td>
                    <td className="p-4 text-muted-foreground">GET</td>
                    <td className="p-4 text-muted-foreground">
                      List available prompts
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
