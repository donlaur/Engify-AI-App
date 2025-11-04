/**
 * Preload JSON Data on Homepage
 * 
 * Preloads prompts.json, patterns.json, and learning.json in the background
 * so they're ready when users navigate to those pages
 */

'use client';

import { useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const JSON_FILES = [
  '/data/prompts.json',
  '/data/patterns.json',
  '/data/learning.json',
] as const;

function PreloadContentJsonInner() {
  useEffect(() => {
    // Preload JSON files using link prefetch
    JSON_FILES.forEach((file) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'fetch';
      link.href = file;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Also prefetch using fetch API (for better browser support)
    // This doesn't block the page, just starts loading in background
    JSON_FILES.forEach((file) => {
      fetch(file, {
        method: 'GET',
        cache: 'force-cache',
      }).catch(() => {
        // Silently fail - prefetch is optional
      });
    });
  }, []);

  // This component doesn't render anything
  return null;
}

/**
 * Preload JSON files in the background
 * Wrapped in ErrorBoundary for safety
 */
export function PreloadContentJson() {
  return (
    <ErrorBoundary
      fallback={null} // Silently fail - prefetch is optional
      onError={(error) => {
        // Log error but don't break the page
        console.debug('Failed to preload JSON files:', error);
      }}
    >
      <PreloadContentJsonInner />
    </ErrorBoundary>
  );
}
