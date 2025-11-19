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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { useAdminData } from '@/hooks/admin/useAdminData';
import { useAdminToast } from '@/hooks/admin/useAdminToast';
import { useDebouncedValue } from '@/hooks/admin/useDebouncedValue';
import { AdminPaginationControls } from '@/components/admin/shared/AdminPaginationControls';
import { AdminStatsCard } from '@/components/admin/shared/AdminStatsCard';
import { AdminDataTable, type ColumnDef } from '@/components/admin/shared/AdminDataTable';
import { AdminTableSkeleton } from '@/components/admin/shared/AdminTableSkeleton';
import { AdminEmptyState } from '@/components/admin/shared/AdminEmptyState';
import { AdminErrorBoundary } from '@/components/admin/shared/AdminErrorBoundary';
import { formatAdminDate, calculateStats } from '@/lib/admin/utils';

interface WorkflowWithMetadata extends Workflow {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export function WorkflowManagementPanel() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowWithMetadata | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Debounce search input to reduce API calls
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Toast notifications for user feedback
  const { success, error: showError } = useAdminToast();

  // Use the new useAdminData hook for data management
  const {
    data: workflows,
    loading,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    filters,
    setFilters,
    goToPage,
    refresh,
  } = useAdminData<WorkflowWithMetadata>({
    endpoint: '/api/admin/workflows',
    pageSize: 100,
    dataKey: 'workflows',
    initialFilters: { category: 'all', status: 'all', audience: 'all' }
  });

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
        refresh();
        success(
          'Status updated',
          `Workflow ${newStatus === 'published' ? 'published' : 'saved as draft'} successfully`
        );
        if (selectedWorkflow?._id === workflowId) {
          setSelectedWorkflow({ ...selectedWorkflow, status: newStatus as 'draft' | 'published' | 'coming_soon' });
        }
      } else {
        showError('Failed to update status', 'Please try again');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showError('Network error', 'Unable to connect to server');
    }
  };

  const handleView = (workflow: WorkflowWithMetadata) => {
    setSelectedWorkflow(workflow);
    setIsDrawerOpen(true);
  };

  // Column definitions for AdminDataTable
  const columns: ColumnDef<WorkflowWithMetadata>[] = [
    {
      id: 'title',
      label: 'Title',
      width: 'w-[300px]',
      render: (workflow) => (
        <button
          onClick={() => handleView(workflow)}
          className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400"
        >
          {workflow.title}
        </button>
      ),
      cellClassName: 'font-medium'
    },
    {
      id: 'category',
      label: 'Category',
      render: (workflow) => <Badge variant="outline">{workflow.category}</Badge>
    },
    {
      id: 'audience',
      label: 'Audience',
      render: (workflow) => (
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
      )
    },
    {
      id: 'checklist',
      label: 'Checklist Items',
      render: (workflow) => (
        <Badge variant="outline" className="text-center">
          {workflow.manualChecklist.length}
        </Badge>
      )
    },
    {
      id: 'updated',
      label: 'Updated',
      render: (workflow) => (
        <span className="text-sm text-muted-foreground">
          {formatAdminDate(workflow.updatedAt)}
        </span>
      )
    }
  ];

  const filteredWorkflows = workflows.filter((workflow) => {
    // Filter by category
    if (filters.category !== 'all' && workflow.category !== filters.category) return false;

    // Filter by status
    if (filters.status !== 'all' && workflow.status !== filters.status) return false;

    // Filter by audience
    if (filters.audience !== 'all' && !workflow.audience.includes(filters.audience as any)) return false;

    // Filter by search using debounced value
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      return (
        workflow.title.toLowerCase().includes(search) ||
        workflow.slug.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // Calculate stats using the utility function
  const stats = useMemo(() => calculateStats(workflows, [
    { key: 'total', calculate: () => totalCount },
    { key: 'published', calculate: (items) => items.filter(w => w.status === 'published').length },
    { key: 'draft', calculate: (items) => items.filter(w => w.status === 'draft').length },
    { key: 'comingSoon', calculate: (items) => items.filter(w => w.status === 'coming_soon').length },
  ]), [workflows, totalCount]);

  // Calculate category breakdown
  const categoryStats = workflows.reduce((acc, workflow) => {
    acc[workflow.category] = (acc[workflow.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminErrorBoundary onError={(err) => console.error('Workflow panel error:', err)}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <AdminStatsCard label="Total" value={stats.total} />
          <AdminStatsCard label="Published" value={stats.published} variant="green" />
          <AdminStatsCard label="Draft" value={stats.draft} variant="gray" />
          <AdminStatsCard label="Coming Soon" value={stats.comingSoon} variant="blue" />
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 min-w-[200px] bg-white dark:bg-gray-800"
              />
            <Select value={filters.category as string} onValueChange={(value) => setFilters({ category: value })}>
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
            <Select value={filters.status as string} onValueChange={(value) => setFilters({ status: value })}>
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
            <Select value={filters.audience as string} onValueChange={(value) => setFilters({ audience: value })}>
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

          {/* Table with new components */}
          {loading ? (
            <AdminTableSkeleton rows={5} columns={6} />
          ) : filteredWorkflows.length === 0 ? (
            <AdminEmptyState
              icon={<Icons.search className="h-12 w-12 text-muted-foreground" />}
              title="No workflows found"
              description="Try adjusting your search or filters"
              action={{
                label: "Clear filters",
                onClick: () => {
                  setFilters({ category: 'all', status: 'all', audience: 'all' });
                  setSearchInput('');
                }
              }}
            />
          ) : (
            <AdminDataTable
              data={filteredWorkflows}
              columns={columns}
              statusField="status"
              onStatusToggle={(id, currentStatus) => handleToggleStatus(id, currentStatus as string)}
              renderRowActions={(workflow) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleView(workflow)}
                >
                  <Icons.eye className="h-4 w-4" />
                </Button>
              )}
              onRowClick={handleView}
            />
          )}

          {/* Pagination Controls */}
          {!loading && filteredWorkflows.length > 0 && (
            <AdminPaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={goToPage}
              itemName="workflows"
            />
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
                        <span>{formatAdminDate(selectedWorkflow.createdAt)}</span>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{formatAdminDate(selectedWorkflow.updatedAt)}</span>
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
    </AdminErrorBoundary>
  );
}
