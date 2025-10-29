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
import { Loader2, Users, CheckCircle, Sparkles, Play } from 'lucide-react';

const AVAILABLE_ROLES = [
  { id: 'engineer', name: 'Engineer', icon: '👨‍💻', color: 'bg-green-500' },
  { id: 'architect', name: 'Architect', icon: '🏗️', color: 'bg-purple-500' },
  { id: 'director', name: 'Director', icon: '💼', color: 'bg-gray-500' },
  { id: 'pm', name: 'Product Manager', icon: '📊', color: 'bg-indigo-500' },
  { id: 'tech_lead', name: 'Tech Lead', icon: '⚡', color: 'bg-teal-500' },
  { id: 'designer', name: 'Designer', icon: '🎨', color: 'bg-pink-500' },
  { id: 'qa', name: 'QA', icon: '🔍', color: 'bg-orange-500' },
  { id: 'security', name: 'Security', icon: '🔒', color: 'bg-red-500' },
  { id: 'devops', name: 'DevOps', icon: '🚀', color: 'bg-cyan-500' },
];

const EXAMPLE_SCENARIOS = [
  {
    title: '🚀 Real-Time Collaboration',
    idea: 'Add real-time collaboration to our document editor using WebSockets. Users can see each other editing in real-time with cursor positions and live updates.',
    roles: ['engineer', 'architect', 'director', 'pm', 'tech_lead', 'qa'],
    mode: 'sequential' as const,
  },
  {
    title: '🏗️ Microservices Migration',
    idea: 'Migrate our monolithic application to microservices. Current app has 500K lines of code, 50 developers, and handles 10M requests/day.',
    roles: ['engineer', 'architect', 'director', 'tech_lead', 'devops'],
    mode: 'debate' as const,
  },
  {
    title: '🤖 AI Code Review Tool',
    idea: 'Build an AI-powered code review tool that automatically reviews pull requests, suggests improvements, and catches bugs before human review.',
    roles: ['engineer', 'architect', 'pm', 'tech_lead', 'qa', 'security'],
    mode: 'sequential' as const,
  },
  {
    title: '👥 Hiring Decision',
    idea: 'We have budget for 5 junior engineers OR 2 senior engineers. Which should we hire? Team is currently 15 people, mostly mid-level.',
    roles: ['director', 'tech_lead', 'engineer', 'pm'],
    mode: 'debate' as const,
  },
];

export function MultiAgentWorkbench() {
  const [idea, setIdea] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    'engineer',
    'architect',
    'pm',
    'tech_lead',
  ]);
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
        body: JSON.stringify({ idea, roles: selectedRoles, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate simulation');
      }

      if (!data.simulation || data.simulation.trim() === '') {
        throw new Error('Empty simulation received. Please try again.');
      }

      setSimulation(data.simulation);
    } catch (err) {
      console.error('Multi-agent simulation error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred. Check console for details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIdea('');
    setSimulation('');
    setError('');
    setSelectedRoles(['engineer', 'architect', 'pm', 'tech_lead']);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 flex items-center justify-center gap-2 text-3xl font-bold">
          <Users className="h-8 w-8 text-blue-600" />
          Multi-Agent Team Simulation
        </h1>
        <p className="text-gray-600">
          See how different roles evaluate your ideas - learn to think like a
          team
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Input & Controls */}
        <div className="space-y-4 lg:col-span-2">
          {/* Quick Examples */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Try an Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {EXAMPLE_SCENARIOS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => loadExample(example)}
                    className="group relative overflow-hidden rounded-lg border-2 border-gray-200 p-3 text-left transition-all hover:border-blue-500 hover:shadow-md"
                  >
                    <div className="mb-1 text-sm font-semibold">
                      {example.title}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {example.roles.slice(0, 4).map((role) => {
                        const roleInfo = AVAILABLE_ROLES.find(
                          (r) => r.id === role
                        );
                        return (
                          <span key={role} className="text-xs">
                            {roleInfo?.icon}
                          </span>
                        );
                      })}
                      {example.roles.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{example.roles.length - 4}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Your Idea</CardTitle>
              <CardDescription>
                What do you want the team to evaluate?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: Add real-time collaboration to our document editor..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={3}
                className="resize-none"
              />

              {/* Mode Selection - Compact */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Mode:</span>
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

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={runSimulation}
                  disabled={
                    isLoading || !idea.trim() || selectedRoles.length === 0
                  }
                  className="flex-1"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Simulation
                    </>
                  )}
                </Button>
                {simulation && (
                  <Button onClick={reset} variant="outline" size="lg">
                    Reset
                  </Button>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simulation Output */}
          {simulation && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Team Simulation Results
                </CardTitle>
                <CardDescription>
                  {mode === 'sequential' ? 'Sequential Review' : 'Team Debate'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto rounded-lg border-2 border-gray-200 bg-white p-4">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900">
                    {simulation}
                  </div>
                </div>

                {/* Feedback */}
                <div className="mt-4 flex items-center gap-2 border-t pt-4">
                  <span className="text-sm font-medium">Helpful?</span>
                  <Button size="sm" variant="outline">
                    👍
                  </Button>
                  <Button size="sm" variant="outline">
                    😐
                  </Button>
                  <Button size="sm" variant="outline">
                    👎
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Role Selection */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Select Roles ({selectedRoles.length}/7)
              </CardTitle>
              <CardDescription>Who should review this idea?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {AVAILABLE_ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${
                            isSelected
                              ? role.color + ' text-white'
                              : 'bg-gray-100'
                          }`}
                        >
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">
                            {role.name}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Info */}
              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <p className="mb-1 font-semibold">💡 How it works</p>
                <ul className="space-y-0.5">
                  <li>• AI simulates each role&apos;s perspective</li>
                  <li>• Surfaces blind spots & hidden costs</li>
                  <li>• Learn how different roles think</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
