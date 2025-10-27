/**
 * Career Progress Card
 * Shows user's career progress and next steps
 */

'use client';

import { Icons } from '@/lib/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SKILL_INFO } from '@/lib/constants/skills';

interface CareerProgressCardProps {
  level: string;
  targetLevel?: string;
  promotionReadiness: number;
  topSkills: Array<{ skill: string; improvement: number }>;
  nextMilestone?: string;
}

export function CareerProgressCard({
  level,
  targetLevel,
  promotionReadiness,
  topSkills,
  nextMilestone,
}: CareerProgressCardProps) {
  const getLevelDisplay = (lvl: string) => {
    const levels: Record<string, string> = {
      junior: 'Junior (L1-L2)',
      mid: 'Mid-Level (L3)',
      senior: 'Senior (L4)',
      staff: 'Staff (L5)',
      principal: 'Principal+ (L6+)',
    };
    return levels[lvl] || lvl;
  };

  const getReadinessColor = (readiness: number) => {
    if (readiness >= 80) return 'text-green-600';
    if (readiness >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getReadinessMessage = (readiness: number) => {
    if (readiness >= 80) return 'Ready for promotion discussion!';
    if (readiness >= 60) return 'On track for promotion';
    if (readiness >= 40) return 'Building skills';
    return 'Keep developing';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icons.target className="h-5 w-5" />
              Career Progress
            </CardTitle>
            <CardDescription>
              Track your path to {targetLevel ? getLevelDisplay(targetLevel) : 'the next level'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg">
            {getLevelDisplay(level)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Promotion Readiness */}
        {targetLevel && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Promotion Readiness</span>
              <span className={`text-2xl font-bold ${getReadinessColor(promotionReadiness)}`}>
                {promotionReadiness}%
              </span>
            </div>
            <Progress value={promotionReadiness} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {getReadinessMessage(promotionReadiness)}
            </p>
          </div>
        )}

        {/* Skills Developed */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Skills You're Developing</h4>
          <div className="space-y-2">
            {topSkills.slice(0, 3).map(({ skill, improvement }) => {
              const skillInfo = SKILL_INFO[skill as keyof typeof SKILL_INFO];
              return (
                <div key={skill} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{skillInfo?.icon}</span>
                    <span className="text-sm">{skillInfo?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={improvement} className="h-1 w-20" />
                    <span className="text-sm font-medium text-green-600">
                      +{improvement}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-start gap-2">
              <Icons.flag className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Next Milestone
                </p>
                <p className="text-blue-800 dark:text-blue-200 mt-1">
                  {nextMilestone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Career Impact */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Career Impact</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Demonstrating</p>
              <p className="font-medium">{targetLevel ? `${getLevelDisplay(targetLevel)} skills` : 'Current level mastery'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Building</p>
              <p className="font-medium">Promotion portfolio</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1">
            <Icons.trendingUp className="mr-2 h-4 w-4" />
            View Development Plan
          </Button>
          <Button variant="outline">
            <Icons.share className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
