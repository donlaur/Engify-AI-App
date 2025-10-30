/**
 * ROI Calculator Component
 * Shows users how much time and money they'll save
 */

'use client';

import { useState } from 'react';
import { Icons } from '@/lib/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface ROICalculatorProps {
  onComplete?: (results: ROIResults) => void;
}

interface ROIResults {
  hoursPerWeek: number;
  hoursSaved: number;
  dollarsPerYear: number;
  promptsPerWeek: number;
  careerImpact: string;
}

const ROLE_DATA = {
  engineer: {
    name: 'Software Engineer',
    avgHourlyRate: 75,
    commonTasks: [
      { task: 'Code reviews', hoursPerWeek: 5, savingsPercent: 40 },
      { task: 'Documentation', hoursPerWeek: 3, savingsPercent: 60 },
      { task: 'Bug investigation', hoursPerWeek: 4, savingsPercent: 30 },
      { task: 'Writing tests', hoursPerWeek: 3, savingsPercent: 50 },
    ],
  },
  'engineering-manager': {
    name: 'Engineering Manager',
    avgHourlyRate: 100,
    commonTasks: [
      { task: 'Performance reviews', hoursPerWeek: 3, savingsPercent: 50 },
      { task: 'Team communications', hoursPerWeek: 5, savingsPercent: 40 },
      { task: 'Project planning', hoursPerWeek: 4, savingsPercent: 35 },
      { task: '1:1 preparation', hoursPerWeek: 3, savingsPercent: 45 },
    ],
  },
  pm: {
    name: 'Product Manager',
    avgHourlyRate: 85,
    commonTasks: [
      { task: 'Writing specs', hoursPerWeek: 6, savingsPercent: 50 },
      { task: 'Stakeholder updates', hoursPerWeek: 4, savingsPercent: 45 },
      { task: 'User research analysis', hoursPerWeek: 3, savingsPercent: 40 },
      { task: 'Roadmap planning', hoursPerWeek: 3, savingsPercent: 35 },
    ],
  },
  designer: {
    name: 'Designer',
    avgHourlyRate: 70,
    commonTasks: [
      { task: 'Design documentation', hoursPerWeek: 4, savingsPercent: 55 },
      { task: 'User research', hoursPerWeek: 3, savingsPercent: 40 },
      { task: 'Design critiques', hoursPerWeek: 2, savingsPercent: 35 },
      {
        task: 'Stakeholder presentations',
        hoursPerWeek: 3,
        savingsPercent: 45,
      },
    ],
  },
  qa: {
    name: 'QA Engineer',
    avgHourlyRate: 65,
    commonTasks: [
      { task: 'Test case writing', hoursPerWeek: 6, savingsPercent: 60 },
      { task: 'Bug reporting', hoursPerWeek: 3, savingsPercent: 50 },
      { task: 'Test documentation', hoursPerWeek: 3, savingsPercent: 55 },
      { task: 'Test planning', hoursPerWeek: 2, savingsPercent: 40 },
    ],
  },
};

export function ROICalculator({ onComplete }: ROICalculatorProps) {
  const [role, setRole] = useState<keyof typeof ROLE_DATA>('engineer');
  const [teamSize, setTeamSize] = useState<number>(1);
  const [showResults, setShowResults] = useState(false);

  const roleData = ROLE_DATA[role];

  // Calculate savings
  const _totalHoursPerWeek = roleData.commonTasks.reduce(
    (sum, task) => sum + task.hoursPerWeek,
    0
  );
  const hoursSaved = roleData.commonTasks.reduce(
    (sum, task) => sum + (task.hoursPerWeek * task.savingsPercent) / 100,
    0
  );
  const hoursSavedPerYear = hoursSaved * 52;
  const dollarsPerYear = Math.round(hoursSavedPerYear * roleData.avgHourlyRate);
  const teamDollarsPerYear = dollarsPerYear * teamSize;
  const promptsPerWeek = Math.round(hoursSaved * 2); // ~2 prompts per hour saved

  const results: ROIResults = {
    hoursPerWeek: hoursSaved,
    hoursSaved: hoursSavedPerYear,
    dollarsPerYear,
    promptsPerWeek,
    careerImpact:
      role === 'engineering-manager' || role === 'pm'
        ? 'Leadership & communication skills'
        : 'Technical & communication skills',
  };

  const handleCalculate = () => {
    setShowResults(true);
    if (onComplete) {
      onComplete(results);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.calculator className="h-5 w-5" />
          Calculate Your ROI
        </CardTitle>
        <CardDescription>
          See how much time and money you&apos;ll save with AI-powered prompts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-2">
          <Label htmlFor="role">Your Role</Label>
          <Select
            value={role}
            onValueChange={(value) => setRole(value as keyof typeof ROLE_DATA)}
          >
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_DATA).map(([key, data]) => (
                <SelectItem key={key} value={key}>
                  {data.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Team Size */}
        <div className="space-y-2">
          <Label htmlFor="team-size">
            Team Size: {teamSize} {teamSize === 1 ? 'person' : 'people'}
          </Label>
          <Slider
            id="team-size"
            min={1}
            max={50}
            step={1}
            value={[teamSize]}
            onValueChange={(value: number[]) => setTeamSize(value[0])}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Calculate ROI for your entire team
          </p>
        </div>

        {/* Common Tasks */}
        <div className="space-y-3">
          <Label>Time Spent on Common Tasks</Label>
          <div className="space-y-2">
            {roleData.commonTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
              >
                <div>
                  <p className="font-medium">{task.task}</p>
                  <p className="text-sm text-muted-foreground">
                    {task.hoursPerWeek}h/week → Save {task.savingsPercent}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {((task.hoursPerWeek * task.savingsPercent) / 100).toFixed(
                      1
                    )}
                    h saved
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculate Button */}
        <Button onClick={handleCalculate} className="w-full" size="lg">
          <Icons.calculator className="mr-2 h-4 w-4" />
          Calculate My Savings
        </Button>

        {/* Results */}
        {showResults && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Your Potential Savings</h3>

            {/* Individual Savings */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Time Saved Per Week
                    </p>
                    <p className="text-4xl font-bold text-blue-600">
                      {hoursSaved.toFixed(1)}h
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {promptsPerWeek} prompts/week
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Value Per Year
                    </p>
                    <p className="text-4xl font-bold text-green-600">
                      ${dollarsPerYear.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      At ${roleData.avgHourlyRate}/hour
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Savings */}
            {teamSize > 1 && (
              <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Team Savings ({teamSize} people)
                    </p>
                    <p className="text-5xl font-bold text-purple-600">
                      ${teamDollarsPerYear.toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {(hoursSaved * teamSize).toFixed(1)} hours/week ={' '}
                      {(hoursSaved * teamSize * 52).toFixed(0)} hours/year
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Career Impact */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:bg-yellow-950">
              <div className="flex items-start gap-2">
                <Icons.trendingUp className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    Career Impact
                  </p>
                  <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                    Develop {results.careerImpact} while saving time. Show your
                    manager this ROI to justify training budget.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <Button className="flex-1" size="lg">
                <Icons.rocket className="mr-2 h-4 w-4" />
                Start Saving Time
              </Button>
              <Button variant="outline" size="lg">
                <Icons.share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
