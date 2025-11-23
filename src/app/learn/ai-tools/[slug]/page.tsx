/**
 * AI Tool Detail Page
 *
 * SEO-optimized detail page for individual AI development tools
 * Shows features, pricing, pros/cons, and affiliate links
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { aiToolService } from '@/lib/services/AIToolService';
import { loadAIToolFromJson } from '@/lib/ai-tools/load-ai-tools-from-json';
import { logger } from '@/lib/logging/logger';
import { getToolLink } from '@/lib/utils/tool-links';
import { AIToolCostComparison } from '@/components/features/AIToolCostComparison';
import { AIToolUpdates } from '@/components/features/AIToolUpdates';
import { newsAggregatorService } from '@/lib/services/NewsAggregatorService';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate hourly

const CATEGORY_LABELS: Record<string, string> = {
  ide: 'AI IDEs',
  'code-assistant': 'Code Assistants',
  'ai-terminal': 'AI Terminals',
  'agentic-assistant': 'Agentic Assistants',
  'cloud-optimized': 'Cloud Optimized Assistants',
  builder: 'AI Builders',
  'ui-generator': 'UI Generators',
  'ai-testing-qa': 'AI Testing & QA',
  'code-review': 'AI Code Review & Quality',
  'mlops': 'MLOps & Experiment Tracking',
  'internal-tooling': 'AI Internal Tooling',
  protocol: 'Protocols',
  framework: 'Frameworks',
  other: 'Other',
};


interface PageProps {
  params: Promise<{ slug: string }>;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Try JSON first (fast, no MongoDB connection), then fallback to MongoDB
  const tool = await loadAIToolFromJson(slug) || await aiToolService.findBySlug(slug);

  if (!tool) {
    return {
      title: 'AI Tool Not Found | Engify.ai',
    };
  }

  const pricingText = tool.pricing.free
    ? 'Free'
    : `$${tool.pricing.paid?.monthly || 0}/month`;

  const prosPreview = tool.pros && tool.pros.length > 0 
    ? tool.pros.slice(0, 2).join('. ')
    : '';

  // Enhanced description with more context
  const enhancedDescription = `${tool.name}: ${tool.tagline || tool.description}. ${pricingText}.${prosPreview ? ` ${prosPreview}.` : ''} Learn how ${tool.name} can improve your development workflow with AI-powered features.`;

  // Warp-specific enhancements
  const isWarp = slug === 'warp';
  const warpSpecificKeywords = isWarp ? [
    'Warp terminal',
    'Warp AI terminal',
    'AI terminal emulator',
    'modern terminal',
    'Warp.dev',
    'terminal AI',
    'AI command line',
    'developer terminal',
    'Warp terminal review',
    'Warp vs iTerm',
    'Warp vs Terminal.app',
  ] : [];

  return {
    title: `${tool.name} Review & Comparison - AI Development Tool | Engify.ai`,
    description: enhancedDescription,
    keywords: [
      tool.name,
      `${tool.name} review`,
      `${tool.name} pricing`,
      `${tool.name} vs`,
      'AI development tool',
      'AI IDE',
      'code assistant',
      ...(tool.tags || []),
      ...warpSpecificKeywords,
    ],
    authors: [{ name: 'Engify.ai Team' }],
    openGraph: {
      title: `${tool.name} - AI Development Tool Review & Guide | Engify.ai`,
      description: enhancedDescription,
      type: 'article',
      url: `${APP_URL}/learn/ai-tools/${slug}`,
      siteName: 'Engify.ai',
      images: [
        {
          url: `${APP_URL}/og-image.png`, // Add OG image if available
          width: 1200,
          height: 630,
          alt: `${tool.name} - AI Development Tool`,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} - AI Development Tool Review`,
      description: enhancedDescription,
      creator: '@engifyai', // Update with actual Twitter handle if available
    },
    alternates: {
      canonical: `${APP_URL}/learn/ai-tools/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function AIToolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  // Try JSON first (fast, no MongoDB connection), then fallback to MongoDB
  const tool = await loadAIToolFromJson(slug) || await aiToolService.findBySlug(slug);

  if (!tool) {
    logger.warn('AI tool not found', { slug });
    notFound();
  }

  const pricingText = tool.pricing.free
    ? 'Free'
    : `$${tool.pricing.paid?.monthly || 0}/month`;

  const annualPrice =
    tool.pricing.paid?.annual && tool.pricing.paid?.monthly
      ? `$${tool.pricing.paid.annual}/year (save ${Math.round((1 - tool.pricing.paid.annual / (tool.pricing.paid.monthly * 12)) * 100)}%)`
      : null;

  // Fetch recent updates for this tool
  const updates = await newsAggregatorService.getToolUpdates(tool.id, 5);

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: tool.name,
            description: tool.description,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Windows, macOS, Linux',
            url: tool.websiteUrl || getToolLink(tool),
            ...(tool.websiteUrl && { sameAs: [tool.websiteUrl] }),
            offers: tool.pricing.free
              ? {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                }
              : {
                  '@type': 'Offer',
                  price: tool.pricing.paid?.monthly || 0,
                  priceCurrency: 'USD',
                  priceSpecification: {
                    '@type': 'UnitPriceSpecification',
                    price: tool.pricing.paid?.monthly || 0,
                    priceCurrency: 'USD',
                    billingDuration: 'P1M',
                  },
                },
            aggregateRating: tool.rating && (tool.reviewCount ?? 0) > 0
              ? {
                  '@type': 'AggregateRating',
                  ratingValue: tool.rating,
                  ratingCount: tool.reviewCount,
                }
              : undefined,
            featureList: tool.features?.map(feature => ({
              '@type': 'SoftwareFeature',
              name: feature,
            })),
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
            <Link href="/learn/ai-tools" className="hover:text-primary">
              AI Tools
            </Link>
            <Icons.chevronRight className="h-4 w-4" />
            <span className="text-foreground">{tool.name}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <h1 className="text-4xl font-bold">{tool.name}</h1>
              {/* Rating only shows when there are actual reviews */}
              {tool.rating && (tool.reviewCount ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <Icons.heart className="h-5 w-5 fill-red-500 text-red-500" />
                  <span className="text-lg font-semibold">{tool.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({tool.reviewCount}{' '}
                    {tool.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>
            {tool.tagline && (
              <p className="text-xl text-muted-foreground">{tool.tagline}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {CATEGORY_LABELS[tool.category] || tool.category}
              </Badge>
              <Badge variant={tool.pricing.free ? 'default' : 'outline'}>
                {pricingText}
              </Badge>
              {tool.badges && tool.badges.length > 0 && (
                <>
                  {tool.badges.includes('open-source') && (
                    <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
                      Open Source
                    </Badge>
                  )}
                  {tool.badges.includes('vscode-plugin') && (
                    <Badge variant="outline">VS Code Plugin</Badge>
                  )}
                  {tool.badges.includes('jetbrains-plugin') && (
                    <Badge variant="outline">JetBrains Plugin</Badge>
                  )}
                  {tool.badges.includes('enterprise') && (
                    <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400">
                      Enterprise
                    </Badge>
                  )}
                  {tool.badges.includes('github-integration') && (
                    <Badge variant="outline">GitHub Integration</Badge>
                  )}
                </>
              )}
            </div>
          </div>

          {/* TL;DR Section - G2-style Authority Architecture */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.zap className="h-5 w-5 text-primary" />
                Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Best For:</h3>
                  <p className="text-sm text-muted-foreground">
                    {tool.pros && tool.pros.length > 0 
                      ? tool.pros.slice(0, 2).join('. ') + '.'
                      : tool.tagline || tool.description.split('.')[0] + '.'}
                  </p>
                </div>
                {tool.pricing && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Pricing:</h3>
                    <p className="text-sm text-muted-foreground">
                      {tool.pricing.free 
                        ? 'Free tier available' + (tool.pricing.paid?.monthly ? `, paid plans from $${tool.pricing.paid.monthly}/month` : '')
                        : `Starting at $${tool.pricing.paid?.monthly || 0}/month`}
                    </p>
                  </div>
                )}
                {tool.features && tool.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Key Differentiator:</h3>
                    <p className="text-sm text-muted-foreground">
                      {tool.features[0]}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground">{tool.description}</p>
                  {tool.websiteUrl && (
                    <p className="mt-4 text-sm">
                      <strong>Official Website:</strong>{' '}
                      <a 
                        href={tool.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {tool.websiteUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Features */}
              {tool.features && tool.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Icons.check className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Latest Updates */}
              <AIToolUpdates 
                updates={updates} 
                toolName={tool.name}
                emptyMessage={`No recent updates for ${tool.name} yet. Check back soon!`}
              />

              {/* Intent-Driven Comparison Section */}
              {tool.category && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>How {tool.name} Compares</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Key differentiators and competitive advantages
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tool.pros && tool.pros.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-foreground">
                            Why {tool.name} beats competitors:
                          </h4>
                          <ul className="space-y-1.5 text-sm text-muted-foreground">
                            {tool.pros.slice(0, 3).map((pro, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Icons.check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {tool.cons && tool.cons.length > 0 && (
                        <div className="pt-3 border-t">
                          <h4 className="mb-2 text-sm font-semibold text-foreground">
                            Trade-offs to consider:
                          </h4>
                          <ul className="space-y-1.5 text-sm text-muted-foreground">
                            {tool.cons.slice(0, 2).map((con, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Icons.alertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pros & Cons - Detailed */}
              {((tool.pros && tool.pros.length > 0) || (tool.cons && tool.cons.length > 0)) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {tool.pros && tool.pros.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-600 dark:text-green-400">
                          Pros
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {tool.pros.map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Icons.check className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {tool.cons && tool.cons.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-600 dark:text-red-400">
                          Cons
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {tool.cons.map((con, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Icons.x className="mt-1 h-4 w-4 shrink-0 text-red-500" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Supported Models */}
              {tool.supportedModels && tool.supportedModels.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Supported AI Models</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tool.supportedModels.map((model) => (
                        <Badge key={model} variant="secondary">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Agent Capabilities */}
              {tool.agentCapabilities && tool.agentCapabilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tool.agentCapabilities.map((capability) => (
                        <li key={capability} className="flex items-start gap-2">
                          <Icons.check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          <span className="text-sm capitalize">
                            {capability.replace(/-/g, ' ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Marketplace Links */}
              {tool.marketplaceLinks && (
                <Card>
                  <CardHeader>
                    <CardTitle>Installation & Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tool.marketplaceLinks.vscode && (
                      <Button asChild variant="outline" size="sm" className="w-full justify-start">
                        <a
                          href={tool.marketplaceLinks.vscode}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icons.code className="mr-2 h-4 w-4" />
                          VS Code Marketplace
                          <Icons.externalLink className="ml-auto h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {tool.marketplaceLinks.jetbrains && (
                      <Button asChild variant="outline" size="sm" className="w-full justify-start">
                        <a
                          href={tool.marketplaceLinks.jetbrains}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icons.code className="mr-2 h-4 w-4" />
                          JetBrains Marketplace
                          <Icons.externalLink className="ml-auto h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {tool.marketplaceLinks.github && (
                      <Button asChild variant="outline" size="sm" className="w-full justify-start">
                        <a
                          href={tool.marketplaceLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icons.github className="mr-2 h-4 w-4" />
                          GitHub Repository
                          <Icons.externalLink className="ml-auto h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cost Comparison */}
              {tool.pricing && (
                <AIToolCostComparison
                  toolPricing={tool.pricing}
                  toolName={tool.name}
                />
              )}

              {/* Tags */}
              {tool.tags && tool.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.map((tag) => (
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
                  {tool.pricing.free ? (
                    <div>
                      <div className="text-2xl font-bold">Free</div>
                      <div className="text-sm text-muted-foreground">
                        Free tier available
                      </div>
                      {/* Show credits for free tier if available */}
                      {tool.pricing.paid?.creditsPerMonth && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="text-sm font-medium">
                            {tool.pricing.paid.creditsPerMonth.toLocaleString()}{' '}
                            {tool.pricing.paid.creditsUnit || 'credits'}/month
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Included in free tier
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="text-2xl font-bold">
                          ${tool.pricing.paid?.monthly || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per month
                        </div>
                      </div>
                      {annualPrice && (
                        <div>
                          <div className="text-lg font-semibold">
                            {annualPrice}
                          </div>
                        </div>
                      )}
                      {tool.pricing.paid?.tier && (
                        <div>
                          <Badge variant="secondary">
                            {tool.pricing.paid.tier}
                          </Badge>
                        </div>
                      )}
                      {/* Credits/Tokens Information */}
                      {tool.pricing.paid?.unlimited ? (
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Icons.infinity className="h-4 w-4 text-green-600" />
                            <div className="text-sm font-medium">
                              Unlimited usage
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Model selection affects cost
                          </div>
                        </div>
                      ) : tool.pricing.paid?.creditsPerMonth ? (
                        <div className="pt-2 border-t">
                          <div className="text-sm font-medium">
                            {tool.pricing.paid.creditsPerMonth.toLocaleString()}{' '}
                            {tool.pricing.paid.creditsUnit || 'credits'}/month
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Included in monthly subscription
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* CTA - Use affiliate link if available, otherwise website URL */}
              {(tool.affiliateLink || tool.websiteUrl) && (
                <div className="space-y-3">
                  <Button asChild className="w-full" size="lg">
                    <a
                      href={getToolLink(tool)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tool.affiliateLink ? `Try ${tool.name}` : `Visit ${tool.name}`}
                      <Icons.externalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  {tool.websiteUrl && (
                    <p className="text-xs text-center text-muted-foreground">
                      Official website: <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{tool.websiteUrl.replace(/^https?:\/\//, '')}</a>
                    </p>
                  )}
                </div>
              )}

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
                    <Link href="/learn/ai-tools">
                      <Icons.arrowLeft className="mr-2 h-4 w-4" />
                      All AI Tools
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Link href="/learn/ai-models">AI Models</Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Link href="/tools">Tools Comparison</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Hub Content Sections */}
          {tool.hubContent && (
            <div className="space-y-12">
              {/* Section 7: Problems & Solutions */}
              {tool.hubContent.problems && tool.hubContent.problems.length > 0 && (
                <section>
                  <h2 className="mb-6 text-2xl font-bold">
                    {tool.hubContent.problemsHeading || `Common ${tool.name} Problems (And How Engify Helps)`}
                  </h2>
                  <div className="space-y-4">
                    {tool.hubContent.problems.map((problem) => (
                      <Card key={problem.id}>
                        <CardHeader>
                          <CardTitle>{problem.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p><strong>Issue:</strong> {problem.issue}</p>
                            <p><strong>Impact:</strong> {problem.impact}</p>
                            <p className="text-primary">
                              <strong>Engify Solution:</strong> {problem.engifySolution}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 10: Community Resources */}
              {((tool.hubContent.officialResources && tool.hubContent.officialResources.length > 0) ||
                (tool.hubContent.communityResources && tool.hubContent.communityResources.length > 0)) && (
                <section>
                  <h2 className="mb-6 text-2xl font-bold">
                    {tool.hubContent.communityHeading || 'Community Resources'}
                  </h2>
                  
                  <div className="space-y-6">
                    {tool.hubContent.officialResources && tool.hubContent.officialResources.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-lg font-semibold">Official Resources</h3>
                        <ul className="space-y-2">
                          {tool.hubContent.officialResources.map((resource) => (
                            <li key={resource.id}>
                              <a href={resource.url} className="text-primary underline" target="_blank" rel="noopener noreferrer">
                                {resource.title}
                              </a>
                              {resource.description && (
                                <span className="text-muted-foreground"> - {resource.description}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {tool.hubContent.communityResources && tool.hubContent.communityResources.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-lg font-semibold">Community Resources</h3>
                        <ul className="space-y-2">
                          {tool.hubContent.communityResources.map((resource) => (
                            <li key={resource.id}>
                              <a href={resource.url} className="text-primary underline" target="_blank" rel="noopener noreferrer">
                                {resource.title}
                              </a>
                              {resource.description && (
                                <span className="text-muted-foreground"> - {resource.description}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm text-muted-foreground">
                      {tool.hubContent.communityCallout || (
                        <>
                          <strong>Why we link to other sites:</strong> We believe the best resource for you might not 
                          always be Engify. Our goal is to help you succeed with AI coding tools, 
                          not to lock you into our platform.
                        </>
                      )}
                    </p>
                  </div>
                </section>
              )}

              {/* Section 9: Getting Started */}
              {tool.hubContent.gettingStarted && tool.hubContent.gettingStarted.length > 0 && (
                <section>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {tool.hubContent.gettingStartedHeading || `Getting Started with ${tool.name}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal space-y-3 pl-5">
                        {tool.hubContent.gettingStarted.map((step) => (
                          <li key={step.id}>
                            <strong>{step.title}:</strong> {step.description}
                          </li>
                        ))}
                      </ol>
                      
                      {tool.hubContent.gettingStartedProTip && (
                        <div className="mt-6 rounded-lg bg-muted p-4">
                          <p className="text-sm font-semibold">💡 Pro Tip:</p>
                          <p className="text-sm text-muted-foreground">
                            {tool.hubContent.gettingStartedProTip}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Section 8: Articles */}
              {tool.hubContent.articles && tool.hubContent.articles.length > 0 && (
                <section>
                  <h2 className="mb-6 text-2xl font-bold">
                    {tool.hubContent.articlesHeading || `In-Depth ${tool.name} Guides`}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {tool.hubContent.articles.map((article) => (
                      <Card key={article.id} className={article.status === 'coming_soon' ? 'border-dashed' : ''}>
                        <CardHeader>
                          <CardTitle>{article.title}</CardTitle>
                          {article.status === 'coming_soon' && (
                            <Badge variant="secondary">Coming Soon</Badge>
                          )}
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {article.description}
                          </p>
                          {article.status === 'published' && article.slug && (
                            <Button asChild className="mt-4" variant="outline">
                              <Link href={`/learn/articles/${article.slug}`}>
                                Read Article →
                              </Link>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}
