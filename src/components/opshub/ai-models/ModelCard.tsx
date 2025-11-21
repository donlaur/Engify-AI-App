import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import type { AIModel } from '@/lib/db/schemas/ai-model';

interface ModelDisplay extends AIModel {
  deprecated?: boolean;
}

interface ModelCardProps {
  model: ModelDisplay;
}

/**
 * ModelCard Component
 * 
 * A card component for displaying individual AI model information.
 * Shows model details including pricing, context window, and status.
 * 
 * @pattern REUSABLE_UI_COMPONENT
 * @principle DRY - Eliminates duplication of model card markup
 * 
 * @features
 * - Model name and ID display
 * - Pricing information (input/output costs per 1M tokens)
 * - Context window size
 * - Deprecated status indication
 * - Visual styling for deprecated models (opacity)
 * 
 * @param model - The AI model data to display
 * 
 * @example
 * ```tsx
 * <ModelCard model={modelData} />
 * ```
 * 
 * @usage
 * Used in AI model management panels to display model information in a card format.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */
export function ModelCard({ model }: ModelCardProps) {
  const inputCost = model.inputCostPer1M || (model.costPer1kInputTokens || 0) * 1000;
  const outputCost = model.outputCostPer1M || (model.costPer1kOutputTokens || 0) * 1000;
  const contextWindowK = (model.contextWindow / 1000).toFixed(0);

  return (
    <Card className={model.deprecated ? 'opacity-60' : ''}>
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
            <span className="font-mono font-semibold">${inputCost.toFixed(2)}/1M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Output:</span>
            <span className="font-mono font-semibold">${outputCost.toFixed(2)}/1M</span>
          </div>
        </div>

        {/* Context Window */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Context:</span>
          <span className="font-semibold">{contextWindowK}K tokens</span>
        </div>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1">
          {model.capabilities.map((cap) => (
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
            Last Verified: {new Date(model.lastVerified).toLocaleDateString()}
          </div>
        )}

        {/* Last Modified */}
        {model.updatedAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icons.clock className="h-3 w-3 text-blue-500" />
            Last Modified: {new Date(model.updatedAt).toLocaleDateString()}
          </div>
        )}

        {/* Status badges */}
        <div className="flex gap-2 flex-wrap">
          {model.status === 'active' && model.isAllowed && (
            <Badge variant="default" className="text-xs">
              Active
            </Badge>
          )}
          {!model.isAllowed && (
            <Badge variant="secondary" className="text-xs">
              Disabled
            </Badge>
          )}
          {model.recommended && (
            <Badge variant="outline" className="text-xs">
              ⭐ Recommended
            </Badge>
          )}
          {model.tier && (
            <Badge variant="outline" className="text-xs capitalize">
              {model.tier}
            </Badge>
          )}
        </div>

        {/* Replacement */}
        {model.deprecated && model.replacementModel && (
          <div className="rounded-lg bg-orange-100 dark:bg-orange-950/50 p-2 text-xs">
            <strong>Use instead:</strong> {model.replacementModel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

