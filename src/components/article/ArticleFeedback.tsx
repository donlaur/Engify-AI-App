'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { toast } from '@/hooks/use-toast';

interface ArticleFeedbackProps {
  articleId: string;
  articleSlug: string;
}

export function ArticleFeedback({ articleId, articleSlug }: ArticleFeedbackProps) {
  const [helpfulFeedback, setHelpfulFeedback] = useState<'yes' | 'no' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleHelpful = async (helpful: boolean) => {
    if (helpfulFeedback !== null) return; // Already answered

    setLoading(true);
    try {
      const response = await fetch('/api/feedback/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          articleSlug,
          helpful,
          type: 'article',
        }),
      });

      if (!response.ok) throw new Error('Failed to save feedback');

      setHelpfulFeedback(helpful ? 'yes' : 'no');
      toast({
        title: helpful ? 'Glad it helped! 👍' : 'Thanks for the feedback',
        description: helpful
          ? "We're happy this article worked for you!"
          : "We'll work on improving this article.",
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to save feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Article link copied to clipboard.',
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Was this article helpful?
      </p>
      <div className="flex gap-2">
        <Button
          variant={helpfulFeedback === 'yes' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleHelpful(true)}
          disabled={loading || helpfulFeedback !== null}
          className={helpfulFeedback === 'yes' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Icons.like className="mr-2 h-4 w-4" />
          Helpful
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          Share
        </Button>
      </div>
    </div>
  );
}

