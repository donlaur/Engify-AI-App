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

interface FavoritePrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  role: string;
}

export default function DashboardPage() {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoritePrompts, setFavoritePrompts] = useState<FavoritePrompt[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      setLoadingFavorites(true);
      try {
        const response = await fetch('/api/favorites');
        if (response.ok) {
          const data = await response.json();
          setFavoritesCount(data.count || 0);
          setFavoritePrompts(data.favorites || []);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setLoadingFavorites(false);
      }
    }

    fetchFavorites();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your favorite prompts
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-1">
          {/* My Favorites */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Favorites</CardTitle>
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
                  {favoritePrompts.map((prompt) => (
                    <Link
                      key={prompt.id}
                      href={`/prompts/${prompt.id}`}
                      className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="mt-1">
                        <Icons.heart className="h-5 w-5 fill-red-600 text-red-600" />
                      </div>
                      <div className="flex-1 space-y-1 overflow-hidden">
                        <p className="line-clamp-1 text-sm font-medium leading-tight">
                          {prompt.title}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {prompt.description}
                        </p>
                        <div className="mt-1 flex gap-2">
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                            {prompt.category}
                          </span>
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
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
                  <Link
                    href="/prompts"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Icons.library className="h-4 w-4" />
                    Browse Prompts
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
