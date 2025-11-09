/**
 * Favorite Button Component
 * Toggle favorite status for prompts
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  promptId: string;
  promptTitle: string;
  category?: string;
  initialFavorited?: boolean;
  onToggle?: (favorited: boolean) => void;
}

export function FavoriteButton({
  promptId,
  promptTitle,
  category,
  initialFavorited = false,
  onToggle,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      if (isFavorited) {
        // Remove favorite
        await fetch(`/api/prompts/favorites?promptId=${promptId}`, {
          method: 'DELETE',
        });
        setIsFavorited(false);
        onToggle?.(false);
      } else {
        // Add favorite
        await fetch('/api/prompts/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptId,
            promptTitle,
            category,
          }),
        });
        setIsFavorited(true);
        onToggle?.(true);

        // Track in Redis (fast, non-blocking)
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptId,
            event: 'favorite',
          }),
        }).catch(() => {
          // Silent fail - analytics shouldn't break favorites
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        'transition-colors',
        isFavorited && 'text-red-600 hover:text-red-700'
      )}
    >
      {isLoading ? (
        <Icons.spinner className="h-4 w-4 animate-spin" />
      ) : isFavorited ? (
        <Icons.heart className="h-4 w-4 fill-current" />
      ) : (
        <Icons.heart className="h-4 w-4" />
      )}
      <span className="ml-1">{isFavorited ? 'Favorited' : 'Favorite'}</span>
    </Button>
  );
}
