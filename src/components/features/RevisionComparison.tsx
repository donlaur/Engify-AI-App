/**
 * Revision Comparison Component
 * Shows side-by-side comparison of two revisions
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RevisionComparisonProps {
  promptId: string;
  revisions: Array<{ revisionNumber: number; createdAt: string; changeReason?: string }>;
}

interface ComparisonData {
  revision1: {
    revisionNumber: number;
    createdAt: string;
    changedBy?: string;
    changeReason?: string;
    snapshot: any;
  };
  revision2: {
    revisionNumber: number;
    createdAt: string;
    changedBy?: string;
    changeReason?: string;
    snapshot: any;
  };
  differences: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    changeType: 'created' | 'updated' | 'deleted';
  }>;
}

export function RevisionComparison({ promptId, revisions }: RevisionComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRev1, setSelectedRev1] = useState<string>('');
  const [selectedRev2, setSelectedRev2] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set defaults to latest and previous revision
  useEffect(() => {
    if (revisions.length >= 2 && !selectedRev1 && !selectedRev2) {
      setSelectedRev1(revisions[0].revisionNumber.toString());
      setSelectedRev2(revisions[1].revisionNumber.toString());
    }
  }, [revisions, selectedRev1, selectedRev2]);

  const handleCompare = async () => {
    if (!selectedRev1 || !selectedRev2 || selectedRev1 === selectedRev2) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/prompts/${promptId}/revisions/compare?revision1=${selectedRev1}&revision2=${selectedRev2}`
      );
      if (response.ok) {
        const data = await response.json();
        setComparisonData(data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Failed to compare revisions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return '(empty)';
    if (Array.isArray(value)) {
      return value.length === 0 ? '(empty array)' : JSON.stringify(value, null, 2);
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <>
      <Card className="mt-4 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.gitCompare className="h-5 w-5" />
            Compare Revisions
          </CardTitle>
          <CardDescription>
            Select two revisions to see a side-by-side comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Revision 1 (Older)</label>
                <Select value={selectedRev1} onValueChange={setSelectedRev1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select revision" />
                  </SelectTrigger>
                  <SelectContent>
                    {revisions.map((rev) => (
                      <SelectItem key={rev.revisionNumber} value={rev.revisionNumber.toString()}>
                        v{rev.revisionNumber} - {rev.changeReason || 'Prompt updated'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Revision 2 (Newer)</label>
                <Select value={selectedRev2} onValueChange={setSelectedRev2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select revision" />
                  </SelectTrigger>
                  <SelectContent>
                    {revisions.map((rev) => (
                      <SelectItem key={rev.revisionNumber} value={rev.revisionNumber.toString()}>
                        v{rev.revisionNumber} - {rev.changeReason || 'Prompt updated'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleCompare}
              disabled={!selectedRev1 || !selectedRev2 || selectedRev1 === selectedRev2 || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  <Icons.gitCompare className="mr-2 h-4 w-4" />
                  Compare Revisions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revision Comparison</DialogTitle>
            <DialogDescription>
              Comparing v{comparisonData?.revision1.revisionNumber} vs v{comparisonData?.revision2.revisionNumber}
            </DialogDescription>
          </DialogHeader>

          {comparisonData && (
            <div className="space-y-6">
              {/* Revision Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Revision {comparisonData.revision1.revisionNumber}
                    </CardTitle>
                    <CardDescription>
                      {new Date(comparisonData.revision1.createdAt).toLocaleString()}
                      {comparisonData.revision1.changedBy && (
                        <span> • by {comparisonData.revision1.changedBy}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Revision {comparisonData.revision2.revisionNumber}
                    </CardTitle>
                    <CardDescription>
                      {new Date(comparisonData.revision2.createdAt).toLocaleString()}
                      {comparisonData.revision2.changedBy && (
                        <span> • by {comparisonData.revision2.changedBy}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Separator />

              {/* Differences */}
              {comparisonData.differences.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icons.check className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p>No differences found between these revisions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    {comparisonData.differences.length} Change
                    {comparisonData.differences.length !== 1 ? 's' : ''} Found
                  </h3>
                  {comparisonData.differences.map((diff, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              diff.changeType === 'created'
                                ? 'default'
                                : diff.changeType === 'deleted'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {diff.field}
                          </Badge>
                          <Badge variant="outline">{diff.changeType}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                              Before (v{comparisonData.revision1.revisionNumber})
                            </p>
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/50">
                              <pre className="whitespace-pre-wrap break-words text-xs font-mono">
                                {formatValue(diff.oldValue)}
                              </pre>
                            </div>
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                              After (v{comparisonData.revision2.revisionNumber})
                            </p>
                            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/50">
                              <pre className="whitespace-pre-wrap break-words text-xs font-mono">
                                {formatValue(diff.newValue)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Full Snapshots */}
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Full Snapshots</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">v{comparisonData.revision1.revisionNumber} Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium">Title:</span>{' '}
                          {comparisonData.revision1.snapshot.title}
                        </div>
                        <div>
                          <span className="font-medium">Description:</span>{' '}
                          {comparisonData.revision1.snapshot.description}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>{' '}
                          {comparisonData.revision1.snapshot.category}
                        </div>
                        {comparisonData.revision1.snapshot.role && (
                          <div>
                            <span className="font-medium">Role:</span>{' '}
                            {comparisonData.revision1.snapshot.role}
                          </div>
                        )}
                        {comparisonData.revision1.snapshot.pattern && (
                          <div>
                            <span className="font-medium">Pattern:</span>{' '}
                            {comparisonData.revision1.snapshot.pattern}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">v{comparisonData.revision2.revisionNumber} Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium">Title:</span>{' '}
                          {comparisonData.revision2.snapshot.title}
                        </div>
                        <div>
                          <span className="font-medium">Description:</span>{' '}
                          {comparisonData.revision2.snapshot.description}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>{' '}
                          {comparisonData.revision2.snapshot.category}
                        </div>
                        {comparisonData.revision2.snapshot.role && (
                          <div>
                            <span className="font-medium">Role:</span>{' '}
                            {comparisonData.revision2.snapshot.role}
                          </div>
                        )}
                        {comparisonData.revision2.snapshot.pattern && (
                          <div>
                            <span className="font-medium">Pattern:</span>{' '}
                            {comparisonData.revision2.snapshot.pattern}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

