'use client';

/**
 * News Items Panel
 * 
 * OpsHub panel for viewing and managing aggregated news items
 * Allows pushing news items to live content
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminToast } from '@/hooks/opshub/useAdminToast';
import { useDebouncedValue } from '@/hooks/opshub/useDebouncedValue';
import { AdminPaginationControls } from '@/components/opshub/panels/shared/AdminPaginationControls';
import { AdminStatsCard } from '@/components/opshub/panels/shared/AdminStatsCard';
import { AdminDataTable, type ColumnDef } from '@/components/opshub/panels/shared/AdminDataTable';
import { AdminTableSkeleton } from '@/components/opshub/panels/shared/AdminTableSkeleton';
import { AdminEmptyState } from '@/components/opshub/panels/shared/AdminEmptyState';
import { AdminErrorBoundary } from '@/components/opshub/panels/shared/AdminErrorBoundary';
import { clientLogger } from '@/lib/logging/client-logger';
import { formatAdminDate, truncateText } from '@/lib/opshub/utils';
import type { AIToolUpdate } from '@/lib/db/schemas/ai-tool-update';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Label } from '@/components/ui/label';

interface NewsItemWithMetadata extends Omit<AIToolUpdate, 'publishedAt' | 'syncedAt' | 'createdAt' | 'updatedAt'> {
  _id: string;
  publishedAt?: string;
  syncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * NewsItemsPanel Component
 * 
 * Admin panel for managing news items. Provides interface for viewing,
 * filtering, and managing news items from various sources.
 * 
 * @component
 * @pattern ADMIN_PANEL, CRUD_INTERFACE
 * @principle DRY - Uses shared components and utilities
 * 
 * @features
 * - News item listing with pagination
 * - Search functionality
 * - Filter by type (tool-update, model-release, blog-post, etc.)
 * - Filter by source
 * - News item management operations
 * 
 * @example
 * ```tsx
 * <NewsItemsPanel />
 * ```
 * 
 * @usage
 * Used in OpsHub admin center for managing news items.
 * Provides interface for news content management.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 * 
 * @function NewsItemsPanel
 */
export function NewsItemsPanel() {
  const [filter, setFilter] = useState<string>('all'); // all, tool-update, model-release, blog-post, etc.
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedItem, setSelectedItem] = useState<NewsItemWithMetadata | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const { success: showSuccess, error: showError, loading: showLoading } = useAdminToast();

  // Fetch news items
  const [items, setItems] = useState<NewsItemWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch items function
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      if (filter !== 'all') params.append('type', filter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await fetch(`/api/admin/news/items?${params}`);
      if (!response.ok) throw new Error('Failed to fetch news items');
      const result = await response.json();
      setItems(result.items || []);
      setTotalCount(result.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter, sourceFilter, debouncedSearch]);

  // Initial fetch and refetch on changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const refetch = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  // Stats
  const stats = useMemo(
    () => ({
      total: totalCount,
      toolUpdates: items.filter((i) => i.type === 'tool-update').length,
      modelReleases: items.filter((i) => i.type === 'model-release').length,
      blogPosts: items.filter((i) => i.type === 'blog-post').length,
      withMatches: items.filter((i) => i.toolId || i.modelId).length,
      recent: items.filter((i) => {
        if (!i.publishedAt) return false;
        const published = new Date(i.publishedAt);
        return published > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }).length,
    }),
    [items, totalCount]
  );

  // Handle push to content
  const handlePushToContent = useCallback(
    async (item: NewsItemWithMetadata) => {
      showLoading('Creating article from news item...');
      setIsPushing(true);
      try {
        // Create article from news item
        const response = await fetch('/api/admin/content/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'article',
            title: item.title,
            content: item.content || item.description || '',
            category: 'AI News',
            tags: [
              ...(item.toolId ? [`tool:${item.toolId}`] : []),
              ...(item.modelId ? [`model:${item.modelId}`] : []),
              item.type,
              item.source,
              ...(item.features || []),
            ],
            metadata: {
              sourceUrl: item.link,
              sourceFeed: item.feedUrl,
              publishedAt: item.publishedAt,
              originalSource: item.source,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create article');
        }

        await response.json(); // Consume response
        
        // Archive the news item so it's removed from the list
        try {
          await fetch(`/api/admin/news/items`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: item._id || item.id,
              status: 'archived',
            }),
          });
        } catch (archiveError) {
          // Log but don't fail the whole operation
          clientLogger.warn('Failed to archive news item', {
            component: 'NewsItemsPanel',
            action: 'archiveNewsItem',
            newsItemId: item.id,
            error: archiveError instanceof Error ? archiveError.message : String(archiveError),
          });
        }
        
        showSuccess(
          'Article created',
          `Article "${item.title}" has been created and is ready for review.`
        );
        setIsSheetOpen(false);
        // Refetch to remove archived item from list
        refetch();
      } catch (err) {
        showError(
          'Failed to create article',
          err instanceof Error ? err.message : 'An unknown error occurred.'
        );
      } finally {
        setIsPushing(false);
      }
    },
    [showLoading, showSuccess, showError]
  );

  const columns: ColumnDef<NewsItemWithMetadata>[] = useMemo(
    () => [
      {
        id: 'title',
        label: 'Title',
        width: 'w-[300px]',
        render: (item) => (
          <button
            onClick={() => {
              setSelectedItem(item);
              setIsSheetOpen(true);
            }}
            className="text-left hover:text-blue-600 hover:underline font-medium"
          >
            {truncateText(item.title, 60)}
          </button>
        ),
        cellClassName: 'font-medium',
      },
      {
        id: 'type',
        label: 'Type',
        render: (item) => (
          <Badge variant="outline" className="capitalize">
            {item.type.replace('-', ' ')}
          </Badge>
        ),
      },
      {
        id: 'source',
        label: 'Source',
        render: (item) => <Badge variant="secondary">{item.source}</Badge>,
      },
      {
        id: 'matches',
        label: 'Matches',
        render: (item) => (
          <div className="flex gap-1 flex-wrap">
            {item.toolId && (
              <Badge variant="default" className="text-xs">
                Tool
              </Badge>
            )}
            {item.modelId && (
              <Badge variant="default" className="text-xs">
                Model
              </Badge>
            )}
            {!item.toolId && !item.modelId && (
              <Badge variant="outline" className="text-xs">
                None
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: 'published',
        label: 'Published',
        render: (item) => (
          <span className="text-sm text-muted-foreground">
            {item.publishedAt
              ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })
              : 'Unknown'}
          </span>
        ),
      },
      {
        id: 'confidence',
        label: 'Confidence',
        render: (item) =>
          item.matchConfidence ? (
            <Badge
              variant={item.matchConfidence > 0.7 ? 'default' : item.matchConfidence > 0.4 ? 'secondary' : 'outline'}
            >
              {Math.round(item.matchConfidence * 100)}%
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">N/A</span>
          ),
      },
    ],
    []
  );

  if (error) {
    return (
      <AdminErrorBoundary onError={(err) => clientLogger.componentError('NewsItemsPanel', err)}>
        <AdminEmptyState
          icon={<Icons.error className="h-12 w-12 text-destructive" />}
          title="Failed to load news items"
          description={error.message || 'An unexpected error occurred while fetching news items.'}
          action={{
            label: 'Retry',
            onClick: refetch,
            icon: <Icons.refreshCw className="h-4 w-4" />,
          }}
        />
      </AdminErrorBoundary>
    );
  }

  return (
    <AdminErrorBoundary onError={(err) => clientLogger.componentError('NewsItemsPanel', err)}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <AdminStatsCard label="Total Items" value={stats.total} />
          <AdminStatsCard label="Tool Updates" value={stats.toolUpdates} variant="blue" />
          <AdminStatsCard label="Model Releases" value={stats.modelReleases} variant="purple" />
          <AdminStatsCard label="Blog Posts" value={stats.blogPosts} variant="green" />
          <AdminStatsCard label="With Matches" value={stats.withMatches} variant="default" />
          <AdminStatsCard label="Last 7 Days" value={stats.recent} variant="orange" />
        </div>

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <CardTitle>News Items ({totalCount})</CardTitle>
            <CardDescription>
              View aggregated news items from RSS feeds. Push items to create articles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by title, description, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800"
              />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="tool-update">Tool Updates</SelectItem>
                  <SelectItem value="model-release">Model Releases</SelectItem>
                  <SelectItem value="blog-post">Blog Posts</SelectItem>
                  <SelectItem value="changelog">Changelogs</SelectItem>
                  <SelectItem value="status-incident">Status Incidents</SelectItem>
                  <SelectItem value="announcement">Announcements</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="cursor-blog">Cursor Blog</SelectItem>
                  <SelectItem value="openai-blog">OpenAI Blog</SelectItem>
                  <SelectItem value="anthropic-blog">Anthropic Blog</SelectItem>
                  <SelectItem value="google-ai-blog">Google AI Blog</SelectItem>
                  <SelectItem value="warp-blog">Warp Blog</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {loading ? (
              <AdminTableSkeleton rows={pageSize} columns={columns.length + 1} />
            ) : items.length === 0 ? (
              <AdminEmptyState
                icon={<Icons.newspaper className="h-12 w-12 text-muted-foreground" />}
                title="No news items found"
                description="Try adjusting your search or filters, or sync feeds to get new items."
                action={{
                  label: 'Sync Feeds',
                  onClick: () => {
                    // Navigate to feeds tab or trigger sync
                    window.location.hash = 'feeds';
                  },
                  icon: <Icons.refreshCw className="h-4 w-4" />,
                }}
              />
            ) : (
              <AdminDataTable
                data={items}
                columns={columns}
                renderRowActions={(item) => (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                        setIsSheetOpen(true);
                      }}
                      title="View details"
                    >
                      <Icons.eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePushToContent(item);
                      }}
                      title="Push to content"
                      disabled={isPushing}
                    >
                      <Icons.send className="h-4 w-4" />
                    </Button>
                    <Link
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm" title="Open original">
                        <Icons.externalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
                onRowClick={(item) => {
                  setSelectedItem(item);
                  setIsSheetOpen(true);
                }}
              />
            )}

            {/* Pagination Controls */}
            <AdminPaginationControls
              currentPage={page}
              totalPages={Math.ceil(totalCount / pageSize)}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              itemName="news items"
            />
          </CardContent>
        </Card>

        {/* Item Detail Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{selectedItem?.title || 'News Item Details'}</SheetTitle>
              <SheetDescription>
                View details and push this news item to live content.
              </SheetDescription>
            </SheetHeader>
            {selectedItem && (
              <div className="py-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Type</Label>
                  <Badge variant="outline" className="ml-2 capitalize">
                    {selectedItem.type.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Source</Label>
                  <Badge variant="secondary" className="ml-2">
                    {selectedItem.source}
                  </Badge>
                </div>
                {selectedItem.description && (
                  <div>
                    <Label className="text-sm font-semibold">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedItem.description}</p>
                  </div>
                )}
                {selectedItem.content && (
                  <div>
                    <Label className="text-sm font-semibold">Content</Label>
                    <div className="text-sm text-muted-foreground mt-1 max-h-60 overflow-y-auto">
                      {selectedItem.content}
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-semibold">Published</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedItem.publishedAt
                      ? formatAdminDate(selectedItem.publishedAt)
                      : 'Unknown'}
                  </p>
                </div>
                {(selectedItem.toolId || selectedItem.modelId) && (
                  <div>
                    <Label className="text-sm font-semibold">Matches</Label>
                    <div className="flex gap-2 mt-1">
                      {selectedItem.toolId && (
                        <Badge variant="default">Tool: {selectedItem.toolId}</Badge>
                      )}
                      {selectedItem.modelId && (
                        <Badge variant="default">Model: {selectedItem.modelId}</Badge>
                      )}
                      {selectedItem.matchConfidence && (
                        <Badge variant="outline">
                          {Math.round(selectedItem.matchConfidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {selectedItem.features && selectedItem.features.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold">Features</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedItem.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handlePushToContent(selectedItem)}
                    disabled={isPushing}
                    className="flex-1"
                  >
                    {isPushing ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Icons.send className="mr-2 h-4 w-4" />
                        Push to Content
                      </>
                    )}
                  </Button>
                  <Link href={selectedItem.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <Icons.externalLink className="mr-2 h-4 w-4" />
                      View Original
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AdminErrorBoundary>
  );
}

