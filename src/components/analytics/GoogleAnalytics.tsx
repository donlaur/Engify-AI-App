/**
 * Google Analytics 4 Integration
 * 
 * Best practices:
 * - Scripts load with afterInteractive strategy (non-blocking)
 * - Preconnects to GTM domain for faster load
 * - Tracks page views on route changes
 * - Only loads in production to avoid dev noise
 */

'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-1X4BJ3EEKD';

// Validate GA ID format
if (!GA_MEASUREMENT_ID.startsWith('G-')) {
  console.warn(`Invalid GA Measurement ID format: ${GA_MEASUREMENT_ID}. Should start with "G-"`);
}

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

function GoogleAnalyticsTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route change (SPA navigation)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID]);

  return null;
}

export function GoogleAnalytics() {
  // Only load in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  // Don't render if no valid GA ID
  if (!GA_MEASUREMENT_ID || !GA_MEASUREMENT_ID.startsWith('G-')) {
    console.warn('Google Analytics: No valid NEXT_PUBLIC_GA_MEASUREMENT_ID found');
    return null;
  }

  return (
    <>
      {/* Preconnect to Google Tag Manager for faster load */}
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      
      {/* Load Google Analytics script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      
      {/* Initialize Google Analytics */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: false, // We'll track manually via useEffect
            });
          `,
        }}
      />
      
      {/* Track page views on route changes */}
      <Suspense fallback={null}>
        <GoogleAnalyticsTracking />
      </Suspense>
    </>
  );
}

/**
 * Track custom events
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/**
 * Track page view manually
 */
export function trackPageView(url: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

