'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import {
  estimateTokens,
  getCostComparison,
  getCheapestModel,
  getOptimizationTips,
  formatCost,
} from '@/lib/tokenizer';

interface TokenCounterProps {
  text: string;
  expectedOutputTokens?: number;
}

export function TokenCounter({ text, expectedOutputTokens = 500 }: TokenCounterProps) {
  const [tokenCount, setTokenCount] = useState(estimateTokens(text));
  const [costComparison, setCostComparison] = useState(
    getCostComparison(tokenCount.tokens, expectedOutputTokens)
  );
  const [cheapestModel, setCheapestModel] = useState(
    getCheapestModel(tokenCount.tokens, expectedOutputTokens)
  );
  const [tips, setTips] = useState(getOptimizationTips(tokenCount.tokens));

  useEffect(() => {
    const count = estimateTokens(text);
    setTokenCount(count);
    setCostComparison(getCostComparison(count.tokens, expectedOutputTokens));
    setCheapestModel(getCheapestModel(count.tokens, expectedOutputTokens));
    setTips(getOptimizationTips(count.tokens));
  }, [text, expectedOutputTokens]);

  return (
    <div className="space-y-4">
      {/* Token Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.hash className="h-5 w-5" />
            Token Analysis
          </CardTitle>
          <CardDescription>Estimated token count and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tokens</p>
              <p className="text-2xl font-bold">{tokenCount.tokens.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Characters</p>
              <p className="text-2xl font-bold">{tokenCount.characters.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Words</p>
              <p className="text-2xl font-bold">{tokenCount.words.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.dollarSign className="h-5 w-5" />
            Cost Comparison
          </CardTitle>
          <CardDescription>
            Estimated cost per request (input + {expectedOutputTokens} output tokens)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {costComparison
              .sort((a, b) => a.cost - b.cost)
              .map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {model.provider}
                        {!model.fitsInContext && (
                          <span className="text-destructive ml-2">⚠️ Exceeds context</span>
                        )}
                      </p>
                    </div>
                    {model.id === cheapestModel?.id && (
                      <Badge variant="secondary" className="text-xs">
                        Cheapest
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCost(model.cost)}</p>
                    <p className="text-xs text-muted-foreground">
                      {model.contextWindow.toLocaleString()} tokens max
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      {tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.lightbulb className="h-5 w-5" />
              Optimization Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Icons.check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Cheapest Recommendation */}
      {cheapestModel && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Icons.sparkles className="h-4 w-4 text-primary" />
              <p className="font-semibold">Recommended</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Use <strong>{cheapestModel.name}</strong> for the best value at{' '}
              <strong>{formatCost(cheapestModel.cost)}</strong> per request.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
