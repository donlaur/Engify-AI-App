'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/lib/icons';

interface ContentStats {
  totalPrompts: number;
  categories: Array<{ _id: string; count: number }>;
  uniqueTags: string[];
  promptsWithoutTags: number;
  testResults: number;
}

export function ContentQualityPanel() {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/content/quality');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch content stats:', error);
    }
  };

  const handleAction = async (action: string, limit?: number) => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/content/quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, limit }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
        fetchStats(); // Refresh stats
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Content Quality Tools</h3>

      {/* Stats Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Prompts</p>
                <p className="text-2xl font-bold">{stats.totalPrompts}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Unique Tags</p>
                <p className="text-2xl font-bold">{stats.uniqueTags.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Test Results</p>
                <p className="text-2xl font-bold">{stats.testResults}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Missing Tags</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.promptsWithoutTags}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Category Distribution:</p>
              <div className="space-y-1">
                {stats.categories.slice(0, 8).map((cat) => (
                  <div key={cat._id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{cat._id}</span>
                    <span className="font-medium">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quality Improvement Actions</CardTitle>
          <CardDescription>
            Run content improvement tasks (requires super admin)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-sm">Recategorize Prompts</p>
              <p className="text-xs text-muted-foreground">
                Fix prompts marked as &quot;general&quot; category
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleAction('recategorize')}
              disabled={loading}
            >
              <Icons.tag className="h-4 w-4 mr-2" />
              Run
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-sm">Test Prompts (Dry Run)</p>
              <p className="text-xs text-muted-foreground">
                Test 3 prompts with AI models (~$0.002)
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('test-prompts', 3)}
              disabled={loading}
            >
              <Icons.testTube className="h-4 w-4 mr-2" />
              Test 3
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-sm">Test All Prompts</p>
              <p className="text-xs text-muted-foreground">
                Multi-model testing (~$5-10 budget)
              </p>
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={() => handleAction('test-prompts', 0)}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Icons.zap className="h-4 w-4 mr-2" />
              Test All
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-sm">Audit Tags</p>
              <p className="text-xs text-muted-foreground">
                Get tag usage statistics
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('audit-tags')}
              disabled={loading}
            >
              <Icons.barChart className="h-4 w-4 mr-2" />
              Audit
            </Button>
          </div>

          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.startsWith('✅')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// function _categorizeByTitleAndTags(title: string, tags: string[]): string {
//   if (title.match(/code|function|class|api|component/) || tags.includes('code')) {
//     return 'code-generation';
//   } else if (title.match(/test|qa|bug/) || tags.includes('testing')) {
//     return 'testing';
//   } else if (title.match(/architect|design|system/) || tags.includes('architecture')) {
//     return 'architecture';
//   } else if (title.match(/product|feature|roadmap/) || tags.includes('product')) {
//     return 'product';
//   } else if (title.match(/leader|manage|team/) || tags.includes('leadership')) {
//     return 'leadership';
//   }
//   return 'general';
// }

