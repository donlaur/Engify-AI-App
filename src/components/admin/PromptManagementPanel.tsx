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

interface Prompt {
  _id: string;
  id: string;
  title: string;
  category: string;
  tags: string[];
  active?: boolean;
  source?: string;
  qualityScore?: {
    overall: number;
  };
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

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      // Fetch from admin endpoint that shows ALL prompts (including inactive)
      const res = await fetch('/api/admin/prompts');
      const data = await res.json();

      if (data.success) {
        setPrompts(data.prompts);
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
    total: prompts.length,
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
        </CardContent>
      </Card>

      {/* Preview Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[600px] overflow-y-auto sm:max-w-[600px]">
          {selectedPrompt && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedPrompt.title}</SheetTitle>
                <SheetDescription>ID: {selectedPrompt.id}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Active Toggle */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label
                      htmlFor="active-toggle"
                      className="text-base font-medium"
                    >
                      Active Status
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedPrompt.active !== false
                        ? 'Visible on prompts page'
                        : 'Hidden from public view'}
                    </p>
                  </div>
                  <Switch
                    id="active-toggle"
                    checked={selectedPrompt.active !== false}
                    onCheckedChange={() =>
                      handleToggleActive(
                        selectedPrompt._id,
                        selectedPrompt.active !== false
                      )
                    }
                  />
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Badge>{selectedPrompt.category}</Badge>
                </div>

                <div className="space-y-2">
                  <Label>Source</Label>
                  <Badge variant="outline">
                    {selectedPrompt.source ||
                      (selectedPrompt.id.startsWith('generated-')
                        ? 'ai-generated'
                        : 'seed')}
                  </Badge>
                </div>

                {selectedPrompt.qualityScore && (
                  <div className="space-y-2">
                    <Label>Quality Score</Label>
                    <div className="text-2xl font-bold">
                      {selectedPrompt.qualityScore.overall.toFixed(1)}/10
                    </div>
                  </div>
                )}

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

                <div className="space-y-2">
                  <Label>Metadata</Label>
                  <div className="rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-800">
                    <div>
                      Created:{' '}
                      {new Date(selectedPrompt.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      Updated:{' '}
                      {new Date(selectedPrompt.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
