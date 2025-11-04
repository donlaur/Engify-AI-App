/**
 * AI Model Detail Page
 *
 * SEO-optimized detail page for individual AI models
 * Shows specs, pricing, EOL status, and related content
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { aiModelService } from '@/lib/services/AIModelService';
import { generateSlug } from '@/lib/utils/slug';
import { logger } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate hourly

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

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const model = await aiModelService.findBySlug(params.slug);

  if (!model) {
    return {
      title: 'AI Model Not Found | Engify.ai',
    };
  }

  const providerLabel = PROVIDER_LABELS[model.provider] || model.provider;
  const statusBadge = model.status === 'deprecated' ? ' (Deprecated)' : '';
  const costPer1M = model.costPer1kInputTokens * 1000;

  return {
    title: `${model.displayName}${statusBadge} - AI Model Guide | Engify.ai`,
    description: `${model.displayName} from ${providerLabel}. Context window: ${model.contextWindow.toLocaleString()} tokens. Pricing: $${costPer1M.toFixed(2)}/1M tokens. ${model.capabilities.join(', ')}.`,
    keywords: [
      model.displayName,
      model.name,
      `${model.displayName} pricing`,
      `${model.displayName} review`,
      `${providerLabel} ${model.displayName}`,
      'AI model comparison',
      model.capabilities.join(', '),
    ],
    openGraph: {
      title: `${model.displayName} - AI Model Guide`,
      description: `${model.displayName} from ${providerLabel}. ${model.contextWindow.toLocaleString()} token context window.`,
      type: 'article',
    },
  };
}

export default async function AIModelDetailPage({ params }: PageProps) {
  const model = await aiModelService.findBySlug(params.slug);

  if (!model) {
    logger.warn('AI model not found', { slug: params.slug });
    notFound();
  }

  const providerLabel = PROVIDER_LABELS[model.provider] || model.provider;
  const costPer1MInput = model.costPer1kInputTokens * 1000;
  const costPer1MOutput = model.costPer1kOutputTokens * 1000;
  const replacementModel = model.replacementModel
    ? await aiModelService.findById(model.replacementModel)
    : null;

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: model.displayName,
            applicationCategory: 'AI Model',
            operatingSystem: 'API',
            offers: {
              '@type': 'Offer',
              price: costPer1MInput,
              priceCurrency: 'USD',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: costPer1MInput,
                priceCurrency: 'USD',
                unitText: 'per 1M tokens',
              },
            },
            provider: {
              '@type': 'Organization',
              name: providerLabel,
            },
          }),
        }}
      />

      <MainLayout>
        <div className="container py-12">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <Icons.chevronRight className="h-4 w-4" />
            <Link href="/learn" className="hover:text-primary">
              Learn
            </Link>
            <Icons.chevronRight className="h-4 w-4" />
            <Link href="/learn/ai-models" className="hover:text-primary">
              AI Models
            </Link>
            <Icons.chevronRight className="h-4 w-4" />
            <span className="text-foreground">{model.displayName}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <h1 className="text-4xl font-bold">{model.displayName}</h1>
              {model.status === 'deprecated' && (
                <Badge variant="destructive">Deprecated</Badge>
              )}
              {model.status === 'sunset' && (
                <Badge variant="destructive">Sunset</Badge>
              )}
              {model.recommended && (
                <Badge variant="default">Recommended</Badge>
              )}
            </div>
            <p className="text-xl text-muted-foreground">
              {providerLabel} • {model.capabilities.join(' • ')}
            </p>
            {model.notes && (
              <p className="mt-2 text-muted-foreground">{model.notes}</p>
            )}
          </div>

          {/* EOL Warning */}
          {model.status === 'deprecated' && (
            <Card className="mb-8 border-orange-500/20 bg-orange-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Icons.alertTriangle className="h-5 w-5" />
                  Model Deprecated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  This model has been deprecated and may be sunset soon.
                </p>
                {model.deprecationDate && (
                  <p className="text-sm text-muted-foreground">
                    Deprecated:{' '}
                    {new Date(model.deprecationDate).toLocaleDateString()}
                  </p>
                )}
                {model.sunsetDate && (
                  <p className="text-sm text-muted-foreground">
                    Sunset Date:{' '}
                    {new Date(model.sunsetDate).toLocaleDateString()}
                  </p>
                )}
                {replacementModel && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">
                      Recommended Replacement:
                    </p>
                    <Button asChild variant="outline">
                      <Link
                        href={`/learn/ai-models/${replacementModel.slug || generateSlug(replacementModel.displayName)}`}
                      >
                        {replacementModel.displayName}
                        <Icons.arrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Context Window
                      </div>
                      <div className="text-lg font-semibold">
                        {model.contextWindow.toLocaleString()} tokens
                      </div>
                    </div>
                    {model.maxOutputTokens && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Max Output
                        </div>
                        <div className="text-lg font-semibold">
                          {model.maxOutputTokens.toLocaleString()} tokens
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Streaming
                      </div>
                      <div className="text-lg font-semibold">
                        {model.supportsStreaming ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        JSON Mode
                      </div>
                      <div className="text-lg font-semibold">
                        {model.supportsJSON ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Vision
                      </div>
                      <div className="text-lg font-semibold">
                        {model.supportsVision ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Tier
                      </div>
                      <div className="text-lg font-semibold">
                        {model.tier
                          ? model.tier.charAt(0).toUpperCase() +
                            model.tier.slice(1)
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Capabilities */}
              {model.capabilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {model.capabilities.map((cap) => (
                        <Badge key={cap} variant="secondary">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {model.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {model.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Input (per 1M tokens)
                    </div>
                    <div className="text-2xl font-bold">
                      ${costPer1MInput.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${model.costPer1kInputTokens.toFixed(4)} per 1K tokens
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Output (per 1M tokens)
                    </div>
                    <div className="text-2xl font-bold">
                      ${costPer1MOutput.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${model.costPer1kOutputTokens.toFixed(4)} per 1K tokens
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Model Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Model Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">Provider</div>
                    <div className="text-muted-foreground">{providerLabel}</div>
                  </div>
                  <div>
                    <div className="font-medium">Model ID</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {model.name}
                    </div>
                  </div>
                  {model.lastVerified && (
                    <div>
                      <div className="font-medium">Last Verified</div>
                      <div className="text-muted-foreground">
                        {new Date(model.lastVerified).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CTA */}
              <Button asChild className="w-full" size="lg">
                <Link href="/demo">
                  Try This Model
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              {/* Related Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Related</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Link href="/learn/ai-models">
                      <Icons.arrowLeft className="mr-2 h-4 w-4" />
                      All AI Models
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Link href="/learn/ai-tools">AI Development Tools</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
