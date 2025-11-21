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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useAdminData } from '@/hooks/opshub/useAdminData';
import { useAdminToast } from '@/hooks/opshub/useAdminToast';
import { useDebouncedValue } from '@/hooks/opshub/useDebouncedValue';
import { AdminDataTable, type ColumnDef } from '@/components/opshub/panels/shared/AdminDataTable';
import { AdminTableSkeleton } from '@/components/opshub/panels/shared/AdminTableSkeleton';
import { AdminEmptyState } from '@/components/opshub/panels/shared/AdminEmptyState';
import { AdminErrorBoundary } from '@/components/opshub/panels/shared/AdminErrorBoundary';
import { AdminPaginationControls } from '@/components/opshub/panels/shared/AdminPaginationControls';
import { AdminStatsCard } from '@/components/opshub/panels/shared/AdminStatsCard';

interface Pattern {
  _id: string;
  id: string;
  name: string;
  category: 'FOUNDATIONAL' | 'STRUCTURAL' | 'COGNITIVE' | 'ITERATIVE';
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  example?: string;
  useCases?: string[];
  relatedPatterns?: string[];
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export function PatternManagementPanel() {
  // Phase 1: Use useAdminData hook for data fetching and pagination
  const {
    data: patterns,
    loading,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    goToPage,
    refresh,
  } = useAdminData<Pattern>({
    endpoint: '/api/admin/patterns',
    pageSize: 10,
    dataKey: 'patterns',
  });

  // Toast notifications
  const { success, error: showError } = useAdminToast();

  // State management
  const [filter, setFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchInput, setSearchInput] = useState('');
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
  const [previewPattern, setPreviewPattern] = useState<Pattern | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Debounced search value
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const handleEdit = (pattern: Pattern) => {
    setEditingPattern(pattern);
    setIsCreating(false);
    setIsEditDialogOpen(true);
  };

  const handlePreview = (pattern: Pattern) => {
    setPreviewPattern(pattern);
    setIsPreviewOpen(true);
  };

  const handleCreate = () => {
    setEditingPattern({
      _id: '',
      id: '',
      name: '',
      category: 'FOUNDATIONAL',
      level: 'beginner',
      description: '',
      example: '',
      useCases: [],
      relatedPatterns: [],
      icon: 'lightbulb',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsCreating(true);
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingPattern) return;

    try {
      const method = isCreating ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/patterns', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPattern),
      });

      const data = await res.json();

      if (data.success) {
        setIsEditDialogOpen(false);
        refresh();
        success(
          isCreating ? 'Pattern created' : 'Pattern updated',
          isCreating
            ? 'The pattern has been created successfully'
            : 'The pattern has been updated successfully'
        );
      } else {
        showError('Save failed', data.error || 'Failed to save pattern');
      }
    } catch (err) {
      console.error('Failed to save pattern:', err);
      showError('Save failed', 'An unexpected error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pattern?')) return;

    try {
      const res = await fetch(`/api/admin/patterns?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        refresh();
        success('Pattern deleted', 'The pattern has been deleted successfully');
      } else {
        showError('Delete failed', data.error || 'Failed to delete pattern');
      }
    } catch (err) {
      console.error('Failed to delete pattern:', err);
      showError('Delete failed', 'An unexpected error occurred');
    }
  };

  // Filter patterns based on category, level, and search
  const filteredPatterns = useMemo(() => {
    return patterns.filter((pattern) => {
      // Filter by category
      if (filter !== 'all' && pattern.category !== filter) return false;

      // Filter by level
      if (levelFilter !== 'all' && pattern.level !== levelFilter) return false;

      // Filter by search
      if (debouncedSearch) {
        const search = debouncedSearch.toLowerCase();
        return (
          pattern.name.toLowerCase().includes(search) ||
          pattern.description.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [patterns, filter, levelFilter, debouncedSearch]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: totalCount,
    foundational: patterns.filter((p) => p.category === 'FOUNDATIONAL').length,
    structural: patterns.filter((p) => p.category === 'STRUCTURAL').length,
    cognitive: patterns.filter((p) => p.category === 'COGNITIVE').length,
    iterative: patterns.filter((p) => p.category === 'ITERATIVE').length,
  }), [patterns, totalCount]);

  // Column definitions for AdminDataTable
  const columns: ColumnDef<Pattern>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Name',
      width: 'w-[250px]',
      cellClassName: 'font-medium',
      render: (pattern) => (
        <button
          onClick={() => handlePreview(pattern)}
          className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400"
        >
          {pattern.name}
        </button>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      render: (pattern) => (
        <Badge variant="outline">{pattern.category}</Badge>
      ),
    },
    {
      id: 'level',
      label: 'Level',
      render: (pattern) => (
        <Badge
          variant={
            pattern.level === 'beginner'
              ? 'default'
              : pattern.level === 'intermediate'
                ? 'secondary'
                : 'default'
          }
        >
          {pattern.level}
        </Badge>
      ),
    },
    {
      id: 'id',
      label: 'ID',
      render: (pattern) => (
        <span className="text-sm text-muted-foreground">{pattern.id}</span>
      ),
    },
    {
      id: 'updated',
      label: 'Updated',
      render: (pattern) => (
        <span className="text-sm">
          {new Date(pattern.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ], []);

  return (
    <AdminErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Pattern Management
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage prompt engineering patterns
            </p>
          </div>
          <Button onClick={handleCreate} size="lg">
            <Icons.plus className="mr-2 h-4 w-4" />
            Create Pattern
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <AdminStatsCard label="Total" value={stats.total} />
          <AdminStatsCard label="Foundational" value={stats.foundational} variant="blue" />
          <AdminStatsCard label="Structural" value={stats.structural} variant="green" />
          <AdminStatsCard label="Cognitive" value={stats.cognitive} variant="purple" />
          <AdminStatsCard label="Iterative" value={stats.iterative} variant="orange" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search patterns..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-white dark:bg-gray-800"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="FOUNDATIONAL">Foundational</SelectItem>
              <SelectItem value="STRUCTURAL">Structural</SelectItem>
              <SelectItem value="COGNITIVE">Cognitive</SelectItem>
              <SelectItem value="ITERATIVE">Iterative</SelectItem>
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Patterns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patterns</CardTitle>
            <CardDescription>
              {filteredPatterns.length} patterns
              {searchInput && ` matching "${searchInput}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <AdminTableSkeleton rows={5} columns={5} />
            ) : filteredPatterns.length === 0 ? (
              <AdminEmptyState
                title="No patterns found"
                description={
                  searchInput || filter !== 'all' || levelFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first pattern to get started.'
                }
                action={
                  searchInput || filter !== 'all' || levelFilter !== 'all'
                    ? undefined
                    : {
                        label: 'Create Pattern',
                        onClick: handleCreate,
                        icon: <Icons.plus className="h-4 w-4" />,
                      }
                }
              />
            ) : (
              <>
                <AdminDataTable
                  data={filteredPatterns}
                  columns={columns}
                  renderRowActions={(pattern) => (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(pattern)}
                      >
                        <Icons.edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(pattern._id)}
                      >
                        <Icons.delete className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                />
                <AdminPaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={goToPage}
                  itemName="patterns"
                />
              </>
            )}
          </CardContent>
        </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New Pattern' : 'Edit Pattern'}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? 'Add a new prompt engineering pattern'
                : 'Update pattern details'}
            </DialogDescription>
          </DialogHeader>

          {editingPattern && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Pattern ID</Label>
                  <Input
                    id="id"
                    value={editingPattern.id}
                    onChange={(e) =>
                      setEditingPattern({ ...editingPattern, id: e.target.value })
                    }
                    placeholder="e.g., chain-of-thought"
                    disabled={!isCreating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingPattern.name}
                    onChange={(e) =>
                      setEditingPattern({ ...editingPattern, name: e.target.value })
                    }
                    placeholder="Pattern name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editingPattern.category}
                    onValueChange={(value: Pattern['category']) =>
                      setEditingPattern({ ...editingPattern, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOUNDATIONAL">Foundational</SelectItem>
                      <SelectItem value="STRUCTURAL">Structural</SelectItem>
                      <SelectItem value="COGNITIVE">Cognitive</SelectItem>
                      <SelectItem value="ITERATIVE">Iterative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={editingPattern.level}
                    onValueChange={(value: Pattern['level']) =>
                      setEditingPattern({ ...editingPattern, level: value })
                    }
                  >
                    <SelectTrigger id="level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingPattern.description}
                  onChange={(e) =>
                    setEditingPattern({
                      ...editingPattern,
                      description: e.target.value,
                    })
                  }
                  placeholder="Pattern description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="example">Example</Label>
                <Textarea
                  id="example"
                  value={editingPattern.example || ''}
                  onChange={(e) =>
                    setEditingPattern({
                      ...editingPattern,
                      example: e.target.value,
                    })
                  }
                  placeholder="Example usage"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="useCases">Use Cases (comma-separated)</Label>
                <Input
                  id="useCases"
                  value={editingPattern.useCases?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingPattern({
                      ...editingPattern,
                      useCases: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  placeholder="use case 1, use case 2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isCreating ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Sheet */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent className="w-[600px] overflow-y-auto sm:max-w-[600px]">
          {previewPattern && (
            <>
              <SheetHeader>
                <SheetTitle>{previewPattern.name}</SheetTitle>
                <SheetDescription>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge>{previewPattern.category}</Badge>
                    <Badge variant="outline">{previewPattern.level}</Badge>
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {previewPattern.description}
                  </p>
                </div>

                {previewPattern.example && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Example</h4>
                    <div className="rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-800">
                      <pre className="whitespace-pre-wrap">
                        {previewPattern.example}
                      </pre>
                    </div>
                  </div>
                )}

                {previewPattern.useCases && previewPattern.useCases.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Use Cases</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {previewPattern.useCases.map((useCase, i) => (
                        <li key={i}>{useCase}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Metadata</h4>
                  <dl className="space-y-1 text-sm">
                    <div>
                      <dt className="inline font-medium">ID:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {previewPattern.id}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Created:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {new Date(previewPattern.createdAt).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Updated:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {new Date(previewPattern.updatedAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      setIsPreviewOpen(false);
                      handleEdit(previewPattern);
                    }}
                    className="flex-1"
                  >
                    <Icons.edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsPreviewOpen(false);
                      handleDelete(previewPattern._id);
                    }}
                  >
                    <Icons.delete className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      </div>
    </AdminErrorBoundary>
  );
}
