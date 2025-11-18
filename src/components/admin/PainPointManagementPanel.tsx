'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import type { PainPoint } from '@/lib/workflows/pain-point-schema';
import { useAdminData } from '@/hooks/admin/useAdminData';
import { AdminPaginationControls } from '@/components/admin/shared/AdminPaginationControls';
import { AdminStatsCard } from '@/components/admin/shared/AdminStatsCard';
import { formatAdminDate, calculateStats, truncateText } from '@/lib/admin/utils';

interface PainPointWithMetadata extends PainPoint {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export function PainPointManagementPanel() {
  // Use the new useAdminData hook for data fetching and pagination
  const {
    data: painPoints,
    loading,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    goToPage,
    refresh,
  } = useAdminData<PainPointWithMetadata>({
    endpoint: '/api/admin/pain-points',
    pageSize: 100,
    dataKey: 'painPoints',
  });

  const [filter, setFilter] = useState<string>('all'); // all, published, draft
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPointWithMetadata | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleToggleStatus = async (
    painPointId: string,
    currentStatus: 'draft' | 'published'
  ) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const res = await fetch(`/api/admin/pain-points/${painPointId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        refresh();
        if (selectedPainPoint?._id === painPointId) {
          setSelectedPainPoint({ ...selectedPainPoint, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleView = (painPoint: PainPointWithMetadata) => {
    setSelectedPainPoint(painPoint);
    setIsDrawerOpen(true);
  };

  const filteredPainPoints = painPoints.filter((painPoint) => {
    // Filter by status
    if (filter === 'published' && painPoint.status !== 'published') return false;
    if (filter === 'draft' && painPoint.status !== 'draft') return false;

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        painPoint.title.toLowerCase().includes(search) ||
        painPoint.slug.toLowerCase().includes(search) ||
        painPoint.description.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // Use calculateStats utility for statistics
  const stats = useMemo(() => calculateStats(painPoints, [
    { key: 'total', calculate: () => totalCount },
    { key: 'published', calculate: (items) => items.filter(p => p.status === 'published').length },
    { key: 'draft', calculate: (items) => items.filter(p => p.status === 'draft').length },
    { key: 'withExamples', calculate: (items) => items.filter(p =>
      (p.examples && p.examples.length > 0) ||
      (p.expandedExamples && p.expandedExamples.length > 0)
    ).length },
    { key: 'withSolutions', calculate: (items) => items.filter(p =>
      p.solutionWorkflows && p.solutionWorkflows.length > 0
    ).length },
  ]), [painPoints, totalCount]);

  return (
    <div className="space-y-6">
      {/* Stats Cards - Using AdminStatsCard */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <AdminStatsCard label="Total" value={stats.total} />
        <AdminStatsCard label="Published" value={stats.published} variant="green" />
        <AdminStatsCard label="Draft" value={stats.draft} variant="gray" />
        <AdminStatsCard label="With Examples" value={stats.withExamples} variant="blue" />
        <AdminStatsCard label="With Solutions" value={stats.withSolutions} variant="purple" />
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Pain Points Library ({filteredPainPoints.length})</CardTitle>
          <CardDescription>
            Manage pain points, toggle published status, and review content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by title, slug, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white dark:bg-gray-800"
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pain Points</SelectItem>
                <SelectItem value="published">Published Only</SelectItem>
                <SelectItem value="draft">Draft Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading pain points...
            </div>
          ) : filteredPainPoints.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No pain points found
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border bg-white dark:bg-gray-900">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="w-[80px] font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="w-[300px] font-semibold">
                      Title
                    </TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Examples</TableHead>
                    <TableHead className="font-semibold">Solutions</TableHead>
                    <TableHead className="font-semibold">Updated</TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPainPoints.map((painPoint) => (
                    <TableRow
                      key={painPoint._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell>
                        <Switch
                          checked={painPoint.status === 'published'}
                          onCheckedChange={() =>
                            handleToggleStatus(
                              painPoint._id,
                              painPoint.status
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleView(painPoint)}
                          className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                        >
                          {painPoint.title}
                        </button>
                      </TableCell>
                      <TableCell>
                        <span className="line-clamp-2 text-sm text-muted-foreground">
                          {truncateText(painPoint.description, 80)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {(painPoint.examples?.length || 0) + (painPoint.expandedExamples?.length || 0)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {painPoint.solutionWorkflows?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatAdminDate(painPoint.updatedAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(painPoint)}
                        >
                          <Icons.eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls - Using AdminPaginationControls */}
          {!loading && filteredPainPoints.length > 0 && (
            <AdminPaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={goToPage}
              itemName="pain points"
            />
          )}
        </CardContent>
      </Card>

      {/* Preview Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[800px] overflow-y-auto sm:max-w-[800px]">
          {selectedPainPoint && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <SheetTitle>{selectedPainPoint.title}</SheetTitle>
                    <SheetDescription>
                      Slug: {selectedPainPoint.slug}
                      <Badge className="ml-2" variant={selectedPainPoint.status === 'published' ? 'default' : 'secondary'}>
                        {selectedPainPoint.status}
                      </Badge>
                    </SheetDescription>
                  </div>
                  <Switch
                    id="status-toggle-header"
                    checked={selectedPainPoint.status === 'published'}
                    onCheckedChange={() =>
                      handleToggleStatus(
                        selectedPainPoint._id,
                        selectedPainPoint.status
                      )
                    }
                  />
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="solutions">Solutions</TabsTrigger>
                  <TabsTrigger value="related">Related</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  {/* Title and Slug */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Title</Label>
                    <p className="text-sm">{selectedPainPoint.title}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Slug</Label>
                    <p className="text-sm font-mono text-muted-foreground">{selectedPainPoint.slug}</p>
                  </div>

                  <Separator />

                  {/* Core Problem */}
                  {selectedPainPoint.coreProblem && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Core Problem</Label>
                      <p className="text-sm text-muted-foreground">{selectedPainPoint.coreProblem}</p>
                    </div>
                  )}

                  {/* Problem Statement */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Problem Statement</Label>
                    <p className="text-sm text-muted-foreground">{selectedPainPoint.problemStatement}</p>
                  </div>

                  {/* Impact */}
                  {selectedPainPoint.impact && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Impact on Teams & Business</Label>
                      <p className="text-sm text-muted-foreground">{selectedPainPoint.impact}</p>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Description</Label>
                    <p className="text-sm text-muted-foreground">{selectedPainPoint.description}</p>
                  </div>

                  <Separator />

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Publication Status</Label>
                    <div>
                      <Badge variant={selectedPainPoint.status === 'published' ? 'default' : 'secondary'}>
                        {selectedPainPoint.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Timestamps</Label>
                    <div className="rounded-md border p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{formatAdminDate(selectedPainPoint.createdAt)}</span>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{formatAdminDate(selectedPainPoint.updatedAt)}</span>
                      </div>
                      {selectedPainPoint.datePublished && (
                        <div className="mt-2 flex justify-between">
                          <span className="text-muted-foreground">Published:</span>
                          <span>{selectedPainPoint.datePublished}</span>
                        </div>
                      )}
                      {selectedPainPoint.dateModified && (
                        <div className="mt-2 flex justify-between">
                          <span className="text-muted-foreground">Modified:</span>
                          <span>{selectedPainPoint.dateModified}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Examples Tab */}
                <TabsContent value="examples" className="space-y-4">
                  {/* Simple Examples */}
                  {selectedPainPoint.examples && selectedPainPoint.examples.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Simple Examples</Label>
                      <ul className="list-disc space-y-2 pl-5 text-sm">
                        {selectedPainPoint.examples.map((example, idx) => (
                          <li key={idx} className="text-muted-foreground">{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPainPoint.examples && selectedPainPoint.examples.length > 0 &&
                   selectedPainPoint.expandedExamples && selectedPainPoint.expandedExamples.length > 0 && (
                    <Separator />
                  )}

                  {/* Expanded Examples */}
                  {selectedPainPoint.expandedExamples && selectedPainPoint.expandedExamples.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Expanded Real-World Examples</Label>
                      <div className="space-y-3">
                        {selectedPainPoint.expandedExamples.map((example, idx) => (
                          <div key={idx} className="rounded-md border p-4 space-y-2">
                            <div className="font-medium text-sm">{example.title}</div>
                            <p className="text-sm text-muted-foreground">{example.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!selectedPainPoint.examples || selectedPainPoint.examples.length === 0) &&
                   (!selectedPainPoint.expandedExamples || selectedPainPoint.expandedExamples.length === 0) && (
                    <div className="py-8 text-center text-muted-foreground">
                      No examples available
                    </div>
                  )}
                </TabsContent>

                {/* Solutions Tab */}
                <TabsContent value="solutions" className="space-y-4">
                  {selectedPainPoint.solutionWorkflows && selectedPainPoint.solutionWorkflows.length > 0 ? (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Solution Workflows</Label>
                      <div className="space-y-3">
                        {selectedPainPoint.solutionWorkflows.map((solution, idx) => (
                          <div key={idx} className="rounded-md border p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="font-medium">{solution.title}</div>
                              <Badge variant="outline" className="text-xs">
                                {solution.workflowId}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Pain Point It Solves:</span>
                                <p className="text-sm mt-1">{solution.painPointItSolves}</p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Why It Works:</span>
                                <p className="text-sm mt-1">{solution.whyItWorks}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No solution workflows available
                    </div>
                  )}
                </TabsContent>

                {/* Related Content Tab */}
                <TabsContent value="related" className="space-y-4">
                  {/* Related Workflows */}
                  {selectedPainPoint.relatedWorkflows && selectedPainPoint.relatedWorkflows.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Related Workflows ({selectedPainPoint.relatedWorkflows.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPainPoint.relatedWorkflows.map((workflow, idx) => (
                          <Badge key={idx} variant="outline">
                            {workflow}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Prompts */}
                  {selectedPainPoint.relatedPrompts && selectedPainPoint.relatedPrompts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Related Prompts ({selectedPainPoint.relatedPrompts.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPainPoint.relatedPrompts.map((prompt, idx) => (
                          <Badge key={idx} variant="secondary">
                            {prompt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Patterns */}
                  {selectedPainPoint.relatedPatterns && selectedPainPoint.relatedPatterns.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Related Patterns ({selectedPainPoint.relatedPatterns.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPainPoint.relatedPatterns.map((pattern, idx) => (
                          <Badge key={idx} variant="outline">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Research Citations */}
                  {selectedPainPoint.researchCitations && selectedPainPoint.researchCitations.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">
                          Research Citations ({selectedPainPoint.researchCitations.length})
                        </Label>
                        <div className="space-y-3">
                          {selectedPainPoint.researchCitations.map((citation, idx) => (
                            <div key={idx} className="rounded-md border p-3 space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="font-medium text-sm">{citation.source}</div>
                                {citation.verified && (
                                  <Badge variant="default" className="text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{citation.summary}</p>
                              {citation.url && (
                                <a
                                  href={citation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  {citation.url}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Keywords Section */}
                  <Separator />
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Keywords</Label>

                    {/* Primary Keywords */}
                    {selectedPainPoint.primaryKeywords && selectedPainPoint.primaryKeywords.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Primary Keywords ({selectedPainPoint.primaryKeywords.length})
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedPainPoint.primaryKeywords.map((keyword, idx) => (
                            <Badge key={idx} variant="default">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pain Point Keywords */}
                    {selectedPainPoint.painPointKeywords && selectedPainPoint.painPointKeywords.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Pain Point Keywords ({selectedPainPoint.painPointKeywords.length})
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedPainPoint.painPointKeywords.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Solution Keywords */}
                    {selectedPainPoint.solutionKeywords && selectedPainPoint.solutionKeywords.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Solution Keywords ({selectedPainPoint.solutionKeywords.length})
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedPainPoint.solutionKeywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* General Keywords (backwards compatibility) */}
                    {selectedPainPoint.keywords && selectedPainPoint.keywords.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          General Keywords ({selectedPainPoint.keywords.length})
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedPainPoint.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {(!selectedPainPoint.relatedWorkflows || selectedPainPoint.relatedWorkflows.length === 0) &&
                   (!selectedPainPoint.relatedPrompts || selectedPainPoint.relatedPrompts.length === 0) &&
                   (!selectedPainPoint.relatedPatterns || selectedPainPoint.relatedPatterns.length === 0) &&
                   (!selectedPainPoint.researchCitations || selectedPainPoint.researchCitations.length === 0) &&
                   (!selectedPainPoint.primaryKeywords || selectedPainPoint.primaryKeywords.length === 0) &&
                   (!selectedPainPoint.painPointKeywords || selectedPainPoint.painPointKeywords.length === 0) &&
                   (!selectedPainPoint.solutionKeywords || selectedPainPoint.solutionKeywords.length === 0) &&
                   (!selectedPainPoint.keywords || selectedPainPoint.keywords.length === 0) && (
                    <div className="py-8 text-center text-muted-foreground">
                      No related content available
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
