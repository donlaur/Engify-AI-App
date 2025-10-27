/**
 * Model Selector Component
 * Allows users to select AI model or use auto-selection
 */

'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AI_MODELS, AIModel } from '@/lib/ai/providers';
import { autoSelectModel, ModelRecommendation } from '@/lib/ai/model-selector';
import { formatNumber } from '@/lib/utils/string';

interface ModelSelectorProps {
  value?: string;
  onChange: (modelId: string) => void;
  prompt?: string;
  userTier?: 'free' | 'basic' | 'pro' | 'enterprise';
  availableKeys?: string[];
}

export function ModelSelector({
  value = 'auto',
  onChange,
  prompt = '',
  userTier = 'free',
  availableKeys = ['openai', 'anthropic', 'google', 'groq'],
}: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState(value);
  const [autoRecommendation, setAutoRecommendation] = useState<ModelRecommendation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Auto-select model when prompt changes
  useEffect(() => {
    if (selectedModel === 'auto' && prompt) {
      const recommendation = autoSelectModel(prompt, userTier, availableKeys);
      setAutoRecommendation(recommendation);
    }
  }, [prompt, selectedModel, userTier, availableKeys]);

  const handleChange = (modelId: string) => {
    setSelectedModel(modelId);
    onChange(modelId);
  };

  const getDisplayModel = (): AIModel | null => {
    if (selectedModel === 'auto' && autoRecommendation) {
      return autoRecommendation.model;
    }
    return AI_MODELS[selectedModel] || null;
  };

  const displayModel = getDisplayModel();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select value={selectedModel} onValueChange={handleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select AI model" />
          </SelectTrigger>
          <SelectContent>
            {/* Auto option */}
            <SelectItem value="auto">
              <div className="flex items-center gap-2">
                <Icons.sparkles className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Auto (Recommended)</span>
              </div>
            </SelectItem>

            {/* Separator */}
            <div className="h-px bg-gray-200 my-2" />

            {/* Free tier models */}
            <div className="px-2 py-1 text-xs font-semibold text-gray-500">
              Free Tier
            </div>
            {Object.values(AI_MODELS)
              .filter(m => m.tier === 'free' && availableKeys.includes(m.provider))
              .map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.displayName}</span>
                    {model.provider === 'groq' && (
                      <Badge variant="outline" className="text-xs">⚡ Fast</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}

            {/* Affordable models */}
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 mt-2">
              Affordable
            </div>
            {Object.values(AI_MODELS)
              .filter(m => m.tier === 'affordable' && availableKeys.includes(m.provider))
              .map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.displayName}</span>
                    <span className="text-xs text-gray-500">
                      ${model.inputCostPer1M.toFixed(2)}/1M
                    </span>
                  </div>
                </SelectItem>
              ))}

            {/* Premium models */}
            {userTier === 'pro' || userTier === 'enterprise' ? (
              <>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 mt-2">
                  Premium
                </div>
                {Object.values(AI_MODELS)
                  .filter(m => m.tier === 'premium' && availableKeys.includes(m.provider))
                  .map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{model.displayName}</span>
                        <Badge variant="outline" className="text-xs">Pro</Badge>
                      </div>
                    </SelectItem>
                  ))}
              </>
            ) : null}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          <Icons.info className="h-4 w-4" />
        </Button>
      </div>

      {/* Model details */}
      {displayModel && (
        <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{displayModel.displayName}</span>
              {selectedModel === 'auto' && (
                <Badge variant="outline" className="text-xs">
                  Auto-selected
                </Badge>
              )}
            </div>
            <span className="text-xs text-gray-500 capitalize">
              {displayModel.provider}
            </span>
          </div>

          {/* Auto-selection reasons */}
          {selectedModel === 'auto' && autoRecommendation && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Why this model:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {autoRecommendation.reasons.slice(0, 3).map((reason, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <Icons.check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Model specs */}
          {showDetails && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div>
                <p className="text-xs text-gray-500">Context</p>
                <p className="font-medium">
                  {formatNumber(displayModel.contextWindow)} tokens
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cost</p>
                <p className="font-medium">
                  ${displayModel.inputCostPer1M.toFixed(2)}/1M
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Max Output</p>
                <p className="font-medium">
                  {formatNumber(displayModel.maxOutputTokens)} tokens
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Features</p>
                <div className="flex gap-1">
                  {displayModel.supportsStreaming && (
                    <Badge variant="outline" className="text-xs">Stream</Badge>
                  )}
                  {displayModel.supportsJSON && (
                    <Badge variant="outline" className="text-xs">JSON</Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Estimated cost */}
          {autoRecommendation && (
            <div className="pt-2 border-t text-xs text-gray-600">
              <span>Estimated cost: </span>
              <span className="font-medium">
                ${autoRecommendation.estimatedCost.toFixed(4)}
              </span>
              <span className="mx-2">•</span>
              <span>Latency: </span>
              <span className="font-medium">
                ~{(autoRecommendation.estimatedLatency / 1000).toFixed(1)}s
              </span>
            </div>
          )}
        </div>
      )}

      {/* No keys warning */}
      {availableKeys.length === 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Icons.alertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900">No API keys configured</p>
              <p className="text-yellow-700 text-xs mt-1">
                Add your API keys in settings to use AI features
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
