'use client';

import { useEffect } from 'react';
import { trackWorkflowView } from '@/lib/analytics/ga-events';

interface WorkflowDetailTrackingProps {
  workflowId: string;
  workflowTitle: string;
  category: string;
}

/**
 * Client component to track workflow detail page views
 */
export function WorkflowDetailTracking({
  workflowId,
  workflowTitle,
  category,
}: WorkflowDetailTrackingProps) {
  useEffect(() => {
    trackWorkflowView(workflowId, workflowTitle, category);
  }, [workflowId, workflowTitle, category]);

  return null;
}

