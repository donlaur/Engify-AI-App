'use client';

import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';

export default function TagPage() {
  const params = useParams();
  const router = useRouter();
  const tag = params.tag as string;
  
  // Decode URL-encoded tag
  const decodedTag = decodeURIComponent(tag);

  // Get all prompts with this tag
  const allPrompts = getSeedPromptsWithTimestamps();
  const taggedPrompts = allPrompts.filter((p) => 
    p.tags && p.tags.some((t) => t.toLowerCase() === decodedTag.toLowerCase())
  );

  // Format tag for display (convert kebab-case to Title Case)
  const displayTag = decodedTag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/library')} className="mb-6">
          <Icons.arrowLeft className="mr-2 h-4 w-4" />
          Library
        </Button>

        {/* Tag Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Icons.tag className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{displayTag}</h1>
              <p className="text-muted-foreground">
                {taggedPrompts.length} prompt{taggedPrompts.length !== 1 ? 's' : ''} tagged with {displayTag.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        <div>
          {taggedPrompts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icons.inbox className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  No prompts found with tag: {displayTag}
                </p>
                <Button className="mt-4" onClick={() => router.push('/library')}>
                  Browse All Prompts
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {taggedPrompts.map((prompt) => (
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
                            <Badge 
                              key={t} 
                              variant={t.toLowerCase() === decodedTag.toLowerCase() ? "default" : "outline"} 
                              className="text-xs"
                            >
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

        {/* Related Tags Section */}
        {taggedPrompts.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Related Tags</CardTitle>
              <CardDescription>Explore similar topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set(
                    taggedPrompts
                      .flatMap((p) => p.tags || [])
                      .filter((t) => t.toLowerCase() !== decodedTag.toLowerCase())
                  )
                )
                  .slice(0, 15)
                  .map((relatedTag) => (
                    <Button
                      key={relatedTag}
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/tags/${encodeURIComponent(relatedTag)}`)}
                    >
                      <Icons.tag className="mr-1 h-3 w-3" />
                      {relatedTag}
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

