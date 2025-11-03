/**
 * ArticleFooter - Reusable article footer component
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { Article } from '@/lib/articles/article-service';
import { formatArticleDate } from '@/lib/articles/article-formatter';

interface ArticleFooterProps {
  article: Article;
}

export function ArticleFooter({ article }: ArticleFooterProps) {
  return (
    <footer className="mt-16 space-y-8 border-t pt-8">
      {/* Engagement section */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Was this article helpful?</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Icons.like className="mr-2 h-4 w-4" />
            Helpful
          </Button>
          <Button variant="outline" size="sm">
            <Icons.share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Author bio */}
      <div className="rounded-lg border bg-slate-50 p-6 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Icons.user className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{article.author || 'Engify.ai Team'}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Helping developers master AI-assisted development with proven workflows and
              enterprise practices.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/learn">More Articles</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/prompts">Browse Prompts</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground">
        <p>
          Published on {formatArticleDate(article.publishedAt)} •{' '}
          {article.views || 0} views
        </p>
      </div>
    </footer>
  );
}

