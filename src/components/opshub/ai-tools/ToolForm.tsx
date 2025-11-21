'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AITool } from '@/lib/db/schemas/ai-tool';
import { generateSlug } from '@/lib/utils/slug';
import { HubContentEditor } from '@/components/opshub/HubContentEditor';

interface ToolDisplay extends AITool {
  _id?: string;
}

interface ToolFormProps {
  tool: ToolDisplay | null;
  onSave: (data: Partial<ToolDisplay>) => void;
  onCancel: () => void;
  categoryLabels: Record<string, string>;
}

/**
 * Tool form component for creating/editing tools
 */
export function ToolForm({ tool, onSave, onCancel, categoryLabels }: ToolFormProps) {
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
    hubContent: tool?.hubContent,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details & Pricing</TabsTrigger>
          <TabsTrigger value="hub">Hub Content</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
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
                  {Object.entries(categoryLabels).map(([key, label]) => (
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
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-4">
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
        </TabsContent>

        <TabsContent value="hub" className="space-y-4 mt-4">
          <HubContentEditor
            tool={formData}
            onChange={(hubContent) => setFormData({ ...formData, hubContent })}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{tool ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}

