'use client';

import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DEMO_PROMPTS = [
  {
    title: 'Code Review',
    prompt: `You are an expert code reviewer. Review this code and provide:
1. Security issues
2. Performance concerns
3. Best practice violations
4. Specific improvements

Code:
function fetchData(url) {
  return fetch(url).then(r => r.json())
}`,
  },
  {
    title: 'API Documentation',
    prompt: `Create comprehensive API documentation for this endpoint:

POST /api/users
Body: { name, email, role }

Include: description, parameters, responses, examples`,
  },
  {
    title: 'Test Cases',
    prompt: `Generate test cases for a login form with:
- Email input
- Password input
- Remember me checkbox
- Submit button

Include: happy path, edge cases, error scenarios`,
  },
];

export default function DemoPage() {
  const [prompt, setPrompt] = useState('');
  const [pattern, setPattern] = useState('persona');
  const [selectedDemo, setSelectedDemo] = useState<number | null>(null);

  // Check for pre-filled prompt from URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPrompt = params.get('prompt');
    if (urlPrompt) {
      setPrompt(decodeURIComponent(urlPrompt));
    }
  }, []);

  const handleDemoSelect = (index: number) => {
    setSelectedDemo(index);
    setPrompt(DEMO_PROMPTS[index].prompt);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4">
            <Icons.sparkles className="mr-2 h-3 w-3" />
            Interactive Demo
          </Badge>
          <h1 className="mb-2 text-4xl font-bold">AI Workbench Demo</h1>
          <p className="text-xl text-muted-foreground">
            See how prompt patterns improve your AI interactions
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Demo Prompts */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Try These Examples</CardTitle>
                <CardDescription>
                  Click to load a pre-built prompt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {DEMO_PROMPTS.map((demo, index) => (
                  <Button
                    key={index}
                    variant={selectedDemo === index ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleDemoSelect(index)}
                  >
                    <Icons.file className="mr-2 h-4 w-4" />
                    {demo.title}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Pattern Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Current Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Select value={pattern} onValueChange={setPattern}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="persona">Persona</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="chain-of-thought">Chain of Thought</SelectItem>
                      <SelectItem value="few-shot">Few-Shot</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {pattern === 'persona' && 'Assigns a role to the AI for better responses'}
                    {pattern === 'template' && 'Provides structure with placeholders'}
                    {pattern === 'chain-of-thought' && 'Breaks down complex reasoning'}
                    {pattern === 'few-shot' && 'Includes examples to guide output'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Prompt Builder */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Build Your Prompt</CardTitle>
                <CardDescription>
                  Edit the prompt below to see how patterns work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Your Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>

                {/* What Makes This Good */}
                {prompt && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-sm text-green-900">
                        <Icons.check className="inline mr-2 h-4 w-4" />
                        What Makes This Prompt Effective
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-green-800">
                      <ul className="space-y-1">
                        {prompt.toLowerCase().includes('you are') && (
                          <li>✓ Defines a clear role/persona</li>
                        )}
                        {prompt.includes('1.') && (
                          <li>✓ Uses structured formatting</li>
                        )}
                        {prompt.split('\n').length > 3 && (
                          <li>✓ Breaks down requirements clearly</li>
                        )}
                        {prompt.length > 100 && (
                          <li>✓ Provides sufficient context</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* CTA */}
                <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-6">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    Want to Execute This Prompt?
                  </h3>
                  <p className="text-sm text-purple-800 mb-4">
                    Sign up for free to run your prompts with OpenAI, Google AI, or Anthropic. 
                    Save your favorites and track your progress.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link href="/signup">
                        <Icons.sparkles className="mr-2 h-4 w-4" />
                        Sign Up Free
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/library">
                        Browse {67} Prompts
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom: Learn More */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="py-8 text-center">
            <Icons.library className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-2xl font-bold">
              Ready to Master Prompt Engineering?
            </h3>
            <p className="mb-6 text-muted-foreground">
              Access 67+ expert prompts, 15 proven patterns, and interactive learning
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/patterns">
                  <Icons.sparkles className="mr-2 h-4 w-4" />
                  Learn Patterns
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/learn">
                  <Icons.trophy className="mr-2 h-4 w-4" />
                  Start Learning
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
