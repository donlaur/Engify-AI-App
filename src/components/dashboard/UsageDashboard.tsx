/**
 * Usage Dashboard Component
 * Displays AI usage stats, limits, and costs
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/lib/icons';
import { formatNumber } from '@/lib/utils/string';

interface UsageData {
  requests: {
    used: number;
    limit: number;
    percentage: number;
  };
  tokens: {
    used: number;
    limit: number;
    percentage: number;
  };
  cost: {
    used: number;
    limit: number;
    percentage: number;
  };
  byProvider: Record<
    string,
    {
      requests: number;
      tokens: number;
      cost: number;
    }
  >;
}

export function UsageDashboard() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage');
      const data = await response.json();
      setUsage(data);
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.spinner className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No usage data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <UsageCard
          title="Requests Today"
          used={usage.requests.used}
          limit={usage.requests.limit}
          percentage={usage.requests.percentage}
          icon={<Icons.zap className="h-4 w-4" />}
          color="blue"
        />
        <UsageCard
          title="Tokens Used"
          used={usage.tokens.used}
          limit={usage.tokens.limit}
          percentage={usage.tokens.percentage}
          icon={<Icons.hash className="h-4 w-4" />}
          color="purple"
          format="tokens"
        />
        <UsageCard
          title="Cost Today"
          used={usage.cost.used}
          limit={usage.cost.limit}
          percentage={usage.cost.percentage}
          icon={<Icons.dollarSign className="h-4 w-4" />}
          color="green"
          format="currency"
        />
      </div>

      {/* Provider Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Usage by Provider</CardTitle>
          <CardDescription>
            See which AI providers you&apos;re using most
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(usage.byProvider).map(([provider, stats]) => (
              <div key={provider} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">{provider}</span>
                  <span className="text-gray-500">
                    {stats.requests} requests • {formatNumber(stats.tokens)}{' '}
                    tokens • ${stats.cost.toFixed(4)}
                  </span>
                </div>
                <Progress
                  value={(stats.requests / usage.requests.used) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Prompt */}
      {usage.requests.percentage > 80 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Icons.alertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">
                  Approaching Usage Limit
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  You&apos;ve used {usage.requests.percentage.toFixed(0)}% of
                  your daily limit. Upgrade to Pro for higher limits.
                </p>
                <button className="mt-3 text-sm font-medium text-yellow-900 hover:underline">
                  Upgrade Now →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface UsageCardProps {
  title: string;
  used: number;
  limit: number;
  percentage: number;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green';
  format?: 'number' | 'tokens' | 'currency';
}

function UsageCard({
  title,
  used,
  limit,
  percentage,
  icon,
  color,
  format = 'number',
}: UsageCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
  };

  const formatValue = (value: number) => {
    if (format === 'currency') return `$${value.toFixed(4)}`;
    if (format === 'tokens') return formatNumber(value);
    return value.toString();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className={`rounded-lg p-2 ${colorClasses[color]}`}>{icon}</div>
          <span className="text-2xl font-bold">{formatValue(used)}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{title}</span>
            <span className="text-gray-500">of {formatValue(limit)}</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-gray-500">{percentage.toFixed(1)}% used</p>
        </div>
      </CardContent>
    </Card>
  );
}
