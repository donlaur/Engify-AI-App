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
import { Loader2, CheckCircle, Sparkles, Play, Users2 } from 'lucide-react';

const AVAILABLE_ROLES = [
  {
    id: 'engineer',
    name: 'Engineer',
    icon: '👨‍💻',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  {
    id: 'architect',
    name: 'Architect',
    icon: '🏗️',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
  {
    id: 'director',
    name: 'Director',
    icon: '💼',
    color: 'bg-slate-500',
    lightColor: 'bg-slate-50',
    textColor: 'text-slate-700',
  },
  {
    id: 'pm',
    name: 'Product Manager',
    icon: '📊',
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
  },
  {
    id: 'tech_lead',
    name: 'Tech Lead',
    icon: '⚡',
    color: 'bg-teal-500',
    lightColor: 'bg-teal-50',
    textColor: 'text-teal-700',
  },
  {
    id: 'designer',
    name: 'Designer',
    icon: '🎨',
    color: 'bg-pink-500',
    lightColor: 'bg-pink-50',
    textColor: 'text-pink-700',
  },
  {
    id: 'qa',
    name: 'QA',
    icon: '🔍',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  {
    id: 'security',
    name: 'Security',
    icon: '🔒',
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: '🚀',
    color: 'bg-cyan-500',
    lightColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
  },
];

const EXAMPLE_SCENARIOS = [
  {
    title: 'Real-Time Collaboration',
    description: 'Add WebSocket-based real-time editing',
    idea: 'Add real-time collaboration to our document editor using WebSockets. Users can see each other editing in real-time with cursor positions and live updates.',
    roles: ['engineer', 'architect', 'director', 'pm', 'tech_lead', 'qa'],
    mode: 'sequential' as const,
  },
  {
    title: 'Microservices Migration',
    description: 'Break monolith into services',
    idea: 'Migrate our monolithic application to microservices. Current app has 500K lines of code, 50 developers, and handles 10M requests/day.',
    roles: ['engineer', 'architect', 'director', 'tech_lead', 'devops'],
    mode: 'debate' as const,
  },
  {
    title: 'AI Code Review Tool',
    description: 'Automated PR review system',
    idea: 'Build an AI-powered code review tool that automatically reviews pull requests, suggests improvements, and catches bugs before human review.',
    roles: ['engineer', 'architect', 'pm', 'tech_lead', 'qa', 'security'],
    mode: 'sequential' as const,
  },
  {
    title: 'Hiring Decision',
    description: '5 juniors vs 2 seniors?',
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-slate-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
            Decision-Making Gym
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900">
            Multi-Agent Team Simulation
          </h1>
          <p className="text-lg text-gray-600">
            Practice thinking from multiple perspectives • Train your
            collaborative decision-making skills
          </p>
          <p className="mt-2 text-sm text-gray-500">
            This is a training tool to help you understand how different roles
            think. Use it to practice, not to replace real team discussions.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Input & Controls */}
          <div className="space-y-6 lg:col-span-2">
            {/* Quick Examples */}
            <Card className="border-stone-200 bg-stone-50/50 shadow-sm backdrop-blur-sm">
              <CardHeader className="border-b border-stone-200 bg-gradient-to-r from-amber-50 to-orange-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  Try an Example
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Click to load a pre-built scenario
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-stone-50/30 pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {EXAMPLE_SCENARIOS.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => loadExample(example)}
                      className="group relative overflow-hidden rounded-xl border-2 border-stone-200 bg-white/80 p-4 text-left transition-all hover:border-blue-400 hover:bg-white hover:shadow-md"
                    >
                      <div className="mb-1 text-base font-semibold text-gray-900 group-hover:text-blue-600">
                        {example.title}
                      </div>
                      <div className="mb-2 text-xs text-gray-500">
                        {example.description}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <span className="font-medium">
                          {example.roles.length} roles
                        </span>
                        <span>•</span>
                        <span className="capitalize">{example.mode}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Input */}
            <Card className="border-stone-200 bg-stone-50/50 shadow-sm backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Your Idea
                </CardTitle>
                <CardDescription className="text-gray-600">
                  What do you want the team to evaluate?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 bg-stone-50/30 pt-4">
                <Textarea
                  placeholder="Example: Add real-time collaboration to our document editor..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={4}
                  className="resize-none border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />

                {/* Mode Selection */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Mode:
                  </span>
                  <Button
                    variant={mode === 'sequential' ? 'default' : 'outline'}
                    onClick={() => setMode('sequential')}
                    size="sm"
                    className={
                      mode === 'sequential'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : ''
                    }
                  >
                    Sequential Review
                  </Button>
                  <Button
                    variant={mode === 'debate' ? 'default' : 'outline'}
                    onClick={() => setMode('debate')}
                    size="sm"
                    className={
                      mode === 'debate' ? 'bg-blue-600 hover:bg-blue-700' : ''
                    }
                  >
                    Team Debate
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={runSimulation}
                    disabled={
                      isLoading || !idea.trim() || selectedRoles.length === 0
                    }
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                  {simulation && (
                    <Button
                      onClick={reset}
                      variant="outline"
                      size="lg"
                      className="border-gray-300"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    <strong className="font-semibold">Error:</strong> {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Simulation Output */}
            {simulation && (
              <Card className="border-stone-200 bg-stone-50/50 shadow-sm backdrop-blur-sm">
                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Team Simulation Results
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {mode === 'sequential'
                      ? 'Sequential Review'
                      : 'Team Debate'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-stone-50/30 pt-4">
                  <div className="max-h-[600px] overflow-y-auto rounded-lg border-2 border-gray-200 bg-white p-6">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                      {simulation}
                    </div>
                  </div>

                  {/* Reflection Questions */}
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <h3 className="font-semibold text-gray-900">
                      💡 Reflection & Learning
                    </h3>
                    <p className="text-sm text-gray-600">
                      Take a moment to consolidate your learning:
                    </p>

                    <div className="space-y-3">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="mb-2 text-sm font-medium text-blue-900">
                          1. What was the core disagreement in this discussion?
                        </p>
                        <p className="text-xs text-blue-700">
                          Identify the main tension or trade-off that different
                          roles prioritized differently.
                        </p>
                      </div>

                      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                        <p className="mb-2 text-sm font-medium text-purple-900">
                          2. Which perspective surprised you most?
                        </p>
                        <p className="text-xs text-purple-700">
                          Which role&apos;s concerns or priorities did you
                          initially underestimate?
                        </p>
                      </div>

                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="mb-2 text-sm font-medium text-green-900">
                          3. How would you apply this to your real team?
                        </p>
                        <p className="text-xs text-green-700">
                          What specific question or concern from this simulation
                          should you raise in your next project discussion?
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="mt-6 flex items-center gap-3 border-t pt-4">
                    <span className="text-sm font-medium text-gray-700">
                      Was this helpful?
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-300 hover:bg-green-50"
                    >
                      👍 Yes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-300 hover:bg-yellow-50"
                    >
                      😐 Somewhat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-300 hover:bg-red-50"
                    >
                      👎 No
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Role Selection */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-stone-200 bg-stone-50/50 shadow-sm backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Users2 className="h-5 w-5 text-purple-600" />
                  Select Roles ({selectedRoles.length}/7)
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Who should review this idea?
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-stone-50/30 pt-4">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {AVAILABLE_ROLES.map((role) => {
                    const isSelected = selectedRoles.includes(role.id);
                    return (
                      <button
                        key={role.id}
                        onClick={() => toggleRole(role.id)}
                        className={`relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle className="absolute right-1 top-1 h-4 w-4 text-blue-600" />
                        )}
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-lg ${
                            isSelected
                              ? role.color + ' text-white'
                              : role.lightColor
                          }`}
                        >
                          {role.icon}
                        </div>
                        <div
                          className={`text-center text-xs font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}
                        >
                          {role.name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Info */}
                <div className="mt-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-blue-900">
                    💡 How it works
                  </p>
                  <ul className="space-y-1 text-xs text-blue-800">
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
    </div>
  );
}
