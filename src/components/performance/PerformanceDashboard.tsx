/**
 * Performance Monitoring Dashboard Component
 *
 * Displays real-time performance metrics and analytics.
 */

'use client';

import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  api?: {
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    averageDuration: number;
    p95Duration: number;
    p99Duration: number;
    requestsPerMinute: number;
    slowestEndpoints: Array<{ path: string; avgDuration: number }>;
    endpoints: Array<{
      path: string;
      requestCount: number;
      averageDuration: number;
      p95Duration: number;
    }>;
  };
  query?: {
    totalQueries: number;
    slowQueries: number;
    averageQueryTime: number;
    p95QueryTime: number;
    p99QueryTime: number;
    byCollection: Record<string, { count: number; avgTime: number }>;
    byOperation: Record<string, { count: number; avgTime: number }>;
    slowQueries: Array<{
      collection: string;
      operation: string;
      duration: number;
      query: string;
    }>;
  };
  cache?: {
    hits: number;
    misses: number;
    hitRate: number;
    missRate: number;
    averageGetTime: number;
    averageSetTime: number;
    efficiencyScore: number;
    mostAccessed: Array<{ key: string; count: number }>;
  };
  system?: {
    memory: NodeJS.MemoryUsage;
    uptime: number;
    timestamp: string;
  };
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/performance/metrics?type=all');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatDuration = (ms: number) => `${ms.toFixed(2)}ms`;
  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <p>Loading performance metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded bg-red-50 text-red-800">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <p>No metrics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded ${autoRefresh ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
          </button>
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* API Metrics */}
      {metrics.api && (
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-xl font-semibold mb-4">API Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Total Requests"
              value={metrics.api.totalRequests.toLocaleString()}
            />
            <MetricCard
              label="Error Rate"
              value={formatPercent(metrics.api.errorRate)}
              status={metrics.api.errorRate > 0.05 ? 'warning' : 'success'}
            />
            <MetricCard
              label="Avg Response Time"
              value={formatDuration(metrics.api.averageDuration)}
              status={metrics.api.averageDuration > 500 ? 'warning' : 'success'}
            />
            <MetricCard
              label="P95 Response Time"
              value={formatDuration(metrics.api.p95Duration)}
              status={metrics.api.p95Duration > 1000 ? 'error' : 'success'}
            />
          </div>

          {metrics.api.slowestEndpoints.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Slowest Endpoints</h4>
              <div className="space-y-2">
                {metrics.api.slowestEndpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="font-mono text-sm">{endpoint.path}</span>
                    <span className="text-sm font-semibold">
                      {formatDuration(endpoint.avgDuration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query Metrics */}
      {metrics.query && (
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-xl font-semibold mb-4">Database Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Total Queries"
              value={metrics.query.totalQueries.toLocaleString()}
            />
            <MetricCard
              label="Slow Queries"
              value={metrics.query.slowQueries.toLocaleString()}
              status={metrics.query.slowQueries > 10 ? 'warning' : 'success'}
            />
            <MetricCard
              label="Avg Query Time"
              value={formatDuration(metrics.query.averageQueryTime)}
              status={
                metrics.query.averageQueryTime > 100 ? 'warning' : 'success'
              }
            />
            <MetricCard
              label="P95 Query Time"
              value={formatDuration(metrics.query.p95QueryTime)}
              status={
                metrics.query.p95QueryTime > 200 ? 'error' : 'success'
              }
            />
          </div>

          {Object.keys(metrics.query.byCollection).length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">By Collection</h4>
              <div className="space-y-2">
                {Object.entries(metrics.query.byCollection).map(
                  ([collection, stats]) => (
                    <div
                      key={collection}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="font-mono text-sm">{collection}</span>
                      <div className="text-sm">
                        <span className="mr-4">{stats.count} queries</span>
                        <span className="font-semibold">
                          {formatDuration(stats.avgTime)}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cache Metrics */}
      {metrics.cache && (
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-xl font-semibold mb-4">Cache Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Hit Rate"
              value={formatPercent(metrics.cache.hitRate)}
              status={metrics.cache.hitRate > 0.8 ? 'success' : 'warning'}
            />
            <MetricCard
              label="Total Hits"
              value={metrics.cache.hits.toLocaleString()}
            />
            <MetricCard
              label="Total Misses"
              value={metrics.cache.misses.toLocaleString()}
            />
            <MetricCard
              label="Efficiency Score"
              value={`${metrics.cache.efficiencyScore.toFixed(0)}/100`}
              status={metrics.cache.efficiencyScore > 70 ? 'success' : 'warning'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <MetricCard
              label="Avg Get Time"
              value={formatDuration(metrics.cache.averageGetTime)}
            />
            <MetricCard
              label="Avg Set Time"
              value={formatDuration(metrics.cache.averageSetTime)}
            />
          </div>

          {metrics.cache.mostAccessed.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Most Accessed Keys</h4>
              <div className="space-y-2">
                {metrics.cache.mostAccessed.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="font-mono text-sm truncate">
                      {item.key}
                    </span>
                    <span className="text-sm font-semibold">
                      {item.count} accesses
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Metrics */}
      {metrics.system && (
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-xl font-semibold mb-4">System Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Heap Used"
              value={formatBytes(metrics.system.memory.heapUsed)}
            />
            <MetricCard
              label="Heap Total"
              value={formatBytes(metrics.system.memory.heapTotal)}
            />
            <MetricCard
              label="RSS"
              value={formatBytes(metrics.system.memory.rss)}
            />
            <MetricCard
              label="Uptime"
              value={`${(metrics.system.uptime / 60).toFixed(0)}m`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  status = 'neutral',
}: {
  label: string;
  value: string;
  status?: 'success' | 'warning' | 'error' | 'neutral';
}) {
  const statusColors = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    neutral: 'bg-gray-50 border-gray-200',
  };

  return (
    <div className={`border rounded p-4 ${statusColors[status]}`}>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
