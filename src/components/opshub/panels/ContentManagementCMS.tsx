'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { AdminErrorBoundary } from '@/components/opshub/panels/shared/AdminErrorBoundary';
import { clientLogger } from '@/lib/logging/client-logger';
import { useCrudOperations } from '@/hooks/opshub/useCrudOperations';
import { applyFilters } from '@/lib/opshub/utils';
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
import { Label } from '@/components/ui/label';

interface ContentItem {
  _id: string;
  type: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * ContentManagementCMS Component
 * 
 * Admin panel for managing content items in the CMS. Provides comprehensive
 * content management with filtering, searching, and CRUD operations.
 * 
 * @component
 * @pattern ADMIN_PANEL, CRUD_INTERFACE
 * @principle DRY - Uses shared components and utilities
 * 
 * @features
 * - Content item listing with filtering
 * - Search functionality
 * - Filter by status (all, published, draft, archived)
 * - Create, edit, and delete content items
 * - Content preview and editing
 * 
 * @example
 * ```tsx
 * <ContentManagementCMS />
 * ```
 * 
 * @usage
 * Used in OpsHub admin center for managing CMS content.
 * Provides a complete interface for content management.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */
export function ContentManagementCMS() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);
  const [recapProvider, setRecapProvider] = useState<'openai' | 'anthropic' | 'google'>('openai');

  // Use shared CRUD operations hook
  const { saveItem, deleteItem } = useCrudOperations<ContentItem>({
    endpoint: '/api/admin/content/manage',
    onRefresh: fetchContent,
    createSuccessMessage: 'Content created successfully',
    updateSuccessMessage: 'Content updated successfully',
    deleteSuccessMessage: 'Content deleted successfully',
    onSaveSuccess: () => {
      setIsEditDialogOpen(false);
    },
  });

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);

      const res = await fetch(`/api/admin/content/manage?${params}`);
      const data = await res.json();

      if (data.success) {
        setContentItems(data.content);
      }
    } catch (error) {
      clientLogger.apiError('/api/admin/content', error, {
        component: 'ContentManagementCMS',
        action: 'fetchContent',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setIsCreating(false);
    setIsEditDialogOpen(true);
  };

  const handlePreview = (item: ContentItem) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const handleCreate = () => {
    setEditingItem({
      _id: '',
      type: 'ai_adoption_question',
      category: '',
      title: '',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsCreating(true);
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    await saveItem(editingItem, isCreating);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id, 'Are you sure you want to delete this content?');
  };

  const handleGenerateWithAI = async () => {
    if (!editingItem) return;

    setIsGenerating(true);
    try {
      const prompt = `Generate comprehensive content for the following:

Title: ${editingItem.title || 'AI-generated content'}
Type: ${editingItem.type}
Category: ${editingItem.category || 'General'}

Create detailed, professional content in markdown format. Include:
- Clear introduction explaining why this matters
- Key concepts and definitions
- Practical examples and use cases
- Best practices
- Common pitfalls to avoid
- Related resources or frameworks

Make it educational, actionable, and suitable for ${editingItem.type === 'ai_adoption_question' ? 'engineering leaders' : 'technical professionals'}.`;

      const res = await fetch('/api/admin/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: editingItem.type }),
      });

      const data = await res.json();

      if (data.success && data.content) {
        setEditingItem({
          ...editingItem,
          content: data.content,
          title: data.title || editingItem.title,
          tags: data.tags || editingItem.tags,
        });
      } else {
        alert(`Error: ${data.error || 'Failed to generate content'}`);
      }
    } catch (error) {
      clientLogger.apiError('/api/admin/content/generate', error, {
        component: 'ContentManagementCMS',
        action: 'generateContent',
      });
      alert('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!editingItem || !editingItem.content) return;

    setIsGenerating(true);
    try {
      const prompt = `Enhance and improve the following content:

Title: ${editingItem.title}
Current Content:
${editingItem.content}

Improve it by:
- Making it more clear and concise
- Adding practical examples if missing
- Improving structure and flow
- Ensuring it's actionable and valuable
- Maintaining the same tone and purpose

Return enhanced markdown content.`;

      const res = await fetch('/api/admin/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'enhance' }),
      });

      const data = await res.json();

      if (data.success && data.content) {
        setEditingItem({
          ...editingItem,
          content: data.content,
        });
      } else {
        alert(`Error: ${data.error || 'Failed to enhance content'}`);
      }
    } catch (error) {
      clientLogger.apiError('/api/admin/content/enhance', error, {
        component: 'ContentManagementCMS',
        action: 'enhanceContent',
        contentId: editingContent?._id,
      });
      alert('Failed to enhance content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRecap = async () => {
    if (!editingItem || !editingItem.content) return;

    setIsGeneratingRecap(true);
    try {
      const res = await fetch('/api/admin/content/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingItem.title,
          content: editingItem.content,
          provider: recapProvider,
          sourceUrl: (editingItem as any).metadata?.sourceUrl,
        }),
      });

      const data = await res.json();

      if (data.success && data.recap) {
        // Append recap to content with a separator
        // Include agent analyses in a collapsible section
        const separator = '\n\n---\n\n## Editorial Recap\n\n';
        let recapSection = data.recap;
        
        if (data.agentAnalyses) {
          recapSection += '\n\n<details>\n<summary>Agent Analyses (Editor & SEO)</summary>\n\n';
          if (data.agentAnalyses.editor) {
            recapSection += `### Editor Analysis\n\n${data.agentAnalyses.editor}\n\n`;
          }
          if (data.agentAnalyses.seoEeat) {
            recapSection += `### SEO/EEAT Analysis\n\n${data.agentAnalyses.seoEeat}\n\n`;
          }
          recapSection += '</details>\n';
        }
        
        const newContent = editingItem.content + separator + recapSection;
        setEditingItem({
          ...editingItem,
          content: newContent,
        });
        alert(`Recap generated using ${data.metadata?.workflow || 'multi-agent'} workflow!`);
      } else {
        alert(`Error: ${data.error || data.message || 'Failed to generate recap'}`);
      }
    } catch (error) {
      clientLogger.apiError('/api/admin/content/recap', error, {
        component: 'ContentManagementCMS',
        action: 'generateRecap',
      });
      alert('Failed to generate recap');
    } finally {
      setIsGeneratingRecap(false);
    }
  };

  // Use shared filtering utilities
  const filteredContent = useMemo(() => {
    return applyFilters(
      contentItems,
      filter !== 'all' ? {
        predicates: [{
          type: 'exact',
          field: 'type',
          value: filter,
        } as any],
      } : {},
      searchTerm || undefined,
      ['title', 'content']
    );
  }, [contentItems, filter, searchTerm]);

  const stats = {
    total: contentItems.length,
    ai_adoption_question: contentItems.filter(
      (c) => c.type === 'ai_adoption_question'
    ).length,
    learning_story: contentItems.filter((c) => c.type === 'learning_story')
      .length,
    case_study: contentItems.filter((c) => c.type === 'case_study').length,
    framework_guide: contentItems.filter((c) => c.type === 'framework_guide')
      .length,
  };

  return (
    <AdminErrorBoundary onError={(err) => clientLogger.componentError('ContentManagementCMS', err)}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Content Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage learning content, patterns, and prompts
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Icons.plus className="mr-2 h-4 w-4" />
          Create Content
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">Total Items</CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">AI Questions</CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {stats.ai_adoption_question}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">Stories</CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {stats.learning_story}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">Case Studies</CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {stats.case_study}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">Frameworks</CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {stats.framework_guide}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ai_adoption_question">AI Questions</SelectItem>
            <SelectItem value="learning_story">Stories</SelectItem>
            <SelectItem value="case_study">Case Studies</SelectItem>
            <SelectItem value="framework_guide">Frameworks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Table */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Content Items</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {filteredContent.length} items
            {searchTerm && ` matching "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Icons.spinner className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="py-8 text-center text-gray-600 dark:text-gray-400">
              No content found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="w-[300px] font-semibold text-gray-900 dark:text-gray-100">
                      Title
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Type</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Category</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Tags</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Updated</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((item) => (
                    <TableRow
                      key={item._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        <button
                          onClick={() => handlePreview(item)}
                          className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400 dark:text-gray-100"
                        >
                          {item.title}
                        </button>
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        <Badge variant="outline" className="font-normal">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {item.category || '-'}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 2).map((tag, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/50 text-gray-700 dark:text-gray-300"
                          >
                            <Icons.edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item._id)}
                            className="hover:bg-red-50 dark:hover:bg-red-900/50 text-gray-700 dark:text-gray-300"
                          >
                            <Icons.delete className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New Content' : 'Edit Content'}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? 'Add new learning content to the database'
                : 'Update existing content'}
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={editingItem.type}
                    onValueChange={(value) =>
                      setEditingItem({ ...editingItem, type: value })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai_adoption_question">
                        AI Adoption Question
                      </SelectItem>
                      <SelectItem value="learning_story">
                        Learning Story
                      </SelectItem>
                      <SelectItem value="case_study">Case Study</SelectItem>
                      <SelectItem value="framework_guide">
                        Framework Guide
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category: e.target.value,
                      })
                    }
                    placeholder="e.g., Strategic, Technical, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  placeholder="Content title"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content (Markdown)</Label>
                  <div className="flex gap-2">
                    {editingItem.content && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateRecap}
                          disabled={isGeneratingRecap}
                          title="Generate editorial recap using your API keys"
                        >
                          {isGeneratingRecap ? (
                            <Icons.spinner className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Icons.newspaper className="mr-2 h-3 w-3" />
                          )}
                          Generate Recap
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleEnhanceWithAI}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <Icons.spinner className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Icons.zap className="mr-2 h-3 w-3" />
                          )}
                          Enhance with AI
                        </Button>
                      </>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateWithAI}
                      disabled={isGenerating || !editingItem.title}
                    >
                      {isGenerating ? (
                        <Icons.spinner className="mr-2 h-3 w-3 animate-spin" />
                      ) : (
                        <Icons.sparkles className="mr-2 h-3 w-3" />
                      )}
                      Generate with AI
                    </Button>
                  </div>
                </div>
                {editingItem.content && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Recap provider:</span>
                    <Select
                      value={recapProvider}
                      onValueChange={(value: 'openai' | 'anthropic' | 'google') =>
                        setRecapProvider(value)
                      }
                    >
                      <SelectTrigger className="h-7 w-[120px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Textarea
                  id="content"
                  value={editingItem.content}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, content: e.target.value })
                  }
                  placeholder="Content in markdown format... (or use AI generation)"
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Tip: For news articles, use &quot;Generate Recap&quot; to create an editorial recap using a 3-agent workflow (Editor → SEO/EEAT → Tech Writer). Or use &quot;Generate with AI&quot; to create content from scratch, and &quot;Enhance with AI&quot; to improve existing content.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={editingItem.tags.join(', ')}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      tags: e.target.value.split(',').map((t) => t.trim()),
                    })
                  }
                  placeholder="ai-adoption, engineering-leadership, etc."
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
          {previewItem && (
            <>
              <SheetHeader>
                <SheetTitle>{previewItem.title}</SheetTitle>
                <SheetDescription>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge>{previewItem.type}</Badge>
                    {previewItem.category && (
                      <Badge variant="outline">{previewItem.category}</Badge>
                    )}
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Content</h4>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap text-sm rounded-md border p-4 bg-muted/50">
                      {previewItem.content}
                    </div>
                  </div>
                  {(previewItem as any).metadata?.sourceUrl && (
                    <div className="mt-2">
                      <a
                        href={(previewItem as any).metadata.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        View Original Source →
                      </a>
                    </div>
                  )}
                </div>

                {previewItem.tags.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {previewItem.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Metadata</h4>
                  <dl className="space-y-1 text-sm">
                    <div>
                      <dt className="inline font-medium">Created:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {new Date(previewItem.createdAt).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Updated:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {new Date(previewItem.updatedAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      setIsPreviewOpen(false);
                      handleEdit(previewItem);
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
                      handleDelete(previewItem._id);
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
