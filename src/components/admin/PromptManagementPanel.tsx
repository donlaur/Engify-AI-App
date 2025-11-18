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

export function PromptManagementPanel() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all'); // all, active, inactive, ai-generated
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(100); // Max allowed by API

  useEffect(() => {
    fetchPrompts();
  }, [currentPage, pageSize]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      // Fetch from admin endpoint with pagination
      const res = await fetch(`/api/admin/prompts?page=${currentPage}&limit=${pageSize}`);
      const data = await res.json();

      if (data.success) {
        setPrompts(data.prompts);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  };

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
        fetchPrompts();
        if (selectedPrompt?._id === promptId) {
          setSelectedPrompt({ ...selectedPrompt, active: !currentActive });
        }
      }
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const handleView = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDrawerOpen(true);
  };

  const filteredPrompts = prompts.filter((prompt) => {
    // Filter by status
    if (filter === 'active' && prompt.active === false) return false;
    if (filter === 'inactive' && prompt.active !== false) return false;
    if (filter === 'ai-generated' && !prompt.id.startsWith('generated-'))
      return false;

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        prompt.title.toLowerCase().includes(search) ||
        prompt.id.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const stats = {
    total: totalCount, // Use total from API pagination
    active: prompts.filter((p) => p.active !== false).length,
    inactive: prompts.filter((p) => p.active === false).length,
    aiGenerated: prompts.filter((p) => p.id.startsWith('generated-')).length,
    unscored: prompts.filter((p) => !p.qualityScore).length,
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
            <CardDescription className="text-xs">Active</CardDescription>
            <CardTitle className="text-4xl font-bold text-green-600">
              {stats.active}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Inactive</CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-400">
              {stats.inactive}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">AI-Generated</CardDescription>
            <CardTitle className="text-4xl font-bold text-purple-600">
              {stats.aiGenerated}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Unscored</CardDescription>
            <CardTitle className="text-4xl font-bold text-orange-600">
              {stats.unscored}
            </CardTitle>
          </CardHeader>
        </Card>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Table */}
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading prompts...
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No prompts found
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
                    <TableHead className="font-semibold">Source</TableHead>
                    <TableHead className="font-semibold">Score</TableHead>
                    <TableHead className="font-semibold">Rev.</TableHead>
                    <TableHead className="font-semibold">Updated</TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrompts.map((prompt) => (
                    <TableRow
                      key={prompt._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell>
                        <Switch
                          checked={prompt.active !== false}
                          onCheckedChange={() =>
                            handleToggleActive(
                              prompt._id,
                              prompt.active !== false
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleView(prompt)}
                          className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                        >
                          {prompt.title}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{prompt.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {prompt.source ||
                          (prompt.id.startsWith('generated-')
                            ? 'ai-generated'
                            : 'seed')}
                      </TableCell>
                      <TableCell>
                        {prompt.qualityScore?.overall ? (
                          <span className="font-medium">
                            {prompt.qualityScore.overall.toFixed(1)}/10
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          v{prompt.currentRevision || 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(prompt.updatedAt).toLocaleDateString('en-US', {
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
                          onClick={() => handleView(prompt)}
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
          {!loading && filteredPrompts.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} prompts
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
  );
}
