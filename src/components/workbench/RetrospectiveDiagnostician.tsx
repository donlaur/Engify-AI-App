'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

interface RetrospectiveScenario {
  teamSize: string;
  sprintLength: string;
  currentIssues: string[];
  teamMaturity: string;
  focusArea: string;
}

export function RetrospectiveDiagnostician() {
  const [scenario, setScenario] = useState<RetrospectiveScenario>({
    teamSize: '5-10',
    sprintLength: '2 weeks',
    currentIssues: [''],
    teamMaturity: 'intermediate',
    focusArea: 'process'
  });

  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const teamSizes = [
    { value: '2-5', label: 'Small (2-5 people)' },
    { value: '5-10', label: 'Medium (5-10 people)' },
    { value: '10-15', label: 'Large (10-15 people)' },
    { value: '15+', label: 'Very Large (15+ people)' }
  ];

  const sprintLengths = [
    '1 week', '2 weeks', '3 weeks', '4 weeks', '6 weeks'
  ];

  const teamMaturities = [
    { value: 'new', label: 'New Team (forming)' },
    { value: 'intermediate', label: 'Intermediate (norming)' },
    { value: 'mature', label: 'Mature (performing)' },
    { value: 'high-performing', label: 'High-Performing (excelling)' }
  ];

  const focusAreas = [
    { value: 'process', label: 'Process Improvement' },
    { value: 'communication', label: 'Communication' },
    { value: 'technical', label: 'Technical Debt' },
    { value: 'collaboration', label: 'Team Collaboration' },
    { value: 'delivery', label: 'Delivery Speed' },
    { value: 'quality', label: 'Code Quality' }
  ];

  const generateRetrospectivePrompt = () => {
    const prompt = `You are an expert Agile coach and retrospective facilitator helping me design an effective retrospective for my team.

**Team Context:**
- Team Size: ${scenario.teamSize} people
- Sprint Length: ${scenario.sprintLength}
- Team Maturity: ${teamMaturities.find(m => m.value === scenario.teamMaturity)?.label}
- Focus Area: ${focusAreas.find(f => f.value === scenario.focusArea)?.label}

**Current Issues:**
${scenario.currentIssues.filter(issue => issue.trim()).map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

**Please help me create a comprehensive retrospective plan:**

1. **Retrospective Format**
   - Recommend the best format for our team size and maturity
   - Suggest specific activities and exercises
   - Include timing for each activity
   - Consider remote vs in-person considerations

2. **Focus Questions**
   - Create targeted questions for our focus area: ${focusAreas.find(f => f.value === scenario.focusArea)?.label}
   - Include questions that address our current issues
   - Ensure questions are actionable and specific
   - Balance positive and improvement-focused questions

3. **Facilitation Guide**
   - Provide step-by-step facilitation instructions
   - Include tips for handling difficult conversations
   - Suggest ways to keep the team engaged
   - Address common retrospective pitfalls

4. **Action Items Framework**
   - Create a template for capturing action items
   - Suggest ownership and timeline guidelines
   - Include follow-up mechanisms
   - Ensure accountability measures

5. **Success Metrics**
   - Define how we'll measure retrospective success
   - Suggest tracking methods for action items
   - Include team satisfaction indicators
   - Recommend improvement metrics

**Output Format:**
- Retrospective Agenda (with timings)
- Detailed Activity Instructions
- Focus Questions (categorized)
- Facilitation Tips
- Action Item Template
- Success Metrics Framework

Make this practical, actionable, and tailored to our specific team context.`;

    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
  };

  const updateIssue = (index: number, value: string) => {
    const newIssues = [...scenario.currentIssues];
    newIssues[index] = value;
    setScenario({ ...scenario, currentIssues: newIssues });
  };

  const addIssue = () => {
    setScenario({ ...scenario, currentIssues: [...scenario.currentIssues, ''] });
  };

  const removeIssue = (index: number) => {
    if (scenario.currentIssues.length > 1) {
      const newIssues = scenario.currentIssues.filter((_, i) => i !== index);
      setScenario({ ...scenario, currentIssues: newIssues });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Retrospective Diagnostician</h2>
        <p className="text-muted-foreground">
          Design effective retrospectives tailored to your team&apos;s specific needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.users className="h-5 w-5" />
              Team Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Team Size */}
            <div>
              <label className="text-sm font-medium mb-2 block">Team Size</label>
              <select
                value={scenario.teamSize}
                onChange={(e) => setScenario({ ...scenario, teamSize: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {teamSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sprint Length */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sprint Length</label>
              <select
                value={scenario.sprintLength}
                onChange={(e) => setScenario({ ...scenario, sprintLength: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {sprintLengths.map((length) => (
                  <option key={length} value={length}>
                    {length}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Maturity */}
            <div>
              <label className="text-sm font-medium mb-2 block">Team Maturity</label>
              <select
                value={scenario.teamMaturity}
                onChange={(e) => setScenario({ ...scenario, teamMaturity: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {teamMaturities.map((maturity) => (
                  <option key={maturity.value} value={maturity.value}>
                    {maturity.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Focus Area */}
            <div>
              <label className="text-sm font-medium mb-2 block">Focus Area</label>
              <select
                value={scenario.focusArea}
                onChange={(e) => setScenario({ ...scenario, focusArea: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {focusAreas.map((area) => (
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Issues */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Current Issues
                <Badge variant="secondary" className="ml-2">
                  {scenario.currentIssues.length}
                </Badge>
              </label>
              <div className="space-y-2">
                {scenario.currentIssues.map((issue, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Issue ${index + 1} (e.g., Communication breakdowns)`}
                      value={issue}
                      onChange={(e) => updateIssue(index, e.target.value)}
                    />
                    {scenario.currentIssues.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeIssue(index)}
                      >
                        <Icons.x className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addIssue}
                  className="w-full"
                >
                  <Icons.plus className="h-4 w-4 mr-2" />
                  Add Issue
                </Button>
              </div>
            </div>

            <Button
              onClick={generateRetrospectivePrompt}
              className="w-full"
              disabled={scenario.currentIssues.every(issue => !issue.trim())}
            >
              <Icons.sparkles className="h-4 w-4 mr-2" />
              Generate Retrospective Plan
            </Button>
          </CardContent>
        </Card>

        {/* Generated Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.fileText className="h-5 w-5" />
              Retrospective Plan
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
                    Copy Plan
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedPrompt('')}>
                    <Icons.refresh className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">How to use:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Copy the retrospective plan above</li>
                    <li>Paste it into ChatGPT, Claude, or Gemini</li>
                    <li>Get a detailed facilitation guide</li>
                    <li>Run your retrospective with confidence</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Icons.users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fill in your team details and click &quot;Generate Retrospective Plan&quot;</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Retrospective Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.lightbulb className="h-5 w-5" />
            Popular Retrospective Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Start, Stop, Continue</h4>
              <p className="text-sm text-muted-foreground">
                Simple format for new teams. What should we start, stop, or continue doing?
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Mad, Sad, Glad</h4>
              <p className="text-sm text-muted-foreground">
                Emotion-based format. What made us mad, sad, or glad this sprint?
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4Ls (Liked, Learned, Lacked, Longed For)</h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive format covering all aspects of team experience.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sailboat</h4>
              <p className="text-sm text-muted-foreground">
                Visual format identifying anchors (blockers) and wind (enablers).
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Speed Car</h4>
              <p className="text-sm text-muted-foreground">
                Fun format identifying accelerators and brakes in your process.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">KALM (Keep, Add, Less, More)</h4>
              <p className="text-sm text-muted-foreground">
                Action-oriented format focusing on concrete changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


