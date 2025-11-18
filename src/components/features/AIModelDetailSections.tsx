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

type SupportedParam = NonNullable<AIModel['supportedParameters']>[keyof NonNullable<AIModel['supportedParameters']>];
type RangeParam = SupportedParam & { min?: number; max?: number; default?: number };

function isRangeParam(param: SupportedParam): param is RangeParam {
  return (
    typeof param === 'object' &&
    param !== null &&
    ('min' in param || 'max' in param || 'default' in param)
  );
}

export function ParameterSupportSection({ model }: AIModelDetailSectionsProps) {
  if (!model.supportedParameters) return null;

  const parameters: {
    name: string;
    data: SupportedParam | undefined;
    renderValue?: (param: RangeParam) => string;
  }[] = [
    {
      name: 'Temperature',
      data: model.supportedParameters.temperature,
      renderValue: (param) => {
        const parts: string[] = [];
        if (param.min !== undefined) parts.push(`Min: ${param.min}`);
        if (param.max !== undefined) parts.push(`Max: ${param.max}`);
        if (param.default !== undefined) parts.push(`Default: ${param.default}`);
        return parts.join(' • ');
      },
    },
    {
      name: 'Max Tokens',
      data: model.supportedParameters.maxTokens,
      renderValue: (param) => {
        const parts: string[] = [];
        if (param.min !== undefined) parts.push(`Min: ${param.min.toLocaleString()}`);
        if (param.max !== undefined) parts.push(`Max: ${param.max.toLocaleString()}`);
        if (param.default !== undefined)
          parts.push(`Default: ${param.default.toLocaleString()}`);
        return parts.join(' • ');
      },
    },
    {
      name: 'Stream',
      data: model.supportedParameters.stream,
    },
    {
      name: 'System Prompt',
      data: model.supportedParameters.systemPrompt,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parameter Support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {parameters.map((parameter) => {
          if (!parameter.data) return null;

          return (
            <div key={parameter.name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{parameter.name}</span>
                <Badge variant="outline">
                  {parameter.data.supported ? 'Supported' : 'Not supported'}
                </Badge>
              </div>
              {parameter.data.supported && (
                <div className="text-sm text-muted-foreground">
                  {isRangeParam(parameter.data) && parameter.renderValue
                    ? parameter.renderValue(parameter.data) || parameter.data.notes || 'Supported'
                    : parameter.data.notes || 'Supported in API requests'}
                </div>
              )}
              {parameter.data.notes && isRangeParam(parameter.data) && (
                <div className="text-xs text-muted-foreground">{parameter.data.notes}</div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function ParameterFailureAlerts({ model }: AIModelDetailSectionsProps) {
  if (!model.parameterFailures || model.parameterFailures.length === 0) {
    return null;
  }

  const recentFailures = model.parameterFailures
    .slice()
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 3);

  return (
    <Card className="border-orange-500/30 bg-orange-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <Icons.alertTriangle className="h-4 w-4" />
          Recent Parameter Failures
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          These parameters failed recently when testing or running automated audits.
          Adjust your requests or review provider documentation before retrying.
        </p>
        <div className="space-y-3">
          {recentFailures.map((failure, index) => (
            <div key={`${failure.parameter}-${index}`} className="space-y-1 rounded-md border border-orange-500/20 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{failure.parameter}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(failure.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="text-muted-foreground">{failure.error}</div>
              {failure.attemptedValue !== undefined && (
                <div className="text-xs text-muted-foreground">
                  Attempted value: <code>{JSON.stringify(failure.attemptedValue)}</code>
                </div>
              )}
              {failure.source && (
                <div className="text-xs text-muted-foreground">Source: {failure.source}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
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

