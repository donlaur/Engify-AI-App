'use client';

/**
 * Hub Content Editor
 * 
 * Editor for managing hub content sections (problems, resources, getting started, articles).
 * Uses generic hooks and components to eliminate duplication.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icons } from '@/lib/icons';
import type { AITool } from '@/lib/db/schemas/ai-tool';

interface HubContentEditorProps {
  tool: Partial<AITool>;
  onChange: (hubContent: NonNullable<AITool['hubContent']>) => void;
}

type HubContentKey = keyof NonNullable<AITool['hubContent']>;

/**
 * Generic hook for managing array items in hub content
 */
function useHubContentArray<T extends { id: string; order: number }>(
  items: T[] | undefined,
  key: HubContentKey,
  updateHubContent: (updates: Partial<NonNullable<AITool['hubContent']>>) => void
) {
  const add = (newItem: Omit<T, 'id' | 'order'>) => {
    const item = {
      ...newItem,
      id: crypto.randomUUID(),
      order: (items?.length || 0) + 1,
    } as T;
    updateHubContent({
      [key]: [...(items || []), item],
    });
  };

  const update = (index: number, field: keyof T, value: string) => {
    const updated = [...(items || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateHubContent({ [key]: updated });
  };

  const remove = (index: number) => {
    const updated = [...(items || [])];
    updated.splice(index, 1);
    updateHubContent({ [key]: updated });
  };

  return { add, update, remove };
}

/**
 * Reusable item card component for editing array items
 */
interface ItemCardProps {
  fields: Array<{
    name: string;
    label: string;
    placeholder: string;
    type?: 'input' | 'textarea';
    rows?: number;
  }>;
  value: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onRemove: () => void;
  removeLabel?: string;
}

function ItemCard({
  fields,
  value,
  onChange,
  onRemove,
  removeLabel = 'Remove',
}: ItemCardProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-4">
        <div className="space-y-2">
          {fields.map((field) => {
            const FieldComponent = field.type === 'textarea' ? Textarea : Input;
            return (
              <div key={field.name}>
                <Label>{field.label}</Label>
                <FieldComponent
                  placeholder={field.placeholder}
                  value={value[field.name] || ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  rows={field.rows}
                />
              </div>
            );
          })}
          <Button variant="destructive" size="sm" onClick={onRemove}>
            <Icons.trash className="mr-2 h-4 w-4" />
            {removeLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Reusable section component for hub content arrays
 */
interface HubContentSectionProps<T extends { id: string; order: number }> {
  title: string;
  description: string;
  items: T[] | undefined;
  key: HubContentKey;
  fields: Array<{
    name: keyof T;
    label: string;
    placeholder: string;
    type?: 'input' | 'textarea';
    rows?: number;
  }>;
  defaultItem: Omit<T, 'id' | 'order'>;
  updateHubContent: (updates: Partial<NonNullable<AITool['hubContent']>>) => void;
  addButtonLabel: string;
  removeLabel?: string;
  extraContent?: React.ReactNode;
}

function HubContentSection<T extends { id: string; order: number }>({
  title,
  description,
  items,
  key: contentKey,
  fields,
  defaultItem,
  updateHubContent,
  addButtonLabel,
  removeLabel,
  extraContent,
}: HubContentSectionProps<T>) {
  const { add, update, remove } = useHubContentArray(items, contentKey, updateHubContent);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items?.map((item, idx) => {
            // Extract only the string fields that are being edited
            const stringFields = fields.reduce((acc, f) => {
              const fieldName = String(f.name);
              const fieldValue = item[fieldName as keyof T];
              if (typeof fieldValue === 'string') {
                acc[fieldName] = fieldValue;
              }
              return acc;
            }, {} as Record<string, string>);

            return (
              <ItemCard
                key={item.id}
                fields={fields.map((f) => ({
                  name: String(f.name),
                  label: f.label,
                  placeholder: f.placeholder,
                  type: f.type,
                  rows: f.rows,
                }))}
                value={stringFields}
                onChange={(field, value) => update(idx, field as keyof T, value)}
                onRemove={() => remove(idx)}
                removeLabel={removeLabel}
              />
            );
          })}
          <Button onClick={() => add(defaultItem)} variant="outline">
            <Icons.plus className="mr-2 h-4 w-4" />
            {addButtonLabel}
          </Button>
          {extraContent}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * HubContentEditor Component
 * 
 * A complex editor component for managing hub content associated with AI tools.
 * Provides interfaces for managing related prompts, patterns, problems, articles,
 * getting started guides, and official/community resources.
 * 
 * @pattern COMPLEX_FORM_COMPONENT
 * @principle DRY - Centralizes hub content editing logic
 * 
 * @features
 * - Multiple content section management (prompts, patterns, problems, etc.)
 * - Add, edit, and remove items in each section
 * - Drag-and-drop reordering (via HubContentSection)
 * - Resource management (official and community)
 * - Automatic state synchronization with parent component
 * 
 * @param tool - The AI tool containing hub content to edit
 * @param onChange - Callback function when hub content is updated
 * 
 * @example
 * ```tsx
 * <HubContentEditor
 *   tool={toolData}
 *   onChange={(updatedContent) => {
 *     // Update tool with new hub content
 *     updateTool({ ...tool, hubContent: updatedContent });
 *   }}
 * />
 * ```
 * 
 * @usage
 * Used within ToolForm for managing the hub content section of AI tools.
 * Provides a comprehensive interface for organizing tool-related content.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */
export function HubContentEditor({ tool, onChange }: HubContentEditorProps) {
  const [hubContent, setHubContent] = useState<NonNullable<AITool['hubContent']>>(
    tool.hubContent || {
      relatedPrompts: [],
      relatedPatterns: [],
      problems: [],
      articles: [],
      gettingStarted: [],
      officialResources: [],
      communityResources: [],
    }
  );

  const updateHubContent = (updates: Partial<NonNullable<AITool['hubContent']>>) => {
    const updated = { ...hubContent, ...updates };
    setHubContent(updated);
    onChange(updated);
  };

  // Resources need special handling for two types
  const { add: addOfficialResource, update: updateOfficialResource, remove: removeOfficialResource } =
    useHubContentArray(hubContent.officialResources, 'officialResources', updateHubContent);
  const { add: addCommunityResource, update: updateCommunityResource, remove: removeCommunityResource } =
    useHubContentArray(hubContent.communityResources, 'communityResources', updateHubContent);

  return (
    <div className="space-y-6">
      {/* Problems & Solutions */}
      <HubContentSection
        title="Problems & Solutions"
        description="Common problems users face with this tool and how Engify solves them"
        items={hubContent.problems}
        key="problems"
        fields={[
          { name: 'title', label: 'Problem Title', placeholder: "e.g., No Guardrails", type: 'input' },
          { name: 'issue', label: 'Issue Description', placeholder: "What's the problem?", type: 'textarea', rows: 2 },
          { name: 'impact', label: 'Impact', placeholder: "What's the impact on users?", type: 'textarea', rows: 2 },
          { name: 'engifySolution', label: 'Engify Solution', placeholder: 'How does Engify solve this?', type: 'textarea', rows: 2 },
        ]}
        defaultItem={{ title: '', issue: '', impact: '', engifySolution: '' }}
        updateHubContent={updateHubContent}
        addButtonLabel="Add Problem"
        removeLabel="Remove Problem"
      />

      {/* Community Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Community Resources</CardTitle>
          <p className="text-sm text-muted-foreground">
            External links to official docs, community sites, and helpful resources
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Official Resources */}
            <div>
              <h4 className="mb-3 font-semibold">Official Resources</h4>
              <div className="space-y-3">
                {hubContent.officialResources?.map((resource, idx) => {
                  const stringFields = {
                    title: String(resource.title || ''),
                    url: String(resource.url || ''),
                    description: String(resource.description || ''),
                  };
                  return (
                    <ItemCard
                      key={resource.id}
                      fields={[
                        { name: 'title', label: 'Title', placeholder: 'Title (e.g., Official Documentation)', type: 'input' },
                        { name: 'url', label: 'URL', placeholder: 'URL', type: 'input' },
                        { name: 'description', label: 'Description', placeholder: 'Description (optional)', type: 'input' },
                      ]}
                      value={stringFields}
                      onChange={(field, value) => updateOfficialResource(idx, field as any, value)}
                      onRemove={() => removeOfficialResource(idx)}
                      removeLabel="Remove"
                    />
                  );
                })}
                <Button onClick={() => addOfficialResource({ title: '', url: '', description: '' })} variant="outline" size="sm">
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Official Resource
                </Button>
              </div>
            </div>

            {/* Community Resources */}
            <div>
              <h4 className="mb-3 font-semibold">Community Resources</h4>
              <div className="space-y-3">
                {hubContent.communityResources?.map((resource, idx) => {
                  const stringFields = {
                    title: String(resource.title || ''),
                    url: String(resource.url || ''),
                    description: String(resource.description || ''),
                  };
                  return (
                    <ItemCard
                      key={resource.id}
                      fields={[
                        { name: 'title', label: 'Title', placeholder: 'Title (e.g., Reddit Community)', type: 'input' },
                        { name: 'url', label: 'URL', placeholder: 'URL', type: 'input' },
                        { name: 'description', label: 'Description', placeholder: 'Description (optional)', type: 'input' },
                      ]}
                      value={stringFields}
                      onChange={(field, value) => updateCommunityResource(idx, field as any, value)}
                      onRemove={() => removeCommunityResource(idx)}
                      removeLabel="Remove"
                    />
                  );
                })}
                <Button onClick={() => addCommunityResource({ title: '', url: '', description: '' })} variant="outline" size="sm">
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Community Resource
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <HubContentSection
        title="Getting Started Guide"
        description="Step-by-step guide for new users"
        items={hubContent.gettingStarted}
        key="gettingStarted"
        fields={[
          { name: 'title', label: 'Step Title', placeholder: 'Step Title (e.g., Download & Install)', type: 'input' },
          { name: 'description', label: 'Step Description', placeholder: 'Step Description', type: 'textarea', rows: 2 },
        ]}
        defaultItem={{ title: '', description: '' }}
        updateHubContent={updateHubContent}
        addButtonLabel="Add Step"
        removeLabel="Remove Step"
        extraContent={
          <div className="mt-4">
            <Label>Pro Tip (optional)</Label>
            <Textarea
              placeholder="Add a helpful pro tip for users..."
              value={hubContent.gettingStartedProTip || ''}
              onChange={(e) => updateHubContent({ gettingStartedProTip: e.target.value })}
              rows={2}
            />
          </div>
        }
      />

      {/* Articles */}
      <HubContentSection
        title="Related Articles"
        description='In-depth guides and articles (can be placeholders for "Coming Soon")'
        items={hubContent.articles}
        key="articles"
        fields={[
          { name: 'title', label: 'Article Title', placeholder: 'Article Title', type: 'input' },
          { name: 'description', label: 'Article Description', placeholder: 'Article Description', type: 'textarea', rows: 2 },
          { name: 'slug', label: 'Slug', placeholder: 'Slug (when published, e.g., cursor-vs-windsurf)', type: 'input' },
        ]}
        defaultItem={{ title: '', description: '', slug: '', status: 'coming_soon' as const }}
        updateHubContent={updateHubContent}
        addButtonLabel="Add Article"
        removeLabel="Remove Article"
      />
    </div>
  );
}
