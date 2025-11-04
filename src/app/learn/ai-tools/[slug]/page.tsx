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

  return {
    title: `${tool.name} Review & Comparison - AI Development Tool | Engify.ai`,
    description: `${tool.name}: ${tool.tagline || tool.description}. ${pricingText}. ${tool.pros.slice(0, 2).join('. ')}.`,
    keywords: [
      tool.name,
      `${tool.name} review`,
      `${tool.name} pricing`,
      `${tool.name} vs`,
      'AI development tool',
      'AI IDE',
      'code assistant',
      ...tool.tags,
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
            aggregateRating: tool.rating
              ? {
                  '@type': 'AggregateRating',
                  ratingValue: tool.rating,
                  ratingCount: tool.reviewCount || 0,
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
              {tool.rating && (
                <div className="flex items-center gap-1">
                  <Icons.star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{tool.rating}</span>
                  {tool.reviewCount > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({tool.reviewCount}{' '}
                      {tool.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
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
              {tool.features.length > 0 && (
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
              {(tool.pros.length > 0 || tool.cons.length > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {tool.pros.length > 0 && (
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

                  {tool.cons.length > 0 && (
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
              {tool.tags.length > 0 && (
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
                    </>
                  )}
                </CardContent>
              </Card>

              {/* CTA */}
              {tool.affiliateLink && (
                <Button asChild className="w-full" size="lg">
                  <a
                    href={tool.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Try {tool.name}
                    <Icons.externalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}

              {tool.websiteUrl && !tool.affiliateLink && (
                <Button asChild className="w-full" size="lg" variant="outline">
                  <a
                    href={tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
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
        </div>
      </MainLayout>
    </>
  );
}
