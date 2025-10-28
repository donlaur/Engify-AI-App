'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';

interface AuditResult {
  overallScore: number;
  kernelScores: {
    keepSimple: number;
    easyToVerify: number;
    reproducible: number;
    narrowScope: number;
    explicitConstraints: number;
    logicalStructure: number;
  };
  issues: Array<{
    severity: 'critical' | 'warning' | 'suggestion';
    category: string;
    description: string;
    fix: string;
  }>;
  recommendations: string[];
  improvedVersion: string;
}

export default function PromptAuditPage() {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const analyzePrompt = async () => {
    if (!prompt.trim()) return;

    setIsAnalyzing(true);

    // Simulate analysis (in production, this would call an AI API)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock audit result
    const result: AuditResult = {
      overallScore: 72,
      kernelScores: {
        keepSimple: 90,
        easyToVerify: 60,
        reproducible: 85,
        narrowScope: 55,
        explicitConstraints: 30,
        logicalStructure: 80,
      },
      issues: [
        {
          severity: 'critical',
          category: 'Explicit Constraints',
          description: 'No explicit constraints defined',
          fix: 'Add "Do NOT modify X" or "Keep under Y lines" constraints',
        },
        {
          severity: 'critical',
          category: 'Verification',
          description: 'Success criteria too vague',
          fix: 'Define specific, measurable success metrics',
        },
        {
          severity: 'warning',
          category: 'Scope',
          description: 'Scope could be narrower',
          fix: 'Focus on single feature instead of multiple goals',
        },
        {
          severity: 'warning',
          category: 'Structure',
          description: 'Missing output format specification',
          fix: 'Add template or example of expected output',
        },
        {
          severity: 'suggestion',
          category: 'Examples',
          description: 'No examples provided',
          fix: 'Include 1-2 examples of desired output',
        },
      ],
      recommendations: [
        'Add explicit constraints (e.g., "Do NOT modify authentication logic")',
        'Define specific success metrics (e.g., "Must handle 3 edge cases")',
        'Narrow scope to single, focused goal',
        'Specify output format with template',
        'Include examples for clarity',
      ],
      improvedVersion: `${prompt}\n\n### Constraints:\n- Do NOT modify existing authentication\n- Keep changes under 100 lines\n- Follow existing code style\n\n### Success Criteria:\n- All tests pass\n- Handles edge cases: null, empty, invalid\n- Response time < 100ms\n\n### Output Format:\n\`\`\`typescript\n// Your code here\n\`\`\``,
    };

    setAuditResult(result);
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'suggestion':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <MainLayout>
      <div className="container py-12">
        {/* Hero */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            <Icons.search className="h-4 w-4" />
            Free Tool
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Prompt Audit Tool
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analyze & Improve Your Prompts
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Get instant feedback on your prompts using our KERNEL framework.
            Find issues, get recommendations, and see an improved version.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Prompt</CardTitle>
                <CardDescription>
                  Paste your prompt below for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt to Audit</Label>
                  <textarea
                    id="prompt"
                    placeholder="Paste your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={16}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {prompt.length} characters
                  </p>
                </div>

                <Button
                  onClick={analyzePrompt}
                  disabled={!prompt.trim() || isAnalyzing}
                  size="lg"
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Icons.search className="mr-2 h-4 w-4" />
                      Audit Prompt
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* What We Check */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What We Check</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>KERNEL Framework compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Clarity and specificity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Explicit constraints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Verifiable success criteria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Scope and focus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Logical structure</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {!auditResult && !isAnalyzing && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Icons.inbox className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Enter a prompt and click &quot;Audit Prompt&quot; to see
                    results
                  </p>
                </CardContent>
              </Card>
            )}

            {isAnalyzing && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icons.spinner className="mb-4 h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Analyzing your prompt...
                  </p>
                </CardContent>
              </Card>
            )}

            {auditResult && !isAnalyzing && (
              <>
                {/* Overall Score */}
                <Card>
                  <CardHeader>
                    <CardTitle>Audit Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div
                        className={`text-6xl font-bold ${getScoreColor(auditResult.overallScore)}`}
                      >
                        {auditResult.overallScore}
                        <span className="text-2xl">/100</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Overall Quality Score
                      </p>
                    </div>

                    {/* KERNEL Scores */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">
                        KERNEL Framework:
                      </h4>
                      {Object.entries(auditResult.kernelScores).map(
                        ([key, score]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className={getScoreColor(score)}>
                                {score}/100
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Issues */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Issues Found ({auditResult.issues.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {auditResult.issues.map((issue, i) => (
                      <div key={i} className="space-y-2 rounded-lg border p-3">
                        <div className="flex items-start gap-2">
                          <Badge
                            variant={
                              getSeverityColor(issue.severity) as
                                | 'default'
                                | 'secondary'
                                | 'destructive'
                                | 'outline'
                            }
                          >
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">
                              {issue.category}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {issue.description}
                            </p>
                          </div>
                        </div>
                        <div className="rounded bg-muted/50 p-2">
                          <p className="text-xs">
                            <span className="font-semibold">Fix:</span>{' '}
                            {issue.fix}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {auditResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Icons.lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Improved Version */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Improved Version</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            auditResult.improvedVersion
                          )
                        }
                      >
                        <Icons.copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {auditResult.improvedVersion}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Icons.zap className="mb-2 h-8 w-8 text-blue-600" />
              <CardTitle className="text-lg">Instant Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get immediate feedback on your prompt quality with detailed
                scoring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Icons.target className="mb-2 h-8 w-8 text-green-600" />
              <CardTitle className="text-lg">KERNEL Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analysis based on our proven 6-principle quality framework
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Icons.sparkles className="mb-2 h-8 w-8 text-purple-600" />
              <CardTitle className="text-lg">Auto-Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See an improved version with fixes applied automatically
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
