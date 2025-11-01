'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { AI_MODELS } from '@/lib/config/ai-models';

export default function AIModelsAdminPage() {
  const [models, setModels] = useState(AI_MODELS);
  const [filter, setFilter] = useState<'all' | 'active' | 'deprecated'>('active');

  const filteredModels = models.filter(model => {
    if (filter === 'all') return true;
    if (filter === 'active') return !model.deprecated;
    if (filter === 'deprecated') return model.deprecated;
    return true;
  });

  const groupedByProvider = filteredModels.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, typeof AI_MODELS>);

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
            <Button variant="outline">
              <Icons.refresh className="mr-2 h-4 w-4" />
              Check for Updates
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{models.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {models.filter(m => !m.deprecated).length}
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
                {models.filter(m => m.deprecated).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">Oct 31, 2025</div>
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
            All Models ({models.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            size="sm"
          >
            Active ({models.filter(m => !m.deprecated).length})
          </Button>
          <Button
            variant={filter === 'deprecated' ? 'default' : 'outline'}
            onClick={() => setFilter('deprecated')}
            size="sm"
          >
            Deprecated ({models.filter(m => m.deprecated).length})
          </Button>
        </div>

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
        {Object.entries(groupedByProvider).map(([provider, providerModels]) => (
          <div key={provider} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 capitalize flex items-center gap-2">
              {provider === 'openai' && <Icons.zap className="h-6 w-6" />}
              {provider === 'anthropic' && <Icons.brain className="h-6 w-6" />}
              {provider === 'google' && <Icons.globe className="h-6 w-6" />}
              {provider}
              <Badge variant="secondary">{providerModels.length} models</Badge>
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {providerModels.map((model) => (
                <Card key={model.id} className={model.deprecated ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription className="mt-1 font-mono text-xs">
                          {model.id}
                        </CardDescription>
                      </div>
                      {model.deprecated ? (
                        <Badge variant="destructive">Deprecated</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Pricing */}
                    <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Input:</span>
                        <span className="font-mono font-semibold">
                          ${(model.costPer1kInputTokens * 1000).toFixed(2)}/1M
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Output:</span>
                        <span className="font-mono font-semibold">
                          ${(model.costPer1kOutputTokens * 1000).toFixed(2)}/1M
                        </span>
                      </div>
                    </div>

                    {/* Context Window */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Context:</span>
                      <span className="font-semibold">
                        {(model.contextWindow / 1000).toFixed(0)}K tokens
                      </span>
                    </div>

                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.map(cap => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>

                    {/* Notes */}
                    {model.notes && (
                      <p className="text-xs text-muted-foreground border-l-2 border-primary pl-2">
                        {model.notes}
                      </p>
                    )}

                    {/* Last Verified */}
                    {model.lastVerified && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icons.check className="h-3 w-3 text-green-500" />
                        Verified: {model.lastVerified}
                      </div>
                    )}

                    {/* Replacement */}
                    {model.deprecated && model.replacementModel && (
                      <div className="rounded-lg bg-orange-100 dark:bg-orange-950/50 p-2 text-xs">
                        <strong>Use instead:</strong> {model.replacementModel}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

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
              <li>Check each provider's docs for new/updated models (links above)</li>
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

