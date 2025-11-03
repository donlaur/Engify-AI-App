/**
 * Analytics utilities for tracking user behavior
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  timestamp?: Date;
}

export function trackEvent(event: AnalyticsEvent): void {
  // In production, send to analytics service
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Analytics]', event);
  }
  
  // TODO: Integrate with analytics provider (PostHog, Mixpanel, etc.)
}

export function trackPageView(path: string, userId?: string): void {
  trackEvent({
    name: 'page_view',
    properties: { path },
    userId,
  });
}

export function trackPromptView(promptId: string, userId?: string): void {
  trackEvent({
    name: 'prompt_view',
    properties: { promptId },
    userId,
  });
}

export function trackPromptCopy(promptId: string, userId?: string): void {
  trackEvent({
    name: 'prompt_copy',
    properties: { promptId },
    userId,
  });
}

export function trackPromptExecute(promptId: string, model: string, userId?: string): void {
  trackEvent({
    name: 'prompt_execute',
    properties: { promptId, model },
    userId,
  });
}

export function trackSignup(userId: string, method: string): void {
  trackEvent({
    name: 'signup',
    properties: { method },
    userId,
  });
}

export function trackLogin(userId: string, method: string): void {
  trackEvent({
    name: 'login',
    properties: { method },
    userId,
  });
}
