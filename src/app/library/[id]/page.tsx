'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
// import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts'; // TODO: Replace with database
import { categoryLabels, roleLabels } from '@/lib/schemas/prompt';
import { RatingStars } from '@/components/features/RatingStars';
import { MakeItMineButton } from '@/components/features/MakeItMineButton';
import { useToast } from '@/hooks/use-toast';

export default function PromptDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const { toast } = useToast();

  // Get all prompts and find the one with matching ID
  const prompts = getSeedPromptsWithTimestamps();
  const prompt = prompts.find((p) => p.id === id);

  // Track view count
  useEffect(() => {
    if (prompt && id) {
      // Initialize view count from prompt data
      setViewCount(prompt.views || 0);

      // Increment view count (in real app, this would be an API call)
      const viewKey = `prompt_view_${id}`;
      const hasViewed = sessionStorage.getItem(viewKey);
      if (!hasViewed) {
        // Only count once per session
        setViewCount((prev) => prev + 1);
        sessionStorage.setItem(viewKey, 'true');

        // TODO: In production, send to API to persist
        // await fetch(`/api/prompts/${id}/view`, { method: 'POST' });
      }

      // Load user rating from localStorage
      const ratingKey = `prompt_rating_${id}`;
      const savedRating = localStorage.getItem(ratingKey);
      if (savedRating) {
        setUserRating(Number(savedRating));
      }
    }
  }, [prompt, id]);

  // Handle rating
  const handleRate = (rating: number) => {
    setUserRating(rating);
    localStorage.setItem(`prompt_rating_${id}`, String(rating));
    toast({
      title: 'Rating saved!',
      description: `You rated this prompt ${rating} stars`,
    });
    // TODO: In production, send to API
    // await fetch(`/api/prompts/${id}/rate`, { method: 'POST', body: { rating } });
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // If prompt not found, show error
  if (!prompt) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icons.alertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-bold">Prompt Not Found</h2>
              <p className="mb-6 text-muted-foreground">
                The prompt you&apos;re looking for doesn&apos;t exist.
              </p>
              <Button onClick={() => router.push('/library')}>
                <Icons.arrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/library')}
          className="mb-6"
        >
          <Icons.arrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Prompt Content - Main Column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="mb-2 text-3xl font-bold">{prompt.title}</h1>
                    <p className="text-lg text-muted-foreground">
                      {prompt.description}
                    </p>
                  </div>
                  {prompt.isFeatured && (
                    <Badge variant="default" className="shrink-0">
                      <Icons.star className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Metadata Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {categoryLabels[prompt.category]}
                  </Badge>
                  {prompt.role && (
                    <Badge variant="outline">{roleLabels[prompt.role]}</Badge>
                  )}
                  {prompt.pattern && (
                    <Badge variant="outline">
                      <Icons.zap className="mr-1 h-3 w-3" />
                      {prompt.pattern}
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Prompt Content */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Prompt</h2>
                    <Button
                      onClick={handleCopy}
                      variant={copied ? 'default' : 'outline'}
                      size="sm"
                    >
                      {copied ? (
                        <>
                          <Icons.check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Icons.copy className="mr-2 h-4 w-4" />
                          Copy Prompt
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-6">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {prompt.content}
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <MakeItMineButton
                    promptId={prompt.id}
                    promptTitle={prompt.title}
                    size="lg"
                    className="w-full"
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      <Icons.zap className="mr-2 h-4 w-4" />
                      Try in Workbench
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Icons.share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Stats & Info */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Statistics</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Icons.users className="mr-2 h-4 w-4" />
                    <span className="text-sm">Views</span>
                  </div>
                  <span className="font-semibold">
                    {viewCount.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-muted-foreground">
                      <Icons.star className="mr-2 h-4 w-4" />
                      <span className="text-sm">Avg Rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">
                        {prompt.rating || 0}
                      </span>
                      <span className="text-sm text-muted-foreground">/ 5</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="mb-2 text-sm text-muted-foreground">
                      Your Rating:
                    </p>
                    <RatingStars
                      rating={userRating}
                      onRate={handleRate}
                      size="lg"
                    />
                  </div>
                </div>

                {prompt.ratingCount !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-muted-foreground">
                      <Icons.users className="mr-2 h-4 w-4" />
                      <span className="text-sm">Ratings</span>
                    </div>
                    <span className="font-semibold">
                      {prompt.ratingCount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Icons.calendar className="mr-2 h-4 w-4" />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="text-sm">
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Pattern Info Card */}
            {prompt.pattern && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Pattern Used</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <Icons.zap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="mb-1 font-medium capitalize">
                        {prompt.pattern}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This prompt uses the {prompt.pattern} pattern for
                        optimal results.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share Card */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Share</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Icons.share className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.users className="mr-2 h-4 w-4" />
                  Share with Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
