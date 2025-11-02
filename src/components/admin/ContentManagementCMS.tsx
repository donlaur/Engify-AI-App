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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

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

export function ContentManagementCMS() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchContent();
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
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setIsCreating(false);
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingItem({
      _id: '',
      type: 'learning_content',
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

    try {
      const method = isCreating ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/content/manage', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      const data = await res.json();

      if (data.success) {
        setIsEditDialogOpen(false);
        fetchContent();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save content');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const res = await fetch(`/api/admin/content/manage?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        fetchContent();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to delete content:', error);
      alert('Failed to delete content');
    }
  };

  const filteredContent = contentItems.filter((item) =>
    searchTerm
      ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const contentByType = {
    all: filteredContent,
    ai_adoption_question: filteredContent.filter(
      (c) => c.type === 'ai_adoption_question'
    ),
    learning_story: filteredContent.filter((c) => c.type === 'learning_story'),
    case_study: filteredContent.filter((c) => c.type === 'case_study'),
    framework_guide: filteredContent.filter((c) => c.type === 'framework_guide'),
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Content Management System</h3>
          <p className="text-sm text-muted-foreground">
            Manage learning content, patterns, and prompts
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Icons.plus className="h-4 w-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {stats.ai_adoption_question}
            </div>
            <p className="text-xs text-muted-foreground">AI Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.learning_story}</div>
            <p className="text-xs text-muted-foreground">Stories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.case_study}</div>
            <p className="text-xs text-muted-foreground">Case Studies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.framework_guide}</div>
            <p className="text-xs text-muted-foreground">Frameworks</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
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

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Items</CardTitle>
          <CardDescription>
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
            <div className="text-center py-8 text-muted-foreground">
              No content found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start justify-between border rounded-lg p-4 hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.tags.slice(0, 3).join(', ')}</span>
                      <span>•</span>
                      <span>
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                    >
                      <Icons.edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Icons.delete className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={editingItem.type}
                  onValueChange={(value) =>
                    setEditingItem({ ...editingItem, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai_adoption_question">
                      AI Adoption Question
                    </SelectItem>
                    <SelectItem value="learning_story">Learning Story</SelectItem>
                    <SelectItem value="case_study">Case Study</SelectItem>
                    <SelectItem value="framework_guide">
                      Framework Guide
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, category: e.target.value })
                  }
                  placeholder="e.g., Strategic, Technical, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  placeholder="Content title"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Content (Markdown)</label>
                <Textarea
                  value={editingItem.content}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, content: e.target.value })
                  }
                  placeholder="Content in markdown format..."
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Tags (comma-separated)
                </label>
                <Input
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
    </div>
  );
}

