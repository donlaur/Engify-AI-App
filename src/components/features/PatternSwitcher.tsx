/**
 * Pattern Switcher Component
 * Allows users to see how the same prompt changes with different patterns
 */

'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { PATTERNS } from '@/lib/pattern-constants';

interface PatternSwitcherProps {
  basePrompt: string;
  currentPattern: string;
}

export function PatternSwitcher({
  basePrompt,
  currentPattern,
}: PatternSwitcherProps) {
  const [selectedPattern, setSelectedPattern] = useState(currentPattern);
  const [showComparison, setShowComparison] = useState(false);

  // Transform prompt based on pattern
  const transformPrompt = (pattern: string): string => {
    const baseTask = basePrompt.replace(/^Act as.*?\.\s*/i, '');

    switch (pattern) {
      case 'persona':
        return `Act as an expert in this domain. ${baseTask}`;

      case 'few-shot':
        return `Here are examples of good responses:\n\nExample 1: [Show example]\nExample 2: [Show example]\n\nNow, ${baseTask}`;

      case 'chain-of-thought':
        return `Let's approach this step-by-step:\n\n1. First, analyze...\n2. Then, consider...\n3. Finally, conclude...\n\n${baseTask}`;

      case 'template':
        return `Please provide your response in this format:\n\n### Section 1\n[Your content]\n\n### Section 2\n[Your content]\n\n${baseTask}`;

      case 'kernel':
        return `### Context\n[Provide background]\n\n### Task\n${baseTask}\n\n### Constraints\n- Be specific\n- Be concise\n\n### Output Format\n[Specify format]`;

      case 'cognitive-verifier':
        return `${basePrompt}\n\nAfter providing your answer, verify your reasoning by asking yourself: "Is this correct? What assumptions did I make?"`;

      case 'critique-improve':
        return `First, ${baseTask}\n\nThen, critique your own response and provide an improved version.`;

      default:
        return basePrompt;
    }
  };

  const availablePatterns = PATTERNS.filter((p) =>
    [
      'persona',
      'few-shot',
      'chain-of-thought',
      'template',
      'kernel',
      'cognitive-verifier',
      'critique-improve',
    ].includes(p.id)
  );

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icons.refresh className="h-5 w-5" />
              Pattern Switcher
            </CardTitle>
            <CardDescription>
              See how this prompt changes with different patterns
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? 'Hide' : 'Show'} Comparison
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pattern Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Select Pattern:
          </label>
          <div className="flex flex-wrap gap-2">
            {availablePatterns.map((pattern) => (
              <Badge
                key={pattern.id}
                variant={selectedPattern === pattern.id ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => setSelectedPattern(pattern.id)}
              >
                {pattern.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Current Pattern Display */}
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge>{selectedPattern}</Badge>
            <span className="text-sm font-medium">Current Pattern</span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-foreground">
            {transformPrompt(selectedPattern)}
          </pre>
        </div>

        {/* Comparison View */}
        {showComparison && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-t pt-4">
              <Icons.refresh className="h-4 w-4" />
              <span className="font-semibold">Pattern Comparison</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Original */}
              <div className="rounded-lg border bg-muted p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{currentPattern}</Badge>
                  <span className="text-xs font-medium">Original</span>
                </div>
                <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                  {transformPrompt(currentPattern)}
                </pre>
              </div>

              {/* Selected */}
              <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/50">
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="bg-green-600">{selectedPattern}</Badge>
                  <span className="text-xs font-medium">New Pattern</span>
                </div>
                <pre className="whitespace-pre-wrap text-xs text-green-900 dark:text-green-100">
                  {transformPrompt(selectedPattern)}
                </pre>
              </div>
            </div>

            {/* Impact Analysis */}
            <Card className="bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Icons.lightbulb className="h-5 w-5 text-blue-600" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-blue-900">
                      Pattern Impact:
                    </p>
                    {selectedPattern === 'chain-of-thought' && (
                      <p className="text-blue-800">
                        ✅ Better for complex reasoning tasks
                        <br />
                        ✅ Makes AI logic transparent
                        <br />
                        ⚠️ Uses more tokens
                      </p>
                    )}
                    {selectedPattern === 'few-shot' && (
                      <p className="text-blue-800 dark:text-blue-200">
                        ✅ Ensures consistent format
                        <br />
                        ✅ Reduces ambiguity
                        <br />
                        ⚠️ Requires good examples
                      </p>
                    )}
                    {selectedPattern === 'kernel' && (
                      <p className="text-blue-800">
                        ✅ Enterprise-grade quality
                        <br />
                        ✅ 94% success rate
                        <br />✅ Highly reproducible
                      </p>
                    )}
                    {selectedPattern === 'template' && (
                      <p className="text-blue-800">
                        ✅ Structured output
                        <br />
                        ✅ Easy to verify
                        <br />✅ Consistent results
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 border-t pt-4">
          <Button size="sm" className="flex-1">
            <Icons.copy className="mr-2 h-4 w-4" />
            Copy New Version
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Icons.sparkles className="mr-2 h-4 w-4" />
            Try in Workbench
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
