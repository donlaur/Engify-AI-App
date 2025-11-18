'use client';

import { useState, useEffect } from 'react';
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

interface PainPointWithMetadata extends PainPoint {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export function PainPointManagementPanel() {
  const [painPoints, setPainPoints] = useState<PainPointWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all'); // all, published, draft
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPointWithMetadata | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(100); // Max allowed by API

  useEffect(() => {
    fetchPainPoints();
  }, [currentPage, pageSize]);

  const fetchPainPoints = async () => {
    setLoading(true);
    try {
      // Fetch from admin endpoint with pagination
      const res = await fetch(`/api/admin/pain-points?page=${currentPage}&limit=${pageSize}`);
      const data = await res.json();

      if (data.success) {
        setPainPoints(data.painPoints);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pain points:', error);
    } finally {
      setLoading(false);
    }
  };

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
        fetchPainPoints();
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

  const stats = {
    total: totalCount, // Use total from API pagination
    published: painPoints.filter((p) => p.status === 'published').length,
    draft: painPoints.filter((p) => p.status === 'draft').length,
    withExamples: painPoints.filter((p) =>
      (p.examples && p.examples.length > 0) ||
      (p.expandedExamples && p.expandedExamples.length > 0)
    ).length,
    withSolutions: painPoints.filter((p) =>
      p.solutionWorkflows && p.solutionWorkflows.length > 0
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total</CardDescription>
            <CardTitle className="text-4xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Published</CardDescription>
            <CardTitle className="text-4xl font-bold text-green-600">
              {stats.published}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Draft</CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-400">
              {stats.draft}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">With Examples</CardDescription>
            <CardTitle className="text-4xl font-bold text-blue-600">
              {stats.withExamples}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">With Solutions</CardDescription>
            <CardTitle className="text-4xl font-bold text-purple-600">
              {stats.withSolutions}
            </CardTitle>
          </CardHeader>
        </Card>
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
                          {painPoint.description}
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
                          {new Date(painPoint.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
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

          {/* Pagination Controls */}
          {!loading && filteredPainPoints.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} pain points
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
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
                        <span>{new Date(selectedPainPoint.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{new Date(selectedPainPoint.updatedAt).toLocaleString()}</span>
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
