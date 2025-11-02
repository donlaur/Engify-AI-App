/**
 * Hook for tracking prompt views
 * Automatically tracks view when component mounts
 */

import { useEffect, useRef } from 'react';

interface UsePromptViewOptions {
  promptId: string;
  enabled?: boolean; // Allow disabling tracking (e.g., for previews)
}

export function usePromptView({ promptId, enabled = true }: UsePromptViewOptions) {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per session
    if (!enabled || tracked.current || !promptId) {
      return;
    }

    tracked.current = true;

    // Track view asynchronously (don't wait for response)
    fetch(`/api/prompts/${promptId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((error) => {
      // Silently fail - view tracking is not critical
      console.debug('Failed to track prompt view:', error);
    });
  }, [promptId, enabled]);
}

