/**
 * Related Articles Component
 * Shows related articles based on tags, category, and pillar/cluster relationships
 * Includes keyword-rich anchor text for SEO
 */

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { getRelatedArticles } from '@/lib/articles/article-service';
import type { Article } from '@/lib/articles/article-service';

interface RelatedArticlesProps {
  currentArticle: {
    slug: string;
    tags?: string[];
    category?: string;
    title?: string;
  };
  limit?: number;
}

/**
 * Generate SEO-friendly anchor text variations
 */
function getAnchorTextVariations(title: string, tags?: string[]): string[] {
  const variations: string[] = [];
  
  // Use full title
  variations.push(title);
  
  // Extract keywords from title
  const keywords = title
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !['the', 'how', 'what', 'guide', 'to'].includes(word));
  
  // Create variations
  if (keywords.length > 0) {
    variations.push(keywords.slice(0, 3).join(' '));
    variations.push(`${keywords[0]} guide`);
    variations.push(`${keywords[0]} tutorial`);
  }
  
  // Add tag-based variations
  if (tags && tags.length > 0) {
    tags.forEach((tag) => {
      variations.push(`learn more about ${tag}`);
      variations.push(`${tag} guide`);
    });
  }
  
  return variations;
}

export async function RelatedArticles({ currentArticle, limit = 6 }: RelatedArticlesProps) {
  const tags = currentArticle.tags || [];
  const category = currentArticle.category || '';
  
  const relatedArticles = await getRelatedArticles(
    currentArticle.slug,
    tags,
    category,
    limit
  );

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t pt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Related Articles</h2>
        <p className="text-sm text-muted-foreground">
          Continue learning with these related guides and tutorials
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedArticles.map((article: Article) => {
          const slug = article.seo?.slug || article.slug || article._id;
          const anchorText = getAnchorTextVariations(article.title, article.tags)[0];
          
          return (
            <Link
              key={slug}
              href={`/learn/${slug}`}
              className="group rounded-lg border bg-card p-6 transition-all hover:border-primary hover:bg-accent hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold group-hover:text-primary line-clamp-2">
                  {anchorText}
                </h3>
                <Icons.arrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1" />
              </div>
              
              {article.description && (
                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                  {article.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2">
                {article.category && (
                  <Badge variant="secondary" className="text-xs">
                    {article.category}
                  </Badge>
                )}
                {article.level && (
                  <Badge variant="outline" className="text-xs">
                    {article.level}
                  </Badge>
                )}
                {article.featured && (
                  <Badge variant="default" className="text-xs">
                    <Icons.star className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                )}
              </div>
              
              {article.views > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Icons.eye className="h-3 w-3" />
                  <span>{article.views.toLocaleString()} views</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

