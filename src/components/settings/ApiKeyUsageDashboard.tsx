'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UsageSummary {
  userId: string;
  keyId?: string;
  provider?: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  errorCount: number;
  rateLimitHits: number;
}

interface ApiKeyUsageDashboardProps {
  userId: string;
  keyId?: string;
}

export function ApiKeyUsageDashboard({ userId, keyId }: ApiKeyUsageDashboardProps) {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [_provider, _setProvider] = useState<string>('');

  const loadUsageRef = useRef(loadUsage);
  
  useEffect(() => {
    loadUsageRef.current = loadUsage;
  });

  useEffect(() => {
    loadUsageRef.current();
  }, [userId, keyId, period]);

  const loadUsage = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
      });
      if (keyId) params.append('keyId', keyId);
      if (_provider) params.append('provider', _provider);

      const response = await fetch(`/api/v2/users/api-keys/usage?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error loading usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Icons.barChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No usage data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Usage Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your API key usage and costs
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(val) => setPeriod(val as typeof period)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Icons.messageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalRequests.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Icons.hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTokens.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <Icons.dollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalCost.toFixed(4)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Icons.checkCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary.successRate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Response Time</span>
                <span className="text-sm font-medium">
                  {summary.averageResponseTime.toFixed(0)}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Error Count</span>
                <Badge variant={summary.errorCount > 0 ? 'destructive' : 'secondary'}>
                  {summary.errorCount}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rate Limit Hits</span>
                <Badge variant={summary.rateLimitHits > 0 ? 'warning' : 'secondary'}>
                  {summary.rateLimitHits}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">From: </span>
                <span className="font-medium">
                  {new Date(summary.startDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">To: </span>
                <span className="font-medium">
                  {new Date(summary.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

