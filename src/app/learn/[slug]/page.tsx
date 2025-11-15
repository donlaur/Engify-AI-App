import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { ArticleRenderer } from '@/components/article/ArticleRenderer';
import { RelatedArticles } from '@/components/features/RelatedArticles';
import { HubSpokeLinks } from '@/components/features/HubSpokeLinks';
import { CrossContentLinks } from '@/components/features/CrossContentLinks';
import { ArticleFeedback } from '@/components/article/ArticleFeedback';
import { getClient } from '@/lib/mongodb';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

async function getArticle(slug: string) {
  const client = await getClient();
  const db = client.db('engify');
  const collection = db.collection('learning_resources');

  const article = await collection.findOne({
    'seo.slug': slug,
    status: 'active',
  });

  if (!article) {
    return null;
  }

  // Increment view count
  await collection.updateOne(
    { 'seo.slug': slug },
    { $inc: { views: 1 } }
  );

  return article;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Article Not Found | Engify.ai',
    };
  }

  // Use real article metadata from DB (not hardcoded)
  const metaTitle = article.seo?.metaTitle || article.title;
  const metaDescription = article.seo?.metaDescription || article.description || 'Learn about AI and prompt engineering from Engify.ai';
  
  return {
    title: `${metaTitle} | Engify.ai`,
    description: metaDescription,
    keywords: article.seo?.keywords || article.tags || [],
    openGraph: {
      title: article.title,
      description: metaDescription,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author || 'Engify.ai Team'],
      images: article.seo?.ogImage ? [{ url: article.seo.ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: metaDescription,
      images: article.seo?.ogImage ? [article.seo.ogImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  try {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article) {
      // Log missing articles for SEO monitoring
      console.warn('Article not found:', slug);
      notFound();
    }

    return (
    <MainLayout>
      {/* Breadcrumbs */}
      <nav className="border-b bg-slate-50 dark:bg-slate-900">
        <div className="container flex items-center gap-2 py-3 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
          <Link href="/learn" className="text-muted-foreground hover:text-foreground">
            Learn
          </Link>
          <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{article.title}</span>
        </div>
      </nav>

      <article className="container max-w-4xl py-12">
        {/* Header - Professional tech article style */}
        <header className="mb-12 space-y-6 border-b pb-8">
          <div className="flex items-center gap-3">
            {article.category && (
              <Badge variant="default" className="text-sm font-medium">
                {article.category}
              </Badge>
            )}
            {article.level && (
              <Badge variant="outline" className="text-sm">
                {article.level}
              </Badge>
            )}
            {article.featured && (
              <Badge variant="secondary" className="text-sm">
                <Icons.star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {article.title}
          </h1>

          {article.description && (
            <p className="text-xl leading-relaxed text-muted-foreground">
              {article.description}
            </p>
          )}

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icons.user className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{article.author || 'Engify.ai Team'}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {article.publishedAt && (
                    <time>
                      {new Date(article.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                  {article.duration && <span>• {article.duration} read</span>}
                  {article.views > 0 && <span>• {article.views.toLocaleString()} views</span>}
                </div>
              </div>
            </div>

            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="icon">
                <Icons.share className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Icons.bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content - Rendered Markdown with syntax highlighting, copy buttons, proper formatting */}
        <ArticleRenderer content={article.content || article.contentHtml || ''} />

        {/* Footer - Engagement and metadata */}
        <footer className="mt-16 space-y-8 border-t pt-8">
          {/* Tags - Moved from header to footer */}
          {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Tags:</span>
              {article.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/learn?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  #{tag.toLowerCase().replace(/\s+/g, '-')}
                </Link>
              ))}
            </div>
          )}

          {/* Feedback buttons */}
          <ArticleFeedback
            articleId={article._id?.toString() || article.id || ''}
            articleSlug={article.seo?.slug || article.slug || params.slug}
          />

          {/* Author info */}
          <div className="rounded-lg border bg-slate-50 p-6 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icons.user className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{article.author || 'Engify.ai Team'}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Helping developers master AI-assisted development with proven workflows and enterprise practices.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/learn">
                      More Articles
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground">
            <p>Published on {article.publishedAt && new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} • {article.views || 0} views</p>
          </div>
        </footer>

        {/* Related Articles */}
        <RelatedArticles
          currentArticle={{
            slug: article.seo?.slug || article.slug || params.slug,
            tags: Array.isArray(article.tags) ? article.tags : (article.tags ? [article.tags] : []),
            category: article.category,
            title: article.title,
          }}
          limit={6}
        />

        {/* Hub-and-Spoke Links */}
        <HubSpokeLinks articleSlug={article.seo?.slug || article.slug || params.slug} />

        {/* Cross-Content Links (Prompts & Patterns) */}
        <CrossContentLinks
          tags={Array.isArray(article.tags) ? article.tags : (article.tags ? [article.tags] : [])}
          category={article.category}
          excludeId={article._id || article.id}
        />
      </article>

      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.description,
            author: {
              '@type': 'Person',
              name: article.author || 'Engify.ai Team',
            },
            datePublished: article.publishedAt,
            dateModified: article.updatedAt || article.publishedAt,
            publisher: {
              '@type': 'Organization',
              name: 'Engify.ai',
              logo: {
                '@type': 'ImageObject',
                url: 'https://engify.ai/logo.png',
              },
            },
            keywords: article.tags?.join(', '),
          }),
        }}
      />
    </MainLayout>
  );
  } catch (error) {
    // Log error for monitoring
    console.error('Error loading article:', params.slug, error);
    notFound();
  }
}
