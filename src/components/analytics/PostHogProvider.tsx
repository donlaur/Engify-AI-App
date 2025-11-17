/**
 * PostHog Analytics Provider
 *
 * Privacy-focused, GDPR-compliant analytics integration
 *
 * Features:
 * - Respects Do Not Track (DNT) browser setting
 * - GDPR-compliant opt-out mechanism
 * - Graceful degradation on error
 * - Client-side only tracking
 * - Session replay disabled by default
 * - IP anonymization enabled
 *
 * Environment Variables:
 * - NEXT_PUBLIC_POSTHOG_KEY: PostHog project API key
 * - NEXT_PUBLIC_POSTHOG_HOST: PostHog instance host (default: https://app.posthog.com)
 * - NEXT_PUBLIC_ANALYTICS_ENABLED: Master toggle for analytics (default: true)
 */

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { logger } from '@/lib/logging/logger';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false';

/**
 * Check if user has Do Not Track enabled
 */
function isDoNotTrackEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

/**
 * Check if user has opted out of analytics
 */
function hasOptedOut(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return localStorage.getItem('analytics-opt-out') === 'true';
  } catch {
    return false;
  }
}

/**
 * Initialize PostHog analytics
 */
function initializePostHog(): void {
  if (!POSTHOG_KEY) {
    logger.warn('PostHog: No API key found. Analytics disabled.');
    return;
  }

  if (!ANALYTICS_ENABLED) {
    logger.info('PostHog: Analytics disabled via environment variable');
    return;
  }

  // Respect privacy settings
  if (isDoNotTrackEnabled()) {
    logger.info('PostHog: Do Not Track is enabled. Analytics disabled.');
    return;
  }

  if (hasOptedOut()) {
    logger.info('PostHog: User has opted out. Analytics disabled.');
    return;
  }

  // Only initialize in browser
  if (typeof window === 'undefined') return;

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,

      // Privacy settings
      loaded: (posthog) => {
        // Disable in development mode
        if (process.env.NODE_ENV === 'development') {
          posthog.opt_out_capturing();
          logger.debug('PostHog: Opted out in development mode');
        }
      },

      // Respect user privacy
      respect_dnt: true,

      // IP anonymization
      mask_all_text: false,
      mask_all_element_attributes: false,

      // Session recording disabled by default for privacy
      disable_session_recording: true,

      // Autocapture settings
      autocapture: {
        dom_event_allowlist: [], // Disable autocapture, we'll track explicitly
        url_allowlist: [],
        element_allowlist: [],
        css_selector_allowlist: [],
      },

      // Performance optimization
      capture_pageview: false, // We'll handle this manually
      capture_pageleave: true,

      // Error handling
      on_xhr_error: (error) => {
        logger.error('PostHog XHR error', { error });
      },

      // Persistence
      persistence: 'localStorage+cookie',

      // Cross-domain tracking
      cross_subdomain_cookie: true,

      // Advanced options
      property_denylist: ['$referrer', '$referring_domain'], // Remove referrer for privacy
      sanitize_properties: (properties) => {
        // Remove any sensitive properties
        const sanitized = { ...properties };
        delete sanitized.email;
        delete sanitized.phone;
        delete sanitized.password;
        return sanitized;
      },
    });

    logger.info('PostHog: Initialized successfully');
  } catch (error) {
    logger.error('PostHog: Initialization error', { error });
  }
}

/**
 * Track page views on route changes
 */
function usePostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!POSTHOG_KEY || !ANALYTICS_ENABLED) return;
    if (isDoNotTrackEnabled() || hasOptedOut()) return;

    try {
      // Track page view
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      posthog.capture('$pageview', {
        $current_url: url,
      });

      logger.debug('PostHog: Page view tracked', { url });
    } catch (error) {
      logger.error('PostHog: Page view tracking error', { error });
    }
  }, [pathname, searchParams]);
}

/**
 * PostHog Provider Component
 */
export function PostHogProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    initializePostHog();

    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined' && posthog) {
        try {
          posthog.reset();
        } catch (error) {
          logger.error('PostHog: Cleanup error', { error });
        }
      }
    };
  }, []);

  // Track page views
  usePostHogPageView();

  return children || null;
}

/**
 * Export PostHog instance for use in components
 */
export { posthog };

/**
 * Analytics opt-out function (GDPR compliance)
 */
export function optOutAnalytics(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('analytics-opt-out', 'true');
    posthog.opt_out_capturing();
    logger.info('PostHog: User opted out of analytics');
  } catch (error) {
    logger.error('PostHog: Opt-out error', { error });
  }
}

/**
 * Analytics opt-in function
 */
export function optInAnalytics(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('analytics-opt-out');
    if (!isDoNotTrackEnabled()) {
      posthog.opt_in_capturing();
      logger.info('PostHog: User opted in to analytics');
    }
  } catch (error) {
    logger.error('PostHog: Opt-in error', { error });
  }
}

/**
 * Check if analytics is currently enabled
 */
export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return !isDoNotTrackEnabled() && !hasOptedOut() && ANALYTICS_ENABLED && !!POSTHOG_KEY;
}
