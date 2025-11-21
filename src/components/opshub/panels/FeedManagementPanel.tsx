'use client';

/**
 * Feed Management Panel
 * 
 * OpsHub panel for managing RSS/Atom/API feeds
 * Follows DRY/SOLID principles using shared admin components
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminToast } from '@/hooks/opshub/useAdminToast';
import { useDebouncedValue } from '@/hooks/opshub/useDebouncedValue';
import { AdminPaginationControls } from '@/components/opshub/panels/shared/AdminPaginationControls';
import { AdminStatsCard } from '@/components/opshub/panels/shared/AdminStatsCard';
import { AdminDataTable } from '@/components/opshub/panels/shared/AdminDataTable';
import { AdminTableSkeleton } from '@/components/opshub/panels/shared/AdminTableSkeleton';
import { AdminEmptyState } from '@/components/opshub/panels/shared/AdminEmptyState';
import { AdminErrorBoundary } from '@/components/opshub/panels/shared/AdminErrorBoundary';
import { formatAdminDate, truncateText } from '@/lib/opshub/utils';
import type { FeedConfig } from '@/lib/db/schemas/feed-config';

interface FeedWithMetadata extends Omit<FeedConfig, 'createdAt' | 'updatedAt' | 'lastSyncedAt'> {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  lastSyncedAt?: string;
}

export function FeedManagementPanel() {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<FeedWithMetadata | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const { success: showSuccess, error: showError } = useAdminToast();

  // Fetch feeds
  const [feeds, setFeeds] = useState<FeedWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch feeds function
  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/news/feeds');
      if (!response.ok) throw new Error('Failed to fetch feeds');
      const result = await response.json();
      setFeeds(result.feeds || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  // Filter and search
  const filteredFeeds = useMemo(() => {
    let result = feeds;

    // Apply filter
    if (filter === 'enabled') {
      result = result.filter((f) => f.enabled);
    } else if (filter === 'disabled') {
      result = result.filter((f) => !f.enabled);
    } else if (filter === 'errors') {
      result = result.filter((f) => (f.errorCount || 0) > 0);
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (f) =>
          f.name?.toLowerCase().includes(query) ||
          f.url.toLowerCase().includes(query) ||
          f.source?.toLowerCase().includes(query) ||
          f.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [feeds, filter, debouncedSearch]);

  // Pagination
  const paginatedFeeds = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredFeeds.slice(start, start + pageSize);
  }, [filteredFeeds, page, pageSize]);

  // Stats
  const stats = useMemo(
    () => ({
      total: feeds.length,
      enabled: feeds.filter((f) => f.enabled).length,
      disabled: feeds.filter((f) => !f.enabled).length,
      withErrors: feeds.filter((f) => (f.errorCount || 0) > 0).length,
      rss: feeds.filter((f) => f.feedType === 'rss').length,
      atom: feeds.filter((f) => f.feedType === 'atom').length,
      api: feeds.filter((f) => f.feedType === 'api').length,
    }),
    [feeds]
  );

  // Handlers
  const handleToggleEnabled = useCallback(
    async (feed: FeedWithMetadata) => {
      try {
        const response = await fetch('/api/admin/news/feeds', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: feed.id,
            enabled: !feed.enabled,
          }),
        });

        if (!response.ok) throw new Error('Failed to update feed');

        showSuccess(`Feed ${feed.enabled ? 'disabled' : 'enabled'} successfully`);
        refetch();
      } catch (error) {
        showError('Failed to update feed');
      }
    },
    [refetch, showSuccess, showError]
  );

  const handleSyncAll = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/admin/news/sync', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Sync failed');

      const result = await response.json();
      showSuccess(
        `Synced ${result.totalCreated + result.totalUpdated} items from ${result.feedResults?.length || 0} feeds`
      );
      refetch();
    } catch (error) {
      showError('Failed to sync feeds');
    } finally {
      setIsSyncing(false);
    }
  }, [refetch, showSuccess, showError]);

  const handleSyncFeed = useCallback(
    async (feed: FeedWithMetadata) => {
      setIsSyncing(true);
      try {
        const response = await fetch('/api/admin/news/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedUrl: feed.url }),
        });

        if (!response.ok) throw new Error('Sync failed');

        showSuccess(`Synced feed: ${feed.name || feed.url}`);
        refetch();
      } catch (error) {
        showError('Failed to sync feed');
      } finally {
        setIsSyncing(false);
      }
    },
    [refetch, showSuccess, showError]
  );

  const handleEdit = useCallback((feed: FeedWithMetadata) => {
    setSelectedFeed(feed);
    setIsSheetOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedFeed(null);
    setIsSheetOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (feed: FeedWithMetadata) => {
      if (!confirm(`Delete feed "${feed.name || feed.url}"?`)) return;

      try {
        const response = await fetch(`/api/admin/news/feeds?id=${feed.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Delete failed');

        showSuccess('Feed deleted successfully');
        refetch();
      } catch (error) {
        showError('Failed to delete feed');
      }
    },
    [refetch, showSuccess, showError]
  );

  // Table columns (using AdminDataTable pattern)
  const columns = useMemo(
    () => [
      {
        id: 'name',
        label: 'Feed Name',
        width: 'w-[300px]',
        render: (feed: FeedWithMetadata) => (
          <div className="flex flex-col">
            <span className="font-medium">{feed.name || 'Unnamed Feed'}</span>
            <span className="text-xs text-muted-foreground truncate max-w-md">
              {truncateText(feed.url, 60)}
            </span>
          </div>
        ),
        cellClassName: 'font-medium',
      },
      {
        id: 'source',
        label: 'Source',
        render: (feed: FeedWithMetadata) => (
          <Badge variant="outline">{feed.source || 'other'}</Badge>
        ),
      },
      {
        id: 'feedType',
        label: 'Type',
        render: (feed: FeedWithMetadata) => {
          const type = feed.feedType || 'rss';
          return <Badge variant="secondary">{type.toUpperCase()}</Badge>;
        },
      },
      {
        id: 'contentType',
        label: 'Content Type',
        render: (feed: FeedWithMetadata) => (
          <Badge variant="outline">{feed.type}</Badge>
        ),
      },
      {
        id: 'lastSynced',
        label: 'Last Synced',
        render: (feed: FeedWithMetadata) => {
          const date = feed.lastSyncedAt;
          return date ? (
            <span className="text-sm text-muted-foreground">
              {formatAdminDate(new Date(date))}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Never</span>
          );
        },
      },
      {
        id: 'errors',
        label: 'Errors',
        render: (feed: FeedWithMetadata) => {
          const errorCount = feed.errorCount || 0;
          return errorCount > 0 ? (
            <Badge variant="destructive" className="text-xs">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          );
        },
      },
    ],
    []
  );

  return (
    <AdminErrorBoundary onError={(err) => console.error('Feed panel error:', err)}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          <AdminStatsCard label="Total" value={stats.total} />
          <AdminStatsCard label="Enabled" value={stats.enabled} variant="green" />
          <AdminStatsCard label="Disabled" value={stats.disabled} variant="gray" />
          <AdminStatsCard label="With Errors" value={stats.withErrors} variant="red" />
          <AdminStatsCard label="RSS" value={stats.rss} variant="blue" />
          <AdminStatsCard label="Atom" value={stats.atom} variant="purple" />
          <AdminStatsCard label="API" value={stats.api} variant="orange" />
          <AdminStatsCard
            label="Last Sync"
            value={feeds.filter((f) => f.lastSyncedAt).length}
            variant="blue"
          />
        </div>

        {/* Actions Bar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Feed Management</CardTitle>
                <CardDescription>
                  Manage RSS/Atom/API feeds for AI model and tool updates
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  variant="default"
                >
                  {isSyncing ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Icons.refresh className="mr-2 h-4 w-4" />
                      Sync All Feeds
                    </>
                  )}
                </Button>
                <Button onClick={handleCreate} size="lg">
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Feed
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search feeds by name, URL, or source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Feeds</SelectItem>
                  <SelectItem value="enabled">Enabled Only</SelectItem>
                  <SelectItem value="disabled">Disabled Only</SelectItem>
                  <SelectItem value="errors">With Errors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load feeds: {error instanceof Error ? error.message : 'Unknown error'}
                </AlertDescription>
              </Alert>
            )}

            {/* Data Table */}
            {loading ? (
              <AdminTableSkeleton />
            ) : filteredFeeds.length === 0 ? (
              <AdminEmptyState
                icon={<Icons.newspaper className="h-12 w-12 text-muted-foreground" />}
                title="No feeds found"
                description={
                  searchQuery || filter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first feed'
                }
                action={
                  !searchQuery && filter === 'all'
                    ? {
                        label: 'Add Feed',
                        onClick: handleCreate,
                      }
                    : undefined
                }
              />
            ) : (
              <>
              <AdminDataTable
                data={paginatedFeeds}
                columns={columns}
                statusField="enabled"
                onStatusToggle={(id) => {
                  const feed = feeds.find((f) => f.id === id);
                  if (feed) handleToggleEnabled(feed);
                }}
                renderRowActions={(feed) => (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSyncFeed(feed);
                      }}
                      disabled={isSyncing || !feed.enabled}
                      title="Sync this feed"
                    >
                      <Icons.refresh className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(feed);
                      }}
                      title="Edit feed"
                    >
                      <Icons.edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(feed);
                      }}
                      title="Delete feed"
                    >
                      <Icons.trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
                emptyMessage="No feeds found"
              />
                <AdminPaginationControls
                  currentPage={page}
                  totalPages={Math.ceil(filteredFeeds.length / pageSize)}
                  totalCount={filteredFeeds.length}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  itemName="feeds"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit/Create Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {selectedFeed ? 'Edit Feed' : 'Add New Feed'}
              </SheetTitle>
              <SheetDescription>
                Configure RSS/Atom/API feed for news aggregation
              </SheetDescription>
            </SheetHeader>
            <FeedFormSheet
              feed={selectedFeed}
              onSuccess={() => {
                setIsSheetOpen(false);
                refetch();
              }}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </AdminErrorBoundary>
  );
}

// Feed Form Component (extracted for reusability)
interface FeedFormSheetProps {
  feed: FeedWithMetadata | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function FeedFormSheet({ feed, onSuccess, onCancel }: FeedFormSheetProps) {
  const [formData, setFormData] = useState<Partial<FeedConfig>>({
    url: feed?.url || '',
    source: feed?.source || 'other',
    feedType: feed?.feedType || 'rss',
    type: feed?.type || 'blog-post',
    name: feed?.name || '',
    description: feed?.description || '',
    enabled: feed?.enabled ?? true,
    toolId: feed?.toolId || '',
    modelId: feed?.modelId || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success: showSuccess, error: showError } = useAdminToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = feed
        ? '/api/admin/news/feeds'
        : '/api/admin/news/feeds';
      const method = feed ? 'PUT' : 'POST';

      const body = feed
        ? { id: feed.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to save feed');
      }

      showSuccess(feed ? 'Feed updated successfully' : 'Feed created successfully');
      onSuccess();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to save feed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="url">Feed URL *</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com/feed.xml"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="feedType">Feed Type *</Label>
            <Select
              value={formData.feedType}
              onValueChange={(value: 'rss' | 'atom' | 'api') =>
                setFormData({ ...formData, feedType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rss">RSS</SelectItem>
                <SelectItem value="atom">Atom</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Content Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as FeedConfig['type'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog-post">Blog Post</SelectItem>
                <SelectItem value="model-release">Model Release</SelectItem>
                <SelectItem value="tool-update">Tool Update</SelectItem>
                <SelectItem value="status-incident">Status Incident</SelectItem>
                <SelectItem value="changelog">Changelog</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="source">Source</Label>
          <Select
            value={formData.source}
            onValueChange={(value) => setFormData({ ...formData, source: value as FeedConfig['source'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cursor-blog">Cursor Blog</SelectItem>
              <SelectItem value="cursor-status">Cursor Status</SelectItem>
              <SelectItem value="openai-blog">OpenAI Blog</SelectItem>
              <SelectItem value="anthropic-blog">Anthropic Blog</SelectItem>
              <SelectItem value="google-ai-blog">Google AI Blog</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="name">Feed Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Descriptive name for this feed"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What this feed contains"
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enabled">Enabled</Label>
            <p className="text-sm text-muted-foreground">
              Feed will be synced when enabled
            </p>
          </div>
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            feed ? 'Update Feed' : 'Create Feed'
          )}
        </Button>
      </div>
    </form>
  );
}

