/**
 * AI Models Hub Page
 *
 * SEO-optimized hub for all AI models
 * Lists models with filtering, sorting, and search
 * Includes image and video models for comprehensive coverage
 */

import { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { AIModelsClient } from '@/components/features/AIModelsClient';
import { aiModelService } from '@/lib/services/AIModelService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Icons } from '@/lib/icons';

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
    'image generation models',
    'video generation models',
  ],
  openGraph: {
    title: 'AI Models Comparison & Pricing Guide | Engify.ai',
    description:
      'Compare AI models: GPT-4o, Claude 3.5 Sonnet, Gemini, and more.',
    type: 'website',
  },
};

export default async function AIModelsHubPage() {
  // Fetch all active models (including image/video models)
  const models = await aiModelService.findActive();

  // Get unique providers
  const providers = Array.from(
    new Set(models.map((m) => m.provider))
  ).sort();

  // Stats
  const activeCount = models.filter((m) => m.status === 'active').length;
  const textModels = models.filter((m) => m.capabilities.includes('text')).length;
  const imageModels = models.filter((m) =>
    m.capabilities.some((cap) => cap.includes('image'))
  ).length;
  const videoModels = models.filter((m) =>
    m.capabilities.some((cap) => cap.includes('video'))
  ).length;

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
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
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
                Text Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{textModels}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Image Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{imageModels}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Video Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{videoModels}</div>
            </CardContent>
          </Card>
        </div>

        {/* Models List with Client Filtering */}
        <AIModelsClient models={models} providers={providers} />

        {/* CTA */}
        <Card className="mt-12 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Looking for AI Development Tools?</CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare AI-powered IDEs, code assistants, and development tools.
            </p>
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
      </div>
    </MainLayout>
  );
}
