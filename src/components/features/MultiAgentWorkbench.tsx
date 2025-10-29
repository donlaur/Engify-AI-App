'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Users,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

const AVAILABLE_ROLES = [
  { id: 'engineer', name: 'Engineer', color: 'bg-green-100 text-green-800' },
  {
    id: 'architect',
    name: 'Architect',
    color: 'bg-purple-100 text-purple-800',
  },
  { id: 'director', name: 'Director', color: 'bg-gray-100 text-gray-800' },
  { id: 'pm', name: 'Product Manager', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'tech_lead', name: 'Tech Lead', color: 'bg-teal-100 text-teal-800' },
  { id: 'designer', name: 'Designer', color: 'bg-pink-100 text-pink-800' },
  { id: 'qa', name: 'QA Engineer', color: 'bg-orange-100 text-orange-800' },
  { id: 'security', name: 'Security', color: 'bg-red-100 text-red-800' },
  { id: 'devops', name: 'DevOps', color: 'bg-cyan-100 text-cyan-800' },
];

const DEFAULT_ROLES = ['engineer', 'architect', 'pm', 'tech_lead'];

const EXAMPLE_SCENARIOS = [
  {
    title: 'Add Real-Time Collaboration',
    idea: 'Add real-time collaboration to our document editor using WebSockets. Users can see each other editing in real-time with cursor positions and live updates.',
    roles: ['engineer', 'architect', 'director', 'pm', 'tech_lead', 'qa'],
    mode: 'sequential' as const,
  },
  {
    title: 'Microservices vs Monolith',
    idea: 'Migrate our monolithic application to a microservices architecture. Current app has 500K lines of code, 50 developers, and handles 10M requests/day.',
    roles: ['engineer', 'architect', 'director', 'tech_lead', 'devops'],
    mode: 'debate' as const,
  },
  {
    title: 'AI Code Review Tool',
    idea: 'Build an AI-powered code review tool that automatically reviews pull requests, suggests improvements, and catches bugs before human review.',
    roles: ['engineer', 'architect', 'pm', 'tech_lead', 'qa', 'security'],
    mode: 'sequential' as const,
  },
  {
    title: 'Hire 5 Engineers vs 2 Seniors',
    idea: 'We have budget for 5 junior engineers OR 2 senior engineers. Which should we hire? Team is currently 15 people, mostly mid-level.',
    roles: ['director', 'tech_lead', 'engineer', 'pm'],
    mode: 'debate' as const,
  },
];

export function MultiAgentWorkbench() {
  const [idea, setIdea] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(DEFAULT_ROLES);
  const [mode, setMode] = useState<'sequential' | 'debate'>('sequential');
  const [simulation, setSimulation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loadExample = (example: (typeof EXAMPLE_SCENARIOS)[0]) => {
    setIdea(example.idea);
    setSelectedRoles(example.roles);
    setMode(example.mode);
    setSimulation('');
    setError('');
  };

  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== roleId));
    } else {
      if (selectedRoles.length < 7) {
        setSelectedRoles([...selectedRoles, roleId]);
      }
    }
  };

  const runSimulation = async () => {
    if (!idea.trim()) {
      setError('Please enter an idea to evaluate');
      return;
    }

    if (selectedRoles.length === 0) {
      setError('Please select at least one role');
      return;
    }

    setIsLoading(true);
    setError('');
    setSimulation('');

    try {
      const response = await fetch('/api/multi-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          roles: selectedRoles,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate simulation');
      }

      setSimulation(data.simulation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIdea('');
    setSimulation('');
    setError('');
    setSelectedRoles(DEFAULT_ROLES);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Users className="h-8 w-8" />
          Multi-Agent Team Simulation
        </h1>
        <p className="text-gray-600">
          Simulate team discussions with AI playing different roles
        </p>
      </div>

      {/* Privacy Warning */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div className="text-sm">
              <p className="mb-1 font-semibold text-yellow-900">
                Privacy Notice
              </p>
              <p className="text-yellow-800">
                Use anonymized data only. Don&apos;t share company secrets,
                customer data, or confidential information. Treat this like a
                public forum.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Scenarios */}
      {!simulation && (
        <Card>
          <CardHeader>
            <CardTitle>Try an Example</CardTitle>
            <CardDescription>
              Click an example to see how multi-agent simulation works
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {EXAMPLE_SCENARIOS.map((example, index) => (
                <button
                  key={index}
                  onClick={() => loadExample(example)}
                  className="rounded-lg border-2 p-5 text-left transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-md"
                >
                  <h3 className="mb-2 text-base font-semibold">
                    {example.title}
                  </h3>
                  <p className="mb-3 min-h-[40px] text-sm text-gray-600">
                    {example.idea}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {example.roles.map((role) => {
                      const roleInfo = AVAILABLE_ROLES.find(
                        (r) => r.id === role
                      );
                      return (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="px-2 py-0.5 text-xs"
                        >
                          {roleInfo?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Idea</CardTitle>
          <CardDescription>
            Describe the idea, feature, or decision you want the team to
            evaluate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: Add real-time collaboration to our document editor"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            className="resize-none"
          />

          {/* Role Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Select Roles ({selectedRoles.length}/7)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ROLES.map((role) => (
                <Badge
                  key={role.id}
                  variant={
                    selectedRoles.includes(role.id) ? 'default' : 'outline'
                  }
                  className={`cursor-pointer ${
                    selectedRoles.includes(role.id) ? role.color : ''
                  }`}
                  onClick={() => toggleRole(role.id)}
                >
                  {role.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Simulation Mode
            </label>
            <div className="flex gap-2">
              <Button
                variant={mode === 'sequential' ? 'default' : 'outline'}
                onClick={() => setMode('sequential')}
                size="sm"
              >
                Sequential Review
              </Button>
              <Button
                variant={mode === 'debate' ? 'default' : 'outline'}
                onClick={() => setMode('debate')}
                size="sm"
              >
                Team Debate
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {mode === 'sequential'
                ? 'Roles review one at a time with handoffs'
                : 'Roles debate and respond to each other'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={runSimulation}
              disabled={isLoading || !idea.trim() || selectedRoles.length === 0}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
            {simulation && (
              <Button onClick={reset} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulation Output */}
      {simulation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Team Simulation Results
            </CardTitle>
            <CardDescription>
              AI-generated team discussion (
              {mode === 'sequential' ? 'Sequential Review' : 'Team Debate'})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap rounded border bg-gray-50 p-4 font-mono text-sm">
                {simulation}
              </div>
            </div>

            {/* Feedback */}
            <div className="mt-4 border-t pt-4">
              <p className="mb-2 text-sm font-medium">Was this helpful?</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  👍 Very helpful
                </Button>
                <Button size="sm" variant="outline">
                  😐 Somewhat helpful
                </Button>
                <Button size="sm" variant="outline">
                  👎 Not helpful
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Info */}
      {!simulation && !isLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="mb-2 font-semibold text-blue-900">How This Works</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>
                • AI simulates multiple team members with different perspectives
              </li>
              <li>
                • Each role evaluates your idea from their unique viewpoint
              </li>
              <li>• Surfaces blind spots and hidden costs you might miss</li>
              <li>• Teaches you how different roles think and prioritize</li>
              <li>• Use for learning, validation, or decision support</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
