'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ContentItem {
  _id: string;
  title?: string;
  source?: string;
  createdAt?: string;
  hash: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
}

interface ContentReviewQueueProps {
  initialItems?: ContentItem[];
}

export function ContentReviewQueue({
  initialItems = [],
}: ContentReviewQueueProps) {
  const [items, setItems] = useState<ContentItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    'pending' | 'approved' | 'rejected'
  >('pending');
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/content/review?status=${status}&limit=20`
      );
      if (!res.ok) {
        throw new Error('Failed to fetch content');
      }
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(statusFilter);
  }, [statusFilter]);

  const handleAction = async (hash: string, action: 'approve' | 'reject') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/content/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, action }),
      });
      if (!res.ok) {
        throw new Error('Failed to update content');
      }
      const data = await res.json();
      if (data.success) {
        // Refresh the list
        await fetchItems(statusFilter);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content Review Queue</h3>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({items.filter((i) => i.reviewStatus === 'pending').length})
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="py-8 text-center text-slate-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          No {statusFilter} content items found.
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-white">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-4 hover:bg-slate-50"
            >
              <div className="flex-1">
                <div className="font-medium">{item.title || 'Untitled'}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {item.source || 'unknown source'}
                  {item.createdAt && (
                    <span className="ml-2">
                      • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Hash: {item.hash.substring(0, 16)}...
                </div>
              </div>
              {statusFilter === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAction(item.hash, 'approve')}
                    disabled={loading}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction(item.hash, 'reject')}
                    disabled={loading}
                  >
                    Reject
                  </Button>
                </div>
              )}
              {statusFilter !== 'pending' && (
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    item.reviewStatus === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.reviewStatus}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
