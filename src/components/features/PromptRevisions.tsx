/**
 * Prompt Revision History Component
 * Shows revision history for a prompt
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { Separator } from '@/components/ui/separator';
import { RevisionComparison } from './RevisionComparison';

interface RevisionChange {
  field: string;
  oldValue?: string;
  newValue?: string;
  changeType: 'created' | 'updated' | 'deleted' | 'enriched';
}

interface PromptRevision {
  revisionNumber: number;
  changes: RevisionChange[];
  changedBy?: string;
  changeReason?: string;
  createdAt: string;
  snapshot?: {
    title: string;
    description: string;
  };
}

interface PromptRevisionsProps {
  promptId: string;
}

export function PromptRevisions({ promptId }: PromptRevisionsProps) {
  const [revisions, setRevisions] = useState<PromptRevision[]>([]);
  const [currentRevision, setCurrentRevision] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRevisions, setExpandedRevisions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        const response = await fetch(`/api/prompts/${promptId}/revisions`);
        if (response.ok) {
          const data = await response.json();
          setRevisions(data.revisions || []);
          setCurrentRevision(data.currentRevision || 1);
        }
      } catch (error) {
        console.error('Failed to fetch revisions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevisions();
  }, [promptId]);

  const toggleRevision = (revisionNumber: number) => {
    const newExpanded = new Set(expandedRevisions);
    if (newExpanded.has(revisionNumber)) {
      newExpanded.delete(revisionNumber);
    } else {
      newExpanded.add(revisionNumber);
    }
    setExpandedRevisions(newExpanded);
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'updated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'enriched':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'created':
        return Icons.plus;
      case 'updated':
        return Icons.edit;
      case 'deleted':
        return Icons.trash;
      case 'enriched':
        return Icons.sparkles;
      default:
        return Icons.fileText;
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-8 border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Loading revision history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (revisions.length === 0) {
    return (
      <Card className="mt-8 border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>No revision history available</p>
            <p className="text-xs mt-2">Revisions will appear here as the prompt is updated</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="mt-12">
      <Separator />
      
      <div className="mt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">📝 Revision History</h2>
          <Badge variant="outline">
            Current: v{currentRevision}
          </Badge>
        </div>

        <div className="space-y-4">
          {revisions.map((revision) => {
            const isExpanded = expandedRevisions.has(revision.revisionNumber);
            const ChangeIcon = getChangeTypeIcon(
              revision.changes[0]?.changeType || 'updated'
            );
            
            return (
              <Card key={revision.revisionNumber}>
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleRevision(revision.revisionNumber)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getChangeTypeColor(revision.changes[0]?.changeType || 'updated')}>
                        <ChangeIcon className="mr-1 h-3 w-3" />
                        v{revision.revisionNumber}
                      </Badge>
                      <CardTitle className="text-lg">
                        {revision.changeReason || 'Prompt updated'}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {revision.changedBy && (
                        <span>by {revision.changedBy}</span>
                      )}
                      <span>
                        {new Date(revision.createdAt).toLocaleDateString()}
                      </span>
                      <Icons.chevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <CardDescription>
                    {revision.changes.length} change{revision.changes.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    <div className="space-y-3">
                      {revision.changes.map((change, i) => {
                        const ChangeIcon = getChangeTypeIcon(change.changeType);
                        return (
                          <div key={i} className="rounded-lg border p-4">
                            <div className="mb-2 flex items-center gap-2">
                              <Badge variant="outline" className={getChangeTypeColor(change.changeType)}>
                                <ChangeIcon className="mr-1 h-3 w-3" />
                                {change.field}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {change.changeType}
                              </Badge>
                            </div>
                            {change.oldValue && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Before:</p>
                                <div className="rounded bg-red-50 dark:bg-red-950/50 p-2 text-xs font-mono">
                                  {change.oldValue.length > 200 
                                    ? change.oldValue.substring(0, 200) + '...' 
                                    : change.oldValue}
                                </div>
                              </div>
                            )}
                            {change.newValue && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">After:</p>
                                <div className="rounded bg-green-50 dark:bg-green-950/50 p-2 text-xs font-mono">
                                  {change.newValue.length > 200 
                                    ? change.newValue.substring(0, 200) + '...' 
                                    : change.newValue}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Revision Comparison */}
        {revisions.length >= 2 && (
          <RevisionComparison promptId={promptId} revisions={revisions} />
        )}
      </div>
    </section>
  );
}

