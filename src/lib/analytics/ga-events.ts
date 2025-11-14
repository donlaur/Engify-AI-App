/**
 * Google Analytics Event Tracking
 * 
 * Track prompt interactions via GA events
 * No database writes needed - all in GA
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, any>
    ) => void;
  }
}

/**
 * Track prompt event in Google Analytics
 */
export function trackPromptEvent(
  action: 'view' | 'copy' | 'favorite' | 'execute' | 'share',
  promptId: string,
  promptTitle?: string,
  metadata?: Record<string, any>
) {
  // Check if GA is loaded
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  // Send event to GA
  window.gtag('event', action, {
    event_category: 'prompt_interaction',
    event_label: promptId,
    prompt_id: promptId,
    prompt_title: promptTitle,
    ...metadata,
  });
}

/**
 * Track prompt view (call on page load)
 */
export function trackPromptView(promptId: string, promptTitle: string) {
  trackPromptEvent('view', promptId, promptTitle);
}

/**
 * Track prompt copy (call when user copies prompt)
 */
export function trackPromptCopy(promptId: string, promptTitle: string) {
  trackPromptEvent('copy', promptId, promptTitle);
}

/**
 * Track prompt favorite (call when user favorites)
 */
export function trackPromptFavorite(promptId: string, promptTitle: string) {
  trackPromptEvent('favorite', promptId, promptTitle);
}

/**
 * Track prompt execution (call when user runs prompt)
 */
export function trackPromptExecute(
  promptId: string,
  promptTitle: string,
  model?: string
) {
  trackPromptEvent('execute', promptId, promptTitle, { model });
}

/**
 * Track prompt share (call when user shares)
 */
export function trackPromptShare(
  promptId: string,
  promptTitle: string,
  platform?: string
) {
  trackPromptEvent('share', promptId, promptTitle, { platform });
}

/**
 * Track pattern view
 */
export function trackPatternView(patternId: string, patternName: string) {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', 'view', {
    event_category: 'pattern_interaction',
    event_label: patternId,
    pattern_id: patternId,
    pattern_name: patternName,
  });
}

/**
 * Track learning resource view
 */
export function trackLearningView(resourceId: string, resourceTitle: string) {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', 'view', {
    event_category: 'learning_interaction',
    event_label: resourceId,
    resource_id: resourceId,
    resource_title: resourceTitle,
  });
}

/**
 * Track workflow event in Google Analytics
 */
export function trackWorkflowEvent(
  action: 'view' | 'click' | 'filter',
  workflowId?: string,
  workflowTitle?: string,
  metadata?: Record<string, any>
) {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', action, {
    event_category: 'workflow_interaction',
    event_label: workflowId || 'workflows_page',
    workflow_id: workflowId,
    workflow_title: workflowTitle,
    ...metadata,
  });
}

/**
 * Track workflow view (call on workflow detail page load)
 */
export function trackWorkflowView(workflowId: string, workflowTitle: string, category?: string) {
  trackWorkflowEvent('view', workflowId, workflowTitle, { category });
}

/**
 * Track workflow click (call when user clicks on a workflow)
 */
export function trackWorkflowClick(workflowId: string, workflowTitle: string, category?: string) {
  trackWorkflowEvent('click', workflowId, workflowTitle, { category });
}

/**
 * Track workflow filter (call when user filters by category or audience)
 */
export function trackWorkflowFilter(filterType: 'category' | 'audience', filterValue: string) {
  trackWorkflowEvent('filter', undefined, undefined, { filter_type: filterType, filter_value: filterValue });
}
