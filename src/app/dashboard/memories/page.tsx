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

interface Memory {
  id: string;
  memory: string;
  metadata_?: {
    type?: string;
    priority?: string;
    status?: string;
    session_id?: string;
    created_at?: string;
    timestamp?: string;
    file_path?: string;
    score?: number;
    title?: string;
  };
  created_at?: number;
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchMemories();
  }, []);

  async function fetchMemories() {
    try {
      setLoading(true);
      // Fetch from local mem0 instance
      const response = await fetch('/api/memories');
      if (!response.ok) throw new Error('Failed to fetch memories');
      const data = await response.json();
      setMemories(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getTypeColor(type?: string) {
    switch (type) {
      case 'idea': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'feature': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'assessment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'session': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'git_context': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  const filteredMemories = filter === 'all'
    ? memories
    : memories.filter(m => m.metadata_?.type === filter);

  const types: string[] = ['all', ...new Set(memories.map(m => m.metadata_?.type).filter((t): t is string => !!t))];

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Memories</h1>
            <p className="text-muted-foreground">
              Browse and resume from any memory in Claude Code
            </p>
          </div>
          <Button onClick={fetchMemories} variant="outline" size="sm">
            <Icons.refresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {types.map(type => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type)}
            >
              {type === 'all' ? 'All' : type}
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
            {filteredMemories.map(memory => (
              <Card key={memory.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {memory.metadata_?.type && (
                          <Badge className={getTypeColor(memory.metadata_.type)}>
                            {memory.metadata_.type}
                          </Badge>
                        )}
                        {memory.metadata_?.priority && (
                          <Badge variant="outline">
                            {memory.metadata_.priority}
                          </Badge>
                        )}
                        {memory.metadata_?.status && (
                          <Badge variant="secondary">
                            {memory.metadata_.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm line-clamp-3">
                        {memory.metadata_?.title || memory.memory}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="font-mono">{memory.id.slice(0, 8)}...</span>
                        {memory.metadata_?.created_at && (
                          <span>{new Date(memory.metadata_.created_at).toLocaleDateString()}</span>
                        )}
                        {memory.metadata_?.file_path && (
                          <span className="truncate max-w-48">{memory.metadata_.file_path}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(memory.id)}
                      className="shrink-0"
                    >
                      {copiedId === memory.id ? (
                        <>
                          <Icons.check className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Icons.copy className="h-4 w-4 mr-1" />
                          Copy ID
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredMemories.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icons.inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No memories found</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">How to Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click <strong>Copy ID</strong> on any memory above</li>
              <li>Open Claude Code in your terminal</li>
              <li>Type: <code className="bg-muted px-2 py-1 rounded">/resume &lt;paste-id&gt;</code></li>
              <li>Claude will load that memory as context and start a new session</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
