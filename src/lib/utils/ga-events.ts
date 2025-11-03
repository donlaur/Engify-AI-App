/**
 * Google Analytics 4 Events - Comprehensive Tracking
 * 
 * Tracks all key user actions for better insights:
 * - Multi-agent workflow usage
 * - Prompt interactions (view, copy, favorite, execute)
 * - Search and filter usage
 * - Authentication events
 * - Error tracking
 * - Conversion events
 */

import { trackEvent as gaTrackEvent } from '@/components/analytics/GoogleAnalytics';

/**
 * Track multi-agent workflow events
 */
export function trackMultiAgentEvent(action: 'started' | 'completed' | 'failed', metadata?: {
  situation_length?: number;
  context_length?: number;
  turn_count?: number;
  error?: string;
  duration_ms?: number;
}) {
  gaTrackEvent('multi_agent_workflow', {
    event_category: 'workflow',
    event_label: action,
    ...metadata,
  });
}

/**
 * Track prompt interactions
 */
export function trackPromptEvent(
  action: 'view' | 'copy' | 'favorite' | 'unfavorite' | 'execute',
  promptId: string,
  metadata?: {
    prompt_title?: string;
    prompt_category?: string;
    prompt_pattern?: string;
    model?: string;
  }
) {
  gaTrackEvent('prompt_interaction', {
    event_category: 'prompt',
    event_label: action,
    prompt_id: promptId,
    ...metadata,
  });
}

/**
 * Track search and filter usage
 */
export function trackSearchEvent(
  action: 'search' | 'filter' | 'clear',
  metadata?: {
    query?: string;
    filter_type?: string;
    filter_value?: string;
    result_count?: number;
  }
) {
  gaTrackEvent('search_action', {
    event_category: 'search',
    event_label: action,
    ...metadata,
  });
}

/**
 * Track authentication events
 */
export function trackAuthEvent(
  action: 'signup' | 'login' | 'logout' | 'signup_started',
  metadata?: {
    method?: string;
    user_id?: string;
  }
) {
  gaTrackEvent('auth_event', {
    event_category: 'authentication',
    event_label: action,
    ...metadata,
  });
}

/**
 * Track error events
 */
export function trackErrorEvent(
  errorType: string,
  metadata?: {
    error_message?: string;
    page?: string;
    component?: string;
    stack?: string;
  }
) {
  gaTrackEvent('error', {
    event_category: 'error',
    event_label: errorType,
    ...metadata,
  });
}

/**
 * Track conversion events (GA4 recommended events)
 */
export function trackConversionEvent(
  conversionType: 'purchase' | 'signup' | 'subscribe' | 'trial_start',
  metadata?: {
    value?: number;
    currency?: string;
    user_id?: string;
  }
) {
  gaTrackEvent('conversion', {
    event_category: 'conversion',
    event_label: conversionType,
    ...metadata,
  });
}

/**
 * Track page engagement (scroll depth, time on page)
 */
export function trackPageEngagement(
  action: 'scroll_25' | 'scroll_50' | 'scroll_75' | 'scroll_100' | 'time_on_page',
  metadata?: {
    page_path?: string;
    time_seconds?: number;
  }
) {
  gaTrackEvent('page_engagement', {
    event_category: 'engagement',
    event_label: action,
    ...metadata,
  });
}

/**
 * Track RAG chat interactions
 */
export function trackRAGChatEvent(
  action: 'message_sent' | 'response_received' | 'error',
  metadata?: {
    query_length?: number;
    response_length?: number;
    model?: string;
    sources_count?: number;
    error?: string;
  }
) {
  gaTrackEvent('rag_chat', {
    event_category: 'chat',
    event_label: action,
    ...metadata,
  });
}

/**
 * Track API key usage
 */
export function trackAPIKeyEvent(
  action: 'created' | 'deleted' | 'tested' | 'updated',
  metadata?: {
    provider?: string;
    key_id?: string;
  }
) {
  gaTrackEvent('api_key_action', {
    event_category: 'settings',
    event_label: action,
    ...metadata,
  });
}

/**
 * Track feature discovery (when users explore new features)
 */
export function trackFeatureDiscovery(
  featureName: string,
  metadata?: {
    source?: string;
    page?: string;
  }
) {
  gaTrackEvent('feature_discovery', {
    event_category: 'engagement',
    event_label: featureName,
    ...metadata,
  });
}

/**
 * Track navigation events
 */
export function trackNavigation(
  destination: string,
  metadata?: {
    source?: string;
    navigation_type?: 'link' | 'button' | 'menu';
  }
) {
  gaTrackEvent('navigation', {
    event_category: 'navigation',
    event_label: destination,
    ...metadata,
  });
}

/**
 * Track filter usage for prompt library
 */
export function trackFilterUsage(
  filterType: 'category' | 'role' | 'pattern' | 'tags' | 'favorites',
  filterValue: string,
  metadata?: {
    result_count?: number;
  }
) {
  trackSearchEvent('filter', {
    filter_type: filterType,
    filter_value: filterValue,
    ...metadata,
  });
}

