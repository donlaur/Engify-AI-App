/**
 * Hub-and-Spoke Linking Component
 * Shows pillar page links to cluster articles and vice versa
 */

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { findPillarClusterLinks } from '@/lib/seo/internal-linking';

interface HubSpokeLinksProps {
  articleSlug: string;
}

export async function HubSpokeLinks({ articleSlug }: HubSpokeLinksProps) {
  const { pillar, clusters } = await findPillarClusterLinks(articleSlug);

  if (!pillar && clusters.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t pt-8">
      {pillar && (
        <div className="mb-8 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:from-blue-950 dark:to-blue-900">
          <div className="mb-4 flex items-center gap-2">
            <Icons.star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold">Master Guide</h2>
            <Badge variant="default" className="ml-2">
              Pillar Page
            </Badge>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Dive deeper into this topic with our comprehensive guide
          </p>
          <Link
            href={pillar.url}
            className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {pillar.anchorText}
            <Icons.arrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {clusters.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Icons.book className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Related Topics</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Explore more articles in this learning pathway
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clusters.map((cluster) => (
              <Link
                key={cluster.url}
                href={cluster.url}
                className="group rounded-lg border bg-card p-4 transition-all hover:border-primary hover:bg-accent"
              >
                <h3 className="mb-2 font-semibold group-hover:text-primary">
                  {cluster.anchorText}
                </h3>
                {cluster.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {cluster.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

