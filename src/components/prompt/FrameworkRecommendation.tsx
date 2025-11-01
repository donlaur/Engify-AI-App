/**
 * FrameworkRecommendation Component
 * Displays recommended prompt framework and reasoning
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import Link from 'next/link';

interface FrameworkRecommendationProps {
  framework?: string;
  frameworkReasoning?: string;
  recommendedModel?: string;
  modelReasoning?: string;
  estimatedCost?: number;
}

export function FrameworkRecommendation({
  framework,
  frameworkReasoning,
  recommendedModel,
  modelReasoning,
  estimatedCost,
}: FrameworkRecommendationProps) {
  if (!framework && !recommendedModel) {
    return null;
  }

  const getFrameworkColor = (fw?: string) => {
    switch (fw?.toLowerCase()) {
      case 'craft':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'kernel':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'chain-of-thought':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'few-shot':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'zero-shot':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'persona':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getModelBadgeColor = (model?: string) => {
    if (!model) return 'bg-gray-100 text-gray-800';
    if (model.includes('mini') || model.includes('flash')) {
      return 'bg-green-100 text-green-800';
    }
    if (model.includes('gpt-4') || model.includes('claude')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-purple-100 text-purple-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.lightbulb className="h-4 w-4" />
          <span>AI Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Framework Recommendation */}
        {framework && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Recommended Framework:
              </span>
              <Badge className={getFrameworkColor(framework)} variant="outline">
                {framework}
              </Badge>
            </div>
            {frameworkReasoning && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  <strong>Why?</strong>
                </p>
                <p className="text-sm">{frameworkReasoning}</p>
              </div>
            )}
            <Link
              href={`/learn/${framework.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Learn more about {framework} →
            </Link>
          </div>
        )}

        {/* Model Recommendation */}
        {recommendedModel && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Recommended Model:
              </span>
              <Badge className={getModelBadgeColor(recommendedModel)} variant="outline">
                {recommendedModel}
              </Badge>
            </div>
            {modelReasoning && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  <strong>Why?</strong>
                </p>
                <p className="text-sm">{modelReasoning}</p>
              </div>
            )}
            {estimatedCost !== undefined && estimatedCost > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icons.dollarSign className="h-3 w-3" />
                <span>
                  Estimated cost: ${estimatedCost.toFixed(4)} per use
                </span>
              </div>
            )}
            <Link
              href="/opshub/ai-models"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Compare models →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

