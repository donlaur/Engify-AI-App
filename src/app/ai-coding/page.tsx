/**
 * AI-Assisted Coding Tips Page
 * Best practices for using AI tools like Cursor, Windsurf, Claude, etc.
 */

'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

const tips = [
  {
    category: 'Cursor Tips',
    icon: Icons.code,
    color: 'blue',
    items: [
      {
        title: 'Use Cmd+K for inline edits',
        description: 'Select code and press Cmd+K to get AI suggestions inline. Much faster than chat.',
      },
      {
        title: 'Reference files with @filename',
        description: 'Type @ in chat to reference specific files. AI gets full context.',
      },
      {
        title: 'Use Composer for multi-file changes',
        description: 'Cmd+I opens Composer - perfect for refactoring across multiple files.',
      },
    ],
  },
  {
    category: 'Windsurf + Claude',
    icon: Icons.zap,
    color: 'purple',
    items: [
      {
        title: 'Cascade mode for autonomous work',
        description: 'Let Cascade handle multi-step tasks while you focus on architecture.',
      },
      {
        title: 'Use tools in parallel',
        description: 'Cascade can read multiple files, search, and edit simultaneously.',
      },
      {
        title: 'Set clear goals, not steps',
        description: 'Tell Cascade WHAT you want, not HOW. Let it figure out the steps.',
      },
    ],
  },
  {
    category: 'Prompting Best Practices',
    icon: Icons.sparkles,
    color: 'green',
    items: [
      {
        title: 'Be specific about constraints',
        description: 'Tell AI what NOT to do. "Don\'t use any, keep it under 100 lines, use TypeScript strict mode"',
      },
      {
        title: 'Provide examples',
        description: 'Show the AI existing code style. It will match your patterns.',
      },
      {
        title: 'Iterate, don\'t perfect',
        description: 'Get 80% from AI, refine the 20% yourself. Faster than writing from scratch.',
      },
    ],
  },
  {
    category: 'Code Review with AI',
    icon: Icons.search,
    color: 'orange',
    items: [
      {
        title: 'Ask for security review',
        description: 'Paste code and ask: "Review for security vulnerabilities, especially SQL injection and XSS"',
      },
      {
        title: 'Performance analysis',
        description: 'Ask: "Identify performance bottlenecks and suggest optimizations"',
      },
      {
        title: 'Best practices check',
        description: 'Ask: "Does this follow React/TypeScript best practices? What would you change?"',
      },
    ],
  },
  {
    category: 'GitHub Copilot Patterns',
    icon: Icons.github,
    color: 'pink',
    items: [
      {
        title: 'Write comments first',
        description: 'Describe what you want in a comment. Copilot will generate the code.',
      },
      {
        title: 'Use descriptive function names',
        description: 'Name your function clearly. Copilot will infer the implementation.',
      },
      {
        title: 'Accept, then refine',
        description: 'Accept Copilot suggestions, then tweak. Faster than typing from scratch.',
      },
    ],
  },
];

export default function AICodingPage() {
  return (
    <MainLayout>
      <div className="container py-12">
        {/* Hero */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200 mb-6">
            <Icons.sparkles className="h-4 w-4" />
            AI-Assisted Development
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Code Faster with AI
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Without Sacrificing Quality
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Tips, tricks, and best practices for using Cursor, Windsurf, Claude, GitHub Copilot,
            and other AI coding tools effectively.
          </p>
        </div>

        {/* Tips Grid */}
        <div className="space-y-8">
          {tips.map((section) => {
            const Icon = section.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
              purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
              green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
              orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
              pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
            };

            return (
              <Card key={section.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClasses[section.color as keyof typeof colorClasses]}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {section.items.map((tip, index) => (
                      <div key={index} className="rounded-lg border p-4 space-y-2">
                        <h3 className="font-semibold flex items-start gap-2">
                          <Icons.check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          {tip.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* General Principles */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.lightbulb className="h-6 w-6 text-yellow-600" />
              General Principles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">✅ Do This</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Icons.check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Use AI for boilerplate, write logic yourself</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Review every AI suggestion before accepting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Iterate quickly, refine manually</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Use AI for code review and security checks</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-red-600">❌ Don&apos;t Do This</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Icons.x className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Blindly accept AI code without understanding it</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.x className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Let AI make architectural decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.x className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Skip testing because AI wrote it</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.x className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Use AI as a crutch instead of learning</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Example */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.workflow className="h-6 w-6 text-purple-600" />
              Example Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Badge className="bg-blue-600">1</Badge>
                <div>
                  <h3 className="font-semibold mb-1">Define the goal</h3>
                  <p className="text-sm text-muted-foreground">
                    &quot;Create a user authentication API with JWT tokens&quot;
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-blue-600">2</Badge>
                <div>
                  <h3 className="font-semibold mb-1">Let AI generate boilerplate</h3>
                  <p className="text-sm text-muted-foreground">
                    Routes, middleware, types - let AI handle the structure
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-blue-600">3</Badge>
                <div>
                  <h3 className="font-semibold mb-1">Review and refine</h3>
                  <p className="text-sm text-muted-foreground">
                    Check for security issues, add error handling, improve types
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-blue-600">4</Badge>
                <div>
                  <h3 className="font-semibold mb-1">Test and iterate</h3>
                  <p className="text-sm text-muted-foreground">
                    Write tests (or have AI generate them), fix issues, deploy
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
