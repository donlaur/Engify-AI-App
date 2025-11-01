'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import type { Prompt } from '@/data/seed-prompts';

interface CategoryPageClientProps {
  category: string;
  categoryInfo: {
    title: string;
    description: string;
  };
  categoryPrompts: Prompt[];
}

export default function CategoryPageClient({ category, categoryInfo, categoryPrompts }: CategoryPageClientProps) {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/library')} className="mb-6">
          <Icons.arrowLeft className="mr-2 h-4 w-4" />
          Library
        </Button>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Icons.folder className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{categoryInfo.title}</h1>
              <p className="text-muted-foreground">
                {categoryPrompts.length} prompt{categoryPrompts.length !== 1 ? 's' : ''} in this category
              </p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {categoryInfo.description}
          </p>
        </div>

        {/* Prompts Grid */}
        <div>
          {categoryPrompts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icons.inbox className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  No prompts found in category: {categoryInfo.title}
                </p>
                <Button className="mt-4" onClick={() => router.push('/library')}>
                  Browse All Prompts
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => router.push(`/library/${prompt.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
                      {prompt.isFeatured && (
                        <Badge variant="default" className="shrink-0">
                          <Icons.star className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {prompt.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{prompt.category}</Badge>
                        {prompt.role && <Badge variant="outline">{prompt.role}</Badge>}
                        {prompt.pattern && (
                          <Badge variant="outline">
                            <Icons.zap className="mr-1 h-3 w-3" />
                            {prompt.pattern}
                          </Badge>
                        )}
                      </div>
                      {prompt.tags && prompt.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {prompt.tags.slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                          {prompt.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{prompt.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Related Categories Section */}
        {categoryPrompts.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Browse by Category</CardTitle>
              <CardDescription>Explore other prompt categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['code-generation', 'debugging', 'documentation', 'testing', 'refactoring', 'architecture', 'learning', 'general']
                  .filter((cat) => cat !== category)
                  .map((cat) => {
                    const catInfo = {
                      'code-generation': 'Code Generation',
                      'debugging': 'Debugging',
                      'documentation': 'Documentation',
                      'testing': 'Testing',
                      'refactoring': 'Refactoring',
                      'architecture': 'Architecture',
                      'learning': 'Learning',
                      'general': 'General',
                    }[cat] || cat;
                    return (
                      <Button
                        key={cat}
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/library/category/${encodeURIComponent(cat)}`)}
                      >
                        <Icons.folder className="mr-1 h-3 w-3" />
                        {catInfo}
                      </Button>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

