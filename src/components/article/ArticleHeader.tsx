/**
 * ArticleHeader - Reusable article header component
 */

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { Article } from '@/lib/articles/article-service';
import { formatArticleDate, formatViewCount, formatTag } from '@/lib/articles/article-formatter';

interface ArticleHeaderProps {
  article: Article;
  showActions?: boolean;
}

export function ArticleHeader({ article, showActions = true }: ArticleHeaderProps) {
  return (
    <header className="mb-12 space-y-6 border-b pb-8">
      {/* Badges */}
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

      {/* Title */}
      <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
        {article.title}
      </h1>

      {/* Description */}
      {article.description && (
        <p className="text-xl leading-relaxed text-muted-foreground">
          {article.description}
        </p>
      )}

      {/* Author & Metadata */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Icons.user className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">{article.author || 'Engify.ai Team'}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {article.publishedAt && (
                <time>{formatArticleDate(article.publishedAt)}</time>
              )}
              {article.duration && <span>• {article.duration}</span>}
              {article.views > 0 && (
                <span>• {formatViewCount(article.views)} views</span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="icon" title="Share article">
              <Icons.share className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Bookmark article">
              <Icons.bookmark className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href={`/learn?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              {formatTag(tag)}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

