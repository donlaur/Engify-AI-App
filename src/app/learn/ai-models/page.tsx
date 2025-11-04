/**
 * AI Models Hub Page
 *
 * SEO-optimized hub for all AI models
 * Lists models with filtering, sorting, and search
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
import { aiModelService } from '@/lib/services/AIModelService';
import { generateSlug } from '@/lib/utils/slug';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate hourly

export const metadata: Metadata = {
  title: 'AI Models Comparison & Pricing Guide | Engify.ai',
  description:
    'Compare AI models: GPT-4o, Claude 3.5 Sonnet, Gemini, and more. Find the best model for your use case with pricing, capabilities, and EOL tracking.',
  keywords: [
    'AI models',
    'GPT-4o',
    'Claude 3.5 Sonnet',
    'Gemini models',
    'AI model comparison',
    'AI model pricing',
    'deprecated AI models',
    'best AI model',
  ],
  openGraph: {
    title: 'AI Models Comparison & Pricing Guide | Engify.ai',
    description:
      'Compare AI models: GPT-4o, Claude 3.5 Sonnet, Gemini, and more.',
    type: 'website',
  },
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  groq: 'Groq',
  replicate: 'Replicate',
  perplexity: 'Perplexity',
  together: 'Together AI',
  mistral: 'Mistral',
};

export default async function AIModelsHubPage() {
  // Fetch all active models
  const models = await aiModelService.findActive();

  // Group by provider
  const byProvider: Record<string, typeof models> = {};
  models.forEach((model) => {
    if (!byProvider[model.provider]) {
      byProvider[model.provider] = [];
    }
    byProvider[model.provider].push(model);
  });

  // Stats
  const activeCount = models.filter((m) => m.status === 'active').length;
  const providers = Object.keys(byProvider).length;

  return (
    <MainLayout>
      <div className="container py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">
            AI Models Comparison & Pricing Guide
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Compare AI models from OpenAI, Anthropic, Google, and more. Find the
            best model for your use case with pricing, capabilities, and EOL
            tracking.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{providers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Models by Provider */}
        <div className="space-y-12">
          {Object.entries(byProvider).map(([provider, providerModels]) => (
            <div key={provider}>
              <div className="mb-6 flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {PROVIDER_LABELS[provider] || provider}
                </h2>
                <Badge variant="secondary">
                  {providerModels.length}{' '}
                  {providerModels.length === 1 ? 'model' : 'models'}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {providerModels.map((model) => {
                  const slug = model.slug || generateSlug(model.displayName);
                  const costPer1M = model.costPer1kInputTokens * 1000;

                  return (
                    <Card key={model.id} className="group hover:border-primary">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="group-hover:text-primary">
                              <Link href={`/learn/ai-models/${slug}`}>
                                {model.displayName}
                              </Link>
                            </CardTitle>
                            {model.status === 'deprecated' && (
                              <Badge variant="destructive" className="mt-2">
                                Deprecated
                              </Badge>
                            )}
                            {model.status === 'sunset' && (
                              <Badge variant="destructive" className="mt-2">
                                Sunset
                              </Badge>
                            )}
                            {model.recommended && (
                              <Badge variant="default" className="mt-2">
                                Recommended
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardDescription>
                          {model.notes || `${model.capabilities.join(', ')}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Pricing */}
                          <div>
                            <div className="text-sm font-medium">Pricing</div>
                            <div className="text-sm text-muted-foreground">
                              ${costPer1M.toFixed(2)} / 1M tokens
                            </div>
                          </div>

                          {/* Context Window */}
                          <div>
                            <div className="text-sm font-medium">
                              Context Window
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {model.contextWindow.toLocaleString()} tokens
                            </div>
                          </div>

                          {/* Capabilities */}
                          {model.capabilities.length > 0 && (
                            <div>
                              <div className="mb-1 text-sm font-medium">
                                Capabilities
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {model.capabilities.slice(0, 3).map((cap) => (
                                  <Badge
                                    key={cap}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {cap}
                                  </Badge>
                                ))}
                                {model.capabilities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{model.capabilities.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          {model.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {model.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* CTA */}
                          <Button asChild className="w-full" variant="outline">
                            <Link href={`/learn/ai-models/${slug}`}>
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
            <CardTitle>Looking for AI Development Tools?</CardTitle>
            <CardDescription>
              Compare AI-powered IDEs, code assistants, and development tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/learn/ai-tools">
                Browse AI Tools
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* EOL Tracking CTA */}
        <Card className="mt-6 border-orange-500/20 bg-orange-500/5">
          <CardHeader>
            <CardTitle>Track Deprecated Models</CardTitle>
            <CardDescription>
              See which models are deprecated or sunset and find replacements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/learn/ai-models/deprecated">
                View Deprecated Models
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
