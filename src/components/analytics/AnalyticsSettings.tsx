/**
 * Analytics Settings Component
 *
 * Allows users to control their analytics preferences
 * GDPR-compliant opt-in/opt-out interface
 */

'use client';

import { useState, useEffect } from 'react';
import {
  optOutAnalytics,
  optInAnalytics,
  isAnalyticsEnabled,
} from '@/components/analytics/PostHogProvider';

export function AnalyticsSettings() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(isAnalyticsEnabled());
  }, []);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      optInAnalytics();
      setEnabled(true);
    } else {
      optOutAnalytics();
      setEnabled(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            id="analytics-toggle"
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="analytics-toggle"
            className="text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Enable Analytics
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Help us improve Engify by sharing anonymous usage data. We respect your privacy
            and never collect personal information.
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
        <p className="font-medium">What we collect:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Page views and navigation patterns</li>
          <li>Feature usage (prompts, workbench, workflows)</li>
          <li>Performance metrics</li>
          <li>Error reports</li>
        </ul>

        <p className="font-medium mt-3">What we don&apos;t collect:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Personal information (email, name, etc.)</li>
          <li>Prompt content or API keys</li>
          <li>IP addresses (anonymized)</li>
          <li>Session recordings</li>
        </ul>

        <p className="mt-3">
          We use{' '}
          <a
            href="https://posthog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            PostHog
          </a>
          , an open-source, privacy-focused analytics platform. You can opt out at any time.
        </p>
      </div>
    </div>
  );
}
