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
import type { Workflow } from '@/lib/workflows/workflow-schema';

interface WorkflowWithMetadata extends Workflow {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export function WorkflowManagementPanel() {
  const [workflows, setWorkflows] = useState<WorkflowWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowWithMetadata | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(100);

  useEffect(() => {
    fetchWorkflows();
  }, [currentPage, pageSize]);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/workflows?page=${currentPage}&limit=${pageSize}`);
      const data = await res.json();

      if (data.success) {
        setWorkflows(data.workflows);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (
    workflowId: string,
    currentStatus: string
  ) => {
    try {
      // Toggle between published and draft
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';

      const res = await fetch(`/api/admin/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchWorkflows();
        if (selectedWorkflow?._id === workflowId) {
          setSelectedWorkflow({ ...selectedWorkflow, status: newStatus as 'draft' | 'published' | 'coming_soon' });
        }
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleView = (workflow: WorkflowWithMetadata) => {
    setSelectedWorkflow(workflow);
    setIsDrawerOpen(true);
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    // Filter by category
    if (categoryFilter !== 'all' && workflow.category !== categoryFilter) return false;

    // Filter by status
    if (statusFilter !== 'all' && workflow.status !== statusFilter) return false;

    // Filter by audience
    if (audienceFilter !== 'all' && !workflow.audience.includes(audienceFilter as any)) return false;

    // Filter by search (title or slug)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        workflow.title.toLowerCase().includes(search) ||
        workflow.slug.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // Calculate stats
  const stats = {
    total: totalCount,
    published: workflows.filter((w) => w.status === 'published').length,
    draft: workflows.filter((w) => w.status === 'draft').length,
    comingSoon: workflows.filter((w) => w.status === 'coming_soon').length,
  };

  // Calculate category breakdown
  const categoryStats = workflows.reduce((acc, workflow) => {
    acc[workflow.category] = (acc[workflow.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
            <CardDescription className="text-xs">Coming Soon</CardDescription>
            <CardTitle className="text-4xl font-bold text-blue-600">
              {stats.comingSoon}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">By Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryStats).map(([category, count]) => (
              <Badge key={category} variant="secondary">
                {category}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Library ({filteredWorkflows.length})</CardTitle>
          <CardDescription>
            Manage all workflows, toggle status, and review content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] bg-white dark:bg-gray-800"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ai-behavior">AI Behavior</SelectItem>
                <SelectItem value="code-quality">Code Quality</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="enablement">Enablement</SelectItem>
                <SelectItem value="governance">Governance</SelectItem>
                <SelectItem value="guardrails">Guardrails</SelectItem>
                <SelectItem value="memory">Memory</SelectItem>
                <SelectItem value="process">Process</SelectItem>
                <SelectItem value="risk-management">Risk Management</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="analysts">Analysts</SelectItem>
                <SelectItem value="architects">Architects</SelectItem>
                <SelectItem value="engineering-managers">Engineering Managers</SelectItem>
                <SelectItem value="engineers">Engineers</SelectItem>
                <SelectItem value="executives">Executives</SelectItem>
                <SelectItem value="platform">Platform</SelectItem>
                <SelectItem value="product-managers">Product Managers</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading workflows...
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No workflows found
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
                    <TableHead className="font-semibold text-center">Checklist</TableHead>
                    <TableHead className="font-semibold">Updated</TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows.map((workflow) => (
                    <TableRow
                      key={workflow._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell>
                        <Switch
                          checked={workflow.status === 'published'}
                          onCheckedChange={() =>
                            handleToggleStatus(
                              workflow._id,
                              workflow.status
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleView(workflow)}
                          className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                        >
                          {workflow.title}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{workflow.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {workflow.audience.slice(0, 2).map((aud) => (
                            <Badge key={aud} variant="secondary" className="text-xs">
                              {aud}
                            </Badge>
                          ))}
                          {workflow.audience.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{workflow.audience.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {workflow.manualChecklist.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(workflow.updatedAt).toLocaleDateString('en-US', {
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
                          onClick={() => handleView(workflow)}
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
          {!loading && filteredWorkflows.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} workflows
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
          {selectedWorkflow && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <SheetTitle>{selectedWorkflow.title}</SheetTitle>
                    <SheetDescription>
                      Slug: {selectedWorkflow.slug}
                    </SheetDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="status-toggle-header" className="text-sm">
                      {selectedWorkflow.status === 'published' ? 'Published' : 'Draft'}
                    </Label>
                    <Switch
                      id="status-toggle-header"
                      checked={selectedWorkflow.status === 'published'}
                      onCheckedChange={() =>
                        handleToggleStatus(
                          selectedWorkflow._id,
                          selectedWorkflow.status
                        )
                      }
                    />
                  </div>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="citations">Citations</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Title</Label>
                    <p className="text-sm">{selectedWorkflow.title}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Slug</Label>
                    <p className="text-sm font-mono text-muted-foreground">{selectedWorkflow.slug}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <div><Badge>{selectedWorkflow.category}</Badge></div>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div>
                        <Badge
                          variant={
                            selectedWorkflow.status === 'published'
                              ? 'default'
                              : selectedWorkflow.status === 'coming_soon'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {selectedWorkflow.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Audience</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedWorkflow.audience.map((aud) => (
                        <Badge key={aud} variant="secondary">
                          {aud}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Problem Statement</Label>
                    <p className="text-sm text-muted-foreground">{selectedWorkflow.problemStatement}</p>
                  </div>

                  {selectedWorkflow.automationTeaser && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Automation Teaser</Label>
                      <p className="text-sm text-muted-foreground">{selectedWorkflow.automationTeaser}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Checklist Tab */}
                <TabsContent value="checklist" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Manual Checklist ({selectedWorkflow.manualChecklist.length} items)
                    </Label>
                    <ol className="list-decimal space-y-2 pl-5 text-sm">
                      {selectedWorkflow.manualChecklist.map((item, idx) => (
                        <li key={idx} className="text-muted-foreground">{item}</li>
                      ))}
                    </ol>
                  </div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-4">
                  {selectedWorkflow.relatedResources.prompts && selectedWorkflow.relatedResources.prompts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Related Prompts</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflow.relatedResources.prompts.map((prompt, idx) => (
                          <Badge key={idx} variant="outline">
                            {prompt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedWorkflow.relatedResources.patterns && selectedWorkflow.relatedResources.patterns.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Related Patterns</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflow.relatedResources.patterns.map((pattern, idx) => (
                          <Badge key={idx} variant="outline">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedWorkflow.relatedResources.learn && selectedWorkflow.relatedResources.learn.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Learn Resources</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflow.relatedResources.learn.map((learn, idx) => (
                          <Badge key={idx} variant="outline">
                            {learn}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedWorkflow.relatedResources.adjacentWorkflows && selectedWorkflow.relatedResources.adjacentWorkflows.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Adjacent Workflows</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflow.relatedResources.adjacentWorkflows.map((workflow, idx) => (
                          <Badge key={idx} variant="secondary">
                            {workflow}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {selectedWorkflow.painPointIds && selectedWorkflow.painPointIds.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Pain Point IDs</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflow.painPointIds.map((id, idx) => (
                          <Badge key={idx} variant="outline" className="font-mono text-xs">
                            {id}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedWorkflow.painPointKeywords && selectedWorkflow.painPointKeywords.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Pain Point Keywords</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflow.painPointKeywords.map((keyword, idx) => (
                          <Badge key={idx} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Citations Tab */}
                <TabsContent value="citations" className="space-y-4">
                  {selectedWorkflow.researchCitations && selectedWorkflow.researchCitations.length > 0 ? (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">
                        Research Citations ({selectedWorkflow.researchCitations.length})
                      </Label>
                      {selectedWorkflow.researchCitations.map((citation, idx) => (
                        <div key={idx} className="space-y-2 rounded-md border p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-medium">{citation.source}</div>
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
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No research citations available
                    </div>
                  )}
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced" className="space-y-4">
                  {selectedWorkflow.seoStrategy && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">SEO Strategy</Label>
                      <div className="rounded-md border p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Pain Point Focus</div>
                          <p className="text-sm text-muted-foreground">
                            {selectedWorkflow.seoStrategy.painPointFocus}
                          </p>
                        </div>

                        {selectedWorkflow.seoStrategy.keywordPhrases && selectedWorkflow.seoStrategy.keywordPhrases.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Keyword Phrases</div>
                            <div className="flex flex-wrap gap-2">
                              {selectedWorkflow.seoStrategy.keywordPhrases.map((keyword, idx) => (
                                <Badge key={idx} variant="outline">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Measurement Plan</div>
                          <p className="text-sm text-muted-foreground">
                            {selectedWorkflow.seoStrategy.measurementPlan}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedWorkflow.eEatSignals && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">E-E-A-T Signals</Label>
                      <div className="rounded-md border p-3 space-y-3">
                        {selectedWorkflow.eEatSignals.experience && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Experience</div>
                            <p className="text-sm text-muted-foreground">
                              {selectedWorkflow.eEatSignals.experience}
                            </p>
                          </div>
                        )}
                        {selectedWorkflow.eEatSignals.expertise && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Expertise</div>
                            <p className="text-sm text-muted-foreground">
                              {selectedWorkflow.eEatSignals.expertise}
                            </p>
                          </div>
                        )}
                        {selectedWorkflow.eEatSignals.authoritativeness && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Authoritativeness</div>
                            <p className="text-sm text-muted-foreground">
                              {selectedWorkflow.eEatSignals.authoritativeness}
                            </p>
                          </div>
                        )}
                        {selectedWorkflow.eEatSignals.trustworthiness && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Trustworthiness</div>
                            <p className="text-sm text-muted-foreground">
                              {selectedWorkflow.eEatSignals.trustworthiness}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedWorkflow.cta && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Call to Action</Label>
                      <div className="rounded-md border p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge>{selectedWorkflow.cta.type}</Badge>
                          <span className="font-medium">{selectedWorkflow.cta.label}</span>
                        </div>
                        {selectedWorkflow.cta.href && (
                          <div className="text-sm text-muted-foreground">
                            URL: {selectedWorkflow.cta.href}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Guardrail-specific fields */}
                  {selectedWorkflow.category === 'guardrails' && (
                    <>
                      {selectedWorkflow.subcategory && (
                        <div className="space-y-2">
                          <Label className="text-base font-semibold">Guardrail Subcategory</Label>
                          <div><Badge variant="outline">{selectedWorkflow.subcategory}</Badge></div>
                        </div>
                      )}

                      {selectedWorkflow.severity && (
                        <div className="space-y-2">
                          <Label className="text-base font-semibold">Severity</Label>
                          <div>
                            <Badge
                              variant={
                                selectedWorkflow.severity === 'critical'
                                  ? 'destructive'
                                  : selectedWorkflow.severity === 'high'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {selectedWorkflow.severity}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {selectedWorkflow.earlyDetection && (
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Early Detection</Label>
                          <div className="rounded-md border p-3 space-y-2">
                            {selectedWorkflow.earlyDetection.cicd && (
                              <div className="space-y-1">
                                <div className="text-sm font-medium">CI/CD</div>
                                <p className="text-sm text-muted-foreground">
                                  {selectedWorkflow.earlyDetection.cicd}
                                </p>
                              </div>
                            )}
                            {selectedWorkflow.earlyDetection.static && (
                              <div className="space-y-1">
                                <div className="text-sm font-medium">Static Analysis</div>
                                <p className="text-sm text-muted-foreground">
                                  {selectedWorkflow.earlyDetection.static}
                                </p>
                              </div>
                            )}
                            {selectedWorkflow.earlyDetection.runtime && (
                              <div className="space-y-1">
                                <div className="text-sm font-medium">Runtime</div>
                                <p className="text-sm text-muted-foreground">
                                  {selectedWorkflow.earlyDetection.runtime}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedWorkflow.mitigation && selectedWorkflow.mitigation.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-base font-semibold">Mitigation Steps</Label>
                          <ol className="list-decimal space-y-1 pl-5 text-sm">
                            {selectedWorkflow.mitigation.map((step, idx) => (
                              <li key={idx} className="text-muted-foreground">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Timestamps</Label>
                    <div className="rounded-md border p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(selectedWorkflow.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{new Date(selectedWorkflow.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
