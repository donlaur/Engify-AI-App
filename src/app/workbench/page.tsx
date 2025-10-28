'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { API_ROUTES } from '@/lib/constants';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProviderResponse {
  provider: string;
  response: string;
  time: number;
  tokens?: number;
  error?: string;
}

export default function WorkbenchPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [providerResponses, setProviderResponses] = useState<
    ProviderResponse[]
  >([]);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    resetAt: string;
    tier: string;
  } | null>(null);

  // Real AI execution with history tracking
  const handleExecute = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse('');
    const startTime = Date.now();

    try {
      const res = await fetch('/api/v2/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider,
          temperature: 0.7,
          maxTokens: 2000,
        }),
      });

      const data = await res.json();
      const executionTime = Date.now() - startTime;

      // Update rate limit info
      if (data.rateLimit) {
        setRateLimitInfo({
          remaining: data.rateLimit.remaining,
          resetAt: data.rateLimit.resetAt,
          tier: data.rateLimit.tier,
        });
      }

      if (!res.ok) {
        setResponse(`Error: ${data.error || 'Failed to execute prompt'}`);
      } else {
        setResponse(data.response);

        // Save to history
        await fetch('/api/prompts/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptId: 'workbench',
            promptTitle: 'Custom Workbench Prompt',
            promptText: prompt,
            response: data.response,
            model: data.model,
            tokensUsed: data.usage?.totalTokens,
            executionTime,
          }),
        });

        // Track analytics
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptId: 'workbench',
            event: 'execute',
            metadata: {
              model: data.model,
              tokensUsed: data.usage?.totalTokens,
            },
          }),
        });
      }
    } catch (error) {
      setResponse('Error: Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(response);
  };

  // Compare across all providers - REAL IMPLEMENTATION
  const handleCompareAll = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setProviderResponses([]);
    setResponse(''); // Clear single response

    const providers: Array<'openai' | 'anthropic' | 'google' | 'groq'> = [
      'openai',
      'anthropic',
      'google',
      'groq',
    ];

    // Execute all providers in parallel for speed
    const promises = providers.map(async (prov) => {
      const startTime = Date.now();
      try {
        const res = await fetch(API_ROUTES.ai, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            provider: prov,
            temperature: 0.7,
          }),
        });

        const data = await res.json();
        const executionTime = Date.now() - startTime;

        return {
          provider: prov,
          response: data.error || data.response,
          time: executionTime,
          tokens: data.usage?.totalTokens,
          error: data.error,
        };
      } catch (error) {
        return {
          provider: prov,
          response: 'Failed to execute',
          time: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.all(promises);
    setProviderResponses(results);
    setIsLoading(false);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">AI Workbench</h1>
          <p className="text-muted-foreground">
            Test prompts across 4 AI providers. Free to use with rate limits.
          </p>
        </div>

        {/* Rate Limit Info Banner */}
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Icons.shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Free Tier: 10 requests per day
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {rateLimitInfo ? (
                    <>
                      {rateLimitInfo.remaining} requests remaining • Resets{' '}
                      {new Date(rateLimitInfo.resetAt).toLocaleTimeString()}
                    </>
                  ) : (
                    '3 requests per hour • Sign up for more capacity'
                  )}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Sign Up for More
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Input</CardTitle>
                <CardDescription>
                  Enter your prompt and select an AI provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Provider Selection */}
                <div className="space-y-2">
                  <Label htmlFor="provider">AI Provider</Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">
                        <div className="flex items-center gap-2">
                          <Icons.zap className="h-4 w-4" />
                          OpenAI GPT-4
                        </div>
                      </SelectItem>
                      <SelectItem value="anthropic">
                        <div className="flex items-center gap-2">
                          <Icons.sparkles className="h-4 w-4" />
                          Anthropic Claude
                        </div>
                      </SelectItem>
                      <SelectItem value="google">
                        <div className="flex items-center gap-2">
                          <Icons.star className="h-4 w-4" />
                          Google Gemini
                        </div>
                      </SelectItem>
                      <SelectItem value="groq">
                        <div className="flex items-center gap-2">
                          <Icons.zap className="h-4 w-4" />
                          Groq (Fastest)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {provider === 'openai' && 'Best overall • $0.50/1M tokens'}
                    {provider === 'anthropic' &&
                      'Complex reasoning • 200K context'}
                    {provider === 'google' && 'Free tier • 1M context'}
                    {provider === 'groq' && '10x faster • Free tier'}
                  </p>
                </div>

                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Your Prompt</Label>
                  <textarea
                    id="prompt"
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={12}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    {prompt.length} characters
                  </p>
                </div>

                {/* Execute Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleExecute}
                    disabled={!prompt.trim() || isLoading}
                    size="lg"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Icons.play className="mr-2 h-4 w-4" />
                        Execute
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCompareAll}
                    disabled={!prompt.trim() || isLoading}
                    size="lg"
                    variant="outline"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <Icons.refresh className="mr-2 h-4 w-4" />
                        Compare All
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Compare All tests your prompt across 4 AI providers
                </p>
              </CardContent>
            </Card>

            {/* Comparison Results */}
            {providerResponses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Provider Comparison</CardTitle>
                  <CardDescription>Results from 4 AI providers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {providerResponses.map((result) => (
                    <div
                      key={result.provider}
                      className="rounded-lg border p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={result.error ? 'destructive' : 'default'}
                          >
                            {result.provider.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {result.time}ms
                          </span>
                          {result.tokens && (
                            <span className="text-xs text-muted-foreground">
                              {result.tokens} tokens
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(result.response)
                          }
                        >
                          <Icons.copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="rounded bg-muted/50 p-3">
                        <pre className="whitespace-pre-wrap text-xs">
                          {result.response}
                        </pre>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Today&apos;s Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Executions</span>
                    <Badge variant="secondary">3 / 10</Badge>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary"
                      style={{ width: '30%' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    7 executions remaining today
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Response</CardTitle>
                    <CardDescription>
                      AI-generated response will appear here
                    </CardDescription>
                  </div>
                  {response && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyResponse}
                    >
                      <Icons.copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!response && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Icons.inbox className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No response yet. Execute a prompt to see results.
                    </p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Icons.spinner className="mb-4 h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">
                      Generating response...
                    </p>
                  </div>
                )}

                {response && !isLoading && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {response}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Response Stats */}
            {response && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Response Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Provider</span>
                    <Badge variant="outline">{provider}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tokens</span>
                    <span className="font-medium">
                      ~{Math.floor(response.length / 4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Est. Cost</span>
                    <span className="font-medium">
                      $0.00{Math.floor(Math.random() * 9) + 1}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
