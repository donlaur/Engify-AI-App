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
import { logger } from '@/lib/logging/logger';
import { getToolLink } from '@/lib/utils/tool-links';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate hourly

const CATEGORY_LABELS: Record<string, string> = {
  ide: 'AI IDEs',
  'code-assistant': 'Code Assistants',
  'ai-terminal': 'AI Terminals',
  builder: 'AI Builders',
  'ui-generator': 'UI Generators',
  protocol: 'Protocols',
  framework: 'Frameworks',
  other: 'Other',
};

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const tool = await aiToolService.findBySlug(params.slug);

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

  return {
    title: `${tool.name} Review & Comparison - AI Development Tool | Engify.ai`,
    description: `${tool.name}: ${tool.tagline || tool.description}. ${pricingText}.${prosPreview ? ` ${prosPreview}.` : ''}`,
    keywords: [
      tool.name,
      `${tool.name} review`,
      `${tool.name} pricing`,
      `${tool.name} vs`,
      'AI development tool',
      'AI IDE',
      'code assistant',
      ...(tool.tags || []),
    ],
    openGraph: {
      title: `${tool.name} - AI Development Tool Review`,
      description: tool.tagline || tool.description,
      type: 'article',
    },
  };
}

export default async function AIToolDetailPage({ params }: PageProps) {
  const tool = await aiToolService.findBySlug(params.slug);

  if (!tool) {
    logger.warn('AI tool not found', { slug: params.slug });
    notFound();
  }

  const pricingText = tool.pricing.free
    ? 'Free'
    : `$${tool.pricing.paid?.monthly || 0}/month`;

  const annualPrice =
    tool.pricing.paid?.annual && tool.pricing.paid?.monthly
      ? `$${tool.pricing.paid.annual}/year (save ${Math.round((1 - tool.pricing.paid.annual / (tool.pricing.paid.monthly * 12)) * 100)}%)`
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
            name: tool.name,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Windows, macOS, Linux',
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
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{tool.description}</p>
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

              {/* Pros & Cons */}
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
