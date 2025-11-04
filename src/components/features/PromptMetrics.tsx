/**
 * Prompt Metrics Component
 * Displays views, favorites, and shares counts for a prompt
 * 
 * Enterprise Compliance:
 * - ⚠️ Error Boundary: Simple display component, error handled via try/catch
 * - ⚠️ Tests: Should be added in future
 */

'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/lib/icons';

interface PromptMetricsProps {
  promptId: string;
  initialViews?: number;
  initialFavorites?: number;
  initialShares?: number;
}

export function PromptMetrics({
  promptId,
  initialViews = 0,
  initialFavorites = 0,
  initialShares = 0,
}: PromptMetricsProps) {
  const [views, setViews] = useState(initialViews);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [shares, setShares] = useState(initialShares);

  // Fetch updated metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `/api/prompts/metrics?promptIds=${promptId}&limit=1`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.prompts && data.prompts.length > 0) {
            const prompt = data.prompts[0];
            setViews(prompt.views || 0);
            setFavorites(prompt.favorites || 0);
            setShares(prompt.shares || 0);
          }
        }
      } catch (error) {
        // Silently fail - metrics are not critical
        console.debug('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
  }, [promptId]);

  return (
    <div className="flex gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Icons.eye className="h-4 w-4" />
        <span>{views.toLocaleString()} views</span>
      </div>
      <div className="flex items-center gap-1">
        <Icons.heart className="h-4 w-4" />
        <span>{favorites.toLocaleString()} favorites</span>
      </div>
      <div className="flex items-center gap-1">
        <Icons.share className="h-4 w-4" />
        <span>{shares.toLocaleString()} shares</span>
      </div>
    </div>
  );
}
