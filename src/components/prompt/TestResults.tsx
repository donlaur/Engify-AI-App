/**
 * TestResults Component
 * Displays AI model test results for a prompt
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

interface TestResult {
  model: string;
  provider: string;
  qualityScore: number;
  tokensUsed: number;
  costUSD: number;
  latencyMs: number;
  testedAt: string;
}

interface ModelStat {
  model: string;
  provider: string;
  averageScore: number;
  totalCost: number;
  averageLatency: number;
  testCount: number;
}

interface TestResultsData {
  promptId: string;
  promptTitle: string;
  hasResults: boolean;
  results: TestResult[];
  averageScore: number | null;
  totalTests: number;
  totalCost: number;
  modelStats: ModelStat[];
  lastTested: string | null;
}

interface TestResultsProps {
  promptId: string;
}

export function TestResults({ promptId }: TestResultsProps) {
  const [data, setData] = useState<TestResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTestResults() {
      try {
        const response = await fetch(`/api/prompts/${promptId}/test-results`);
        if (!response.ok) {
          throw new Error('Failed to fetch test results');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchTestResults();
  }, [promptId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.spinner className="h-4 w-4 animate-spin" />
            <span>Test Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading test results...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.hasResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.zap className="h-4 w-4" />
            <span>Test Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No test results available yet. This prompt hasn&apos;t been tested with AI models.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 4) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800';
      case 'google':
        return 'bg-blue-100 text-blue-800';
      case 'anthropic':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.zap className="h-4 w-4" />
          <span>AI Test Results</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Quality</p>
            <div className="flex items-center gap-2">
              <Badge className={getScoreColor(data.averageScore || 0)}>
                {data.averageScore?.toFixed(1)}/5
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tests Run</p>
            <p className="text-lg font-semibold">{data.totalTests}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-lg font-semibold">${data.totalCost.toFixed(4)}</p>
          </div>
        </div>

        {/* Model Stats */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Performance by Model</h4>
          {data.modelStats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-lg border bg-muted/50 p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getProviderColor(stat.provider)}>
                    {stat.provider}
                  </Badge>
                  <span className="text-sm font-medium">{stat.model}</span>
                </div>
                <Badge className={getScoreColor(stat.averageScore)}>
                  {stat.averageScore.toFixed(1)}/5
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Latency:</span>{' '}
                  {Math.round(stat.averageLatency)}ms
                </div>
                <div>
                  <span className="font-medium">Cost:</span> $
                  {stat.totalCost.toFixed(4)}
                </div>
                <div>
                  <span className="font-medium">Tests:</span> {stat.testCount}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Last Tested */}
        {data.lastTested && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            Last tested:{' '}
            {new Date(data.lastTested).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

