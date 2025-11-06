/**
 * Pattern Playground
 * Interactive page to experiment with different prompt patterns
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { PATTERNS } from '@/lib/pattern-constants';

export default function PatternPlaygroundPage() {
  const [userInput, setUserInput] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('persona');
  const [transformedPrompt, setTransformedPrompt] = useState('');
  const [promptCount, setPromptCount] = useState(300);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setPromptCount(data.prompts?.total || data.stats?.prompts || 300);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }
    fetchStats();
  }, []);

  const transformPrompt = (input: string, pattern: string): string => {
    if (!input.trim()) return '';

    switch (pattern) {
      case 'persona':
        return `Act as an expert in this domain. ${input}`;

      case 'few-shot':
        return `Here are examples of the desired output format:\n\nExample 1:\n[Show example output]\n\nExample 2:\n[Show example output]\n\nNow, ${input}`;

      case 'chain-of-thought':
        return `Let's approach this step-by-step:\n\n1. First, I'll analyze the problem\n2. Then, I'll consider the options\n3. Finally, I'll provide a solution\n\nTask: ${input}`;

      case 'template':
        return `Please provide your response in this structured format:\n\n### Summary\n[Brief overview]\n\n### Details\n[Detailed explanation]\n\n### Conclusion\n[Final thoughts]\n\nTask: ${input}`;

      case 'kernel':
        return `### Context\n[Provide relevant background information]\n\n### Task\n${input}\n\n### Constraints\n- Be specific and clear\n- Provide actionable insights\n- Use concrete examples\n\n### Input\n[Describe the input data or information]\n\n### Output Format\n[Specify exactly what the output should look like]`;

      case 'cognitive-verifier':
        return `${input}\n\nAfter completing this task, please verify your answer by:\n1. Checking your assumptions\n2. Considering alternative approaches\n3. Confirming the logic is sound`;

      case 'critique-improve':
        return `Task: ${input}\n\nStep 1: Provide your initial response\n\nStep 2: Critique your response by identifying:\n- What could be clearer\n- What might be missing\n- What could be improved\n\nStep 3: Provide an improved version based on your critique`;

      case 'hypothesis-testing':
        return `Task: ${input}\n\nPlease provide:\n1. Three plausible hypotheses (from most to least likely)\n2. For each hypothesis, explain the reasoning\n3. Suggest how to test each hypothesis`;

      case 'rag':
        return `Using the most current and relevant information available, ${input}\n\nPlease cite sources and indicate the recency of the information used.`;

      case 'reverse-engineering':
        return `Given the following result or conclusion:\n[Describe the result]\n\nTask: ${input}\n\nPlease work backwards to explain:\n1. What steps led to this result\n2. What decisions were made along the way\n3. What the underlying logic was`;

      default:
        return input;
    }
  };

  const handleTransform = () => {
    setTransformedPrompt(transformPrompt(userInput, selectedPattern));
  };

  const patternCategories = {
    FOUNDATIONAL: PATTERNS.filter((p) => p.category === 'FOUNDATIONAL'),
    STRUCTURAL: PATTERNS.filter((p) => p.category === 'STRUCTURAL'),
    COGNITIVE: PATTERNS.filter((p) => p.category === 'COGNITIVE'),
    ITERATIVE: PATTERNS.filter((p) => p.category === 'ITERATIVE'),
  };

  return (
    <MainLayout>
      {/* Hero */}
      <section className="border-b bg-gradient-to-r from-purple-50 to-pink-50 py-12">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">
              <Icons.sparkles className="mr-2 h-3 w-3" />
              Interactive Learning
            </Badge>
            <h1 className="mb-4 text-4xl font-bold">Pattern Playground</h1>
            <p className="text-xl text-gray-600">
              Experiment with different prompt patterns and see how they
              transform your prompts in real-time
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Side */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Prompt</CardTitle>
                <CardDescription>
                  Enter your basic prompt or task description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Example: Help me write a function to validate email addresses"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Select Pattern:
                    </label>

                    {Object.entries(patternCategories).map(
                      ([category, patterns]) => (
                        <div key={category} className="mb-4">
                          <p className="mb-2 text-xs font-semibold text-gray-500">
                            {category}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {patterns.map((pattern) => (
                              <Badge
                                key={pattern.id}
                                variant={
                                  selectedPattern === pattern.id
                                    ? 'default'
                                    : 'outline'
                                }
                                className="cursor-pointer transition-all hover:scale-105"
                                onClick={() => setSelectedPattern(pattern.id)}
                              >
                                {pattern.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <Button
                    onClick={handleTransform}
                    className="w-full"
                    size="lg"
                  >
                    <Icons.refresh className="mr-2 h-4 w-4" />
                    Transform Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pattern Info */}
            {selectedPattern && (
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">About This Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                  {PATTERNS.find((p) => p.id === selectedPattern) && (
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">
                        {PATTERNS.find((p) => p.id === selectedPattern)?.name}
                      </p>
                      <p className="text-gray-700">
                        {
                          PATTERNS.find((p) => p.id === selectedPattern)
                            ?.description
                        }
                      </p>
                      <Badge variant="outline">
                        {PATTERNS.find((p) => p.id === selectedPattern)?.level}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Output Side */}
          <div className="space-y-6">
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.sparkles className="h-5 w-5 text-primary" />
                  Transformed Prompt
                </CardTitle>
                <CardDescription>
                  Your prompt enhanced with the {selectedPattern} pattern
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transformedPrompt ? (
                  <div className="space-y-4">
                    <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
                      {transformedPrompt}
                    </pre>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Icons.copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Icons.sparkles className="mr-2 h-4 w-4" />
                        Try in Workbench
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                    <Icons.sparkles className="mb-4 h-12 w-12" />
                    <p>
                      Enter a prompt and click &quot;Transform Prompt&quot; to
                      see the magic!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icons.lightbulb className="h-5 w-5 text-green-600" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700">
                <p>
                  • <strong>Persona</strong> - Great for expertise and tone
                </p>
                <p>
                  • <strong>Few-Shot</strong> - Best for consistent formatting
                </p>
                <p>
                  • <strong>Chain-of-Thought</strong> - Use for complex
                  reasoning
                </p>
                <p>
                  • <strong>KERNEL</strong> - Enterprise-grade quality (94%
                  success)
                </p>
                <p>
                  • <strong>Template</strong> - Structured, predictable output
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-gray-50 py-12">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Apply These Patterns?
          </h2>
          <p className="mb-6 text-gray-600">
            Browse our library of {promptCount}+ prompts using these patterns
          </p>
          <Button size="lg" asChild>
            <Link href="/prompts">
              Browse Prompt Library
              <Icons.arrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}
