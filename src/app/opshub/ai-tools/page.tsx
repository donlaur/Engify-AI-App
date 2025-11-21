'use client';

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Icons } from '@/lib/icons';
import type { AITool } from '@/lib/db/schemas/ai-tool';
import { generateSlug } from '@/lib/utils/slug';
import { useToolsData } from '@/components/opshub/ai-tools/useToolsData';
import { ToolCard } from '@/components/opshub/ai-tools/ToolCard';
import { ToolForm } from '@/components/opshub/ai-tools/ToolForm';
import { filterTools, groupToolsByCategory, type FilterType } from '@/components/opshub/ai-tools/toolUtils';
import { useApiAction } from '@/components/opshub/shared/useApiAction';
import { StatsCards } from '@/components/opshub/shared/StatsCards';
import { FilterButtons } from '@/components/opshub/shared/FilterButtons';
import { LoadingState } from '@/components/opshub/shared/LoadingState';
import { EmptyState } from '@/components/opshub/shared/EmptyState';

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
  const { tools, loading, reload } = useToolsData();
  const [filter, setFilter] = useState<FilterType>('active');
  const [editingTool, setEditingTool] = useState<ToolDisplay | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const saveAction = useApiAction();
  const toggleAction = useApiAction();

  const filteredTools = useMemo(() => filterTools(tools, filter), [tools, filter]);
  const groupedByCategory = useMemo(() => groupToolsByCategory(filteredTools), [filteredTools]);

  const handleSave = async (toolData: Partial<ToolDisplay>) => {
    await saveAction.execute(
      async () => {
        const method = editingTool ? 'PATCH' : 'POST';
        const body = editingTool
          ? { id: editingTool.id, ...toolData }
          : {
              ...toolData,
              slug: toolData.slug || generateSlug(toolData.name || ''),
            };

        const response = await fetch('/api/admin/ai-tools', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error('Failed to save tool');
        return response;
      },
      {
        successMessage: editingTool ? 'Tool updated' : 'Tool created',
        errorMessage: 'Failed to save tool',
        onSuccess: async () => {
          setIsDialogOpen(false);
          setEditingTool(null);
          await reload();
        },
      }
    );
  };

  const handleToggleStatus = async (tool: ToolDisplay) => {
    await toggleAction.execute(
      async () => {
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
        return newStatus;
      },
      {
        successMessage: (newStatus) =>
          `Tool ${newStatus === 'active' ? 'activated' : 'deprecated'}`,
        errorMessage: 'Failed to update tool',
        onSuccess: async () => {
          await reload();
        },
      }
    );
  };

  const handleEdit = (tool: ToolDisplay) => {
    setEditingTool(tool);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <LoadingState message="Loading AI tools..." />;
  }

  const stats = [
    { label: 'Total Tools', value: tools.length },
    {
      label: 'Active Tools',
      value: tools.filter((t) => t.status === 'active').length,
      variant: 'success' as const,
    },
    {
      label: 'Deprecated',
      value: tools.filter((t) => t.status === 'deprecated' || t.status === 'sunset').length,
      variant: 'warning' as const,
    },
    {
      label: 'Categories',
      value: Object.keys(groupedByCategory).length,
    },
  ];

  const filterOptions = [
    { value: 'all' as FilterType, label: 'All Tools', count: tools.length },
    {
      value: 'active' as FilterType,
      label: 'Active',
      count: tools.filter((t) => t.status === 'active').length,
    },
    {
      value: 'deprecated' as FilterType,
      label: 'Deprecated',
      count: tools.filter((t) => t.status === 'deprecated' || t.status === 'sunset').length,
    },
  ];

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
                    <DialogTitle>{editingTool ? 'Edit Tool' : 'Add New Tool'}</DialogTitle>
                    <DialogDescription>
                      {editingTool
                        ? 'Update tool information'
                        : 'Add a new AI development tool to the database'}
                    </DialogDescription>
                  </DialogHeader>
                  <ToolForm
                    tool={editingTool}
                    onSave={handleSave}
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setEditingTool(null);
                    }}
                    categoryLabels={CATEGORY_LABELS}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <StatsCards stats={stats} />

        {/* Filter */}
        <FilterButtons filter={filter} onFilterChange={setFilter} options={filterOptions} />

        {/* Empty State */}
        {tools.length === 0 && (
          <EmptyState
            title="No Tools Found"
            description={
              <>
                <p className="text-sm text-blue-600 dark:text-blue-300 mb-2">
                  No AI tools found in the database. To get started:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-600 dark:text-blue-300">
                  <li>
                    Click <strong>&quot;Add Tool&quot;</strong> to manually add a new tool
                  </li>
                  <li>Or check if tools need to be migrated from static config</li>
                </ol>
              </>
            }
            actions={
              <Button onClick={() => setIsDialogOpen(true)}>
                <Icons.plus className="mr-2 h-4 w-4" />
                Add Tool
              </Button>
            }
          />
        )}

        {/* Tools by Category */}
        {Object.entries(groupedByCategory).length > 0 && (
          <>
            {Object.entries(groupedByCategory).map(([category, categoryTools]) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  {CATEGORY_LABELS[category] || category}
                  <Badge variant="secondary">{categoryTools.length} tools</Badge>
                </h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onEdit={handleEdit}
                      onToggleStatus={handleToggleStatus}
                      categoryLabels={CATEGORY_LABELS}
                    />
                  ))}
                </div>
          </div>
        ))}
          </>
        )}

        {filteredTools.length === 0 && tools.length > 0 && (
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


