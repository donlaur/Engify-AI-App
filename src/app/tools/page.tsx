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
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best AI Coding Assistants 2025: Cursor, Windsurf, Replit, Lovable & More | Engify.ai',
  description:
    'Compare 10+ AI coding tools for developers. In-depth reviews of Cursor, Windsurf, Replit AI, Lovable, v0.dev, Warp, GitHub Copilot. Real benchmarks, pricing, and use cases from production experience.',
  keywords: [
    'AI coding assistant',
    'Cursor IDE review',
    'Windsurf vs Cursor',
    'Replit AI review 2025',
    'Lovable AI builder',
    'v0.dev review',
    'Warp terminal AI',
    'GitHub Copilot alternative',
    'best AI pair programming',
    'Claude Sonnet 4.5',
    'AI code generation',
    'developer productivity tools',
    'Cursor referral',
    'Windsurf review 2025',
  ],
  openGraph: {
    title: 'Best AI Coding Assistants 2025: Complete Comparison',
    description:
      'Real-world reviews from building production SaaS. Which AI coding tool is right for you?',
    type: 'article',
  },
};

/**
 * AI Tools Hub - SEO-optimized comparison page
 * High-intent keywords for affiliate revenue
 */
export default function ToolsPage() {
  const tools = [
    {
      name: 'Cursor',
      tagline: 'The AI-first code editor',
      icon: Icons.code,
      rating: 5,
      pricing: '$20/mo Pro',
      bestFor: 'Full-stack development with Claude integration',
      pros: [
        'Native Claude Sonnet 4.5 integration',
        'Composer mode for multi-file edits',
        'Excellent context awareness',
        'VSCode fork (familiar UX)',
        'Codebase indexing',
      ],
      cons: [
        'Subscription required for best models',
        'Can be resource-intensive',
        'Occasional context window issues',
      ],
      affiliate: true,
      cta: 'Try Cursor Pro',
      slug: 'cursor',
    },
    {
      name: 'Windsurf',
      tagline: 'AI-powered development environment',
      icon: Icons.wind,
      rating: 4,
      pricing: '$15/mo',
      bestFor: 'Frontend and React development',
      pros: [
        'Fast UI generation',
        'Good React/Next.js support',
        'Lower pricing than competitors',
        'Clean interface',
      ],
      cons: [
        'Newer tool (less mature)',
        'Smaller community',
        'Limited backend support',
        'Fewer integrations',
      ],
      affiliate: false,
      cta: 'Learn More',
      slug: 'windsurf',
    },
    {
      name: 'GitHub Copilot',
      tagline: 'AI pair programmer from GitHub',
      icon: Icons.github,
      rating: 4,
      pricing: '$10/mo',
      bestFor: 'Autocomplete and inline suggestions',
      pros: [
        'Excellent autocomplete',
        'Works in any IDE',
        'Large training dataset',
        'GitHub integration',
        'Free for students',
      ],
      cons: [
        'Less conversational than Cursor',
        'No multi-file awareness',
        'Limited context window',
        'Occasional hallucinations',
      ],
      affiliate: true,
      cta: 'Get Copilot',
      slug: 'github-copilot',
    },
    {
      name: 'Claude AI (Direct)',
      tagline: 'Conversational AI for coding',
      icon: Icons.sparkles,
      rating: 5,
      pricing: '$20/mo Pro',
      bestFor: 'Architecture, planning, and code review',
      pros: [
        'Best reasoning ability',
        'Excellent for architecture',
        'Large context window (200K)',
        'Accurate code generation',
      ],
      cons: [
        'Not an IDE (web interface)',
        'Manual copy/paste workflow',
        'No codebase awareness',
        'Requires context management',
      ],
      affiliate: true,
      cta: 'Try Claude Pro',
      slug: 'claude',
    },
    {
      name: 'ChatGPT Code Interpreter',
      tagline: 'GPT-4 with Python execution',
      icon: Icons.terminal,
      rating: 3,
      pricing: '$20/mo Plus',
      bestFor: 'Data analysis and Python scripts',
      pros: [
        'Can execute Python code',
        'Good for data analysis',
        'File upload/download',
        'Large context (GPT-4 Turbo)',
      ],
      cons: [
        'Limited to Python',
        'No full codebase support',
        'Sandboxed environment',
        'Not a coding IDE',
      ],
      affiliate: true,
      cta: 'Get ChatGPT Plus',
      slug: 'chatgpt',
    },
    {
      name: 'Tabnine',
      tagline: 'Privacy-first AI code completion',
      icon: Icons.lock,
      rating: 3,
      pricing: 'Free / $12/mo Pro',
      bestFor: 'Teams with strict data privacy',
      pros: [
        'On-premises deployment',
        'Privacy-focused',
        'Works offline',
        'Multi-language support',
      ],
      cons: [
        'Less accurate than GPT-4/Claude',
        'Basic autocomplete only',
        'No conversational mode',
        'Smaller model',
      ],
      affiliate: false,
      cta: 'Learn More',
      slug: 'tabnine',
    },
    {
      name: 'Replit AI',
      tagline: 'Code in the browser with AI',
      icon: Icons.cloud,
      rating: 4,
      pricing: 'Free / $20/mo Replit Core',
      bestFor: 'Rapid prototyping and learning',
      pros: [
        'No setup required (browser-based)',
        'Ghostwriter AI for autocomplete',
        'Instant deployment',
        'Great for beginners',
        'Collaborative coding',
      ],
      cons: [
        'Limited for large codebases',
        'Browser-only environment',
        'Less powerful than Cursor',
        'Dependency on Replit platform',
      ],
      affiliate: true,
      cta: 'Try Replit AI',
      slug: 'replit',
    },
    {
      name: 'Lovable (formerly GPT Engineer)',
      tagline: 'AI app builder from prompts',
      icon: Icons.heart,
      rating: 4,
      pricing: '$20/mo Pro',
      bestFor: 'No-code/low-code app generation',
      pros: [
        'Builds full apps from prompts',
        'React + Tailwind output',
        'Fast prototyping',
        'Export to GitHub',
        'Great for MVPs',
      ],
      cons: [
        'Less control than traditional IDEs',
        'Generated code needs cleanup',
        'Limited customization',
        'New tool (less mature)',
      ],
      affiliate: false,
      cta: 'Try Lovable',
      slug: 'lovable',
    },
    {
      name: 'Warp Terminal',
      tagline: 'AI-powered terminal',
      icon: Icons.terminal,
      rating: 4,
      pricing: 'Free / $15/mo Team',
      bestFor: 'DevOps and command-line workflows',
      pros: [
        'AI command suggestions',
        'Natural language to shell',
        'Beautiful modern UI',
        'Command history with AI search',
        'Team collaboration',
      ],
      cons: [
        'macOS only (no Windows/Linux)',
        'Terminal-focused (not full IDE)',
        'Learning curve for features',
        'Some features require subscription',
      ],
      affiliate: false,
      cta: 'Get Warp',
      slug: 'warp',
    },
    {
      name: 'v0.dev by Vercel',
      tagline: 'AI-powered UI generation',
      icon: Icons.zap,
      rating: 4,
      pricing: 'Free (limited) / Credits system',
      bestFor: 'Frontend UI component generation',
      pros: [
        'Generates React components instantly',
        'Tailwind + shadcn/ui output',
        'Iterative refinement',
        'Copy-paste ready code',
        'Great for UI prototyping',
      ],
      cons: [
        'UI-only (no backend)',
        'Credit-based pricing',
        'Can be expensive for heavy use',
        'Limited to React/Next.js',
      ],
      affiliate: false,
      cta: 'Try v0.dev',
      slug: 'v0',
    },
  ];

  const comparisonTable = [
    {
      feature: 'Multi-file editing',
      cursor: true,
      windsurf: true,
      copilot: false,
      claude: false,
    },
    {
      feature: 'Codebase awareness',
      cursor: true,
      windsurf: false,
      copilot: false,
      claude: false,
    },
    {
      feature: 'Works in VSCode',
      cursor: true,
      windsurf: false,
      copilot: true,
      claude: false,
    },
    {
      feature: 'Conversational chat',
      cursor: true,
      windsurf: true,
      copilot: false,
      claude: true,
    },
    {
      feature: 'Code execution',
      cursor: false,
      windsurf: false,
      copilot: false,
      claude: false,
    },
  ];

  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="border-white/20 bg-white/10 text-white"
            >
              <Icons.wrench className="mr-2 h-3 w-3" />
              Tool Reviews
            </Badge>

            <h1 className="text-5xl font-bold text-white sm:text-6xl">
              Best AI Coding Assistants
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                for Developers in 2025
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              Real-world reviews from building production SaaS. We tested 10+
              AI coding tools—Cursor, Windsurf, Replit, Lovable, v0.dev, Warp,
              and more. Here's what actually works, what doesn't, and which one
              is right for you.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-900 hover:bg-gray-100"
                asChild
              >
                <Link href="#comparison">
                  <Icons.list className="mr-2 h-4 w-4" />
                  Compare Tools
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white/90 text-purple-900 hover:bg-white"
                asChild
              >
                <Link href="/learn/case-studies/7-day-saas-build">
                  <Icons.bookOpen className="mr-2 h-4 w-4" />
                  See Them in Action
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Cards */}
      <section className="container py-16" id="comparison">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Tool-by-Tool Breakdown</h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Honest reviews from 1,357 commits of production use
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline">Full IDEs</Badge>
            <Badge variant="outline">AI Builders</Badge>
            <Badge variant="outline">Terminal Tools</Badge>
            <Badge variant="outline">UI Generators</Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.name} className="border-2 hover:border-primary hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>{tool.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Icons.star
                              key={i}
                              className={`h-3 w-3 ${
                                i < tool.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {tool.affiliate && (
                      <Badge variant="secondary" className="text-xs">
                        Affiliate
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{tool.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Pricing: <span className="text-foreground">{tool.pricing}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Best for:</strong> {tool.bestFor}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-2">
                      Pros
                    </p>
                    <ul className="space-y-1">
                      {tool.pros.slice(0, 3).map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <Icons.check className="mt-0.5 h-3 w-3 shrink-0 text-green-600" />
                          <span className="text-muted-foreground">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-2">
                      Cons
                    </p>
                    <ul className="space-y-1">
                      {tool.cons.slice(0, 2).map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <Icons.close className="mt-0.5 h-3 w-3 shrink-0 text-red-600" />
                          <span className="text-muted-foreground">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    variant={tool.affiliate ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={`/tools/${tool.slug}`}>
                      {tool.cta} →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Our Recommendation */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-16 dark:from-purple-950 dark:to-blue-950">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Icons.award className="h-6 w-6 text-purple-600" />
                  Our Recommendation for 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg font-semibold">
                  <strong className="text-purple-700 dark:text-purple-400">Winner: Cursor</strong> for full-stack
                  production development
                </p>
                <p className="text-muted-foreground">
                  After building Engify.ai (1,357 commits in 7 days), <strong>Cursor with Claude Sonnet 4.5</strong> proved
                  most effective for production work. The native Claude integration, multi-file editing, and codebase awareness
                  were game-changers for complex refactoring and architecture decisions.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold">Use Cursor when:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Building production SaaS</li>
                      <li>• Refactoring across multiple files</li>
                      <li>• Need codebase-wide context</li>
                      <li>• Working with TypeScript/Next.js</li>
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold">Use Copilot when:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Autocomplete is your main need</li>
                      <li>• Working in VSCode ecosystem</li>
                      <li>• Budget-conscious ($10/mo)</li>
                      <li>• Simple inline suggestions</li>
                    </ul>
                  </div>
                </div>
                <Button size="lg" className="mt-4" asChild>
                  <Link href="/tools/cursor">
                    <Icons.externalLink className="mr-2 h-4 w-4" />
                    Get Started with Cursor (Affiliate Link)
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Feature Comparison</h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Side-by-side comparison of key features
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold">Feature</th>
                  <th className="p-4 text-center text-sm font-semibold">Cursor</th>
                  <th className="p-4 text-center text-sm font-semibold">Windsurf</th>
                  <th className="p-4 text-center text-sm font-semibold">Copilot</th>
                  <th className="p-4 text-center text-sm font-semibold">Claude</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-4 text-sm">{row.feature}</td>
                    <td className="p-4 text-center">
                      {row.cursor ? (
                        <Icons.check className="inline h-5 w-5 text-green-600" />
                      ) : (
                        <Icons.close className="inline h-5 w-5 text-red-600" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.windsurf ? (
                        <Icons.check className="inline h-5 w-5 text-green-600" />
                      ) : (
                        <Icons.close className="inline h-5 w-5 text-red-600" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.copilot ? (
                        <Icons.check className="inline h-5 w-5 text-green-600" />
                      ) : (
                        <Icons.close className="inline h-5 w-5 text-red-600" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.claude ? (
                        <Icons.check className="inline h-5 w-5 text-green-600" />
                      ) : (
                        <Icons.close className="inline h-5 w-5 text-red-600" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="text-center">
              <h2 className="mb-4 text-4xl font-bold">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is Cursor worth $20/month?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, for professional development. If it saves 2 hours/month (at $50/hr = $100), it's 5x ROI.
                    We saved 20-30% development time on Engify.ai, making it easily worth it.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I use multiple AI tools together?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Absolutely! We use Cursor for coding, Claude for architecture/planning, and Copilot for quick autocomplete.
                    Each tool has strengths—use them strategically.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Which tool is best for beginners?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    GitHub Copilot. It's the most forgiving, works in any IDE, and the autocomplete helps you learn patterns.
                    Start there, then upgrade to Cursor when you're building larger projects.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-16">
        <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="space-y-6 py-12 text-center">
            <h2 className="text-3xl font-bold">
              Ready to 10x Your Coding Speed?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              See how we used these tools to build production SaaS in 7 days.
              Complete workflow guide, best practices, and lessons learned.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/learn/case-studies/7-day-saas-build">
                  <Icons.bookOpen className="mr-2 h-5 w-5" />
                  Read the Case Study
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/ai-workflow">
                  <Icons.target className="mr-2 h-5 w-5" />
                  See Our Workflow
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}

