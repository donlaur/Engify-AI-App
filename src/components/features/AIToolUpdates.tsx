/**
 * AI Tool Updates Component
 * 
 * Displays recent news and updates for an AI tool or model
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { AIToolUpdate } from '@/lib/db/schemas/ai-tool-update';

interface AIToolUpdatesProps {
  updates: AIToolUpdate[];
  toolName?: string;
  emptyMessage?: string;
}

export function AIToolUpdates({ 
  updates, 
  toolName,
  emptyMessage = 'No recent updates available.' 
}: AIToolUpdatesProps) {
  if (updates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.newspaper className="h-5 w-5" />
            Latest Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.newspaper className="h-5 w-5" />
          Latest Updates
          {toolName && (
            <span className="text-sm font-normal text-muted-foreground">
              for {toolName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.map((update) => (
          <div
            key={update.id}
            className="border-b last:border-0 pb-4 last:pb-0 space-y-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-start gap-2">
                  <Link
                    href={update.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary transition-colors line-clamp-2"
                  >
                    {update.title}
                  </Link>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {update.type.replace('-', ' ')}
                  </Badge>
                </div>
                
                {update.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {update.description}
                  </p>
                )}

                {update.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {update.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                {formatDistanceToNow(new Date(update.publishedAt), {
                  addSuffix: true,
                })}
              </span>
              {update.author && (
                <span className="flex items-center gap-1">
                  <Icons.user className="h-3 w-3" />
                  {update.author}
                </span>
              )}
              {update.categories.length > 0 && (
                <div className="flex items-center gap-1">
                  <Icons.tag className="h-3 w-3" />
                  {update.categories.slice(0, 2).join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}

        {updates.length >= 10 && (
          <div className="pt-2">
            <Link
              href={`/learn/ai-tools/${updates[0]?.toolId}/updates`}
              className="text-sm text-primary hover:underline"
            >
              View all updates →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

