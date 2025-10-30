/**
 * Manager Dashboard Component
 * Shows team overview, member progress, and analytics
 */

'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/lib/icons';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SKILL_INFO } from '@/lib/constants/skills';

interface TeamOverview {
  teamId: string;
  teamName: string;
  totalMembers: number;
  activeMembers: number;
  promptsUsedThisWeek: number;
  timeSavedThisWeek: number;
  topSkills: Array<{ skill: string; count: number }>;
}

interface MemberProgress {
  userId: string;
  name: string;
  email: string;
  level: string;
  promptsUsed: number;
  skillsImproving: string[];
  promotionReadiness: number;
  lastActive: Date;
}

export function ManagerDashboard() {
  const [overview, setOverview] = useState<TeamOverview[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/manager/dashboard');
      const data = await response.json();

      if (data.success) {
        setOverview(data.overview);
        if (data.overview.length > 0) {
          setSelectedTeam(data.overview[0].teamId);
          loadTeamDetails(data.overview[0].teamId);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (teamId: string) => {
    try {
      const response = await fetch(`/api/manager/team/${teamId}`);
      const data = await response.json();

      if (data.success) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Failed to load team details:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (overview.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Teams Yet</CardTitle>
          <CardDescription>
            Create a team to start tracking your team&apos;s progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <Icons.plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentTeam = overview.find((t) => t.teamId === selectedTeam);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground">
          Track your team&apos;s AI skill development and productivity
        </p>
      </div>

      {/* Team Selector */}
      {overview.length > 1 && (
        <div className="flex gap-2">
          {overview.map((team) => (
            <Button
              key={team.teamId}
              variant={selectedTeam === team.teamId ? 'default' : 'outline'}
              onClick={() => {
                setSelectedTeam(team.teamId);
                loadTeamDetails(team.teamId);
              }}
            >
              {team.teamName}
            </Button>
          ))}
        </div>
      )}

      {/* Overview Cards */}
      {currentTeam && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
              <Icons.users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentTeam.totalMembers}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentTeam.activeMembers} active this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Prompts Used
              </CardTitle>
              <Icons.zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentTeam.promptsUsedThisWeek}
              </div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Icons.clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentTeam.timeSavedThisWeek}h
              </div>
              <p className="text-xs text-muted-foreground">
                ~${Math.round(currentTeam.timeSavedThisWeek * 100)} value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Skill</CardTitle>
              <Icons.target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentTeam.topSkills[0]
                  ? SKILL_INFO[
                      currentTeam.topSkills[0].skill as keyof typeof SKILL_INFO
                    ]?.icon
                  : '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentTeam.topSkills[0]
                  ? SKILL_INFO[
                      currentTeam.topSkills[0].skill as keyof typeof SKILL_INFO
                    ]?.name
                  : 'None yet'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
          <TabsTrigger value="promotion">Promotion Pipeline</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Member Progress</CardTitle>
              <CardDescription>
                Track individual skill development and promotion readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{member.name}</h4>
                        <Badge variant="outline">{member.level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                      <div className="mt-2 flex gap-2">
                        {member.skillsImproving.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {SKILL_INFO[skill as keyof typeof SKILL_INFO]?.icon}{' '}
                            {SKILL_INFO[skill as keyof typeof SKILL_INFO]?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {member.promotionReadiness}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Promotion ready
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {member.promptsUsed} prompts used
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Team Skills Matrix</CardTitle>
              <CardDescription>
                See which skills your team is developing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track your team&apos;s AI skill development and identify growth
                opportunities.
              </p>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link href="/learn">View Learning Paths</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotion Tab */}
        <TabsContent value="promotion">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Pipeline</CardTitle>
              <CardDescription>
                Team members ready for promotion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members
                  .filter((m) => m.promotionReadiness >= 70)
                  .map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Icons.trendingUp className="h-4 w-4 text-green-600" />
                          <h4 className="font-medium">{member.name}</h4>
                          <Badge variant="outline">{member.level}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Ready for promotion discussion
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {member.promotionReadiness}%
                        </div>
                        <Button size="sm" className="mt-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}

                {members.filter((m) => m.promotionReadiness >= 70).length ===
                  0 && (
                  <p className="py-8 text-center text-muted-foreground">
                    No team members currently ready for promotion
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
