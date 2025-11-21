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
import { useAdminData } from '@/hooks/opshub/useAdminData';
import { useAdminToast } from '@/hooks/opshub/useAdminToast';
import { useDebouncedValue } from '@/hooks/opshub/useDebouncedValue';
import { AdminPaginationControls } from '@/components/opshub/panels/shared/AdminPaginationControls';
import { AdminStatsCard } from '@/components/opshub/panels/shared/AdminStatsCard';
import { AdminDataTable, type ColumnDef } from '@/components/opshub/panels/shared/AdminDataTable';
import { AdminTableSkeleton } from '@/components/opshub/panels/shared/AdminTableSkeleton';
import { AdminEmptyState } from '@/components/opshub/panels/shared/AdminEmptyState';
import { AdminErrorBoundary } from '@/components/opshub/panels/shared/AdminErrorBoundary';
import { formatAdminDate, calculateStats } from '@/lib/opshub/utils';
import { clientLogger } from '@/lib/logging/client-logger';
import { applyFilters } from '@/lib/opshub/utils';

interface Prompt {
  _id: string;
  id: string;
  slug?: string;
  title: string;
  description?: string;
  content: string;
  category: string;
  role?: string;
  experienceLevel?: string;
  pattern?: string;
  designPattern?: string;
  tags: string[];
  active?: boolean;
  source?: string;
  qualityScore?: {
    overall: number;
    clarity?: number;
    usefulness?: number;
    specificity?: number;
    completeness?: number;
    examples?: number;
    reviewedBy?: string;
    reviewedAt?: string;
    notes?: string;
  };
  currentRevision?: number;
  lastRevisedBy?: string;
  lastRevisedAt?: string;
  whatIs?: string;
  whyUse?: string[];
  metaDescription?: string;
  seoKeywords?: string[];
  examples?: Array<{
    title?: string;
    input?: string;
    output?: string;
    expectedOutput?: string;
    description?: string;
  }>;
  useCases?: string[];
  caseStudies?: Array<{
    title: string;
    scenario?: string;
    context?: string;
    challenge?: string;
    solution?: string;
    outcome?: string;
  }>;
  bestPractices?: string[];
  bestTimeToUse?: string | string[];
  whenNotToUse?: string[];
  recommendedModel?: Array<{
    model: string;
    provider?: string;
    reason?: string;
    useCase?: string;
  }>;
  difficulty?: string | number;
  estimatedTime?: string | number;
  verified?: boolean;
  isPremium?: boolean;
  requiresAuth?: boolean;
  parameters?: Array<{
    id: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
    description?: string;
    example?: string;
    defaultValue?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * PromptManagementPanel Component
 * 
 * Admin panel for managing prompts, including viewing, filtering, searching,
 * and editing prompt entries. Provides comprehensive prompt management with
 * filtering by status and search functionality.
 * 
 * @component
 * @pattern ADMIN_PANEL, CRUD_INTERFACE
 * @principle DRY - Uses shared hooks and utilities
 * 
 * @features
 * - Prompt listing with filtering
 * - Search functionality
 * - Filter by status (all, active, inactive, ai-generated)
 * - Edit and view prompts in drawer
 * - Prompt statistics display
 * 
 * @example
 * ```tsx
 * <PromptManagementPanel />
 * ```
 * 
 * @usage
 * Used in OpsHub admin center for managing prompt entries.
 * Provides a complete interface for prompt management.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 * 
 * @function PromptManagementPanel
 */
export function PromptManagementPanel() {
  const [filter, setFilter] = useState<string>('all'); // all, active, inactive, ai-generated
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Debounce search input to reduce API calls
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Toast notifications for user feedback
  const { success, error: showError } = useAdminToast();

  const {
    data: prompts,
    loading,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    refresh,
  } = useAdminData<Prompt>({
    endpoint: '/api/admin/prompts',
    pageSize: 100,
    dataKey: 'prompts'
  });

  const handleToggleActive = async (
    promptId: string,
    currentActive: boolean
  ) => {
    try {
      const res = await fetch(`/api/admin/prompts/${promptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (res.ok) {
        refresh();
        success(
          'Status updated',
          `Prompt ${!currentActive ? 'activated' : 'deactivated'} successfully`
        );
        if (selectedPrompt?._id === promptId) {
          setSelectedPrompt({ ...selectedPrompt, active: !currentActive });
        }
      } else {
        showError('Failed to update status', 'Please try again');
      }
    } catch (err) {
      clientLogger.apiError(`/api/admin/prompts/${promptId}`, err, {
        component: 'PromptManagementPanel',
        action: 'toggleActive',
        promptId,
      });
      showError('Network error', 'Unable to connect to server');
    }
  };

  const handleView = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDrawerOpen(true);
  };

  // Column definitions for AdminDataTable
  const columns: ColumnDef<Prompt>[] = [
    {
      id: 'title',
      label: 'Title',
      width: 'w-[300px]',
      render: (prompt) => (
        <button
          onClick={() => handleView(prompt)}
          className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400"
        >
          {prompt.title}
        </button>
      ),
      cellClassName: 'font-medium'
    },
    {
      id: 'category',
      label: 'Category',
      render: (prompt) => <Badge variant="outline">{prompt.category}</Badge>
    },
    {
      id: 'source',
      label: 'Source',
      render: (prompt) => (
        <Badge variant="outline">
          {prompt.source || (prompt.id.startsWith('generated-') ? 'ai-generated' : 'seed')}
        </Badge>
      )
    },
    {
      id: 'score',
      label: 'Score',
      render: (prompt) =>
        prompt.qualityScore?.overall ? (
          <span className="font-medium">
            {prompt.qualityScore.overall.toFixed(1)}/10
          </span>
        ) : (
          <span className="text-gray-400">N/A</span>
        )
    },
    {
      id: 'revision',
      label: 'Rev.',
      render: (prompt) => (
        <Badge variant="secondary">v{prompt.currentRevision || 1}</Badge>
      )
    },
    {
      id: 'updated',
      label: 'Updated',
      render: (prompt) => (
        <span className="text-sm text-muted-foreground">
          {formatAdminDate(prompt.updatedAt)}
        </span>
      )
    }
  ];

  // Use shared filtering utilities to reduce duplication
  const filteredPrompts = useMemo(() => {
    const predicates: Array<{ type: 'exact' | 'contains' | 'startsWith' | 'custom'; field?: keyof Prompt; value?: any; predicate?: (item: Prompt) => boolean }> = [];

    // Filter by status
    if (filter === 'active') {
      predicates.push({ type: 'custom', predicate: (p) => p.active !== false });
    } else if (filter === 'inactive') {
      predicates.push({ type: 'custom', predicate: (p) => p.active === false });
    } else if (filter === 'ai-generated') {
      predicates.push({ type: 'custom', predicate: (p) => p.id.startsWith('generated-') });
    }

    return applyFilters(
      prompts,
      { predicates: predicates as any },
      debouncedSearch || undefined,
      ['title', 'id']
    );
  }, [prompts, filter, debouncedSearch]);

  const stats = useMemo(() => calculateStats(prompts, [
    { key: 'total', calculate: () => totalCount },
    { key: 'active', calculate: (items) => items.filter(p => p.active !== false).length },
    { key: 'inactive', calculate: (items) => items.filter(p => p.active === false).length },
    { key: 'aiGenerated', calculate: (items) => items.filter(p => p.id.startsWith('generated-')).length },
    { key: 'unscored', calculate: (items) => items.filter(p => !p.qualityScore).length },
  ]), [prompts, totalCount]);

  return (
    <AdminErrorBoundary onError={(err) => clientLogger.componentError('PromptManagementPanel', err)}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <AdminStatsCard label="Total" value={stats.total} />
          <AdminStatsCard label="Active" value={stats.active} variant="green" />
          <AdminStatsCard label="Inactive" value={stats.inactive} variant="gray" />
          <AdminStatsCard label="AI-Generated" value={stats.aiGenerated} variant="purple" />
          <AdminStatsCard label="Unscored" value={stats.unscored} variant="orange" />
        </div>

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Prompt Library ({filteredPrompts.length})</CardTitle>
            <CardDescription>
              Manage all prompts, toggle active status, and review quality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Search prompts..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800"
              />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prompts</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="ai-generated">AI-Generated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table with new components */}
            {loading ? (
              <AdminTableSkeleton rows={5} columns={7} />
            ) : filteredPrompts.length === 0 ? (
              <AdminEmptyState
                icon={<Icons.search className="h-12 w-12 text-muted-foreground" />}
                title="No prompts found"
                description="Try adjusting your search or filters"
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    setFilter('all');
                    setSearchInput('');
                  }
                }}
              />
            ) : (
              <AdminDataTable
                data={filteredPrompts}
                columns={columns}
                statusField="active"
                onStatusToggle={handleToggleActive}
                renderRowActions={(prompt) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(prompt)}
                  >
                    <Icons.eye className="h-4 w-4" />
                  </Button>
                )}
                onRowClick={handleView}
              />
            )}

            {/* Pagination Controls */}
            {!loading && filteredPrompts.length > 0 && (
              <AdminPaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={100}
                onPageChange={goToPage}
                itemName="prompts"
              />
            )}
          </CardContent>
        </Card>

      {/* Preview Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[800px] overflow-y-auto sm:max-w-[800px]">
          {selectedPrompt && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <SheetTitle>{selectedPrompt.title}</SheetTitle>
                    <SheetDescription>
                      ID: {selectedPrompt.id} | Revision: v{selectedPrompt.currentRevision || 1}
                      {selectedPrompt.verified && <Badge className="ml-2" variant="default">Verified</Badge>}
                      {selectedPrompt.isPremium && <Badge className="ml-2" variant="secondary">Premium</Badge>}
                    </SheetDescription>
                  </div>
                  <Switch
                    id="active-toggle-header"
                    checked={selectedPrompt.active !== false}
                    onCheckedChange={() =>
                      handleToggleActive(
                        selectedPrompt._id,
                        selectedPrompt.active !== false
                      )
                    }
                  />
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  {/* Description */}
                  {selectedPrompt.description && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Description</Label>
                      <p className="text-sm text-muted-foreground">{selectedPrompt.description}</p>
                    </div>
                  )}

                  {selectedPrompt.whatIs && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">What Is It?</Label>
                      <p className="text-sm text-muted-foreground">{selectedPrompt.whatIs}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <div><Badge>{selectedPrompt.category}</Badge></div>
                    </div>

                    <div className="space-y-2">
                      <Label>Source</Label>
                      <div><Badge variant="outline">
                        {selectedPrompt.source ||
                          (selectedPrompt.id.startsWith('generated-')
                            ? 'ai-generated'
                            : 'seed')}
                      </Badge></div>
                    </div>

                    {selectedPrompt.role && (
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <div><Badge variant="secondary">{selectedPrompt.role}</Badge></div>
                      </div>
                    )}

                    {selectedPrompt.experienceLevel && (
                      <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <div><Badge variant="secondary">{selectedPrompt.experienceLevel}</Badge></div>
                      </div>
                    )}

                    {selectedPrompt.pattern && (
                      <div className="space-y-2">
                        <Label>Pattern</Label>
                        <div><Badge variant="outline">{selectedPrompt.pattern}</Badge></div>
                      </div>
                    )}

                    {selectedPrompt.difficulty && (
                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <div><Badge>{String(selectedPrompt.difficulty)}</Badge></div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrompt.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedPrompt.whyUse && selectedPrompt.whyUse.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Why Use This?</Label>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {selectedPrompt.whyUse.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Prompt Content</Label>
                    <div className="rounded-md border bg-gray-50 p-4 text-sm dark:bg-gray-900">
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {selectedPrompt.content}
                      </pre>
                    </div>
                  </div>

                  {selectedPrompt.examples && selectedPrompt.examples.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Examples</Label>
                      {selectedPrompt.examples.map((example, idx) => (
                        <div key={idx} className="space-y-2 rounded-md border p-3">
                          {example.title && <div className="font-medium">{example.title}</div>}
                          {example.description && (
                            <p className="text-sm text-muted-foreground">{example.description}</p>
                          )}
                          {example.input && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Input:</div>
                              <div className="rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                                {example.input}
                              </div>
                            </div>
                          )}
                          {(example.output || example.expectedOutput) && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Output:</div>
                              <div className="rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                                {example.output || example.expectedOutput}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedPrompt.caseStudies && selectedPrompt.caseStudies.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Case Studies</Label>
                      {selectedPrompt.caseStudies.map((study, idx) => (
                        <div key={idx} className="space-y-2 rounded-md border p-3">
                          <div className="font-medium">{study.title}</div>
                          {study.context && <p className="text-sm text-muted-foreground">{study.context}</p>}
                          {study.challenge && (
                            <div>
                              <span className="text-xs font-medium">Challenge: </span>
                              <span className="text-sm">{study.challenge}</span>
                            </div>
                          )}
                          {study.solution && (
                            <div>
                              <span className="text-xs font-medium">Solution: </span>
                              <span className="text-sm">{study.solution}</span>
                            </div>
                          )}
                          {study.outcome && (
                            <div>
                              <span className="text-xs font-medium">Outcome: </span>
                              <span className="text-sm">{study.outcome}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Metadata Tab */}
                <TabsContent value="metadata" className="space-y-4">
                  {selectedPrompt.qualityScore && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Quality Score</Label>
                      <div className="rounded-md border p-4">
                        <div className="mb-3 text-3xl font-bold">
                          {selectedPrompt.qualityScore.overall.toFixed(1)}/10
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {selectedPrompt.qualityScore.clarity && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Clarity:</span>
                              <span className="font-medium">{selectedPrompt.qualityScore.clarity}/10</span>
                            </div>
                          )}
                          {selectedPrompt.qualityScore.usefulness && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Usefulness:</span>
                              <span className="font-medium">{selectedPrompt.qualityScore.usefulness}/10</span>
                            </div>
                          )}
                          {selectedPrompt.qualityScore.specificity && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Specificity:</span>
                              <span className="font-medium">{selectedPrompt.qualityScore.specificity}/10</span>
                            </div>
                          )}
                          {selectedPrompt.qualityScore.completeness && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Completeness:</span>
                              <span className="font-medium">{selectedPrompt.qualityScore.completeness}/10</span>
                            </div>
                          )}
                          {selectedPrompt.qualityScore.examples && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Examples:</span>
                              <span className="font-medium">{selectedPrompt.qualityScore.examples}/10</span>
                            </div>
                          )}
                        </div>
                        {selectedPrompt.qualityScore.reviewedBy && (
                          <div className="mt-3 text-xs text-muted-foreground">
                            Reviewed by {selectedPrompt.qualityScore.reviewedBy}
                            {selectedPrompt.qualityScore.reviewedAt &&
                              ` on ${new Date(selectedPrompt.qualityScore.reviewedAt).toLocaleDateString()}`
                            }
                          </div>
                        )}
                        {selectedPrompt.qualityScore.notes && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-muted-foreground">Notes:</div>
                            <p className="text-sm">{selectedPrompt.qualityScore.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Revision History</Label>
                    <div className="rounded-md border p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Revision:</span>
                        <Badge variant="secondary">v{selectedPrompt.currentRevision || 1}</Badge>
                      </div>
                      {selectedPrompt.lastRevisedBy && (
                        <div className="mt-2 flex justify-between">
                          <span className="text-muted-foreground">Last Revised By:</span>
                          <span className="font-medium">{selectedPrompt.lastRevisedBy}</span>
                        </div>
                      )}
                      {selectedPrompt.lastRevisedAt && (
                        <div className="mt-2 flex justify-between">
                          <span className="text-muted-foreground">Last Revised:</span>
                          <span>{new Date(selectedPrompt.lastRevisedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Timestamps</Label>
                    <div className="rounded-md border p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(selectedPrompt.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{new Date(selectedPrompt.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedPrompt.seoKeywords && selectedPrompt.seoKeywords.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">SEO Keywords</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPrompt.seoKeywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced" className="space-y-4">
                  {selectedPrompt.useCases && selectedPrompt.useCases.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Use Cases</Label>
                      <ul className="list-disc space-y-1 pl-5 text-sm">
                        {selectedPrompt.useCases.map((useCase, idx) => (
                          <li key={idx}>{useCase}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPrompt.bestPractices && selectedPrompt.bestPractices.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Best Practices</Label>
                      <ul className="list-disc space-y-1 pl-5 text-sm">
                        {selectedPrompt.bestPractices.map((practice, idx) => (
                          <li key={idx}>{practice}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPrompt.whenNotToUse && selectedPrompt.whenNotToUse.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">When NOT to Use</Label>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {selectedPrompt.whenNotToUse.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPrompt.recommendedModel && selectedPrompt.recommendedModel.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Recommended Models</Label>
                      <div className="space-y-2">
                        {selectedPrompt.recommendedModel.map((model, idx) => (
                          <div key={idx} className="rounded-md border p-3">
                            <div className="flex items-center gap-2">
                              <Badge>{model.model}</Badge>
                              {model.provider && <Badge variant="outline">{model.provider}</Badge>}
                            </div>
                            {model.reason && (
                              <p className="mt-2 text-sm text-muted-foreground">{model.reason}</p>
                            )}
                            {model.useCase && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Use case: {model.useCase}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPrompt.parameters && selectedPrompt.parameters.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Interactive Parameters</Label>
                      <div className="space-y-3">
                        {selectedPrompt.parameters.map((param, idx) => (
                          <div key={idx} className="rounded-md border p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{param.label}</span>
                              <Badge variant="outline" className="text-xs">{param.type}</Badge>
                              {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            </div>
                            {param.description && (
                              <p className="mt-1 text-sm text-muted-foreground">{param.description}</p>
                            )}
                            {param.options && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {param.options.map((opt, optIdx) => (
                                  <Badge key={optIdx} variant="secondary" className="text-xs">
                                    {opt}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPrompt.estimatedTime && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Estimated Time</Label>
                      <div className="text-sm">
                        {typeof selectedPrompt.estimatedTime === 'number'
                          ? `${selectedPrompt.estimatedTime} minutes`
                          : selectedPrompt.estimatedTime
                        }
                      </div>
                    </div>
                  )}
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
