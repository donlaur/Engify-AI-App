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
    m.supportsVision ||
    m.capabilities.some((cap) => cap.includes('image') || cap === 'vision' || cap.includes('vision')) ||
    (m.modalities?.image && m.modalities.image !== 'not-supported')
  ).length;
  const videoModels = models.filter((m) =>
    m.capabilities.some((cap) => cap.includes('video') || cap === 'video-generation') ||
    (m.modalities?.video && m.modalities.video !== 'not-supported')
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

        {/* Multi-Model Comparison */}
        <div className="mb-12">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:border-blue-800 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-green-900/20">
            <CardHeader>
              <CardTitle className="text-2xl">
                🤖 AI Model Showdown: GPT-5 vs Claude 4.5 vs Gemini 2.5 (Nov 2025)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                The three flagship models for coding and reasoning compared
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left font-semibold">Feature</th>
                      <th className="p-3 text-left font-semibold text-blue-900 dark:text-blue-100">
                        GPT-5
                      </th>
                      <th className="p-3 text-left font-semibold text-purple-900 dark:text-purple-100">
                        Claude 4.5 Sonnet
                      </th>
                      <th className="p-3 text-left font-semibold text-green-900 dark:text-green-100">
                        Gemini 2.5 Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="p-3 font-medium">Provider</td>
                      <td className="p-3">OpenAI</td>
                      <td className="p-3">Anthropic</td>
                      <td className="p-3">Google</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Release Date</td>
                      <td className="p-3">Aug 2025</td>
                      <td className="p-3">Sept 2025</td>
                      <td className="p-3">Mar 2025</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Knowledge Cutoff</td>
                      <td className="p-3">Oct 2024</td>
                      <td className="p-3 font-semibold text-green-700 dark:text-green-400">July 2025 (Most recent)</td>
                      <td className="p-3">Jan 2025</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Context Window</td>
                      <td className="p-3 font-semibold">400K tokens</td>
                      <td className="p-3">200K tokens</td>
                      <td className="p-3 font-semibold text-green-700 dark:text-green-400">1-2M tokens (Largest)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">SWE-Bench (Bug Fixing)</td>
                      <td className="p-3 font-semibold text-green-700 dark:text-green-400">~74.9% (Top)</td>
                      <td className="p-3 font-semibold text-green-700 dark:text-green-400">~74.5% (Top)</td>
                      <td className="p-3">~63.8%</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">HumanEval (Function Writing)</td>
                      <td className="p-3">~90-92%</td>
                      <td className="p-3">~92%</td>
                      <td className="p-3 font-semibold text-green-700 dark:text-green-400">~99% (Near-perfect)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Best For</td>
                      <td className="p-3">Real-world bug fixing, agentic tasks</td>
                      <td className="p-3">Complex debugging, recent frameworks</td>
                      <td className="p-3">Whole-codebase analysis, new functions</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Speed Mode</td>
                      <td className="p-3">Fast or &quot;thinking&quot; (flexible)</td>
                      <td className="p-3">Fast or &quot;extended thinking&quot;</td>
                      <td className="p-3">Fast (2.0 Flash: 250+ tokens/sec)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Multimodal</td>
                      <td className="p-3">Text, images (native)</td>
                      <td className="p-3">Text, images</td>
                      <td className="p-3">Text, code, images, audio, video</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Ecosystem</td>
                      <td className="p-3">GitHub Copilot, ChatGPT</td>
                      <td className="p-3">Claude Code, Cursor, Windsurf</td>
                      <td className="p-3">Google Cloud, Vertex AI</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Key Strength</td>
                      <td className="p-3">
                        <div className="text-blue-700 dark:text-blue-400">
                          ✓ Top agentic bug fixing
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-purple-700 dark:text-purple-400">
                          ✓ Most up-to-date knowledge
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-green-700 dark:text-green-400">
                          ✓ Massive context window
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                    Choose GPT-5 if:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• You need top agentic bug fixing (74.9% SWE-Bench)</li>
                    <li>• You want flexible speed/accuracy modes</li>
                    <li>• You&apos;re using GitHub Copilot or ChatGPT</li>
                    <li>• You need 400K context window</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                  <h4 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
                    Choose Claude 4.5 Sonnet if:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• You need the most recent knowledge (July 2025)</li>
                    <li>• You&apos;re using Cursor or Windsurf</li>
                    <li>• You want excellent debugging + safety</li>
                    <li>• You value Constitutional AI principles</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                  <h4 className="mb-2 font-semibold text-green-900 dark:text-green-100">
                    Choose Gemini 2.5 Pro if:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• You need massive context (1-2M tokens)</li>
                    <li>• You&apos;re analyzing entire codebases</li>
                    <li>• You want near-perfect function generation (99%)</li>
                    <li>• You&apos;re in Google Cloud ecosystem</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-yellow-900 dark:text-yellow-100">
                  <Icons.lightbulb className="h-5 w-5" />
                  Pro Tip: Task-Specific Model Selection (Nov 2025)
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  The &quot;best&quot; model is no longer a single winner. Use <strong>GPT-5 or Claude 4.5 for real-world bug fixing</strong> (both ~74% on SWE-Bench), <strong>Gemini 2.5 for writing new functions</strong> (99% HumanEval), and <strong>Gemini for whole-codebase analysis</strong> (1-2M context). Tools like Cursor let you switch models per task.
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
