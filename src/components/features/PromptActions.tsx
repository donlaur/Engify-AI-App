/**
 * Client Component for Prompt Page Actions
 * Handles copy, share, and favorite functionality with browser APIs
 * Includes tracking for analytics
 */
'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/use-favorites';
import { trackPromptEvent } from '@/lib/utils/ga-events';

interface CopyButtonProps {
  content: string;
}

export function CopyButton({ content }: CopyButtonProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy prompt',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <Icons.copy className="mr-2 h-4 w-4" />
      Copy
    </Button>
  );
}

interface ShareButtonProps {
  title: string;
  description: string;
  promptId: string;
}

export function ShareButton({ title, description, promptId }: ShareButtonProps) {
  const { toast } = useToast();

  const trackShare = async (platform: string) => {
    try {
      await fetch(`/api/prompts/${promptId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });
      trackPromptEvent('copy', promptId, { prompt_title: title });
    } catch (error) {
      // Silently fail - tracking is not critical
      console.debug('Failed to track share:', error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: description,
          url: window.location.href,
        });
        await trackShare('native');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        await trackShare('copy');
        toast({
          title: 'Link copied!',
          description: 'Prompt link copied to clipboard',
        });
      }
    } catch (error) {
      // User cancelled share or error occurred - don't show error toast
      console.error('Share failed:', error);
    }
  };

  return (
    <Button variant="outline" onClick={handleShare}>
      <Icons.share className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}

interface FavoriteButtonProps {
  promptId: string;
}

export function FavoriteButton({ promptId }: FavoriteButtonProps) {
  const { toast } = useToast();
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const currentFavoriteStatus = isFavorite(promptId);

  const handleToggle = async () => {
    const wasFavorite = currentFavoriteStatus;
    await toggleFavorite(promptId);
    toast({
      title: wasFavorite ? 'Removed from favorites' : 'Added to favorites',
      description: wasFavorite
        ? 'Prompt removed from your favorites'
        : 'Prompt saved to your favorites',
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      disabled={isLoading}
      className={
        currentFavoriteStatus
          ? 'border-red-300 text-red-600 hover:text-red-700'
          : ''
      }
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.heart
          className={`mr-2 h-4 w-4 ${currentFavoriteStatus ? 'fill-red-600 text-red-600' : ''}`}
        />
      )}
      {currentFavoriteStatus ? 'Favorited' : 'Favorite'}
    </Button>
  );
}
