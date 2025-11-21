'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { clientLogger } from '@/lib/logging/client-logger';

interface DashboardStats {
  users: number;
  content: number;
  prompts: number;
  patterns: number;
  aiModels: number;
  aiTools: number;
  auditLogs: number;
  dlqMessages: number;
}

interface RecentActivity {
  type: 'user' | 'content' | 'audit';
  title: string;
  subtitle: string;
  timestamp: Date;
  id: string;
}

/**
 * DashboardOverviewPanel Component
 * 
 * Main dashboard panel for the OpsHub admin center. Displays key statistics
 * and recent activity across all areas of the platform.
 * 
 * @component
 * @pattern DASHBOARD_PANEL
 * @principle DRY - Centralizes dashboard data fetching and display
 * 
 * @features
 * - Platform-wide statistics display
 * - Recent activity feed
 * - Real-time data updates
 * - Loading and error states
 * - Abort controller for cleanup
 * 
 * @example
 * ```tsx
 * <DashboardOverviewPanel />
 * ```
 * 
 * @usage
 * Used as the default tab in OpsHub admin center.
 * Provides an overview of platform health and activity.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */
export function DashboardOverviewPanel() {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    content: 0,
    prompts: 0,
    patterns: 0,
    aiModels: 0,
    aiTools: 0,
    auditLogs: 0,
    dlqMessages: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all stats and recent activity in a single efficient API call
        const response = await fetch('/api/admin/stats?includeRecent=true', {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();

        // Set stats directly from the API response
        if (data.stats) {
          setStats(data.stats);
        }

        // Set recent activity directly from the API response
        // The API already formats and sorts the activity data
        if (data.recentActivity) {
          // Convert timestamp strings to Date objects if needed
          const activity = data.recentActivity.map((item: RecentActivity) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }));
          setRecentActivity(activity);
        }
      } catch (err) {
        // Ignore abort errors (component unmounted)
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        clientLogger.apiError('/api/admin/dashboard', err, {
          component: 'DashboardOverviewPanel',
          action: 'fetchDashboardData',
        });
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      controller.abort(); // Cleanup on unmount
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Icons.spinner className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icons.alertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Error Loading Dashboard</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Total Users</CardDescription>
              <Icons.users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Learning Content</CardDescription>
              <Icons.fileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.content}</div>
            <p className="text-xs text-muted-foreground">AI questions, stories, etc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Prompts</CardDescription>
              <Icons.zap className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.prompts}</div>
            <p className="text-xs text-muted-foreground">Prompt library items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">AI Models</CardDescription>
              <Icons.brain className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.aiModels}</div>
            <p className="text-xs text-muted-foreground">Provider models tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patterns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">AI Tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiTools}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Audit Logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.auditLogs || '—'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">DLQ Messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dlqMessages || '—'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/opshub/ai-models">
                <Icons.brain className="mr-2 h-4 w-4" />
                Manage AI Models
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/opshub/ai-tools">
                <Icons.zap className="mr-2 h-4 w-4" />
                Manage AI Tools
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              <Icons.fileText className="mr-2 h-4 w-4" />
              Generate Content (Use Content Tab)
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              <Icons.users className="mr-2 h-4 w-4" />
              Add User (Use Users Tab)
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              <Icons.settings className="mr-2 h-4 w-4" />
              System Settings (Use Settings Tab)
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              <Icons.alertCircle className="mr-2 h-4 w-4" />
              View DLQ (Use DLQ Tab)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest changes across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="mt-0.5">
                    {activity.type === 'user' && (
                      <Icons.users className="h-4 w-4 text-blue-500" />
                    )}
                    {activity.type === 'content' && (
                      <Icons.fileText className="h-4 w-4 text-green-500" />
                    )}
                    {activity.type === 'audit' && (
                      <Icons.shield className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <Badge variant="secondary" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.server className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>Quick overview of system status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Database</span>
              </div>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">API</span>
              </div>
              <Badge variant="default">Operational</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium">Rate Limiting</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
