'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import { ACHIEVEMENTS } from '@/lib/gamification/achievements';

interface GamificationStats {
  xp: number;
  level: number;
  xpForNextLevel: number;
  dailyStreak: number;
  achievements: string[];
  stats: {
    promptsUsed: number;
    patternsCompleted: number;
    skillsTracked: number;
    skillsMastered: number;
    timeSaved: number;
    promptsShared: number;
    favoritesReceived: number;
  };
}

export default function DashboardPage() {
  // Get prompts for stats
  const allPrompts = getSeedPromptsWithTimestamps();

  // Real gamification data from API
  const [gamificationData, setGamificationData] =
    useState<GamificationStats | null>(null);

  useEffect(() => {
    async function fetchGamificationStats() {
      try {
        const response = await fetch('/api/gamification/stats');
        if (response.ok) {
          const result = await response.json();
          setGamificationData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch gamification stats:', error);
      }
    }

    fetchGamificationStats();
  }, []);

  // Use real data if available, otherwise show defaults
  const stats = gamificationData
    ? {
        promptsUsed: gamificationData.stats.promptsUsed,
        totalPrompts: allPrompts.length,
        favoritePrompts: gamificationData.stats.favoritesReceived,
        patternsLearned: gamificationData.stats.patternsCompleted,
        totalPatterns: 15,
        streak: gamificationData.dailyStreak,
        totalViews: 0,
      }
    : {
        promptsUsed: 0,
        totalPrompts: allPrompts.length,
        favoritePrompts: 0,
        patternsLearned: 0,
        totalPatterns: 15,
        streak: 0,
        totalViews: 0,
      };

  const user = gamificationData
    ? {
        name: 'Explorer',
        level: gamificationData.level,
        xp: gamificationData.xp,
        xpToNextLevel: gamificationData.xpForNextLevel,
      }
    : {
        name: 'Explorer',
        level: 1,
        xp: 0,
        xpToNextLevel: 500,
      };

  // Calculate XP percentage
  const xpPercentage =
    user.xpToNextLevel > 0 ? (user.xp / user.xpToNextLevel) * 100 : 0;

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
                {recentActivity.length > 0 ? (
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
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No recent activity - start exploring prompts!
                    </p>
                  </div>
                )}
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
                {gamificationData &&
                gamificationData.achievements &&
                gamificationData.achievements.length > 0 ? (
                  gamificationData.achievements
                    .slice(0, 3)
                    .map((achievementId: string) => {
                      const achievement = ACHIEVEMENTS.find(
                        (a) => a.id === achievementId
                      );
                      if (!achievement) return null;

                      const iconBgMap: Record<string, string> = {
                        common: 'bg-gray-100',
                        rare: 'bg-blue-100',
                        epic: 'bg-purple-100',
                        legendary: 'bg-yellow-100',
                      };

                      return (
                        <div
                          key={achievementId}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBgMap[achievement.rarity] || 'bg-gray-100'} text-lg`}
                          >
                            {achievement.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {achievement.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-sm text-muted-foreground">
                      No achievements yet - start exploring prompts to unlock
                      badges!
                    </p>
                    <Link
                      href="/prompts"
                      className="text-primary hover:underline"
                    >
                      Browse Prompts
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
