import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
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
      <article className="container max-w-4xl py-12">
        {/* Header */}
        <header className="mb-8 space-y-4">
          {article.category && (
            <Badge variant="secondary">{article.category}</Badge>
          )}
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {article.title}
          </h1>

          {article.description && (
            <p className="text-xl text-muted-foreground">
              {article.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {article.author && <span>By {article.author}</span>}
            {article.duration && <span>• {article.duration} read</span>}
            {article.publishedAt && (
              <span>
                • {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            {article.views > 0 && <span>• {article.views} views</span>}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        {/* Footer */}
        <footer className="mt-12 border-t pt-8">
          <p className="text-sm text-muted-foreground">
            Published by {article.author || 'Engify.ai Team'} •{' '}
            {article.views || 0} views
          </p>
        </footer>
      </article>
    </MainLayout>
  );
}

