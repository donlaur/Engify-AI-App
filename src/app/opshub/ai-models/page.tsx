'use client';

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { useModelsData } from '@/components/opshub/ai-models/useModelsData';
import { ModelCard } from '@/components/opshub/ai-models/ModelCard';
import { filterModels, groupModelsByProvider, getProviderIcon, type FilterType } from '@/components/opshub/ai-models/modelUtils';
import { useApiAction } from '@/components/opshub/shared/useApiAction';
import { StatsCards } from '@/components/opshub/shared/StatsCards';
import { FilterButtons } from '@/components/opshub/shared/FilterButtons';
import { LoadingState } from '@/components/opshub/shared/LoadingState';
import { EmptyState } from '@/components/opshub/shared/EmptyState';

export default function AIModelsAdminPage() {
  const { models, loading, reload } = useModelsData();
  const [filter, setFilter] = useState<FilterType>('active');
  const syncAction = useApiAction();
  const migrateAction = useApiAction();

  const filteredModels = useMemo(() => filterModels(models, filter), [models, filter]);
  const groupedByProvider = useMemo(() => groupModelsByProvider(filteredModels), [filteredModels]);

  const handleSync = async () => {
    await syncAction.execute<{ created?: number; updated?: number }>(
      async () => {
        const response = await fetch('/api/admin/ai-models/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: undefined }),
        });
        if (!response.ok) throw new Error('Failed to sync models');
        return await response.json();
      },
      {
        successMessage: (data) => {
          if (data?.created !== undefined && data?.updated !== undefined) {
            return `Created ${data.created} models, updated ${data.updated}`;
          }
          return 'Models synced successfully';
        },
        errorMessage: 'Failed to sync models',
        onSuccess: async () => {
          await reload();
        },
      }
    );
  };

  const handleMigrate = async () => {
    await migrateAction.execute<{ created?: number }>(
      async () => {
        const response = await fetch('/api/admin/ai-models/migrate', {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to migrate models');
        return await response.json();
      },
      {
        successMessage: (data) => {
          if (data?.created !== undefined) {
            return `Migrated ${data.created} models from static config`;
          }
          return 'Models migrated successfully';
        },
        errorMessage: 'Failed to migrate models',
        onSuccess: async () => {
          await reload();
        },
      }
    );
  };

  if (loading) {
    return <LoadingState message="Loading AI models..." />;
  }

  const stats = [
    { label: 'Total Models', value: models.length },
    { label: 'Active Models', value: models.filter((m) => !m.deprecated).length, variant: 'success' as const },
    { label: 'Deprecated', value: models.filter((m) => m.deprecated).length, variant: 'warning' as const },
    {
      label: 'Last Updated',
      value:
        models.length > 0 && models[0].lastVerified
          ? new Date(models[0].lastVerified).toLocaleDateString()
          : 'Never',
    },
  ];

  const filterOptions = [
    { value: 'all' as FilterType, label: 'All Models', count: models.length },
    {
      value: 'active' as FilterType,
      label: 'Active',
      count: models.filter((m) => !m.deprecated).length,
    },
    {
      value: 'deprecated' as FilterType,
      label: 'Deprecated',
      count: models.filter((m) => m.deprecated).length,
    },
  ];

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">AI Models Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage AI provider models and pricing. Keep models up-to-date to avoid API errors.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSync} disabled={syncAction.loading}>
                <Icons.refresh className={`mr-2 h-4 w-4 ${syncAction.loading ? 'animate-spin' : ''}`} />
                {syncAction.loading ? 'Syncing...' : 'Sync from Providers'}
              </Button>
              <Button variant="outline" onClick={handleMigrate} disabled={migrateAction.loading}>
                <Icons.download className="mr-2 h-4 w-4" />
                Migrate Static Config
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <StatsCards stats={stats} />

        {/* Empty State */}
        {models.length === 0 && (
          <EmptyState
            title="No Models Found"
            description={
              <>
                <p className="text-sm text-blue-600 dark:text-blue-300 mb-2">
                  No AI models found in the database. To get started:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-600 dark:text-blue-300">
                  <li>
                    Click <strong>&quot;Migrate Static Config&quot;</strong> to import models from{' '}
                    <code>src/lib/config/ai-models.ts</code>
                  </li>
                  <li>
                    Or click <strong>&quot;Sync from Providers&quot;</strong> to fetch the latest models from provider
                    APIs
                  </li>
                </ol>
              </>
            }
            actions={
              <>
                <Button onClick={handleMigrate} disabled={migrateAction.loading}>
                  <Icons.download className="mr-2 h-4 w-4" />
                  Migrate Static Config
                </Button>
                <Button variant="outline" onClick={handleSync} disabled={syncAction.loading}>
                  <Icons.refresh className={`mr-2 h-4 w-4 ${syncAction.loading ? 'animate-spin' : ''}`} />
                  Sync from Providers
                </Button>
              </>
            }
          />
        )}

        {/* Filter */}
        {models.length > 0 && (
          <FilterButtons filter={filter} onFilterChange={setFilter} options={filterOptions} />
        )}

        {/* Important Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Icons.alertTriangle className="h-5 w-5" />
              Model Names Change Frequently!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Problem:</strong> Providers update model names without notice (e.g., Google adds -002 suffixes)</p>
            <p><strong>Solution:</strong> Check provider docs monthly and update <code>src/lib/config/ai-models.ts</code></p>
            <p><strong>Test After Update:</strong> Run <code>pnpm exec tsx scripts/content/test-prompts-multi-model.ts --dry-run</code></p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" asChild>
                <a href="https://platform.openai.com/docs/models" target="_blank">
                  OpenAI Docs
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://docs.anthropic.com/en/docs/models-overview" target="_blank">
                  Anthropic Docs
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://ai.google.dev/gemini-api/docs/models/gemini" target="_blank">
                  Google Docs
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Models by Provider */}
        {Object.entries(groupedByProvider).map(([provider, providerModels]) => {
          const IconComponent = getProviderIcon(provider);
          const Icon = IconComponent ? Icons[IconComponent] : null;

          return (
            <div key={provider} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 capitalize flex items-center gap-2">
                {Icon && <Icon className="h-6 w-6" />}
                {provider}
                <Badge variant="secondary">{providerModels.length} models</Badge>
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {providerModels.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Update Instructions */}
        <Card className="mt-8 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400">
              Monthly Update Checklist
            </CardTitle>
            <CardDescription>
              Keep models current to avoid API errors like we had with Gemini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Check each provider&apos;s docs for new/updated models (links above)</li>
              <li>Update <code className="bg-muted px-1 py-0.5 rounded">src/lib/config/ai-models.ts</code> with correct model IDs</li>
              <li>Update pricing (check provider pricing pages)</li>
              <li>Mark old models as deprecated, add replacementModel</li>
              <li>Update lastVerified dates to today</li>
              <li>Test with: <code className="bg-muted px-1 py-0.5 rounded">pnpm exec tsx scripts/content/test-prompts-multi-model.ts --dry-run</code></li>
              <li>If tests pass, commit changes</li>
              <li>Update provider factory in <code className="bg-muted px-1 py-0.5 rounded">src/lib/ai/v2/factory/AIProviderFactory.ts</code></li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

