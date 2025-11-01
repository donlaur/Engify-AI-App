'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';

export default function DashboardPage() {
  // Real user data from session
  const user = {
    name: 'User', // Will come from session
    email: 'user@example.com',
    level: 1,
    xp: 0,
    xpToNextLevel: 500,
    joinedDate: new Date(),
  };

  // Get prompts for stats
  const allPrompts = getSeedPromptsWithTimestamps();

  // Real user stats - starts at zero
  const stats = {
    promptsUsed: 0,
    totalPrompts: allPrompts.length,
    favoritePrompts: 0,
    patternsLearned: 0,
    totalPatterns: 15,
    streak: 0,
    totalViews: 0,
  };

  // Calculate XP percentage
  const xpPercentage = (user.xp / user.xpToNextLevel) * 100;

  // Recent activity - will populate as user uses the app
  const recentActivity: Array<{
    id: string;
    type: string;
    promptTitle: string;
    timestamp: Date;
  }> = [];

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'used':
        return Icons.zap;
      case 'favorited':
        return Icons.heart;
      case 'learned':
        return Icons.sparkles;
      default:
        return Icons.check;
    }
  };

  // Get activity color
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'used':
        return 'text-blue-600';
      case 'favorited':
        return 'text-red-600';
      case 'learned':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Track your progress and continue
            learning.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Prompts Used */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Prompts Used
              </CardTitle>
              <Icons.zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.promptsUsed}</div>
              <p className="text-xs text-muted-foreground">
                of {stats.totalPrompts} available
              </p>
            </CardContent>
          </Card>

          {/* Favorites */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Icons.heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoritePrompts}</div>
              <p className="text-xs text-muted-foreground">saved prompts</p>
            </CardContent>
          </Card>

          {/* Patterns Learned */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Patterns Learned
              </CardTitle>
              <Icons.sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.patternsLearned}</div>
              <p className="text-xs text-muted-foreground">
                of {stats.totalPatterns} patterns
              </p>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Streak
              </CardTitle>
              <Icons.trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streak} days</div>
              <p className="text-xs text-muted-foreground">Keep it going! 🔥</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Level Progress</CardTitle>
                <CardDescription>
                  Level {user.level} • {user.xp} / {user.xpToNextLevel} XP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${xpPercentage}%` }}
                    />
                  </div>

                  {/* XP Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {user.xpToNextLevel - user.xp} XP to Level{' '}
                      {user.level + 1}
                    </span>
                    <span className="font-medium">
                      {Math.round(xpPercentage)}%
                    </span>
                  </div>

                  {/* How to Earn XP */}
                  <div className="space-y-2 rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium">How to earn XP:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Use a prompt: +10 XP</li>
                      <li>• Learn a new pattern: +25 XP</li>
                      <li>• Complete a challenge: +100 XP</li>
                      <li>• Daily login: +5 XP</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest actions and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);

                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className={`mt-1 ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {activity.type === 'used' && 'Used prompt'}
                            {activity.type === 'favorited' && 'Favorited'}
                            {activity.type === 'learned' && 'Learned'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.promptTitle}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.timestamp)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/prompts"
                  className="flex w-full items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <Icons.library className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Prompt Playbook</p>
                    <p className="text-xs text-muted-foreground">
                      Browse all prompts
                    </p>
                  </div>
                </Link>

                <Link
                  href="/prompts?filter=favorites"
                  className="flex w-full items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <Icons.heart className="h-5 w-5 text-red-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium">My Favorites</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.favoritePrompts} saved
                    </p>
                  </div>
                </Link>

                <Link
                  href="/patterns"
                  className="flex w-full items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <Icons.sparkles className="h-5 w-5 text-purple-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Learn Patterns</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.patternsLearned}/{stats.totalPatterns} learned
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Achievements Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                    <Icons.trophy className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Week Warrior</p>
                    <p className="text-xs text-muted-foreground">
                      7-day streak!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Icons.zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Power User</p>
                    <p className="text-xs text-muted-foreground">
                      20+ prompts used
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <Icons.sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pattern Explorer</p>
                    <p className="text-xs text-muted-foreground">
                      5 patterns learned
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
