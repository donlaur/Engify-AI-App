/**
 * Utility Functions
 * 
 * Common utility functions used throughout the application
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Time constants (in seconds)
const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

// Date formatting constants
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
} as const;

const LOCALE = 'en-US' as const;

/**
 * Merge Tailwind CSS classes with proper precedence
 * 
 * This is the standard shadcn/ui utility for combining class names
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500') // => conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse date input to Date object
 */
function parseDate(date: Date | string): Date {
  return typeof date === 'string' ? new Date(date) : date;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = parseDate(date);
  return new Intl.DateTimeFormat(LOCALE, DATE_FORMAT_OPTIONS).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = parseDate(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  // Use early returns to avoid pyramid of doom
  if (diffInSeconds < MINUTE) return 'just now';
  if (diffInSeconds < HOUR) return `${Math.floor(diffInSeconds / MINUTE)}m ago`;
  if (diffInSeconds < DAY) return `${Math.floor(diffInSeconds / HOUR)}h ago`;
  if (diffInSeconds < WEEK) return `${Math.floor(diffInSeconds / DAY)}d ago`;
  
  return formatDate(d);
}

/**
 * Truncate text to specified length
 * 
 * @param text - The text to truncate
 * @param length - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncate(text: string, length: number): string {
  if (typeof text !== 'string') {
    throw new TypeError('Expected string for truncate');
  }
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
