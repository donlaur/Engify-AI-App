/**
 * Blog Post Page
 * Displays published content from the content generator
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getDb } from '@/lib/db/mongodb';
import { GeneratedContent } from '@/lib/db/schemas/generated-content';
import { ContentPreview } from '@/components/admin/ContentPreview';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPublishedContent(slug: string): Promise<GeneratedContent | null> {
  const db = await getDb();
  const collection = db.collection<GeneratedContent>('generated_content');
  
  const content = await collection.findOne({
    slug,
    status: 'published',
  });
  
  return content as GeneratedContent | null;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublishedContent(slug);
  
  if (!content) {
    return {
      title: 'Post Not Found',
    };
  }
  
  return {
    title: content.title,
    description: content.description || `Read ${content.title} on Engify`,
    keywords: content.keywords,
    openGraph: {
      title: content.title,
      description: content.description,
      type: 'article',
      publishedTime: content.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const content = await getPublishedContent(slug);
  
  if (!content) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <a href="/" className="text-xl font-bold">
            Engify
          </a>
        </div>
      </header>
      
      {/* Article */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Title */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
          
          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {content.publishedAt && (
              <time dateTime={content.publishedAt.toISOString()}>
                {new Date(content.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            {content.readingTime && (
              <span>{content.readingTime} min read</span>
            )}
            {content.wordCount && (
              <span>{content.wordCount.toLocaleString()} words</span>
            )}
          </div>
          
          {/* Description */}
          {content.description && (
            <p className="mt-4 text-lg text-muted-foreground">
              {content.description}
            </p>
          )}
          
          {/* Keywords */}
          {content.keywords && content.keywords.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {content.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </header>
        
        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ContentPreview content={content.content} />
        </div>
        
        {/* Footer */}
        <footer className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Published on {new Date(content.publishedAt || content.createdAt).toLocaleDateString()}
            </div>
            <a
              href="/blog"
              className="text-sm text-primary hover:underline"
            >
              ← Back to Blog
            </a>
          </div>
        </footer>
      </article>
    </div>
  );
}
