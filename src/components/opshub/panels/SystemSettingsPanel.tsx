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
import { clientLogger } from '@/lib/logging/client-logger';
import { useCrudOperations } from '@/hooks/opshub/useCrudOperations';
import { useAdminToast } from '@/hooks/opshub/useAdminToast';
import { applyFilters } from '@/lib/opshub/utils';
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
import { Switch } from '@/components/ui/switch';

interface SystemSetting {
  _id: string;
  key: string;
  value: string | number | boolean;
  category: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  createdAt: string;
  updatedAt: string;
}

/**
 * SystemSettingsPanel Component
 * 
 * Admin panel for managing system settings, including viewing, editing, and
 * creating configuration entries. Provides comprehensive settings management
 * with category filtering, search functionality, and value type handling.
 * 
 * @component
 * @pattern ADMIN_PANEL, CRUD_INTERFACE
 * @principle DRY - Uses shared components and utilities
 * 
 * @features
 * - Settings listing with pagination
 * - Search by key or description
 * - Filter by category
 * - Create, edit, and preview settings
 * - Support for multiple value types (string, number, boolean, json)
 * - Settings statistics display
 * - Preview settings in drawer
 * 
 * @example
 * ```tsx
 * <SystemSettingsPanel />
 * ```
 * 
 * @usage
 * Used in OpsHub admin center for managing system configuration.
 * Provides a complete CRUD interface for settings management.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */
export function SystemSettingsPanel() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [previewSetting, setPreviewSetting] = useState<SystemSetting | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSettings();
  }, [categoryFilter]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const res = await fetch(`/api/admin/system-settings?${params}`);
      const data = await res.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      clientLogger.apiError('/api/admin/system-settings', error, {
        component: 'SystemSettingsPanel',
        action: 'fetchSettings',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setIsCreating(false);
    setIsEditDialogOpen(true);
  };

  const handlePreview = (setting: SystemSetting) => {
    setPreviewSetting(setting);
    setIsPreviewOpen(true);
  };

  const handleCreate = () => {
    setEditingSetting({
      _id: '',
      key: '',
      value: '',
      category: 'general',
      description: '',
      type: 'string',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsCreating(true);
    setIsEditDialogOpen(true);
  };

  // Use shared CRUD operations hook
  const { success, error: showError } = useAdminToast();
  const { saveItem, deleteItem } = useCrudOperations<SystemSetting>({
    endpoint: '/api/admin/system-settings',
    onRefresh: fetchSettings,
    createSuccessMessage: 'Setting created successfully',
    updateSuccessMessage: 'Setting updated successfully',
    deleteSuccessMessage: 'Setting deleted successfully',
    onSaveSuccess: () => {
      setIsEditDialogOpen(false);
    },
  });

  const handleSave = async () => {
    if (!editingSetting) return;
    await saveItem(editingSetting, isCreating);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id, 'Are you sure you want to delete this setting?');
  };

  // Use shared filtering utilities
  const filteredSettings = useMemo(() => {
    return applyFilters(
      settings,
      categoryFilter !== 'all' ? {
        predicates: [{
          type: 'exact',
          field: 'category',
          value: categoryFilter,
        } as any],
      } : {},
      searchTerm || undefined,
      ['key', 'description']
    );
  }, [settings, categoryFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredSettings.length / itemsPerPage);
  const paginatedSettings = filteredSettings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = Array.from(new Set(settings.map((s) => s.category)));
  const stats = {
    total: settings.length,
    byCategory: categories.reduce(
      (acc, cat) => {
        acc[cat] = settings.filter((s) => s.category === cat).length;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  const renderValueInput = () => {
    if (!editingSetting) return null;

    switch (editingSetting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id="value"
              checked={editingSetting.value === true || editingSetting.value === 'true'}
              onCheckedChange={(checked) =>
                setEditingSetting({ ...editingSetting, value: checked })
              }
            />
            <Label htmlFor="value">
              {editingSetting.value === true || editingSetting.value === 'true' ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        );
      case 'number':
        return (
          <Input
            id="value"
            type="number"
            value={typeof editingSetting.value === 'number' ? editingSetting.value : ''}
            onChange={(e) =>
              setEditingSetting({
                ...editingSetting,
                value: parseFloat(e.target.value),
              })
            }
            placeholder="Enter number value"
          />
        );
      case 'json':
        return (
          <Textarea
            id="value"
            value={
              typeof editingSetting.value === 'string'
                ? editingSetting.value
                : JSON.stringify(editingSetting.value, null, 2)
            }
            onChange={(e) =>
              setEditingSetting({ ...editingSetting, value: e.target.value })
            }
            placeholder='{"key": "value"}'
            rows={6}
            className="font-mono text-sm"
          />
        );
      default:
        return (
          <Input
            id="value"
            value={typeof editingSetting.value === 'string' ? editingSetting.value : String(editingSetting.value)}
            onChange={(e) =>
              setEditingSetting({ ...editingSetting, value: e.target.value })
            }
            placeholder="Enter setting value"
          />
        );
    }
  };

  const formatValue = (value: string | number | boolean, type: string) => {
    if (type === 'boolean') {
      return value === true || value === 'true' ? 'true' : 'false';
    }
    if (type === 'json') {
      try {
        return JSON.stringify(typeof value === 'string' ? JSON.parse(value) : value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            System Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure system-wide settings and parameters
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Icons.plus className="mr-2 h-4 w-4" />
          Create Setting
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total Settings</CardDescription>
            <CardTitle className="text-4xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        {Object.entries(stats.byCategory)
          .slice(0, 3)
          .map(([category, count]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs capitalize">
                  {category}
                </CardDescription>
                <CardTitle className="text-4xl font-bold">{count}</CardTitle>
              </CardHeader>
            </Card>
          ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-gray-800"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            {filteredSettings.length} settings
            {searchTerm && ` matching "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Icons.spinner className="h-6 w-6 animate-spin" />
            </div>
          ) : paginatedSettings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No settings found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border bg-white dark:bg-gray-900">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="w-[200px] font-semibold">
                        Key
                      </TableHead>
                      <TableHead className="w-[200px] font-semibold">
                        Value
                      </TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Updated</TableHead>
                      <TableHead className="text-right font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSettings.map((setting) => (
                      <TableRow
                        key={setting._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="font-medium">
                          <button
                            onClick={() => handlePreview(setting)}
                            className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                          >
                            {setting.key}
                          </button>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-mono text-sm">
                          {formatValue(setting.value, setting.type)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{setting.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{setting.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(setting.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(setting)}
                            >
                              <Icons.edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(setting._id)}
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New Setting' : 'Edit Setting'}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? 'Add a new system configuration setting'
                : 'Update setting value and details'}
            </DialogDescription>
          </DialogHeader>

          {editingSetting && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    value={editingSetting.key}
                    onChange={(e) =>
                      setEditingSetting({ ...editingSetting, key: e.target.value })
                    }
                    placeholder="setting.key.name"
                    disabled={!isCreating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingSetting.category}
                    onChange={(e) =>
                      setEditingSetting({
                        ...editingSetting,
                        category: e.target.value,
                      })
                    }
                    placeholder="general, features, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={editingSetting.type}
                  onValueChange={(value: SystemSetting['type']) =>
                    setEditingSetting({ ...editingSetting, type: value })
                  }
                  disabled={!isCreating}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                {renderValueInput()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingSetting.description || ''}
                  onChange={(e) =>
                    setEditingSetting({
                      ...editingSetting,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what this setting controls"
                  rows={3}
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
          {previewSetting && (
            <>
              <SheetHeader>
                <SheetTitle>{previewSetting.key}</SheetTitle>
                <SheetDescription>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge>{previewSetting.category}</Badge>
                    <Badge variant="outline">{previewSetting.type}</Badge>
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {previewSetting.description && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {previewSetting.description}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Value</h4>
                  <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {formatValue(previewSetting.value, previewSetting.type)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Details</h4>
                  <dl className="space-y-1 text-sm">
                    <div>
                      <dt className="inline font-medium">Category:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {previewSetting.category}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Type:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {previewSetting.type}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Created:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {new Date(previewSetting.createdAt).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Updated:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {new Date(previewSetting.updatedAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      setIsPreviewOpen(false);
                      handleEdit(previewSetting);
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
                      handleDelete(previewSetting._id);
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
