/**
 * Quick Feedback Component (Tier 1)
 * Low-friction feedback: Like, Save, "Was this helpful?"
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FeedbackErrorBoundary } from '@/components/ErrorBoundary';

interface QuickFeedbackProps {
  promptId: string;
  className?: string;
  showLabels?: boolean;
}

export function QuickFeedback({
  promptId,
  className,
  showLabels = false,
}: QuickFeedbackProps) {
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [helpfulFeedback, setHelpfulFeedback] = useState<'yes' | 'no' | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const sendFeedback = async (action: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/feedback/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId,
          action,
          metadata: {
            timeOnPage: Math.round(performance.now() / 1000),
            copiedContent: document.queryCommandSupported('copy'),
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save feedback');

      return true;
    } catch (error) {
      console.error('Error sending feedback:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liked) return; // Already liked

    const success = await sendFeedback('like');
    if (success) {
      setLiked(true);
      toast({
        title: 'Thanks! ❤️',
        description: 'Your feedback helps us improve our prompts.',
      });
    }
  };

  const handleSave = async () => {
    if (saved) return; // Already saved

    const success = await sendFeedback('save');
    if (success) {
      setSaved(true);
      toast({
        title: 'Saved to your collection',
        description: 'Find this in your dashboard later.',
      });
    }
  };

  const handleHelpful = async (helpful: boolean) => {
    if (helpfulFeedback !== null) return; // Already answered

    const action = helpful ? 'helpful' : 'not-helpful';
    const success = await sendFeedback(action);

    if (success) {
      setHelpfulFeedback(helpful ? 'yes' : 'no');
      toast({
        title: helpful ? 'Glad it helped! 👍' : 'Thanks for the feedback',
        description: helpful
          ? "We're happy this prompt worked for you!"
          : "We'll work on improving this prompt.",
      });
    }
  };

  return (
    <FeedbackErrorBoundary>
      <div className={cn('space-y-4', className)}>
        {/* Like & Save Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={liked ? 'default' : 'outline'}
            size="sm"
            onClick={handleLike}
            disabled={loading || liked}
            className={cn(liked && 'bg-red-500 hover:bg-red-600')}
            aria-label={
              !showLabels ? (liked ? 'Liked' : 'Like prompt') : undefined
            }
          >
            <Icons.heart className={cn('h-4 w-4', liked && 'fill-current')} />
            {showLabels && (
              <span className="ml-2">{liked ? 'Liked' : 'Like'}</span>
            )}
          </Button>

          <Button
            variant={saved ? 'default' : 'outline'}
            size="sm"
            onClick={handleSave}
            disabled={loading || saved}
            aria-label={
              !showLabels ? (saved ? 'Saved' : 'Save prompt') : undefined
            }
          >
            <Icons.bookmark
              className={cn('h-4 w-4', saved && 'fill-current')}
            />
            {showLabels && (
              <span className="ml-2">{saved ? 'Saved' : 'Save'}</span>
            )}
          </Button>
        </div>

        {/* "Was this helpful?" */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="mb-3 text-sm font-medium">Was this helpful?</p>
          <div className="flex gap-2">
            <Button
              variant={helpfulFeedback === 'yes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleHelpful(true)}
              disabled={loading || helpfulFeedback !== null}
            >
              <Icons.thumbsUp className="mr-2 h-4 w-4" />
              Yes, helpful
            </Button>
            <Button
              variant={helpfulFeedback === 'no' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleHelpful(false)}
              disabled={loading || helpfulFeedback !== null}
            >
              <Icons.thumbsDown className="mr-2 h-4 w-4" />
              Not helpful
            </Button>
          </div>

          {helpfulFeedback && (
            <p className="mt-3 text-xs text-muted-foreground">
              ✅ Thanks! Your feedback helps us improve our library.
            </p>
          )}
        </div>

        {/* Privacy notice */}
        <p className="text-xs text-muted-foreground">
          💡 We collect feedback to improve our prompts and recommend better
          content.{' '}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
        </p>
      </div>
    </FeedbackErrorBoundary>
  );
}
