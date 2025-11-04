/**
 * Cross-Content Links Component
 * Shows related prompts and patterns on article pages
 */

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { findRelatedContent } from '@/lib/seo/internal-linking';
import { getPromptSlug } from '@/lib/utils/slug';

interface CrossContentLinksProps {
  tags: string[];
  category?: string;
  excludeId?: string;
}

export async function CrossContentLinks({
  tags,
  category,
  excludeId,
}: CrossContentLinksProps) {
  // Determine content type based on what we're excluding
  // If excludeId matches a pattern ID format, we're on a pattern page
  // Otherwise, assume article or prompt
  const contentType = excludeId?.includes('pattern') || excludeId?.match(/^[a-z-]+$/) 
    ? 'pattern' 
    : 'article';
  
  const relatedPrompts = await findRelatedContent(contentType, excludeId || '', tags, category, 3);
  const relatedPatterns = await findRelatedContent(contentType, excludeId || '', tags, category, 3);
  const relatedArticles = await findRelatedContent(contentType, excludeId || '', tags, category, 3);

  const prompts = relatedPrompts.filter((link) => link.type === 'prompt');
  const patterns = relatedPatterns.filter((link) => link.type === 'pattern');
  const articles = relatedArticles.filter((link) => link.type === 'article');

  if (prompts.length === 0 && patterns.length === 0 && articles.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t pt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Try These Resources</h2>
        <p className="text-sm text-muted-foreground">
          Apply what you learned with these prompts and patterns
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {prompts.length > 0 && (
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Icons.sparkles className="h-5 w-5 text-primary" />
              Related Prompts
            </h3>
            <div className="space-y-3">
              {prompts.map((prompt) => (
                <Link
                  key={prompt.url}
                  href={prompt.url}
                  className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:bg-accent"
                >
                  <Icons.chevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:text-primary">
                      {prompt.anchorText}
                    </h4>
                    {prompt.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {prompt.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {patterns.length > 0 && (
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Icons.brain className="h-5 w-5 text-purple-600" />
              Related Patterns
            </h3>
            <div className="space-y-3">
              {patterns.map((pattern) => (
                <Link
                  key={pattern.url}
                  href={pattern.url}
                  className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:bg-accent"
                >
                  <Icons.chevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:text-primary">
                      {pattern.anchorText}
                    </h4>
                    {pattern.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {pattern.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {articles.length > 0 && (
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Icons.book className="h-5 w-5 text-blue-600" />
              Related Articles
            </h3>
            <div className="space-y-3">
              {articles.map((article) => (
                <Link
                  key={article.url}
                  href={article.url}
                  className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:bg-accent"
                >
                  <Icons.chevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:text-primary">
                      {article.anchorText}
                    </h4>
                    {article.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {article.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

