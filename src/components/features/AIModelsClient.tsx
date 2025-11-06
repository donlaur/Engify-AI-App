/**
 * AI Models Client Component
 *
 * Client-side filtering and search for AI models page
 * Separated from server component for performance
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/lib/icons';
import { generateSlug } from '@/lib/utils/slug';
import type { AIModel } from '@/lib/db/schemas/ai-model';

interface AIModelsClientProps {
  models: AIModel[];
  providers: string[];
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  groq: 'Groq',
  replicate: 'Replicate',
  perplexity: 'Perplexity',
  together: 'Together AI',
  mistral: 'Mistral',
};

export function AIModelsClient({ models, providers }: AIModelsClientProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedCapability, setSelectedCapability] = useState<string>('all');

  // Get unique capabilities from all models
  const allCapabilities = useMemo(() => {
    const caps = new Set<string>();
    models.forEach((model) => {
      model.capabilities.forEach((cap) => caps.add(cap));
    });
    return Array.from(caps).sort();
  }, [models]);

  // Filter models
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesProvider =
        selectedProvider === 'all' || model.provider === selectedProvider;
      const matchesCapability =
        selectedCapability === 'all' ||
        model.capabilities.includes(selectedCapability);
      return matchesProvider && matchesCapability;
    });
  }, [models, selectedProvider, selectedCapability]);

  // Group filtered models by provider
  const groupedByProvider = useMemo(() => {
    const grouped: Record<string, AIModel[]> = {};
    filteredModels.forEach((model) => {
      if (!grouped[model.provider]) {
        grouped[model.provider] = [];
      }
      grouped[model.provider].push(model);
    });
    return grouped;
  }, [filteredModels]);

  return (
    <>
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {PROVIDER_LABELS[provider] || provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCapability} onValueChange={setSelectedCapability}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Capabilities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Capabilities</SelectItem>
            {allCapabilities.map((cap) => (
              <SelectItem key={cap} value={cap}>
                {cap.charAt(0).toUpperCase() + cap.slice(1).replace(/-/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center text-sm text-muted-foreground">
          {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Models by Provider */}
      <div className="space-y-12">
        {Object.entries(groupedByProvider)
          .sort(([a], [b]) => PROVIDER_LABELS[a].localeCompare(PROVIDER_LABELS[b]))
          .map(([provider, providerModels]) => (
            <div key={provider}>
              <div className="mb-6 flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {PROVIDER_LABELS[provider] || provider}
                </h2>
                <Badge variant="secondary">
                  {providerModels.length}{' '}
                  {providerModels.length === 1 ? 'model' : 'models'}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {providerModels
                  .sort((a, b) => {
                    // Sort: recommended first, then by displayName
                    if (a.recommended && !b.recommended) return -1;
                    if (!a.recommended && b.recommended) return 1;
                    return a.displayName.localeCompare(b.displayName);
                  })
                  .map((model) => {
                    const slug = model.slug || generateSlug(model.displayName);
                    const costPer1M = model.costPer1kInputTokens * 1000;

                    return (
                      <Card
                        key={model.id}
                        className="group hover:border-primary transition-colors"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg group-hover:text-primary">
                                <Link
                                  href={`/learn/ai-models/${slug}`}
                                  className="hover:underline"
                                >
                                  {model.displayName}
                                </Link>
                              </CardTitle>
                              {model.codename && (
                                <div className="mt-1 text-xs text-muted-foreground font-mono">
                                  {model.codename}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              {model.status === 'deprecated' && (
                                <Badge variant="destructive" className="text-xs">
                                  Deprecated
                                </Badge>
                              )}
                              {model.status === 'sunset' && (
                                <Badge variant="destructive" className="text-xs">
                                  Sunset
                                </Badge>
                              )}
                              {model.recommended && model.status === 'active' && (
                                <Badge variant="default" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                          </div>
                          {model.notes && (
                            <CardDescription className="mt-2 text-sm line-clamp-2">
                              {model.notes}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Pricing */}
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              Pricing
                            </span>
                            <span className="text-sm font-medium">
                              {costPer1M === 0
                                ? 'Free'
                                : `$${costPer1M.toFixed(2)}/1M`}
                            </span>
                          </div>

                          {/* Context Window */}
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              Context
                            </span>
                            <span className="text-sm">
                              {(model.contextWindow / 1000).toFixed(0)}k tokens
                            </span>
                          </div>

                          {/* Capabilities */}
                          {model.capabilities.length > 0 && (
                            <div>
                              <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                                Capabilities
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {model.capabilities.slice(0, 3).map((cap) => (
                                  <Badge
                                    key={cap}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {cap.replace(/-/g, ' ')}
                                  </Badge>
                                ))}
                                {model.capabilities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{model.capabilities.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* CTA */}
                          <Button
                            asChild
                            className="w-full mt-4"
                            variant="outline"
                            size="sm"
                          >
                            <Link href={`/learn/ai-models/${slug}`}>
                              View Details
                              <Icons.arrowRight className="ml-2 h-3 w-3" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>

      {filteredModels.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              No models found matching your filters.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedProvider('all');
                setSelectedCapability('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}

