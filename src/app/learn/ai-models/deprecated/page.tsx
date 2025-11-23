/**
 * EOL (End-of-Life) Tracking Page
 *
 * SEO-optimized page listing deprecated and sunset AI models
 * Example: /learn/ai-models/deprecated
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { aiModelService } from '@/lib/services/AIModelService';
import { loadAIModelsFromJson, loadAIModelFromJson } from '@/lib/ai-models/load-ai-models-from-json';
import { generateSlug } from '@/lib/utils/slug';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate hourly

export const metadata: Metadata = {
  title: 'Deprecated & Sunset AI Models - EOL Tracking | Engify.ai',
  description:
    'Track deprecated and sunset AI models. Find replacement models, migration guides, and end-of-life dates for GPT-3.5 Turbo, Claude 3.5 Sonnet, and more.',
  keywords: [
    'deprecated AI models',
    'sunset AI models',
    'EOL AI models',
    'GPT-3.5 deprecated',
    'Claude deprecated',
    'AI model end of life',
    'AI model migration',
  ],
  openGraph: {
    title: 'Deprecated & Sunset AI Models - EOL Tracking',
    description:
      'Track deprecated and sunset AI models with replacement recommendations.',
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

export default async function EOLTrackingPage() {
  // Try JSON first (fast, no MongoDB connection), then filter
  let allModels = await loadAIModelsFromJson();
  // If JSON failed, fallback to MongoDB
  if (allModels.length === 0) {
    allModels = await aiModelService.find({});
  }
  // Filter for deprecated and sunset models
  const deprecated = allModels.filter((m) => m.status === 'deprecated');
  const sunset = allModels.filter((m) => m.status === 'sunset');

  const allEOL = [...deprecated, ...sunset].sort((a, b) => {
    const dateA = a.deprecationDate || a.sunsetDate || new Date(0);
    const dateB = b.deprecationDate || b.sunsetDate || new Date(0);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Deprecated & Sunset AI Models',
            description:
              'Track deprecated and sunset AI models with replacement recommendations.',
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
            <span className="text-foreground">Deprecated & Sunset</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">
              Deprecated & Sunset AI Models
            </h1>
            <p className="text-xl text-muted-foreground">
              Track end-of-life dates and find replacement models
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Deprecated Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{deprecated.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sunset Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sunset.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total EOL Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allEOL.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* EOL Models List */}
          {allEOL.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Icons.checkCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                <h3 className="mb-2 text-lg font-semibold">
                  No Deprecated Models
                </h3>
                <p className="text-muted-foreground">
                  All models are currently active and supported.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {await Promise.all(
                allEOL.map(async (model) => {
                  const slug = model.slug || generateSlug(model.displayName);
                  // Load replacement model from JSON if available
                  const replacementModel = model.replacementModel
                    ? (await loadAIModelFromJson(model.replacementModel)) ||
                      (await aiModelService.findById(model.replacementModel))
                    : null;

                  return (
                    <Card key={model.id} className="border-orange-500/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {model.displayName}
                              {model.status === 'deprecated' && (
                                <Badge variant="destructive">Deprecated</Badge>
                              )}
                              {model.status === 'sunset' && (
                                <Badge variant="destructive">Sunset</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {PROVIDER_LABELS[model.provider] ||
                                model.provider}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Dates */}
                        <div className="grid gap-4 md:grid-cols-2">
                          {model.deprecationDate && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Deprecated Date
                              </div>
                              <div className="text-lg font-semibold">
                                {new Date(
                                  model.deprecationDate
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                          {model.sunsetDate && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Sunset Date
                              </div>
                              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                                {new Date(
                                  model.sunsetDate
                                ).toLocaleDateString()}
                              </div>
                              {new Date(model.sunsetDate) < new Date() && (
                                <div className="text-xs text-red-600 dark:text-red-400">
                                  ⚠️ Already sunset
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {model.notes && (
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">
                              Notes
                            </div>
                            <p className="text-sm">{model.notes}</p>
                          </div>
                        )}

                        {/* Replacement Model */}
                        {replacementModel && (
                          <Card className="border-green-500/20 bg-green-500/5">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">
                                Recommended Replacement
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold">
                                    {replacementModel.displayName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {PROVIDER_LABELS[
                                      replacementModel.provider
                                    ] || replacementModel.provider}
                                  </div>
                                </div>
                                <Link
                                  href={`/learn/ai-models/${replacementModel.slug || generateSlug(replacementModel.displayName)}`}
                                >
                                  <Badge
                                    variant="default"
                                    className="cursor-pointer hover:bg-primary/90"
                                  >
                                    View Details
                                    <Icons.arrowRight className="ml-1 inline h-3 w-3" />
                                  </Badge>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Link to Details */}
                        <div className="flex gap-2">
                          <Link href={`/learn/ai-models/${slug}`}>
                            <Badge variant="outline" className="cursor-pointer">
                              View Model Details
                            </Badge>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* Info Card */}
          <Card className="mt-8 border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.info className="h-5 w-5" />
                About EOL Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We track AI model deprecations and sunset dates to help you stay
                up-to-date with the latest models. When a model is deprecated,
                we recommend replacement models and provide migration guidance.
                Check back regularly for updates.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </>
  );
}
