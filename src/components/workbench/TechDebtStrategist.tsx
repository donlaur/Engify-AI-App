'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

interface TechDebtScenario {
  debtType: string;
  severity: string;
  impact: string[];
  stakeholders: string[];
  budget: string;
  timeline: string;
}

export function TechDebtStrategist() {
  const [scenario, setScenario] = useState<TechDebtScenario>({
    debtType: 'code-quality',
    severity: 'medium',
    impact: [''],
    stakeholders: [''],
    budget: 'limited',
    timeline: '3-6 months'
  });

  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const debtTypes = [
    { value: 'code-quality', label: 'Code Quality Issues' },
    { value: 'architecture', label: 'Architecture Problems' },
    { value: 'dependencies', label: 'Outdated Dependencies' },
    { value: 'performance', label: 'Performance Issues' },
    { value: 'security', label: 'Security Vulnerabilities' },
    { value: 'testing', label: 'Testing Gaps' },
    { value: 'documentation', label: 'Documentation Debt' },
    { value: 'infrastructure', label: 'Infrastructure Debt' }
  ];

  const severities = [
    { value: 'low', label: 'Low (Nice to have)' },
    { value: 'medium', label: 'Medium (Should address)' },
    { value: 'high', label: 'High (Must address)' },
    { value: 'critical', label: 'Critical (Blocking)' }
  ];

  const budgets = [
    { value: 'limited', label: 'Limited Budget' },
    { value: 'moderate', label: 'Moderate Budget' },
    { value: 'generous', label: 'Generous Budget' },
    { value: 'unlimited', label: 'Unlimited Budget' }
  ];

  const timelines = [
    '1 month', '3 months', '6 months', '1 year', '2+ years'
  ];

  const generateTechDebtPrompt = () => {
    const prompt = `You are a senior engineering manager and technical debt expert helping me create a compelling business case for addressing technical debt.

**Technical Debt Context:**
- Debt Type: ${debtTypes.find(d => d.value === scenario.debtType)?.label}
- Severity: ${severities.find(s => s.value === scenario.severity)?.label}
- Budget: ${budgets.find(b => b.value === scenario.budget)?.label}
- Timeline: ${scenario.timeline}

**Impact Areas:**
${scenario.impact.filter(impact => impact.trim()).map((impact, i) => `${i + 1}. ${impact}`).join('\n')}

**Stakeholders:**
${scenario.stakeholders.filter(stakeholder => stakeholder.trim()).map((stakeholder, i) => `${i + 1}. ${stakeholder}`).join('\n')}

**Please help me create a comprehensive technical debt strategy:**

1. **Business Case Development**
   - Quantify the cost of NOT addressing this debt
   - Calculate ROI of addressing the debt
   - Identify business risks and opportunities
   - Create compelling arguments for stakeholders

2. **Risk Assessment**
   - Analyze current risks and their probability
   - Project future risks if debt remains
   - Identify critical failure points
   - Assess impact on business objectives

3. **Solution Architecture**
   - Recommend technical approach
   - Suggest implementation strategy
   - Identify required resources and skills
   - Propose phased delivery plan

4. **Resource Planning**
   - Estimate effort and timeline
   - Identify required team members
   - Suggest budget allocation
   - Plan for knowledge transfer

5. **Stakeholder Communication**
   - Create executive summary
   - Develop technical deep-dive
   - Prepare for different audiences
   - Include success metrics

6. **Implementation Plan**
   - Break down into manageable phases
   - Identify dependencies and blockers
   - Suggest parallel workstreams
   - Include testing and validation

**Output Format:**
- Executive Summary (1 page)
- Business Case with ROI calculations
- Technical Solution Overview
- Resource Requirements
- Implementation Timeline
- Risk Mitigation Strategies
- Success Metrics and KPIs

Make this actionable, data-driven, and compelling for both technical and business stakeholders.`;

    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
  };

  const updateImpact = (index: number, value: string) => {
    const newImpact = [...scenario.impact];
    newImpact[index] = value;
    setScenario({ ...scenario, impact: newImpact });
  };

  const addImpact = () => {
    setScenario({ ...scenario, impact: [...scenario.impact, ''] });
  };

  const removeImpact = (index: number) => {
    if (scenario.impact.length > 1) {
      const newImpact = scenario.impact.filter((_, i) => i !== index);
      setScenario({ ...scenario, impact: newImpact });
    }
  };

  const updateStakeholder = (index: number, value: string) => {
    const newStakeholders = [...scenario.stakeholders];
    newStakeholders[index] = value;
    setScenario({ ...scenario, stakeholders: newStakeholders });
  };

  const addStakeholder = () => {
    setScenario({ ...scenario, stakeholders: [...scenario.stakeholders, ''] });
  };

  const removeStakeholder = (index: number) => {
    if (scenario.stakeholders.length > 1) {
      const newStakeholders = scenario.stakeholders.filter((_, i) => i !== index);
      setScenario({ ...scenario, stakeholders: newStakeholders });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Tech Debt Strategist</h2>
        <p className="text-muted-foreground">
          Build compelling business cases for technical debt remediation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.wrench className="h-5 w-5" />
              Debt Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Debt Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Debt Type</label>
              <select
                value={scenario.debtType}
                onChange={(e) => setScenario({ ...scenario, debtType: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {debtTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <select
                value={scenario.severity}
                onChange={(e) => setScenario({ ...scenario, severity: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {severities.map((severity) => (
                  <option key={severity.value} value={severity.value}>
                    {severity.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="text-sm font-medium mb-2 block">Budget</label>
              <select
                value={scenario.budget}
                onChange={(e) => setScenario({ ...scenario, budget: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {budgets.map((budget) => (
                  <option key={budget.value} value={budget.value}>
                    {budget.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeline */}
            <div>
              <label className="text-sm font-medium mb-2 block">Timeline</label>
              <select
                value={scenario.timeline}
                onChange={(e) => setScenario({ ...scenario, timeline: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {timelines.map((timeline) => (
                  <option key={timeline} value={timeline}>
                    {timeline}
                  </option>
                ))}
              </select>
            </div>

            {/* Impact Areas */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Impact Areas
                <Badge variant="secondary" className="ml-2">
                  {scenario.impact.length}
                </Badge>
              </label>
              <div className="space-y-2">
                {scenario.impact.map((impact, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Impact ${index + 1} (e.g., Slower feature delivery)`}
                      value={impact}
                      onChange={(e) => updateImpact(index, e.target.value)}
                    />
                    {scenario.impact.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeImpact(index)}
                      >
                        <Icons.x className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addImpact}
                  className="w-full"
                >
                  <Icons.plus className="h-4 w-4 mr-2" />
                  Add Impact
                </Button>
              </div>
            </div>

            {/* Stakeholders */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Stakeholders
                <Badge variant="secondary" className="ml-2">
                  {scenario.stakeholders.length}
                </Badge>
              </label>
              <div className="space-y-2">
                {scenario.stakeholders.map((stakeholder, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Stakeholder ${index + 1} (e.g., Engineering Manager)`}
                      value={stakeholder}
                      onChange={(e) => updateStakeholder(index, e.target.value)}
                    />
                    {scenario.stakeholders.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeStakeholder(index)}
                      >
                        <Icons.x className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addStakeholder}
                  className="w-full"
                >
                  <Icons.plus className="h-4 w-4 mr-2" />
                  Add Stakeholder
                </Button>
              </div>
            </div>

            <Button
              onClick={generateTechDebtPrompt}
              className="w-full"
              disabled={scenario.impact.every(impact => !impact.trim()) || scenario.stakeholders.every(stakeholder => !stakeholder.trim())}
            >
              <Icons.sparkles className="h-4 w-4 mr-2" />
              Generate Strategy
            </Button>
          </CardContent>
        </Card>

        {/* Generated Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.fileText className="h-5 w-5" />
              Business Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedPrompt ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {generatedPrompt}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} className="flex-1">
                    <Icons.copy className="h-4 w-4 mr-2" />
                    Copy Strategy
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedPrompt('')}>
                    <Icons.refresh className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">How to use:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Copy the strategy above</li>
                    <li>Paste it into ChatGPT, Claude, or Gemini</li>
                    <li>Get a comprehensive business case</li>
                    <li>Present to stakeholders with confidence</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Icons.wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fill in your tech debt details and click &quot;Generate Strategy&quot;</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tech Debt Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.lightbulb className="h-5 w-5" />
            Common Technical Debt Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Code Quality Issues</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Code duplication</li>
                <li>• Complex functions</li>
                <li>• Poor naming conventions</li>
                <li>• Inconsistent patterns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Architecture Problems</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tight coupling</li>
                <li>• Monolithic design</li>
                <li>• Missing abstractions</li>
                <li>• Poor separation of concerns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Dependency Issues</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Outdated packages</li>
                <li>• Security vulnerabilities</li>
                <li>• Breaking changes</li>
                <li>• Unused dependencies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Testing Gaps</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Low test coverage</li>
                <li>• Missing integration tests</li>
                <li>• Flaky tests</li>
                <li>• Poor test quality</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


