'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface AuditLog {
  _id: string;
  eventType: string;
  eventCategory?: 'auth' | 'data' | 'security' | 'admin';
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  success: boolean;
  timestamp: string;
  ipAddress?: string;
  resourceType?: string;
  metadata?: Record<string, unknown>;
}

interface AuditLogViewerProps {
  initialLogs?: AuditLog[];
}

/**
 * AuditLogViewer Component
 * 
 * A component for viewing and filtering audit logs. Provides interface for
 * displaying system audit trail with filtering and search capabilities.
 * 
 * @component
 * @pattern LOG_VIEWER
 * @principle DRY - Centralizes audit log display logic
 * 
 * @features
 * - Audit log listing with filtering
 * - Search functionality
 * - Filter by action type, user, and date range
 * - Initial data support for SSR
 * 
 * @param initialLogs - Optional array of initial audit logs (for SSR)
 * 
 * @example
 * ```tsx
 * <AuditLogViewer initialLogs={auditLogs} />
 * ```
 * 
 * @usage
 * Used in OpsHub admin center for viewing system audit logs.
 * Provides interface for security and compliance auditing.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 * 
 * @function AuditLogViewer
 */
export function AuditLogViewer({ initialLogs = [] }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    eventCategory: '',
    success: '',
    search: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const fetchLogs = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin/audit?page=${page}&limit=${pagination.limit}`;
      if (filters.eventCategory) {
        url += `&eventCategory=${filters.eventCategory}`;
      }
      if (filters.success !== '') {
        url += `&success=${filters.success === 'true'}`;
      }
      if (filters.startDate) {
        url += `&startDate=${new Date(filters.startDate).toISOString()}`;
      }
      if (filters.endDate) {
        url += `&endDate=${new Date(filters.endDate).toISOString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      const data = await res.json();
      if (data.success) {
        const fetchedLogs = data.data || [];
        // Only apply client-side search if search is active, otherwise show all fetched logs
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const filteredLogs = fetchedLogs.filter(
            (log: AuditLog) =>
              log.action.toLowerCase().includes(searchLower) ||
              log.eventType.toLowerCase().includes(searchLower) ||
              log.userEmail?.toLowerCase().includes(searchLower) ||
              log.userId?.toLowerCase().includes(searchLower)
          );
          setLogs(filteredLogs);
        } else {
          setLogs(fetchedLogs);
        }
        setPagination(data.pagination || pagination);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load audit logs'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.eventCategory,
    filters.success,
    filters.startDate,
    filters.endDate,
  ]);

  // Handle search separately - debounce client-side filtering
  useEffect(() => {
    if (filters.search) {
      // Client-side search on already fetched logs
      // This is fine for paginated results
      const searchLower = filters.search.toLowerCase();
      setLogs((currentLogs) =>
        currentLogs.filter(
          (log) =>
            log.action.toLowerCase().includes(searchLower) ||
            log.eventType.toLowerCase().includes(searchLower) ||
            log.userEmail?.toLowerCase().includes(searchLower) ||
            log.userId?.toLowerCase().includes(searchLower)
        )
      );
    } else {
      // If search is cleared, refetch
      fetchLogs(pagination.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const handleExport = () => {
    const csv = [
      [
        'Timestamp',
        'Event Type',
        'Category',
        'Action',
        'User',
        'Success',
        'IP Address',
      ].join(','),
      ...logs.map((log) =>
        [
          new Date(log.timestamp).toISOString(),
          log.eventType,
          log.eventCategory || '',
          `"${log.action.replace(/"/g, '""')}"`,
          log.userEmail || log.userId || '',
          log.success ? 'Yes' : 'No',
          log.ipAddress || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Audit Log</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={logs.length === 0}
        >
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <select
            value={filters.eventCategory}
            onChange={(e) =>
              setFilters({ ...filters, eventCategory: e.target.value })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            <option value="auth">Auth</option>
            <option value="data">Data</option>
            <option value="security">Security</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={filters.success}
            onChange={(e) =>
              setFilters({ ...filters, success: e.target.value })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="true">Success</option>
            <option value="false">Failed</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Search</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search by action, event type, user email..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading && logs.length === 0 ? (
        <div className="py-8 text-center text-slate-500">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          No audit logs found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Event Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3">{log.action}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {log.userEmail || log.userId || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          log.success
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
