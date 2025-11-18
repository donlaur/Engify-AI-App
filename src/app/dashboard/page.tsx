'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { MCPTokenDisplay } from '@/components/mcp/MCPTokenDisplay';

interface FavoritePrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  role: string;
}

interface UserStats {
  daysLoggedIn: number;
  totalSessions: number;
  lastLoginDate: string;
  streak: number;
}

interface PromptHistory {
  _id: string;
  promptId: string;
  promptTitle: string;
  createdAt: string;
  model: string;
  tokensUsed?: number;
}

interface GamificationStats {
  xp: number;
  level: number;
  xpForNextLevel: number;
  dailyStreak: number;
  achievements: string[];
  stats: {
    promptsExecuted: number;
    skillsLearned: number;
  };
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const showMCPToken = ref === 'mcp-auth';
  const { data: session } = useSession();

  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoritePrompts, setFavoritePrompts] = useState<FavoritePrompt[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [showMCP, setShowMCP] = useState(showMCPToken);
  const [recentActivity, setRecentActivity] = useState<PromptHistory[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [gamificationStats, setGamificationStats] = useState<GamificationStats | null>(null);
  const [loadingGamification, setLoadingGamification] = useState(true);

  // Check if user is super admin
  const isSuperAdmin = session?.user?.role === 'super_admin';

  useEffect(() => {
    async function fetchData() {
      setLoadingFavorites(true);
      setLoadingActivity(true);
      setLoadingGamification(true);

      try {
        // Fetch all data in parallel
        const [favoritesResponse, statsResponse, activityResponse, gamificationResponse] = await Promise.all([
          fetch('/api/favorites'),
          fetch('/api/user-stats'),
          fetch('/api/prompts/history?limit=5'),
          fetch('/api/gamification/stats'),
        ]);

        // Process favorites
        if (favoritesResponse.ok) {
          const data = await favoritesResponse.json();
          setFavoritesCount(data.count || 0);
          setFavoritePrompts(data.favorites || []);
        }

        // Process user stats
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setUserStats(statsData.data);
        }

        // Process recent activity
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData.history || []);
        }

        // Process gamification stats
        if (gamificationResponse.ok) {
          const gamificationData = await gamificationResponse.json();
          setGamificationStats(gamificationData.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingFavorites(false);
        setLoadingActivity(false);
        setLoadingGamification(false);
      }
    }

    fetchData();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* MCP Token Display (when ?ref=mcp-auth) */}
        {showMCP ? (
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">MCP Authentication</h1>
              <p className="text-muted-foreground">
                Set up MCP access for CLI and desktop applications
              </p>
            </div>
            <MCPTokenDisplay onClose={() => setShowMCP(false)} />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Your personalized AI workspace
              </p>
            </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Get started with common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {/* OpsHub - Super Admin Only */}
              {isSuperAdmin && (
                <Link href="/opshub">
                  <Button variant="outline" className="w-full justify-start h-auto py-3 border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950 hover:bg-yellow-100 dark:hover:bg-yellow-900">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <Icons.shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="font-medium text-yellow-900 dark:text-yellow-100">OpsHub</span>
                      </div>
                      <span className="text-xs text-yellow-700 dark:text-yellow-300">
                        Admin dashboard
                      </span>
                    </div>
                  </Button>
                </Link>
              )}

              <Link href="/prompts">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <Icons.library className="h-4 w-4" />
                      <span className="font-medium">Browse Prompts</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Explore our library
                    </span>
                  </div>
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => setShowMCP(true)}
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <Icons.key className="h-4 w-4" />
                    <span className="font-medium">MCP Token</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Get access token
                  </span>
                </div>
              </Button>

              <Link href="/learn">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <Icons.bookOpen className="h-4 w-4" />
                      <span className="font-medium">Learning Paths</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Skill development
                    </span>
                  </div>
                </Button>
              </Link>

              <Link href="/prompts?filter=favorites">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <Icons.heart className="h-4 w-4" />
                      <span className="font-medium">My Favorites</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {favoritesCount} saved
                    </span>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* User Stats */}
          {userStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.barChart className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Your Activity
                </CardTitle>
                <CardDescription>
                  Track your engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-center">
                    <Icons.calendar className="mx-auto h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" />
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {userStats.daysLoggedIn}
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Days Active</p>
                  </div>
                  <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-center">
                    <Icons.zap className="mx-auto h-5 w-5 text-green-600 dark:text-green-400 mb-2" />
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {userStats.streak}
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300">Day Streak</p>
                  </div>
                  <div className="rounded-lg bg-purple-50 dark:bg-purple-950 p-4 text-center">
                    <Icons.heart className="mx-auto h-5 w-5 text-purple-600 dark:text-purple-400 mb-2" />
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {favoritesCount}
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Favorites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills & Progress (Gamification) */}
          {gamificationStats && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  Skills & Progress
                </CardTitle>
                <CardDescription>
                  Track your XP, level, and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* XP and Level */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Level</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          Level {gamificationStats.level}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total XP</p>
                        <p className="text-2xl font-bold">{gamificationStats.xp}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">
                          Progress to Level {gamificationStats.level + 1}
                        </p>
                        <p className="text-xs font-medium">
                          {gamificationStats.xpForNextLevel - gamificationStats.xp} XP needed
                        </p>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{
                            width: `${Math.min(
                              100,
                              (gamificationStats.xp / gamificationStats.xpForNextLevel) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="rounded-lg border bg-orange-50 dark:bg-orange-950 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Icons.zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <p className="text-xs text-muted-foreground">Streak</p>
                        </div>
                        <p className="text-xl font-bold">{gamificationStats.dailyStreak} days</p>
                      </div>
                      <div className="rounded-lg border bg-green-50 dark:bg-green-950 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Icons.target className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <p className="text-xs text-muted-foreground">Prompts Used</p>
                        </div>
                        <p className="text-xl font-bold">{gamificationStats.stats.promptsExecuted}</p>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Achievements</p>
                      <p className="text-xs text-muted-foreground">
                        {gamificationStats.achievements.length} unlocked
                      </p>
                    </div>
                    {loadingGamification ? (
                      <div className="flex items-center justify-center py-8">
                        <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : gamificationStats.achievements.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {gamificationStats.achievements.slice(0, 5).map((achievement, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 rounded-lg border bg-yellow-50 dark:bg-yellow-950 p-2"
                          >
                            <Icons.trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{achievement}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <Icons.trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Complete tasks to unlock achievements!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest prompt executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingActivity ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex animate-pulse gap-3">
                      <div className="h-12 w-12 rounded bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                    >
                      <Icons.sparkles className="mt-1 h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <div className="flex-1 space-y-1 overflow-hidden min-w-0">
                        <p className="line-clamp-1 text-sm font-medium">
                          {item.promptTitle}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="truncate">{item.model}</span>
                          {item.tokensUsed && (
                            <>
                              <span>•</span>
                              <span>{item.tokensUsed} tokens</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Icons.sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">No activity yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Start using prompts to see your activity here
                  </p>
                  <Link href="/prompts">
                    <Button size="sm">
                      <Icons.library className="mr-2 h-4 w-4" />
                      Browse Prompts
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Favorites */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Icons.heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                  My Favorites
                </CardTitle>
                <CardDescription>
                  {favoritesCount} saved prompts
                </CardDescription>
              </div>
              {favoritesCount > 0 && (
                <Link
                  href="/prompts?filter=favorites"
                  className="text-sm text-primary hover:underline"
                >
                  View All
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {loadingFavorites ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex animate-pulse gap-3">
                      <div className="h-12 w-12 rounded bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-full rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : favoritePrompts.length > 0 ? (
                <div className="space-y-3">
                  {favoritePrompts.slice(0, 3).map((prompt) => (
                    <Link
                      key={prompt.id}
                      href={`/prompts/${prompt.id}`}
                      className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="mt-1">
                        <Icons.heart className="h-5 w-5 fill-red-600 text-red-600 dark:fill-red-400 dark:text-red-400" />
                      </div>
                      <div className="flex-1 space-y-1 overflow-hidden">
                        <p className="line-clamp-1 text-sm font-medium leading-tight">
                          {prompt.title}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {prompt.description}
                        </p>
                        <div className="mt-1 flex gap-2">
                          <span className="rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs text-blue-800 dark:text-blue-200">
                            {prompt.category}
                          </span>
                          <span className="rounded-full bg-purple-100 dark:bg-purple-900 px-2 py-0.5 text-xs text-purple-800 dark:text-purple-200">
                            {prompt.role}
                          </span>
                        </div>
                      </div>
                      <Icons.chevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Icons.heart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mb-2 text-sm font-medium">No favorites yet</p>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Start saving prompts you love to access them quickly
                  </p>
                  <Link href="/prompts">
                    <Button size="sm">
                      <Icons.library className="mr-2 h-4 w-4" />
                      Browse Prompts
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="flex min-h-screen items-center justify-center">
            <Icons.spinner className="h-8 w-8 animate-spin" />
          </div>
        </MainLayout>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
