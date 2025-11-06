/**
 * AI Tools Hub Page
 *
 * SEO-optimized hub for AI development tools
 * Lists tools with filtering by category and pricing
 */

import { Metadata } from 'next';
import Link from 'next/link';
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
import { aiToolService } from '@/lib/services/AIToolService';
import { aiModelService } from '@/lib/services/AIModelService';
import { generateBreadcrumbSchema } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate hourly

export const metadata: Metadata = {
  title: 'Generative AI Tools Comparison | Best AI Development Tools & IDEs 2024',
  description:
    'Compare 20+ Generative AI development tools: Cursor, Windsurf, GitHub Copilot, Codeium, and more. Find the best Generative AI IDE, code assistant, and app builder for your workflow. Pricing, features, and reviews.',
  keywords: [
    'generative AI tools',
    'generative AI development tools',
    'AI coding tools',
    'AI development tools',
    'AI IDE',
    'Cursor IDE',
    'Windsurf IDE',
    'GitHub Copilot',
    'Codeium',
    'Tabnine',
    'AI code assistant',
    'best AI IDE',
    'code generation tools',
    'AI app builder',
    'Lovable.dev',
    'v0.dev',
    'AI terminal',
    'Warp terminal',
    'MCP protocol',
    'Model Context Protocol',
    'AI tools comparison',
    'developer tools',
    'programming tools',
  ],
  openGraph: {
    title: 'Generative AI Tools Comparison | Best AI IDEs & Code Assistants 2024',
    description:
      'Compare 20+ Generative AI-powered development tools: Cursor, Windsurf, GitHub Copilot, Codeium, and more. Find the best Generative AI IDE for your workflow.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://engify.ai/learn/ai-tools',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  ide: 'AI IDEs',
  'code-assistant': 'Code Assistants',
  'ai-terminal': 'AI Terminals',
  builder: 'AI Builders',
  'ui-generator': 'UI Generators',
  protocol: 'Protocols',
  framework: 'Frameworks',
  other: 'Other',
};

export default async function AIToolsHubPage() {
  // Fetch all active tools
  const tools = await aiToolService.findActive();

  // Fetch AI models count for CTA
  const models = await aiModelService.findActive();
  const activeModelCount = models.filter((m) => m.status === 'active').length;

  // Group by category
  const byCategory: Record<string, typeof tools> = {};
  tools.forEach((tool) => {
    if (!byCategory[tool.category]) {
      byCategory[tool.category] = [];
    }
    byCategory[tool.category].push(tool);
  });

  // Stats
  const freeCount = tools.filter((t) => t.pricing.free).length;
  const categories = Object.keys(byCategory).length;

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://engify.ai' },
    { name: 'Learn', url: 'https://engify.ai/learn' },
    { name: 'AI Tools', url: 'https://engify.ai/learn/ai-tools' },
  ]);

  // Generate FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are AI development tools?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI development tools are software applications that use artificial intelligence to assist developers in writing, debugging, and maintaining code. These include AI-powered IDEs like Cursor and Windsurf, code assistants like GitHub Copilot and Codeium, and AI app builders like Lovable.dev.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best AI IDE in 2024?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The best AI IDE depends on your needs. Cursor is popular for VS Code-like experience with advanced AI, Windsurf offers a full-featured cloud IDE, and GitHub Copilot integrates seamlessly with existing editors. Compare features, pricing, and capabilities to find the best fit.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are there free AI coding tools?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, several AI coding tools offer free tiers. Codeium, Tabnine, and GitHub Copilot have free plans with limited features. Many tools offer free trials or free tiers for open-source projects.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between an AI IDE and a code assistant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An AI IDE is a full integrated development environment with AI capabilities built-in (like Cursor or Windsurf). A code assistant is an AI tool that integrates with existing IDEs (like GitHub Copilot or Codeium). AI IDEs provide a complete development environment, while code assistants enhance your current editor.',
        },
      },
    ],
  };

  return (
    <MainLayout>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">
            Generative AI Tools Comparison
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Compare Generative AI-powered IDEs, code assistants, and development tools.
            Find the best Generative AI tool for your workflow.
          </p>
          
          {/* Prominent AI Models CTA */}
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/learn/ai-models">
                <Icons.sparkles className="mr-2 h-5 w-5" />
                Compare {activeModelCount}+ AI Models
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Find the perfect AI model for your use case
            </p>
          </div>
        </div>

        {/* Introduction Section */}
        <div className="mb-12 rounded-lg border bg-card p-8">
          <h2 className="mb-4 text-2xl font-bold">Why Use AI Development Tools?</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-lg font-semibold">🚀 Boost Productivity</h3>
              <p className="text-muted-foreground">
                AI-powered tools can help you write code 10x faster by suggesting completions, 
                generating boilerplate, and catching errors in real-time.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">🧠 Learn While You Code</h3>
              <p className="text-muted-foreground">
                Get instant explanations, code reviews, and best practice suggestions. 
                AI assistants help you understand complex codebases and learn new patterns.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">🎯 Reduce Errors</h3>
              <p className="text-muted-foreground">
                Catch bugs before they reach production with AI-powered code analysis, 
                automated testing suggestions, and security vulnerability detection.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">⚡ Accelerate Development</h3>
              <p className="text-muted-foreground">
                From generating entire applications to refactoring legacy code, 
                AI tools help you ship features faster and focus on what matters most.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tools.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Free Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{freeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{categories}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tools by Category */}
        <div className="space-y-12">
          {Object.entries(byCategory).map(([category, categoryTools]) => (
            <div key={category}>
              <div className="mb-6 flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {CATEGORY_LABELS[category] || category}
                </h2>
                <Badge variant="secondary">
                  {categoryTools.length}{' '}
                  {categoryTools.length === 1 ? 'tool' : 'tools'}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryTools.map((tool) => {
                  const pricingText = tool.pricing.free
                    ? 'Free'
                    : `$${tool.pricing.paid?.monthly || 0}/mo`;

                  return (
                    <Card key={tool.id} className="group hover:border-primary">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="group-hover:text-primary">
                              <Link href={`/learn/ai-tools/${tool.slug}`}>
                                {tool.name}
                              </Link>
                            </CardTitle>
                            {tool.tagline && (
                              <CardDescription className="mt-1">
                                {tool.tagline}
                              </CardDescription>
                            )}
                          </div>
                          {/* Rating only shows when there are actual reviews */}
                          {tool.rating && (tool.reviewCount ?? 0) > 0 && (
                            <div className="flex items-center gap-1">
                              <Icons.heart className="h-4 w-4 fill-red-500 text-red-500" />
                              <span className="text-sm font-medium">
                                {tool.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Pricing */}
                          <div>
                            <Badge
                              variant={
                                tool.pricing.free ? 'default' : 'secondary'
                              }
                            >
                              {pricingText}
                            </Badge>
                          </div>

                          {/* Features Preview */}
                          {tool.features.length > 0 && (
                            <div>
                              <div className="mb-1 text-sm font-medium">
                                Key Features
                              </div>
                              <ul className="text-sm text-muted-foreground">
                                {tool.features
                                  .slice(0, 3)
                                  .map((feature, idx) => (
                                    <li key={idx}>• {feature}</li>
                                  ))}
                                {tool.features.length > 3 && (
                                  <li className="text-xs">
                                    +{tool.features.length - 3} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Tags */}
                          {tool.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {tool.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* CTA */}
                          <Button asChild className="w-full" variant="outline">
                            <Link href={`/learn/ai-tools/${tool.slug}`}>
                              View Details
                              <Icons.arrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Categories Overview */}
        <div className="mb-12 rounded-lg border bg-card p-8">
          <h2 className="mb-6 text-2xl font-bold">Types of AI Development Tools</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="mb-2 text-lg font-semibold">🔧 AI IDEs</h3>
              <p className="text-sm text-muted-foreground">
                Full-featured integrated development environments with AI capabilities built-in. 
                Includes Cursor, Windsurf, and other modern IDEs designed for AI-assisted development.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">💡 Code Assistants</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered plugins and extensions that enhance your existing IDE. 
                Works with VS Code, JetBrains, and other popular editors. Examples: GitHub Copilot, Codeium, Tabnine.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">⚡ AI Terminals</h3>
              <p className="text-sm text-muted-foreground">
                Next-generation terminal applications with AI-powered command suggestions and explanations. 
                Helps you work faster and learn shell commands. Example: Warp.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">🏗️ AI App Builders</h3>
              <p className="text-sm text-muted-foreground">
                Tools that use AI to generate entire applications from natural language descriptions. 
                Perfect for rapid prototyping and MVP development. Examples: Lovable.dev, Bolt.new.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">🎨 UI Generators</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered tools that generate React components, Tailwind CSS, and UI designs from text prompts. 
                Speeds up frontend development significantly. Example: v0.dev.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">🔌 Protocols & Frameworks</h3>
              <p className="text-sm text-muted-foreground">
                Industry standards and frameworks for building AI-powered applications. 
                Includes Model Context Protocol (MCP), LangChain, and CrewAI.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Guide */}
        <div className="mb-12 rounded-lg border bg-card p-8">
          <h2 className="mb-4 text-2xl font-bold">Understanding AI Tool Pricing</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Most AI development tools operate on a freemium model, offering free tiers with limited features 
              and paid plans for professional use. Pricing typically ranges from $10-50/month for individual 
              developers, with team and enterprise plans available.
            </p>
            <div className="rounded-md bg-muted p-4">
              <h3 className="mb-2 font-semibold text-foreground">💡 What to Look For:</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li><strong>Free Tier:</strong> Many tools offer free plans with daily/monthly limits on AI requests or credits</li>
                <li><strong>Pay-as-you-go:</strong> Some tools charge per token or API call, ideal for occasional use</li>
                <li><strong>Subscription:</strong> Monthly/annual plans with unlimited or high-limit usage</li>
                <li><strong>Credits System:</strong> Tools often include a set number of credits per month (e.g., 500 requests/month)</li>
                <li><strong>Team Plans:</strong> Shared accounts, admin controls, and bulk discounts for teams</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How to Choose Section */}
        <div className="mb-12 rounded-lg border bg-card p-8">
          <h2 className="mb-4 text-2xl font-bold">How to Choose the Right AI Tool</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-lg font-semibold">For Individual Developers</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                If you&apos;re a solo developer or freelancer, consider:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Free tier limits and pricing</li>
                <li>Integration with your current IDE</li>
                <li>Code quality and suggestions</li>
                <li>Multi-language support</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">For Teams & Companies</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                When evaluating tools for your team, look for:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Team collaboration features</li>
                <li>Security and compliance (SOC 2, GDPR)</li>
                <li>Admin controls and user management</li>
                <li>Enterprise pricing and support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Card className="mt-12 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Looking for AI Models?</CardTitle>
            <CardDescription>
              Compare {activeModelCount}+ AI models: GPT-4o, Claude 3.5 Sonnet, Gemini, and more. 
              Find the best model for your use case with pricing, capabilities, and EOL tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/learn/ai-models">
                Browse AI Models
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
