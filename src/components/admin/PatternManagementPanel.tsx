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
import { Textarea } from '@/components/ui/textarea';
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
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
  const [previewPattern, setPreviewPattern] = useState<Pattern | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPatterns();
  }, [filter, levelFilter]);

  const fetchPatterns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('category', filter);
      if (levelFilter !== 'all') params.append('level', levelFilter);

      const res = await fetch(`/api/admin/patterns?${params}`);
      const data = await res.json();

      if (data.success) {
        setPatterns(data.patterns);
      }
    } catch (error) {
      console.error('Failed to fetch patterns:', error);
    } finally {
      setLoading(false);
    }
  };

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
        fetchPatterns();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to save pattern:', error);
      alert('Failed to save pattern');
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
        fetchPatterns();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to delete pattern:', error);
      alert('Failed to delete pattern');
    }
  };

  const filteredPatterns = patterns.filter((pattern) =>
    searchTerm
      ? pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pattern.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // Pagination
  const totalPages = Math.ceil(filteredPatterns.length / itemsPerPage);
  const paginatedPatterns = filteredPatterns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: patterns.length,
    foundational: patterns.filter((p) => p.category === 'FOUNDATIONAL').length,
    structural: patterns.filter((p) => p.category === 'STRUCTURAL').length,
    cognitive: patterns.filter((p) => p.category === 'COGNITIVE').length,
    iterative: patterns.filter((p) => p.category === 'ITERATIVE').length,
  };

  return (
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
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total</CardDescription>
            <CardTitle className="text-4xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Foundational</CardDescription>
            <CardTitle className="text-4xl font-bold text-blue-600">
              {stats.foundational}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Structural</CardDescription>
            <CardTitle className="text-4xl font-bold text-green-600">
              {stats.structural}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Cognitive</CardDescription>
            <CardTitle className="text-4xl font-bold text-purple-600">
              {stats.cognitive}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Iterative</CardDescription>
            <CardTitle className="text-4xl font-bold text-orange-600">
              {stats.iterative}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search patterns..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
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
            {searchTerm && ` matching "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Icons.spinner className="h-6 w-6 animate-spin" />
            </div>
          ) : paginatedPatterns.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No patterns found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border bg-white dark:bg-gray-900">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="w-[250px] font-semibold">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Level</TableHead>
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Updated</TableHead>
                      <TableHead className="text-right font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPatterns.map((pattern) => (
                      <TableRow
                        key={pattern._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="font-medium">
                          <button
                            onClick={() => handlePreview(pattern)}
                            className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                          >
                            {pattern.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{pattern.category}</Badge>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {pattern.id}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(pattern.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <Icons.left className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <Icons.arrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
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
  );
}
