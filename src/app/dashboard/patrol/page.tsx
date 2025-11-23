'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';

interface PatrolScan {
  id: string;
  content: string;
  metadata_?: {
    type?: string;
    file_path?: string;
    score?: number;
    critical_count?: number;
    high_count?: number;
    warning_types?: string[];
    timestamp?: string;
  };
  created_at?: number;
}

interface RepeatPattern {
  warningType: string;
  count: number;
  files: string[];
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
}

export default function PatrolPage() {
  const [scans, setScans] = useState<PatrolScan[]>([]);
  const [patterns, setPatterns] = useState<RepeatPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch patrol scans from memories
      const scansResponse = await fetch('/api/memories');
      if (!scansResponse.ok) throw new Error('Failed to fetch scans');
      const scansData = await scansResponse.json();

      // Filter for patrol_scan type
      const patrolScans = (scansData.items || []).filter(
        (item: PatrolScan) => item.metadata_?.type === 'patrol_scan'
      );
      setScans(patrolScans);

      // Fetch repeat patterns from API route (which proxies to gateway)
      // The API route handles authentication and environment variables
      try {
        const patternsResponse = await fetch('/api/patrol/repeat-patterns');
        if (patternsResponse.ok) {
          const patternsData = await patternsResponse.json();
          setPatterns(patternsData.patterns || []);
        }
      } catch {
        // Gateway might not be running - patterns will be empty array
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(score?: number) {
    if (score === undefined) return 'bg-gray-100 text-gray-800';
    if (score >= 8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  }

  const filteredScans = filter === 'all'
    ? scans
    : scans.filter(s => {
        const score = s.metadata_?.score || 10;
        if (filter === 'critical') return score < 5;
        if (filter === 'warning') return score >= 5 && score < 8;
        if (filter === 'clean') return score >= 8;
        return true;
      });

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              Patrol
            </h1>
            <p className="text-muted-foreground">
              Bug detection history and repeat pattern analysis
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <Icons.refresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Repeat Patterns Alert */}
        {patterns.length > 0 && (
          <Card className="mb-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>⚠️</span>
                Repeat Patterns Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.map((pattern, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4 p-3 bg-white dark:bg-gray-900 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(pattern.severity)}>
                          {pattern.count}x {pattern.warningType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {pattern.recommendation}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Files: {pattern.files.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold">{scans.length}</div>
              <div className="text-sm text-muted-foreground">Total Scans</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {scans.filter(s => (s.metadata_?.score || 10) < 5).length}
              </div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {scans.filter(s => {
                  const score = s.metadata_?.score || 10;
                  return score >= 5 && score < 8;
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {scans.filter(s => (s.metadata_?.score || 10) >= 8).length}
              </div>
              <div className="text-sm text-muted-foreground">Clean</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'critical', 'warning', 'clean'].map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="py-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure mem0 is running at localhost:8765
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <div className="grid gap-4">
            {filteredScans.map(scan => (
              <Card key={scan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getScoreColor(scan.metadata_?.score)}>
                          Score: {scan.metadata_?.score ?? '?'}/10
                        </Badge>
                        {(scan.metadata_?.critical_count || 0) > 0 && (
                          <Badge variant="destructive">
                            {scan.metadata_?.critical_count} critical
                          </Badge>
                        )}
                        {(scan.metadata_?.high_count || 0) > 0 && (
                          <Badge className="bg-orange-100 text-orange-800">
                            {scan.metadata_?.high_count} high
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm">
                        {scan.metadata_?.file_path || 'Unknown file'}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {scan.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {scan.metadata_?.timestamp && (
                          <span>{new Date(scan.metadata_.timestamp).toLocaleString()}</span>
                        )}
                        {scan.metadata_?.warning_types && (
                          <span>Types: {scan.metadata_.warning_types.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredScans.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-4xl mb-4">✨</div>
                  <p className="text-muted-foreground">
                    {filter === 'all'
                      ? 'No Patrol scans yet. Start coding!'
                      : `No ${filter} scans found`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
