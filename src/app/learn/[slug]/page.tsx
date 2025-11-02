import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
// Removed ArticleRenderer import - inlining HTML directly
import { getClient } from '@/lib/mongodb';

interface PageProps {
  params: { slug: string };
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
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found | Engify.ai',
    };
  }

  return {
    title: article.seo?.metaTitle || `${article.title} | Engify.ai`,
    description: article.seo?.metaDescription || article.description,
    keywords: article.seo?.keywords || article.tags,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author || 'Engify.ai Team'],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
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
        {/* Header - Tech newspaper style */}
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
          
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            {article.title}
          </h1>

          {article.description && (
            <p className="text-2xl leading-relaxed text-muted-foreground">
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

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
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
        </header>

        {/* Content - Enhanced typography */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }} 
        />

        {/* Footer - Tech newspaper style */}
        <footer className="mt-16 space-y-8 border-t pt-8">
          {/* Share buttons */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Was this article helpful?
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icons.thumbsUp className="mr-2 h-4 w-4" />
                Helpful
              </Button>
              <Button variant="outline" size="sm">
                Share
              </Button>
            </div>
          </div>

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
      </article>

      {/* Schema.org structured data */}
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
}

