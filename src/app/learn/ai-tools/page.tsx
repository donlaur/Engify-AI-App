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

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate hourly

export const metadata: Metadata = {
  title: 'AI Development Tools Comparison | Engify.ai',
  description:
    'Compare AI-powered development tools: Cursor, Windsurf, GitHub Copilot, and more. Find the best AI IDE and code assistant for your workflow.',
  keywords: [
    'AI coding tools',
    'Cursor IDE',
    'Windsurf',
    'GitHub Copilot',
    'AI code assistant',
    'best AI IDE',
    'AI development tools',
    'code generation tools',
  ],
  openGraph: {
    title: 'AI Development Tools Comparison | Engify.ai',
    description:
      'Compare AI-powered development tools: Cursor, Windsurf, GitHub Copilot, and more.',
    type: 'website',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  ide: 'IDE',
  'code-assistant': 'Code Assistant',
  terminal: 'Terminal',
  builder: 'AI Builder',
  other: 'Other',
};

export default async function AIToolsHubPage() {
  // Fetch all active tools
  const tools = await aiToolService.findActive();

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

  return (
    <MainLayout>
      <div className="container py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">
            AI Development Tools Comparison
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Compare AI-powered IDEs, code assistants, and development tools.
            Find the best AI tool for your workflow.
          </p>
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
                          {tool.rating && (
                            <div className="flex items-center gap-1">
                              <Icons.star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">
                                {tool.rating}
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

        {/* CTA */}
        <Card className="mt-12 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Looking for AI Models?</CardTitle>
            <CardDescription>
              Compare AI models: GPT-4o, Claude 3.5 Sonnet, Gemini, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
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
