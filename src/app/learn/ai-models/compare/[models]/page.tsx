/**
 * AI Model Comparison Page
 *
 * SEO-optimized comparison page for AI models
 * Example: /learn/ai-models/compare/gpt-4o-vs-claude-3-5-sonnet
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { aiModelService } from '@/lib/services/AIModelService';
import { loadAIModelFromJson } from '@/lib/ai-models/load-ai-models-from-json';
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
  params: Promise<{ models: string }>; // e.g., "gpt-4o-vs-claude-3-5-sonnet"
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { models } = await params;
  const modelSlugs = models.split('-vs-');
  if (modelSlugs.length !== 2) {
    return {
      title: 'AI Model Comparison | Engify.ai',
    };
  }

  // Try JSON first (fast, no MongoDB connection), then fallback to MongoDB
  const [model1Json, model2Json] = await Promise.all([
    loadAIModelFromJson(modelSlugs[0]),
    loadAIModelFromJson(modelSlugs[1]),
  ]);
  
  const [model1, model2] = await Promise.all([
    model1Json || aiModelService.findBySlug(modelSlugs[0]),
    model2Json || aiModelService.findBySlug(modelSlugs[1]),
  ]);

  if (!model1 || !model2) {
    return {
      title: 'AI Model Comparison | Engify.ai',
    };
  }

  return {
    title: `${model1.displayName} vs ${model2.displayName} - Comparison | Engify.ai`,
    description: `Compare ${model1.displayName} and ${model2.displayName}. Pricing, capabilities, context windows, and use case recommendations.`,
    keywords: [
      `${model1.displayName} vs ${model2.displayName}`,
      `${model1.displayName} comparison`,
      `${model2.displayName} comparison`,
      'AI model comparison',
      'best AI model',
    ],
    openGraph: {
      title: `${model1.displayName} vs ${model2.displayName}`,
      description: `Compare ${model1.displayName} and ${model2.displayName} - pricing, capabilities, and recommendations.`,
      type: 'article',
    },
  };
}

export default async function AIModelComparisonPage({ params }: PageProps) {
  const { models } = await params;
  const modelSlugs = models.split('-vs-');

  if (modelSlugs.length !== 2) {
    logger.warn('Invalid comparison format', { models });
    notFound();
  }

  // Try JSON first (fast, no MongoDB connection), then fallback to MongoDB
  const [model1Json, model2Json] = await Promise.all([
    loadAIModelFromJson(modelSlugs[0]),
    loadAIModelFromJson(modelSlugs[1]),
  ]);
  
  const [model1, model2] = await Promise.all([
    model1Json || aiModelService.findBySlug(modelSlugs[0]),
    model2Json || aiModelService.findBySlug(modelSlugs[1]),
  ]);

  if (!model1 || !model2) {
    logger.warn('Models not found for comparison', {
      slug1: modelSlugs[0],
      slug2: modelSlugs[1],
    });
    notFound();
  }

  const model1Slug = model1.slug || generateSlug(model1.displayName);
  const model2Slug = model2.slug || generateSlug(model2.displayName);

  // Comparison data
  const costPer1M1 = model1.costPer1kInputTokens * 1000;
  const costPer1M2 = model2.costPer1kInputTokens * 1000;
  const cheaper = costPer1M1 < costPer1M2 ? model1 : model2;
  const largerContext =
    model1.contextWindow > model2.contextWindow ? model1 : model2;

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${model1.displayName} vs ${model2.displayName}`,
            description: `Compare ${model1.displayName} and ${model2.displayName} - pricing, capabilities, and recommendations.`,
            author: {
              '@type': 'Organization',
              name: 'Engify.ai',
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
            <span className="text-foreground">Comparison</span>
          </nav>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold">
              {model1.displayName} vs {model2.displayName}
            </h1>
            <p className="text-xl text-muted-foreground">
              Compare pricing, capabilities, and use cases
            </p>
          </div>

          {/* Quick Comparison */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 font-semibold">Cheaper</div>
                  <Badge variant="default">{cheaper.displayName}</Badge>
                  <div className="mt-1 text-sm text-muted-foreground">
                    $
                    {cheaper === model1
                      ? costPer1M1.toFixed(2)
                      : costPer1M2.toFixed(2)}{' '}
                    vs $
                    {cheaper === model1
                      ? costPer1M2.toFixed(2)
                      : costPer1M1.toFixed(2)}{' '}
                    per 1M tokens
                  </div>
                </div>
                <div>
                  <div className="mb-2 font-semibold">Larger Context</div>
                  <Badge variant="default">{largerContext.displayName}</Badge>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {largerContext.contextWindow.toLocaleString()} vs{' '}
                    {largerContext === model1
                      ? model2.contextWindow.toLocaleString()
                      : model1.contextWindow.toLocaleString()}{' '}
                    tokens
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side-by-Side Comparison */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {/* Model 1 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{model1.displayName}</CardTitle>
                  {model1.recommended && (
                    <Badge variant="default">Recommended</Badge>
                  )}
                </div>
                <CardDescription>
                  {PROVIDER_LABELS[model1.provider] || model1.provider}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Pricing (per 1M tokens)
                  </div>
                  <div className="text-2xl font-bold">
                    ${costPer1M1.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Context Window
                  </div>
                  <div className="text-lg font-semibold">
                    {model1.contextWindow.toLocaleString()} tokens
                  </div>
                </div>
                {model1.maxOutputTokens && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Max Output
                    </div>
                    <div className="text-lg font-semibold">
                      {model1.maxOutputTokens.toLocaleString()} tokens
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Capabilities
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {model1.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/learn/ai-models/${model1Slug}`}>
                    View {model1.displayName} Details
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Model 2 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{model2.displayName}</CardTitle>
                  {model2.recommended && (
                    <Badge variant="default">Recommended</Badge>
                  )}
                </div>
                <CardDescription>
                  {PROVIDER_LABELS[model2.provider] || model2.provider}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Pricing (per 1M tokens)
                  </div>
                  <div className="text-2xl font-bold">
                    ${costPer1M2.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Context Window
                  </div>
                  <div className="text-lg font-semibold">
                    {model2.contextWindow.toLocaleString()} tokens
                  </div>
                </div>
                {model2.maxOutputTokens && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Max Output
                    </div>
                    <div className="text-lg font-semibold">
                      {model2.maxOutputTokens.toLocaleString()} tokens
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Capabilities
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {model2.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/learn/ai-models/${model2Slug}`}>
                    View {model2.displayName} Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left">Feature</th>
                      <th className="p-4 text-center">{model1.displayName}</th>
                      <th className="p-4 text-center">{model2.displayName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Provider</td>
                      <td className="p-4 text-center">
                        {PROVIDER_LABELS[model1.provider] || model1.provider}
                      </td>
                      <td className="p-4 text-center">
                        {PROVIDER_LABELS[model2.provider] || model2.provider}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">
                        Input Cost (per 1M tokens)
                      </td>
                      <td className="p-4 text-center">
                        ${costPer1M1.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        ${costPer1M2.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">
                        Output Cost (per 1M tokens)
                      </td>
                      <td className="p-4 text-center">
                        ${(model1.costPer1kOutputTokens * 1000).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        ${(model2.costPer1kOutputTokens * 1000).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Context Window</td>
                      <td className="p-4 text-center">
                        {model1.contextWindow.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        {model2.contextWindow.toLocaleString()}
                      </td>
                    </tr>
                    {model1.maxOutputTokens && model2.maxOutputTokens && (
                      <tr className="border-b">
                        <td className="p-4 font-medium">Max Output Tokens</td>
                        <td className="p-4 text-center">
                          {model1.maxOutputTokens.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          {model2.maxOutputTokens.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <td className="p-4 font-medium">Streaming</td>
                      <td className="p-4 text-center">
                        {model1.supportsStreaming ? '✅' : '❌'}
                      </td>
                      <td className="p-4 text-center">
                        {model2.supportsStreaming ? '✅' : '❌'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">JSON Mode</td>
                      <td className="p-4 text-center">
                        {model1.supportsJSON ? '✅' : '❌'}
                      </td>
                      <td className="p-4 text-center">
                        {model2.supportsJSON ? '✅' : '❌'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Vision</td>
                      <td className="p-4 text-center">
                        {model1.supportsVision ? '✅' : '❌'}
                      </td>
                      <td className="p-4 text-center">
                        {model2.supportsVision ? '✅' : '❌'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Status</td>
                      <td className="p-4 text-center">
                        <Badge
                          variant={
                            model1.status === 'active'
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {model1.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge
                          variant={
                            model2.status === 'active'
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {model2.status}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Tier</td>
                      <td className="p-4 text-center">
                        {model1.tier || 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        {model2.tier || 'N/A'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Which Should You Choose?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">
                  Choose {model1.displayName} if:
                </h3>
                <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
                  {model1.notes && <li>{model1.notes}</li>}
                  {model1.tags.includes('cheap') && (
                    <li>You need the most cost-effective option</li>
                  )}
                  {model1.tags.includes('fast') && (
                    <li>You need low latency</li>
                  )}
                  {model1.recommended && (
                    <li>You want a well-rounded, recommended model</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">
                  Choose {model2.displayName} if:
                </h3>
                <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
                  {model2.notes && <li>{model2.notes}</li>}
                  {model2.tags.includes('cheap') && (
                    <li>You need the most cost-effective option</li>
                  )}
                  {model2.tags.includes('fast') && (
                    <li>You need low latency</li>
                  )}
                  {model2.recommended && (
                    <li>You want a well-rounded, recommended model</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Try These Models</CardTitle>
              <CardDescription>
                Test both models in our interactive workbench
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/demo">
                  Open Workbench
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </>
  );
}
