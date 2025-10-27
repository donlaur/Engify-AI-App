'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/lib/icons';
import {
  optimizePrompt,
  getOptimizationSuggestions,
  calculateImprovementScore,
  type OptimizationResult,
} from '@/lib/promptOptimizer';

export function PromptOptimizer() {
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const handleOptimize = () => {
    if (!originalPrompt.trim()) return;

    setIsOptimizing(true);
    
    // Simulate processing time
    setTimeout(() => {
      const optimizationResult = optimizePrompt(originalPrompt);
      setResult(optimizationResult);
      setIsOptimizing(false);
      setShowDiff(true);
    }, 500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleReset = () => {
    setOriginalPrompt('');
    setResult(null);
    setShowDiff(false);
  };

  const suggestions = originalPrompt.length > 10 
    ? getOptimizationSuggestions(originalPrompt) 
    : [];

  const improvementScore = result 
    ? calculateImprovementScore(result.original, result.optimized)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Icons.sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>Prompt Optimizer</CardTitle>
              <CardDescription>
                Automatically improve your prompts using best practices
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Original Prompt</CardTitle>
          <CardDescription>
            Enter your prompt below and we'll suggest improvements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={originalPrompt}
            onChange={(e) => setOriginalPrompt(e.target.value)}
            placeholder="Enter your prompt here... (e.g., 'Write a blog post about AI')"
            rows={8}
            className="font-mono text-sm"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {originalPrompt.length} characters
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={!originalPrompt}>
                <Icons.refresh className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleOptimize}
                disabled={!originalPrompt.trim() || isOptimizing}
              >
                {isOptimizing ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Icons.sparkles className="mr-2 h-4 w-4" />
                    Optimize
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions (before optimization) */}
      {suggestions.length > 0 && !result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icons.lightbulb className="h-4 w-4 text-yellow-500" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Improvement Score */}
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Improvement Score</p>
                  <p className="text-3xl font-bold text-green-500">{improvementScore}/100</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Tokens Added</p>
                  <p className="text-2xl font-bold">+{result.tokensAdded}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Improvements</p>
                  <p className="text-2xl font-bold">{result.improvements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Improvements List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What We Improved</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Icons.check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Optimized Prompt */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Optimized Prompt</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDiff(!showDiff)}
                  >
                    {showDiff ? 'Hide' : 'Show'} Diff
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(result.optimized)}
                  >
                    <Icons.copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showDiff ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Badge variant="secondary" className="mb-2">Before</Badge>
                    <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {result.original}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2 bg-green-500/10 text-green-500">
                      After
                    </Badge>
                    <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {result.optimized}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {result.optimized}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Icons.info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-1">How it works</p>
              <p>
                This optimizer uses rule-based improvements to enhance your prompts. It adds
                structure, clarity, examples, and constraints based on best practices. For
                AI-powered optimization, connect your API keys in settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
