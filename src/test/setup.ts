/**
 * Vitest Setup File
 *
 * Configures testing environment and global utilities
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables for testing
// Note: These are test-only values, not real secrets
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
// Generate a random test secret to avoid hardcoding
process.env.NEXTAUTH_SECRET = Array.from(
  { length: 32 },
  () => Math.random().toString(36)[2]
).join('');
