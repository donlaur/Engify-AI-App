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

        {/* Claude vs GPT-4 Comparison */}
        <div className="mb-12">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardHeader>
              <CardTitle className="text-2xl">
                🤖 Claude 3.5 Sonnet vs GPT-4o: The AI Model Battle (2025)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                The two leading AI models for coding and reasoning compared
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left font-semibold">Feature</th>
                      <th className="p-3 text-left font-semibold text-blue-900 dark:text-blue-100">
                        Claude 3.5 Sonnet
                      </th>
                      <th className="p-3 text-left font-semibold text-purple-900 dark:text-purple-100">
                        GPT-4o
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="p-3 font-medium">Provider</td>
                      <td className="p-3">Anthropic</td>
                      <td className="p-3">OpenAI</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Context Window</td>
                      <td className="p-3 font-semibold">200K tokens</td>
                      <td className="p-3">128K tokens</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Best For</td>
                      <td className="p-3">Coding, reasoning, long documents</td>
                      <td className="p-3">General purpose, multimodal tasks</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Coding Performance</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-semibold text-green-700 dark:text-green-400">
                            Excellent
                          </div>
                          <div className="text-xs">Preferred by Cursor, Windsurf</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-semibold text-blue-700 dark:text-blue-400">
                            Very Good
                          </div>
                          <div className="text-xs">Strong general coding</div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Reasoning</td>
                      <td className="p-3">Superior for complex logic</td>
                      <td className="p-3">Strong, more creative</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Speed</td>
                      <td className="p-3">Fast (optimized for coding)</td>
                      <td className="p-3">Very fast (multimodal optimized)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Input Pricing</td>
                      <td className="p-3 font-semibold">$3 / 1M tokens</td>
                      <td className="p-3 font-semibold">$2.50 / 1M tokens</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Output Pricing</td>
                      <td className="p-3 font-semibold">$15 / 1M tokens</td>
                      <td className="p-3 font-semibold">$10 / 1M tokens</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Multimodal</td>
                      <td className="p-3">Vision (images)</td>
                      <td className="p-3">Vision, audio, images</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Function Calling</td>
                      <td className="p-3">Excellent (tool use)</td>
                      <td className="p-3">Excellent (native functions)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Market Position</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="text-green-700 dark:text-green-400">
                            ✓ Coding champion
                          </div>
                          <div className="text-green-700 dark:text-green-400">
                            ✓ Largest context window
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="text-blue-700 dark:text-blue-400">
                            ✓ Most versatile
                          </div>
                          <div className="text-blue-700 dark:text-blue-400">
                            ✓ Lower cost
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                    Choose Claude 3.5 Sonnet if:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• You&apos;re primarily coding (especially complex refactoring)</li>
                    <li>• You need the largest context window (200K tokens)</li>
                    <li>• You value superior reasoning and logic</li>
                    <li>• You&apos;re using Cursor or Windsurf (native integration)</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                  <h4 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
                    Choose GPT-4o if:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• You need multimodal (vision + audio + text)</li>
                    <li>• You want lower costs ($2.50 vs $3 input)</li>
                    <li>• You prefer more creative responses</li>
                    <li>• You&apos;re using GitHub Copilot or ChatGPT</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-yellow-900 dark:text-yellow-100">
                  <Icons.lightbulb className="h-5 w-5" />
                  Pro Tip: Use Both
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Many developers use <strong>Claude for coding</strong> (Cursor, Windsurf) and{' '}
                  <strong>GPT-4o for general tasks</strong> (ChatGPT, research). Tools like Cursor
                  let you switch models per task. Use Claude for complex refactoring and GPT-4o for
                  quick iterations or multimodal work.
                </p>
              </div>
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
