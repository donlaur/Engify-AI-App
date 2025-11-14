'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackWorkflowFilter } from '@/lib/analytics/ga-events';

/**
 * Client component to track workflow page views and filter interactions
 */
export function WorkflowTracking() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track filter usage
    const category = searchParams?.get('category');
    const audience = searchParams?.get('audience');

    if (category) {
      trackWorkflowFilter('category', category);
    }

    if (audience) {
      trackWorkflowFilter('audience', audience);
    }
  }, [searchParams]);

  return null;
}

