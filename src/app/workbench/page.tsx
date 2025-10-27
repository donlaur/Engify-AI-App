'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { TokenCounter } from '@/components/workbench/TokenCounter';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function WorkbenchPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState('openai');

  // Mock execution - will be replaced with real API calls
  const handleExecute = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse('');

    // Simulate API call
    setTimeout(() => {
      setResponse(
        `[Mock Response from ${provider}]\n\nThis is a simulated response. In production, this will execute your prompt using the selected AI provider with proper rate limiting and security.\n\nYour prompt was:\n"${prompt}"\n\nThe actual implementation will:\n- Validate the prompt for security\n- Apply rate limiting\n- Track token usage\n- Return real AI-generated responses`
      );
      setIsLoading(false);
    }, 1500);
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(response);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">AI Workbench</h1>
          <p className="text-muted-foreground">
            Test prompts with multiple AI providers. Rate-limited for security.
          </p>
        </div>

        {/* Pro Feature Banner */}
        <Card className="mb-6 border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Icons.sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  Upgrade to Pro for unlimited executions
                </p>
                <p className="text-sm text-muted-foreground">
                  Free users: 10 executions/day • Pro: Unlimited
                </p>
              </div>
            </div>
            <Button variant="default">Upgrade to Pro</Button>
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
                    </SelectContent>
                  </Select>
                </div>

                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Your Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {prompt.length} characters
                  </p>
                </div>

                {/* Execute Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowTokenCounter(!showTokenCounter)}
                    variant="outline"
                    size="lg"
                  >
                    <Icons.hash className="mr-2 h-4 w-4" />
                    {showTokenCounter ? 'Hide' : 'Show'} Tokens
                  </Button>
                  <Button
                    onClick={handleExecute}
                    disabled={!prompt.trim() || isExecuting}
                    size="lg"
                  >
                    {isExecuting ? (
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
                </div>
              </CardContent>
            </Card>

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
