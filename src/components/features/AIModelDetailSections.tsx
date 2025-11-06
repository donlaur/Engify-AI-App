/**
 * AI Model Detail Sections
 * 
 * Reusable components for displaying OpenAI-style model information
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import type { AIModel } from '@/lib/db/schemas/ai-model';

interface AIModelDetailSectionsProps {
  model: AIModel;
}

export function PerformanceMetrics({ model }: AIModelDetailSectionsProps) {
  if (!model.performanceMetrics) return null;

  const { reasoning, speed, priceRange } = model.performanceMetrics;

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {reasoning && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Icons.lightbulb className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Reasoning
                </span>
              </div>
              <div className="text-sm font-semibold capitalize">{reasoning}</div>
            </div>
          )}
          {speed && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Icons.zap className="h-4 w-4 text-blue-500 fill-blue-500" />
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Speed
                </span>
              </div>
              <div className="text-sm font-semibold capitalize">{speed}</div>
            </div>
          )}
          {priceRange && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Icons.dollarSign className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Price
                </span>
              </div>
              <div className="text-sm font-semibold">{priceRange}</div>
              <div className="text-xs text-muted-foreground">Input • Output</div>
            </div>
          )}
          {model.modalities && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Icons.image className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Input
                </span>
              </div>
              <div className="text-sm font-semibold">
                {[
                  model.modalities.text && model.modalities.text !== 'not-supported' && 'Text',
                  model.modalities.image && model.modalities.image !== 'not-supported' && 'Image',
                ]
                  .filter(Boolean)
                  .join(', ') || 'Text'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ModalitiesSection({ model }: AIModelDetailSectionsProps) {
  if (!model.modalities) return null;

  const modalities = [
    {
      name: 'Text',
      status: model.modalities.text,
      icon: Icons.type,
    },
    {
      name: 'Image',
      status: model.modalities.image,
      icon: Icons.image,
    },
    {
      name: 'Audio',
      status: model.modalities.audio,
      icon: Icons.music,
    },
    {
      name: 'Video',
      status: model.modalities.video,
      icon: Icons.video,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modalities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {modalities.map((modality) => {
            const Icon = modality.icon;
            const isSupported = modality.status && modality.status !== 'not-supported';
            const statusLabel =
              modality.status === 'input-output'
                ? 'Input and output'
                : modality.status === 'input-only'
                  ? 'Input only'
                  : modality.status === 'output-only'
                    ? 'Output only'
                    : 'Not supported';

            return (
              <div
                key={modality.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {isSupported ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <div className="relative">
                      <Icon className="h-5 w-5 opacity-50" />
                      <Icons.x className="absolute inset-0 h-5 w-5 text-destructive" />
                    </div>
                  )}
                  <span className="font-medium">{modality.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function FeaturesSection({ model }: AIModelDetailSectionsProps) {
  if (!model.features) return null;

  const features = [
    { name: 'Streaming', supported: model.features.streaming },
    {
      name: 'Structured outputs',
      supported: model.features.structuredOutputs,
    },
    { name: 'Distillation', supported: model.features.distillation },
    {
      name: 'Function calling',
      supported: model.features.functionCalling,
    },
    { name: 'Fine-tuning', supported: model.features.fineTuning },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="flex items-center justify-between"
            >
              <span>{feature.name}</span>
              <Badge variant={feature.supported ? 'default' : 'secondary'}>
                {feature.supported ? 'Supported' : 'Not supported'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ToolsSection({ model }: AIModelDetailSectionsProps) {
  if (!model.tools) return null;

  const tools = [
    { name: 'Web search', supported: model.tools.webSearch },
    {
      name: 'Image generation',
      supported: model.tools.imageGeneration,
    },
    { name: 'Computer use', supported: model.tools.computerUse },
    { name: 'File search', supported: model.tools.fileSearch },
    {
      name: 'Code interpreter',
      supported: model.tools.codeInterpreter,
    },
    { name: 'MCP', supported: model.tools.mcp },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Tools supported by this model when using the Responses API or similar
          interfaces.
        </p>
        <div className="space-y-2">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center justify-between"
            >
              <span>{tool.name}</span>
              <Badge variant={tool.supported ? 'default' : 'secondary'}>
                {tool.supported ? 'Supported' : 'Not supported'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function EndpointsSection({ model }: AIModelDetailSectionsProps) {
  if (!model.endpoints || model.endpoints.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Endpoints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {model.endpoints.map((endpoint) => (
            <div
              key={endpoint.path}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Icons.code className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{endpoint.name}</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {endpoint.path}
                </code>
              </div>
              {!endpoint.supported && (
                <Badge variant="secondary">Not supported</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SnapshotsSection({ model }: AIModelDetailSectionsProps) {
  if (!model.snapshots || model.snapshots.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Snapshots</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Snapshots let you lock in a specific version of the model so that
          performance and behavior remain consistent. Below is a list of all
          available snapshots and aliases for {model.displayName}.
        </p>
        <div className="space-y-3">
          {model.snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <div className="font-medium">{snapshot.id}</div>
                {snapshot.isAlias && (
                  <div className="text-sm text-muted-foreground">
                    This is an alias that points to{' '}
                    <code className="rounded bg-muted px-1">
                      {snapshot.pointsTo}
                    </code>
                  </div>
                )}
                {snapshot.isSnapshot && (
                  <div className="text-sm text-muted-foreground">
                    This is a specific snapshot version.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RateLimitsSection({ model }: AIModelDetailSectionsProps) {
  if (!model.rateLimits || model.rateLimits.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Limits</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Rate limits ensure fair and reliable access to the API by placing
          specific caps on requests or tokens used within a given time period.
          Your usage tier determines how high these limits are set and
          automatically increases as you send more requests and spend more on
          the API.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                  Tier
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                  RPM
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                  TPM
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                  Batch Queue Limit
                </th>
              </tr>
            </thead>
            <tbody>
              {model.rateLimits.map((limit, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2 font-medium">{limit.tier}</td>
                  <td className="px-4 py-2">
                    {limit.rpm?.toLocaleString() || '-'}
                  </td>
                  <td className="px-4 py-2">
                    {limit.tpm ? (
                      limit.tpm === -1 ? (
                        'Not supported'
                      ) : (
                        limit.tpm.toLocaleString()
                      )
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {limit.batchQueueLimit?.toLocaleString() || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

