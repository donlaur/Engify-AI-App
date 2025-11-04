'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import type { AITool } from '@/lib/db/schemas/ai-tool';
import { generateSlug } from '@/lib/utils/slug';

interface ToolDisplay extends AITool {
  _id?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ide: 'AI IDEs',
  'code-assistant': 'Code Assistants',
  'ai-terminal': 'AI Terminals',
  builder: 'AI Builders',
  'ui-generator': 'UI Generators',
  protocol: 'Protocols',
  framework: 'Frameworks',
  other: 'Other',
};

export default function AIToolsAdminPage() {
  const [tools, setTools] = useState<ToolDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'deprecated'>('active');
  const [editingTool, setEditingTool] = useState<ToolDisplay | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load tools from database
  useEffect(() => {
    loadTools();
  }, []);

  async function loadTools() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ai-tools');
      if (!response.ok) throw new Error('Failed to load tools');

      const data = await response.json();
      setTools(data.tools || []);
    } catch (error) {
      console.error('Error loading tools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI tools',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function saveTool(toolData: Partial<ToolDisplay>) {
    try {
      const method = editingTool ? 'PATCH' : 'POST';
      const url = '/api/admin/ai-tools';
      const body = editingTool
        ? { id: editingTool.id, ...toolData }
        : {
            ...toolData,
            slug: toolData.slug || generateSlug(toolData.name || ''),
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save tool');

      toast({
        title: 'Success',
        description: editingTool ? 'Tool updated' : 'Tool created',
      });

      setIsDialogOpen(false);
      setEditingTool(null);
      await loadTools();
    } catch (error) {
      console.error('Error saving tool:', error);
      toast({
        title: 'Error',
        description: 'Failed to save tool',
        variant: 'destructive',
      });
    }
  }

  async function deleteTool(id: string) {
    if (!confirm('Are you sure you want to deprecate this tool?')) return;

    try {
      const response = await fetch(`/api/admin/ai-tools?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete tool');

      toast({
        title: 'Success',
        description: 'Tool marked as deprecated',
      });

      await loadTools();
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tool',
        variant: 'destructive',
      });
    }
  }

  async function toggleStatus(tool: ToolDisplay) {
    try {
      const newStatus = tool.status === 'active' ? 'deprecated' : 'active';
      const response = await fetch('/api/admin/ai-tools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tool.id,
          action: 'toggle-status',
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update tool');

      toast({
        title: 'Success',
        description: `Tool ${newStatus === 'active' ? 'activated' : 'deprecated'}`,
      });

      await loadTools();
    } catch (error) {
      console.error('Error updating tool:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tool',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Icons.spinner className="mx-auto mb-4 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading AI tools...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const filteredTools = tools.filter((tool) => {
    if (filter === 'all') return true;
    if (filter === 'active') return tool.status === 'active';
    if (filter === 'deprecated') return tool.status === 'deprecated' || tool.status === 'sunset';
    return true;
  });

  const groupedByCategory = filteredTools.reduce(
    (acc, tool) => {
      const category = tool.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(tool);
      return acc;
    },
    {} as Record<string, ToolDisplay[]>
  );

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">AI Tools Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage AI development tools, pricing, and metadata for SEO pages.
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingTool(null);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Icons.plus className="mr-2 h-4 w-4" />
                    Add Tool
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTool ? 'Edit Tool' : 'Add New Tool'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTool
                        ? 'Update tool information'
                        : 'Add a new AI development tool to the database'}
                    </DialogDescription>
                  </DialogHeader>
                  <ToolForm
                    tool={editingTool}
                    onSave={saveTool}
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setEditingTool(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tools.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {tools.filter((t) => t.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deprecated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {tools.filter((t) => t.status === 'deprecated' || t.status === 'sunset').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Object.keys(groupedByCategory).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All Tools ({tools.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            size="sm"
          >
            Active ({tools.filter((t) => t.status === 'active').length})
          </Button>
          <Button
            variant={filter === 'deprecated' ? 'default' : 'outline'}
            onClick={() => setFilter('deprecated')}
            size="sm"
          >
            Deprecated ({tools.filter((t) => t.status === 'deprecated' || t.status === 'sunset').length})
          </Button>
        </div>

        {/* Tools by Category */}
        {Object.entries(groupedByCategory).map(([category, categoryTools]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              {CATEGORY_LABELS[category] || category}
              <Badge variant="secondary">{categoryTools.length} tools</Badge>
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryTools.map((tool) => (
                <Card key={tool.id} className={tool.status === 'deprecated' ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        {tool.tagline && (
                          <CardDescription className="mt-1">{tool.tagline}</CardDescription>
                        )}
                        <div className="mt-1 font-mono text-xs text-muted-foreground">
                          {tool.slug}
                        </div>
                      </div>
                      {tool.status === 'deprecated' || tool.status === 'sunset' ? (
                        <Badge variant="destructive">Deprecated</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Category */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {CATEGORY_LABELS[tool.category] || tool.category}
                      </Badge>
                      {tool.pricing?.free && <Badge variant="secondary">Free</Badge>}
                      {tool.pricing?.paid?.monthly && (
                        <Badge variant="default">
                          ${tool.pricing.paid.monthly}/mo
                        </Badge>
                      )}
                    </div>

                    {/* Rating */}
                    {tool.rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <Icons.star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{tool.rating.toFixed(1)}</span>
                        {tool.reviewCount > 0 && (
                          <span className="text-muted-foreground">
                            ({tool.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {tool.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                    )}

                    {/* Tags */}
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {tool.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tool.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTool(tool);
                          setIsDialogOpen(true);
                        }}
                        className="flex-1"
                      >
                        <Icons.edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(tool)}
                      >
                        {tool.status === 'active' ? (
                          <Icons.archive className="h-3 w-3" />
                        ) : (
                          <Icons.check className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filteredTools.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Icons.info className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Tools Found</h3>
              <p className="text-muted-foreground">
                {filter === 'all'
                  ? 'No tools in database. Add your first tool!'
                  : `No ${filter} tools found.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

// Tool Form Component
function ToolForm({
  tool,
  onSave,
  onCancel,
}: {
  tool: ToolDisplay | null;
  onSave: (data: Partial<ToolDisplay>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<ToolDisplay>>({
    id: tool?.id || '',
    name: tool?.name || '',
    slug: tool?.slug || '',
    tagline: tool?.tagline || '',
    description: tool?.description || '',
    category: tool?.category || 'other',
    status: tool?.status || 'active',
    pricing: tool?.pricing || { free: false },
    features: tool?.features || [],
    pros: tool?.pros || [],
    cons: tool?.cons || [],
    tags: tool?.tags || [],
    rating: tool?.rating,
    reviewCount: tool?.reviewCount || 0,
    affiliateLink: tool?.affiliateLink || '',
    websiteUrl: tool?.websiteUrl || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="id">ID *</Label>
          <Input
            id="id"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            placeholder="cursor"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({
                ...formData,
                name: e.target.value,
                slug: formData.slug || generateSlug(e.target.value),
              });
            }}
            placeholder="Cursor"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="cursor"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value as AITool['category'] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={formData.tagline || ''}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            placeholder="The AI-first code editor"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value as AITool['status'] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
              <SelectItem value="sunset">Sunset</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating || ''}
            onChange={(e) =>
              setFormData({ ...formData, rating: parseFloat(e.target.value) || undefined })
            }
            placeholder="4.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reviewCount">Review Count</Label>
          <Input
            id="reviewCount"
            type="number"
            min="0"
            value={formData.reviewCount || 0}
            onChange={(e) =>
              setFormData({ ...formData, reviewCount: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website URL</Label>
          <Input
            id="websiteUrl"
            type="url"
            value={formData.websiteUrl || ''}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            placeholder="https://cursor.sh"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliateLink">Affiliate Link</Label>
          <Input
            id="affiliateLink"
            type="url"
            value={formData.affiliateLink || ''}
            onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
            placeholder="https://cursor.sh/ref/..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Tool description..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="features">Features (one per line)</Label>
        <Textarea
          id="features"
          value={formData.features?.join('\n') || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              features: e.target.value.split('\n').filter((f) => f.trim()),
            })
          }
          placeholder="Feature 1&#10;Feature 2"
          rows={4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pros">Pros (one per line)</Label>
          <Textarea
            id="pros"
            value={formData.pros?.join('\n') || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                pros: e.target.value.split('\n').filter((p) => p.trim()),
              })
            }
            placeholder="Pro 1&#10;Pro 2"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cons">Cons (one per line)</Label>
          <Textarea
            id="cons"
            value={formData.cons?.join('\n') || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                cons: e.target.value.split('\n').filter((c) => c.trim()),
              })
            }
            placeholder="Con 1&#10;Con 2"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
            })
          }
          placeholder="ide, vscode, claude, paid"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{tool ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}

