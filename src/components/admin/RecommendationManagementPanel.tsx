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
import type { Recommendation } from '@/lib/workflows/recommendation-schema';

interface RecommendationWithMeta extends Recommendation {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export function RecommendationManagementPanel() {
  const [recommendations, setRecommendations] = useState<RecommendationWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationWithMeta | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(100);

  useEffect(() => {
    fetchRecommendations();
  }, [currentPage, pageSize]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/recommendations?page=${currentPage}&limit=${pageSize}`);
      const data = await res.json();

      if (data.success) {
        setRecommendations(data.recommendations);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (
    recommendationId: string,
    currentStatus: string
  ) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const res = await fetch(`/api/admin/recommendations/${recommendationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchRecommendations();
        if (selectedRecommendation?._id === recommendationId) {
          setSelectedRecommendation({ ...selectedRecommendation, status: newStatus as 'draft' | 'published' });
        }
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleView = (recommendation: RecommendationWithMeta) => {
    setSelectedRecommendation(recommendation);
    setIsDrawerOpen(true);
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    // Filter by category
    if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;

    // Filter by audience
    if (audienceFilter !== 'all' && !rec.audience.includes(audienceFilter as any)) return false;

    // Filter by priority
    if (priorityFilter !== 'all' && rec.priority !== priorityFilter) return false;

    // Filter by status
    if (statusFilter !== 'all' && rec.status !== statusFilter) return false;

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        rec.title.toLowerCase().includes(search) ||
        rec.slug.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const stats = {
    total: totalCount,
    published: recommendations.filter((r) => r.status === 'published').length,
    draft: recommendations.filter((r) => r.status === 'draft').length,
    highPriority: recommendations.filter((r) => r.priority === 'high').length,
    mediumPriority: recommendations.filter((r) => r.priority === 'medium').length,
    lowPriority: recommendations.filter((r) => r.priority === 'low').length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
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
            <CardDescription className="text-xs">High Priority</CardDescription>
            <CardTitle className="text-4xl font-bold text-red-600">
              {stats.highPriority}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Medium Priority</CardDescription>
            <CardTitle className="text-4xl font-bold text-yellow-600">
              {stats.mediumPriority}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Low Priority</CardDescription>
            <CardTitle className="text-4xl font-bold text-green-600">
              {stats.lowPriority}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations ({filteredRecommendations.length})</CardTitle>
          <CardDescription>
            Manage all recommendations, toggle status, and review details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            <Input
              placeholder="Search by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-gray-800 md:col-span-1"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="best-practices">Best Practices</SelectItem>
                <SelectItem value="strategic-guidance">Strategic Guidance</SelectItem>
                <SelectItem value="tool-selection">Tool Selection</SelectItem>
                <SelectItem value="team-structure">Team Structure</SelectItem>
                <SelectItem value="process-optimization">Process Optimization</SelectItem>
                <SelectItem value="risk-mitigation">Risk Mitigation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="engineers">Engineers</SelectItem>
                <SelectItem value="engineering-managers">Engineering Managers</SelectItem>
                <SelectItem value="devops-sre">DevOps/SRE</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="product-managers">Product Managers</SelectItem>
                <SelectItem value="cto">CTO</SelectItem>
                <SelectItem value="vp-engineering">VP Engineering</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="architects">Architects</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading recommendations...
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No recommendations found
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
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Audience</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Updated</TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecommendations.map((rec) => (
                    <TableRow
                      key={rec._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell>
                        <Switch
                          checked={rec.status === 'published'}
                          onCheckedChange={() =>
                            handleToggleStatus(rec._id, rec.status)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleView(rec)}
                          className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                        >
                          {rec.title}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rec.category.replace(/-/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rec.audience.slice(0, 2).map((aud) => (
                            <Badge key={aud} variant="secondary" className="text-xs">
                              {aud.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                          {rec.audience.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{rec.audience.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(rec.updatedAt).toLocaleDateString('en-US', {
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
                          onClick={() => handleView(rec)}
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
          {!loading && filteredRecommendations.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} recommendations
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
          {selectedRecommendation && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <SheetTitle>{selectedRecommendation.title}</SheetTitle>
                    <SheetDescription>
                      {selectedRecommendation.slug}
                      <Badge className="ml-2" variant={selectedRecommendation.status === 'published' ? 'default' : 'secondary'}>
                        {selectedRecommendation.status}
                      </Badge>
                      <Badge className={`ml-2 ${getPriorityColor(selectedRecommendation.priority)}`}>
                        {selectedRecommendation.priority} priority
                      </Badge>
                    </SheetDescription>
                  </div>
                  <Switch
                    id="status-toggle-header"
                    checked={selectedRecommendation.status === 'published'}
                    onCheckedChange={() =>
                      handleToggleStatus(
                        selectedRecommendation._id,
                        selectedRecommendation.status
                      )
                    }
                  />
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="related">Related Content</TabsTrigger>
                  <TabsTrigger value="citations">Citations</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Recommendation Statement</Label>
                    <p className="text-sm">{selectedRecommendation.recommendationStatement}</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Description</Label>
                    <p className="text-sm text-muted-foreground">{selectedRecommendation.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <div>
                        <Badge>{selectedRecommendation.category.replace(/-/g, ' ')}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <div>
                        <Badge className={getPriorityColor(selectedRecommendation.priority)}>
                          {selectedRecommendation.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div>
                        <Badge variant={selectedRecommendation.status === 'published' ? 'default' : 'secondary'}>
                          {selectedRecommendation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Audience</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecommendation.audience.map((aud) => (
                        <Badge key={aud} variant="secondary">
                          {aud.replace(/-/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Keywords Section */}
                  {(selectedRecommendation.primaryKeywords.length > 0 ||
                    selectedRecommendation.recommendationKeywords.length > 0 ||
                    selectedRecommendation.solutionKeywords.length > 0) && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Keywords</Label>

                        {selectedRecommendation.primaryKeywords.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm">Primary Keywords</Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedRecommendation.primaryKeywords.map((keyword, idx) => (
                                <Badge key={idx} variant="default">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedRecommendation.recommendationKeywords.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm">Recommendation Keywords</Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedRecommendation.recommendationKeywords.map((keyword, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedRecommendation.solutionKeywords.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm">Solution Keywords</Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedRecommendation.solutionKeywords.map((keyword, idx) => (
                                <Badge key={idx} variant="outline">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Timestamps</Label>
                    <div className="rounded-md border p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(selectedRecommendation.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{new Date(selectedRecommendation.updatedAt).toLocaleString()}</span>
                      </div>
                      {selectedRecommendation.datePublished && (
                        <div className="mt-2 flex justify-between">
                          <span className="text-muted-foreground">Published:</span>
                          <span>{new Date(selectedRecommendation.datePublished).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedRecommendation.dateModified && (
                        <div className="mt-2 flex justify-between">
                          <span className="text-muted-foreground">Modified:</span>
                          <span>{new Date(selectedRecommendation.dateModified).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Why This Matters</Label>
                    <p className="text-sm text-muted-foreground">{selectedRecommendation.whyThisMatters}</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">When to Apply</Label>
                    <p className="text-sm text-muted-foreground">{selectedRecommendation.whenToApply}</p>
                  </div>

                  {selectedRecommendation.implementationGuidance && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Implementation Guidance</Label>
                        <div className="rounded-md border bg-gray-50 p-4 text-sm dark:bg-gray-900">
                          <pre className="whitespace-pre-wrap">{selectedRecommendation.implementationGuidance}</pre>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Related Content Tab */}
                <TabsContent value="related" className="space-y-4">
                  {selectedRecommendation.relatedWorkflows.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Related Workflows ({selectedRecommendation.relatedWorkflows.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecommendation.relatedWorkflows.map((workflow) => (
                          <Badge key={workflow} variant="default">
                            {workflow}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRecommendation.relatedGuardrails.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Related Guardrails ({selectedRecommendation.relatedGuardrails.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecommendation.relatedGuardrails.map((guardrail) => (
                          <Badge key={guardrail} variant="secondary">
                            {guardrail}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRecommendation.relatedPainPoints.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Related Pain Points ({selectedRecommendation.relatedPainPoints.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecommendation.relatedPainPoints.map((painPoint) => (
                          <Badge key={painPoint} variant="destructive">
                            {painPoint}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRecommendation.relatedPrompts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Related Prompts ({selectedRecommendation.relatedPrompts.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecommendation.relatedPrompts.map((prompt) => (
                          <Badge key={prompt} variant="outline">
                            {prompt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRecommendation.relatedPatterns.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Related Patterns ({selectedRecommendation.relatedPatterns.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecommendation.relatedPatterns.map((pattern) => (
                          <Badge key={pattern} className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRecommendation.relatedWorkflows.length === 0 &&
                    selectedRecommendation.relatedGuardrails.length === 0 &&
                    selectedRecommendation.relatedPainPoints.length === 0 &&
                    selectedRecommendation.relatedPrompts.length === 0 &&
                    selectedRecommendation.relatedPatterns.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground">
                        No related content found
                      </div>
                    )}
                </TabsContent>

                {/* Citations Tab */}
                <TabsContent value="citations" className="space-y-4">
                  {selectedRecommendation.researchCitations.length > 0 ? (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">
                        Research Citations ({selectedRecommendation.researchCitations.length})
                      </Label>
                      {selectedRecommendation.researchCitations.map((citation, idx) => (
                        <div key={idx} className="rounded-md border p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="font-medium">{citation.source}</div>
                            {citation.verified && (
                              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
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
                              className="text-sm text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
                            >
                              {citation.url}
                              <Icons.externalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No research citations found
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
