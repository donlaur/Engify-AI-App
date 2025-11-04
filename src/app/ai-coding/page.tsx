/**
 * AI-Assisted Coding Tips Page
 * Best practices for using AI tools like Cursor, Windsurf, Claude, etc.
 */

'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

interface AITool {
  name: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  // Rating removed per ADR-009 (no fake metrics)
  review: string;
}

const aiTools: AITool[] = [
  {
    name: 'Cursor',
    pricing: '$20/mo',
    strengths: [
      'Best inline editing (Cmd+K)',
      'Composer for multi-file changes',
      'Fast and responsive',
      'Great autocomplete',
    ],
    weaknesses: [
      'Limited to code editing',
      'No autonomous agents',
      'Requires manual guidance',
    ],
    bestFor: ['Individual developers', 'Quick edits', 'Refactoring'],
    // Rating removed per ADR-009
    review:
      'Best for hands-on coding with AI assistance. Cmd+K is incredibly fast.',
  },
  {
    name: 'Windsurf (Cascade)',
    pricing: '$15/mo',
    strengths: [
      'Autonomous Cascade mode',
      'Parallel tool execution',
      'Multi-step reasoning',
      'Handles complex tasks',
    ],
    weaknesses: [
      'Can be unpredictable',
      'Requires clear goals',
      'Learning curve',
    ],
    bestFor: ['Complex refactoring', 'Multi-file changes', 'Autonomous work'],
    // Rating removed per ADR-009
    review: 'Revolutionary for letting AI handle entire features autonomously.',
  },
  {
    name: 'GitHub Copilot',
    pricing: '$10/mo',
    strengths: [
      'Excellent autocomplete',
      'GitHub integration',
      'Widely adopted',
      'Good for boilerplate',
    ],
    weaknesses: ['Limited context', 'No multi-file edits', 'Basic chat'],
    bestFor: ['Autocomplete', 'Boilerplate', 'Learning'],
    // Rating removed per ADR-009
    review: 'Solid autocomplete, but limited for complex tasks.',
  },
  {
    name: 'Codeium',
    pricing: 'Free',
    strengths: ['Completely free', 'Good autocomplete', 'Multiple IDE support'],
    weaknesses: ['Less accurate than paid tools', 'Limited features', 'Slower'],
    bestFor: ['Budget-conscious', 'Students', 'Basic autocomplete'],
    // Rating removed per ADR-009
    review: 'Great free option, but you get what you pay for.',
  },
  {
    name: 'Tabnine',
    pricing: '$12/mo',
    strengths: ['Privacy-focused', 'On-premise options', 'Team training'],
    weaknesses: ['Less powerful than competitors', 'Expensive for teams'],
    bestFor: ['Enterprise', 'Privacy-sensitive', 'Team customization'],
    // Rating removed per ADR-009
    review: 'Best for enterprises with privacy requirements.',
  },
  {
    name: 'Replit AI',
    pricing: '$20/mo',
    strengths: ['Full IDE integration', 'Deployment included', 'Collaborative'],
    weaknesses: ['Cloud-only', 'Limited to Replit', 'Not for large projects'],
    bestFor: ['Prototyping', 'Learning', 'Quick projects'],
    // Rating removed per ADR-009
    review: 'Great for quick prototypes and learning.',
  },
];

const tips = [
  {
    category: 'Cursor Tips',
    icon: Icons.code,
    color: 'blue',
    items: [
      {
        title: 'Use Cmd+K for inline edits',
        description:
          'Select code and press Cmd+K to get AI suggestions inline. Much faster than chat.',
      },
      {
        title: 'Reference files with @filename',
        description:
          'Type @ in chat to reference specific files. AI gets full context.',
      },
      {
        title: 'Use Composer for multi-file changes',
        description:
          'Cmd+I opens Composer - perfect for refactoring across multiple files.',
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
        description:
          'Let Cascade handle multi-step tasks while you focus on architecture.',
      },
      {
        title: 'Use tools in parallel',
        description:
          'Cascade can read multiple files, search, and edit simultaneously.',
      },
      {
        title: 'Set clear goals, not steps',
        description:
          'Tell Cascade WHAT you want, not HOW. Let it figure out the steps.',
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
        description:
          'Tell AI what NOT to do. "Don\'t use any, keep it under 100 lines, use TypeScript strict mode"',
      },
      {
        title: 'Provide examples',
        description:
          'Show the AI existing code style. It will match your patterns.',
      },
      {
        title: "Iterate, don't perfect",
        description:
          'Get 80% from AI, refine the 20% yourself. Faster than writing from scratch.',
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
        description:
          'Paste code and ask: "Review for security vulnerabilities, especially SQL injection and XSS"',
      },
      {
        title: 'Performance analysis',
        description:
          'Ask: "Identify performance bottlenecks and suggest optimizations"',
      },
      {
        title: 'Best practices check',
        description:
          'Ask: "Does this follow React/TypeScript best practices? What would you change?"',
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
        description:
          'Describe what you want in a comment. Copilot will generate the code.',
      },
      {
        title: 'Use descriptive function names',
        description:
          'Name your function clearly. Copilot will infer the implementation.',
      },
      {
        title: 'Accept, then refine',
        description:
          'Accept Copilot suggestions, then tweak. Faster than typing from scratch.',
      },
    ],
  },
];

export default function AICodingPage() {
  return (
    <MainLayout>
      <div className="container py-12">
        {/* Hero */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            <Icons.sparkles className="h-4 w-4" />
            AI-Assisted Development
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Code Faster with AI
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Without Sacrificing Quality
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Tips, tricks, and best practices for using Cursor, Windsurf, Claude,
            GitHub Copilot, and other AI coding tools effectively.
          </p>
        </div>

        {/* Tips Grid */}
        <div className="space-y-8">
          {tips.map((section) => {
            const Icon = section.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
              purple:
                'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
              green:
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
              orange:
                'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
              pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
            };

            return (
              <Card key={section.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${colorClasses[section.color as keyof typeof colorClasses]}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {section.items.map((tip, index) => (
                      <div
                        key={index}
                        className="space-y-2 rounded-lg border p-4"
                      >
                        <h3 className="flex items-start gap-2 font-semibold">
                          <Icons.check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                          {tip.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {tip.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tool Comparison Matrix */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Tool Comparison Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Tool</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Rating</th>
                    <th className="p-2 text-left">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {aiTools.map((tool) => (
                    <tr key={tool.name} className="border-b">
                      <td className="p-2 font-semibold">{tool.name}</td>
                      <td className="p-2">{tool.pricing}</td>
                      <td className="p-2">
                        {/* Rating display removed per ADR-009 (no fake metrics) */}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {tool.bestFor.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tool Reviews */}
        <div className="mt-12 space-y-6">
          <h2 className="text-3xl font-bold">Detailed Tool Reviews</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {aiTools.map((tool) => (
              <Card key={tool.name}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{tool.name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tool.pricing}
                      </p>
                    </div>
                    {/* Rating display removed per ADR-009 (no fake metrics) */}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm italic text-muted-foreground">
                    {tool.review}
                  </p>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-green-600">
                      ✅ Strengths
                    </h4>
                    <ul className="space-y-1">
                      {tool.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Icons.check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-orange-600">
                      ⚠️ Weaknesses
                    </h4>
                    <ul className="space-y-1">
                      {tool.weaknesses.map((weakness, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Icons.x className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Best For:</h4>
                    <div className="flex flex-wrap gap-2">
                      {tool.bestFor.map((use, i) => (
                        <Badge key={i} variant="secondary">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Case Guides */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Which Tool for Which Task?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">
                  🚀 Building a New Feature
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  Best: Windsurf Cascade
                </p>
                <ul className="space-y-1 text-sm">
                  <li>1. Define feature requirements clearly</li>
                  <li>2. Let Cascade handle file creation</li>
                  <li>3. Review and refine implementation</li>
                  <li>4. Add tests manually</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">
                  🔧 Refactoring Legacy Code
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  Best: Cursor Composer
                </p>
                <ul className="space-y-1 text-sm">
                  <li>1. Select files to refactor</li>
                  <li>2. Use Composer for multi-file changes</li>
                  <li>3. Review diffs carefully</li>
                  <li>4. Test thoroughly</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">⚡ Writing Boilerplate</h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  Best: GitHub Copilot
                </p>
                <ul className="space-y-1 text-sm">
                  <li>1. Write descriptive comments</li>
                  <li>2. Let Copilot generate code</li>
                  <li>3. Accept and tweak</li>
                  <li>4. Move fast</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">🎓 Learning to Code</h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  Best: Codeium (Free)
                </p>
                <ul className="space-y-1 text-sm">
                  <li>1. Start with free tier</li>
                  <li>2. Learn from suggestions</li>
                  <li>3. Understand before accepting</li>
                  <li>4. Upgrade when ready</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    <Icons.check className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Use AI for boilerplate, write logic yourself</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Review every AI suggestion before accepting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Iterate quickly, refine manually</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Use AI for code review and security checks</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-red-600">
                  ❌ Don&apos;t Do This
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Icons.x className="mt-0.5 h-4 w-4 text-red-600" />
                    <span>Blindly accept AI code without understanding it</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.x className="mt-0.5 h-4 w-4 text-red-600" />
                    <span>Let AI make architectural decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.x className="mt-0.5 h-4 w-4 text-red-600" />
                    <span>Skip testing because AI wrote it</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.x className="mt-0.5 h-4 w-4 text-red-600" />
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
              <Icons.arrowRight className="h-6 w-6 text-purple-600" />
              Example Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Badge className="bg-blue-600">1</Badge>
                <div>
                  <h3 className="mb-1 font-semibold">Define the goal</h3>
                  <p className="text-sm text-muted-foreground">
                    &quot;Create a user authentication API with JWT tokens&quot;
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-blue-600">2</Badge>
                <div>
                  <h3 className="mb-1 font-semibold">
                    Let AI generate boilerplate
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Routes, middleware, types - let AI handle the structure
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-blue-600">3</Badge>
                <div>
                  <h3 className="mb-1 font-semibold">Review and refine</h3>
                  <p className="text-sm text-muted-foreground">
                    Check for security issues, add error handling, improve types
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-blue-600">4</Badge>
                <div>
                  <h3 className="mb-1 font-semibold">Test and iterate</h3>
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
