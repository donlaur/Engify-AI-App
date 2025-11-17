/**
 * Analytics Hooks
 *
 * React hooks for tracking analytics events
 */

'use client';

import { useCallback } from 'react';
import { posthog } from '@/components/analytics/PostHogProvider';
import { logger } from '@/lib/logging/logger';

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined' || !posthog) return;

    try {
      posthog.capture(eventName, properties);
      logger.debug('Analytics event tracked', { eventName, properties });
    } catch (error) {
      logger.error('Failed to track event', { error, eventName });
    }
  }, []);

  const identifyUser = useCallback((userId: string, traits?: Record<string, any>) => {
    if (typeof window === 'undefined' || !posthog) return;

    try {
      posthog.identify(userId, traits);
      logger.debug('User identified', { userId });
    } catch (error) {
      logger.error('Failed to identify user', { error, userId });
    }
  }, []);

  const resetUser = useCallback(() => {
    if (typeof window === 'undefined' || !posthog) return;

    try {
      posthog.reset();
      logger.debug('User reset');
    } catch (error) {
      logger.error('Failed to reset user', { error });
    }
  }, []);

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    if (typeof window === 'undefined' || !posthog) return;

    try {
      posthog.people.set(properties);
      logger.debug('User properties set', { properties });
    } catch (error) {
      logger.error('Failed to set user properties', { error });
    }
  }, []);

  return {
    trackEvent,
    identifyUser,
    resetUser,
    setUserProperties,
  };
}

/**
 * Hook for tracking prompt interactions
 */
export function usePromptAnalytics() {
  const { trackEvent } = useAnalytics();

  const trackPromptView = useCallback(
    (promptId: string, promptTitle: string, metadata?: Record<string, any>) => {
      trackEvent('prompt_view', {
        prompt_id: promptId,
        prompt_title: promptTitle,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackPromptCopy = useCallback(
    (promptId: string, promptTitle: string, metadata?: Record<string, any>) => {
      trackEvent('prompt_copy', {
        prompt_id: promptId,
        prompt_title: promptTitle,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackPromptFavorite = useCallback(
    (promptId: string, promptTitle: string, favorited: boolean, metadata?: Record<string, any>) => {
      trackEvent('prompt_favorite', {
        prompt_id: promptId,
        prompt_title: promptTitle,
        favorited,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackPromptExecute = useCallback(
    (
      promptId: string,
      promptTitle: string,
      model: string,
      metadata?: Record<string, any>
    ) => {
      trackEvent('prompt_execute', {
        prompt_id: promptId,
        prompt_title: promptTitle,
        model,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackPromptShare = useCallback(
    (
      promptId: string,
      promptTitle: string,
      platform: string,
      metadata?: Record<string, any>
    ) => {
      trackEvent('prompt_share', {
        prompt_id: promptId,
        prompt_title: promptTitle,
        platform,
        ...metadata,
      });
    },
    [trackEvent]
  );

  return {
    trackPromptView,
    trackPromptCopy,
    trackPromptFavorite,
    trackPromptExecute,
    trackPromptShare,
  };
}

/**
 * Hook for tracking workbench usage
 */
export function useWorkbenchAnalytics() {
  const { trackEvent } = useAnalytics();

  const trackWorkbenchOpen = useCallback(
    (metadata?: Record<string, any>) => {
      trackEvent('workbench_open', metadata);
    },
    [trackEvent]
  );

  const trackWorkbenchPromptRun = useCallback(
    (model: string, promptLength: number, metadata?: Record<string, any>) => {
      trackEvent('workbench_prompt_run', {
        model,
        prompt_length: promptLength,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackWorkbenchModelChange = useCallback(
    (fromModel: string, toModel: string, metadata?: Record<string, any>) => {
      trackEvent('workbench_model_change', {
        from_model: fromModel,
        to_model: toModel,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackWorkbenchExport = useCallback(
    (format: string, metadata?: Record<string, any>) => {
      trackEvent('workbench_export', {
        format,
        ...metadata,
      });
    },
    [trackEvent]
  );

  return {
    trackWorkbenchOpen,
    trackWorkbenchPromptRun,
    trackWorkbenchModelChange,
    trackWorkbenchExport,
  };
}

/**
 * Hook for tracking conversion events
 */
export function useConversionAnalytics() {
  const { trackEvent } = useAnalytics();

  const trackSignup = useCallback(
    (userId: string, method: string, metadata?: Record<string, any>) => {
      trackEvent('signup', {
        user_id: userId,
        method,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackLogin = useCallback(
    (userId: string, method: string, metadata?: Record<string, any>) => {
      trackEvent('login', {
        user_id: userId,
        method,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackUpgrade = useCallback(
    (userId: string, plan: string, metadata?: Record<string, any>) => {
      trackEvent('upgrade', {
        user_id: userId,
        plan,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackSubscription = useCallback(
    (userId: string, plan: string, price: number, metadata?: Record<string, any>) => {
      trackEvent('subscription', {
        user_id: userId,
        plan,
        price,
        ...metadata,
      });
    },
    [trackEvent]
  );

  return {
    trackSignup,
    trackLogin,
    trackUpgrade,
    trackSubscription,
  };
}

/**
 * Hook for tracking workflow interactions
 */
export function useWorkflowAnalytics() {
  const { trackEvent } = useAnalytics();

  const trackWorkflowView = useCallback(
    (workflowId: string, workflowTitle: string, metadata?: Record<string, any>) => {
      trackEvent('workflow_view', {
        workflow_id: workflowId,
        workflow_title: workflowTitle,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackWorkflowClick = useCallback(
    (workflowId: string, workflowTitle: string, metadata?: Record<string, any>) => {
      trackEvent('workflow_click', {
        workflow_id: workflowId,
        workflow_title: workflowTitle,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackWorkflowFilter = useCallback(
    (filterType: string, filterValue: string, metadata?: Record<string, any>) => {
      trackEvent('workflow_filter', {
        filter_type: filterType,
        filter_value: filterValue,
        ...metadata,
      });
    },
    [trackEvent]
  );

  return {
    trackWorkflowView,
    trackWorkflowClick,
    trackWorkflowFilter,
  };
}
