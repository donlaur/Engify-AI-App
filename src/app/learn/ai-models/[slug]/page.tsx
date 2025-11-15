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
import { ModelIdCopy } from '@/components/features/ModelIdCopy';
import { aiModelService } from '@/lib/services/AIModelService';
import { generateSlug } from '@/lib/utils/slug';
import { logger } from '@/lib/logging/logger';
import {
  PerformanceMetrics,
  ModalitiesSection,
  FeaturesSection,
  ToolsSection,
  EndpointsSection,
  SnapshotsSection,
  RateLimitsSection,
  ParameterSupportSection,
  ParameterFailureAlerts,
} from '@/components/features/AIModelDetailSections';

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
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Try slug first, then fallback to ID lookup (for backwards compatibility)
  let model = await aiModelService.findBySlug(slug);
  if (!model) {
    // Fallback: try finding by ID in case slug doesn't exist
    model = await aiModelService.findById(slug);
  }

  if (!model) {
    return {
      title: 'AI Model Not Found | Engify.ai',
    };
  }

  const providerLabel = PROVIDER_LABELS[model.provider] || model.provider;
  const statusBadge = model.status === 'deprecated' ? ' (Deprecated)' : '';
  const costPer1M = model.costPer1kInputTokens ? model.costPer1kInputTokens * 1000 : 0;
  const contextInfo = model.contextWindow ? `Context window: ${model.contextWindow.toLocaleString()} tokens. ` : '';

  return {
    title: `${model.displayName}${statusBadge} - AI Model Guide | Engify.ai`,
    description: `${model.displayName} from ${providerLabel}. ${contextInfo}Pricing: $${costPer1M.toFixed(2)}/1M tokens. ${model.capabilities?.join(', ') || 'Various capabilities'}.`,
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
      description: `${model.displayName} from ${providerLabel}. ${model.contextWindow ? `${model.contextWindow.toLocaleString()} token context window.` : 'Advanced AI model.'}`,
      type: 'article',
    },
  };
}

export default async function AIModelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  // Try slug first, then fallback to ID lookup (for backwards compatibility)
  let model = await aiModelService.findBySlug(slug);
  if (!model) {
    // Fallback: try finding by ID in case slug doesn't exist
    model = await aiModelService.findById(slug);
  }

  if (!model) {
    logger.warn('AI model not found', { slug });
    notFound();
  }
  
  // If model found by ID but doesn't have slug, generate and save slug, then redirect
  if (model && !model.slug) {
    const generatedSlug = generateSlug(model.name || model.displayName || model.id);
    if (generatedSlug && generatedSlug !== 'untitled') {
      // Update the model with slug for future requests
      await aiModelService.update(model.id, { slug: generatedSlug });
      
      // Redirect to slug URL (if current URL doesn't match slug)
      if (slug !== generatedSlug) {
        const { redirect } = await import('next/navigation');
        redirect(`/learn/ai-models/${generatedSlug}`);
      }
    }
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
          <div className="mb-8 space-y-3">
            <div className="mb-4 flex items-center gap-3">
              <h1 className="text-4xl font-bold">{model.displayName}</h1>
              {model.isDefault && (
                <Badge variant="secondary">Default</Badge>
              )}
              {model.status === 'deprecated' && (
                <Badge variant="destructive">Deprecated</Badge>
              )}
              {model.status === 'sunset' && (
                <Badge variant="destructive">Sunset</Badge>
              )}
              {model.recommended && model.status === 'active' && (
                <Badge variant="default">Recommended</Badge>
              )}
            </div>
            {model.tagline && (
              <p className="text-xl font-medium text-foreground">
                {model.tagline}
              </p>
            )}
            <p className="mt-2 text-lg text-muted-foreground">
              {providerLabel} • {model.capabilities.join(' • ')}
            </p>
            <ModelIdCopy id={model.id} label="Provider ID" />
            {model.description && (
              <p className="mt-3 text-muted-foreground">{model.description}</p>
            )}
            {model.notes && !model.description && (
              <p className="mt-3 text-muted-foreground">{model.notes}</p>
            )}
          </div>

          {/* Performance Metrics */}
          <PerformanceMetrics model={model} />

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
                    {model.contextWindow && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Context Window
                        </div>
                        <div className="text-lg font-semibold">
                          {model.contextWindow.toLocaleString()} tokens
                        </div>
                      </div>
                    )}
                    {model.maxOutputTokens && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Max Output Tokens
                        </div>
                        <div className="text-lg font-semibold">
                          {model.maxOutputTokens.toLocaleString()} tokens
                        </div>
                      </div>
                    )}
                    {model.knowledgeCutoff && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Knowledge Cutoff
                        </div>
                        <div className="text-lg font-semibold">
                          {model.knowledgeCutoff}
                        </div>
                      </div>
                    )}
                    {model.capabilities.includes('reasoning') && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Reasoning Tokens
                        </div>
                        <div className="text-lg font-semibold">Supported</div>
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

              {/* Modalities */}
              <ModalitiesSection model={model} />

              {/* Parameter Support */}
              <ParameterSupportSection model={model} />

              {/* Features */}
              <FeaturesSection model={model} />

              {/* Tools */}
              <ToolsSection model={model} />

              {/* Endpoints */}
              <EndpointsSection model={model} />

              {/* Snapshots */}
              <SnapshotsSection model={model} />

              {/* Rate Limits */}
              <RateLimitsSection model={model} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Parameter Failures */}
              <ParameterFailureAlerts model={model} />

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Pricing is based on the number of tokens used, or other
                    metrics based on the model type. For tool-specific models,
                    like search and computer use, there's a fee per tool call.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1 text-sm font-medium text-muted-foreground">
                      Input
                    </div>
                    <div className="text-2xl font-bold">
                      ${costPer1MInput.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${model.costPer1kInputTokens.toFixed(4)} per 1K tokens
                    </div>
                  </div>
                  {model.costPer1kCachedInputTokens && (
                    <div>
                      <div className="mb-1 text-sm font-medium text-muted-foreground">
                        Cached Input
                      </div>
                      <div className="text-2xl font-bold">
                        $
                        {(
                          (model.costPer1kCachedInputTokens || 0) * 1000
                        ).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${(model.costPer1kCachedInputTokens || 0).toFixed(
                          4,
                        )}{' '}
                        per 1K tokens
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="mb-1 text-sm font-medium text-muted-foreground">
                      Output
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
