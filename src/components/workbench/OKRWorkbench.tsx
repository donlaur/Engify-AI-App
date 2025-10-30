'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

interface OKR {
  objective: string;
  keyResults: string[];
  category: string;
  timeframe: string;
}

export function OKRWorkbench() {
  const [okr, setOKR] = useState<OKR>({
    objective: '',
    keyResults: ['', '', ''],
    category: 'engineering',
    timeframe: 'Q1 2025',
  });

  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const categories = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'product', label: 'Product' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'operations', label: 'Operations' },
  ];

  const timeframes = [
    'Q1 2025',
    'Q2 2025',
    'Q3 2025',
    'Q4 2025',
    'H1 2025',
    'H2 2025',
    '2025',
    '6 months',
    '3 months',
  ];

  const generateOKRPrompt = () => {
    const prompt = `You are an OKR (Objectives and Key Results) expert helping me create effective OKRs for my team.

**Context:**
- Category: ${okr.category}
- Timeframe: ${okr.timeframe}
- Objective: ${okr.objective}

**Key Results:**
${okr.keyResults.map((kr, i) => `${i + 1}. ${kr}`).join('\n')}

**Please help me:**

1. **Refine the Objective**
   - Make it more specific and measurable
   - Ensure it's ambitious but achievable
   - Align with ${okr.category} goals

2. **Improve Key Results**
   - Make each KR specific, measurable, and time-bound
   - Ensure they directly support the objective
   - Add quantitative metrics where possible

3. **Add Missing Elements**
   - Suggest additional KRs if needed
   - Identify potential risks or dependencies
   - Recommend success metrics

4. **Format for Stakeholders**
   - Create a clear, concise summary
   - Add rationale for each KR
   - Suggest progress tracking methods

**Output Format:**
- Refined Objective
- Improved Key Results (with metrics)
- Success Criteria
- Progress Tracking Plan
- Risk Mitigation Strategies

Make this actionable and ready to share with my team.`;

    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
  };

  const updateKeyResult = (index: number, value: string) => {
    const newKeyResults = [...okr.keyResults];
    newKeyResults[index] = value;
    setOKR({ ...okr, keyResults: newKeyResults });
  };

  const addKeyResult = () => {
    setOKR({ ...okr, keyResults: [...okr.keyResults, ''] });
  };

  const removeKeyResult = (index: number) => {
    if (okr.keyResults.length > 1) {
      const newKeyResults = okr.keyResults.filter((_, i) => i !== index);
      setOKR({ ...okr, keyResults: newKeyResults });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">OKR Workbench</h2>
        <p className="text-muted-foreground">
          Create effective Objectives and Key Results with AI-powered guidance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.target className="h-5 w-5" />
              OKR Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <select
                value={okr.category}
                onChange={(e) => setOKR({ ...okr, category: e.target.value })}
                className="w-full rounded-md border p-2"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Timeframe
              </label>
              <select
                value={okr.timeframe}
                onChange={(e) => setOKR({ ...okr, timeframe: e.target.value })}
                className="w-full rounded-md border p-2"
              >
                {timeframes.map((timeframe) => (
                  <option key={timeframe} value={timeframe}>
                    {timeframe}
                  </option>
                ))}
              </select>
            </div>

            {/* Objective */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Objective
              </label>
              <Textarea
                placeholder="What do you want to achieve? (e.g., Improve team productivity by 30%)"
                value={okr.objective}
                onChange={(e) => setOKR({ ...okr, objective: e.target.value })}
                rows={3}
              />
            </div>

            {/* Key Results */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Key Results
                <Badge variant="secondary" className="ml-2">
                  {okr.keyResults.length}
                </Badge>
              </label>
              <div className="space-y-2">
                {okr.keyResults.map((kr, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Key Result ${index + 1} (e.g., Reduce deployment time to <5 minutes)`}
                      value={kr}
                      onChange={(e) => updateKeyResult(index, e.target.value)}
                    />
                    {okr.keyResults.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeKeyResult(index)}
                      >
                        <Icons.x className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addKeyResult}
                  className="w-full"
                >
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Key Result
                </Button>
              </div>
            </div>

            <Button
              onClick={generateOKRPrompt}
              className="w-full"
              disabled={
                !okr.objective || okr.keyResults.every((kr) => !kr.trim())
              }
            >
              <Icons.sparkles className="mr-2 h-4 w-4" />
              Generate OKR Prompt
            </Button>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setOKR({
                    objective: 'Improve team productivity by 30%',
                    keyResults: [
                      'Reduce deployment time to <5 minutes',
                      'Increase code review completion rate to 95%',
                      'Implement automated testing for 80% of features',
                    ],
                    category: 'engineering',
                    timeframe: 'Q1 2025',
                  })
                }
                className="flex-1"
              >
                <Icons.zap className="mr-1 h-4 w-4" />
                Engineering
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setOKR({
                    objective: 'Increase user engagement by 25%',
                    keyResults: [
                      'Achieve 90% user retention rate',
                      'Increase daily active users by 40%',
                      'Reduce user churn to <5%',
                    ],
                    category: 'product',
                    timeframe: 'Q1 2025',
                  })
                }
                className="flex-1"
              >
                <Icons.users className="mr-1 h-4 w-4" />
                Product
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.fileText className="h-5 w-5" />
              Generated Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedPrompt ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-sm">
                    {generatedPrompt}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} className="flex-1">
                    <Icons.copy className="mr-2 h-4 w-4" />
                    Copy Prompt
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setGeneratedPrompt('')}
                  >
                    <Icons.refresh className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="mb-1 font-medium">How to use:</p>
                  <ol className="list-inside list-decimal space-y-1">
                    <li>Copy the prompt above</li>
                    <li>Paste it into ChatGPT, Claude, or Gemini</li>
                    <li>Get refined OKRs with metrics and tracking plans</li>
                    <li>Share the results with your team</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Icons.target className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>
                  Fill in your OKR details and click &quot;Generate OKR
                  Prompt&quot;
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.lightbulb className="h-5 w-5" />
            OKR Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">Objectives Should Be:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Inspiring and ambitious</li>
                <li>• Clear and concise</li>
                <li>• Aligned with company goals</li>
                <li>• Achievable within timeframe</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Key Results Should Be:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Specific and measurable</li>
                <li>• Time-bound</li>
                <li>• Directly support the objective</li>
                <li>• Include quantitative metrics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
