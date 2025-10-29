/**
 * Vitest Setup File
 *
 * Configures testing environment and global utilities
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import * as util from 'util';

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
// Avoid hardcoded DB URIs in repo; tests should mock DB access
process.env.MONGODB_URI = process.env.MONGODB_URI || '';
// Avoid setting secrets in repo; tests should inject via env if required

// Provide minimal globals
const globalWithEncoders = globalThis as unknown as {
  TextEncoder?: typeof util.TextEncoder;
  TextDecoder?: typeof util.TextDecoder;
};
if (!globalWithEncoders.TextEncoder || !globalWithEncoders.TextDecoder) {
  globalWithEncoders.TextEncoder = util.TextEncoder;
  globalWithEncoders.TextDecoder = util.TextDecoder;
}

// Mock fetch globally
const mockedFetch = vi.fn(
  async (_input: RequestInfo | URL, _init?: RequestInit) => {
    const url = typeof _input === 'string' ? _input : _input.toString();
    // Mock RAG endpoint responses
    if (url.includes('/api/rag')) {
      return new Response(
        JSON.stringify({
          success: true,
          results: [
            {
              _id: '1',
              title: 'KB Doc',
              content: 'Sample content',
              score: 0.9,
            },
          ],
          query_embedding: [0.1, 0.2, 0.3],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Default: ok with empty json
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
) as unknown as typeof fetch;
vi.stubGlobal('fetch', mockedFetch);

// Mock OpenAI SDK
vi.mock('openai', () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: vi.fn(async () => ({
            choices: [{ message: { content: 'Test response' } }],
          })),
        },
      };
      constructor(_opts?: unknown) {}
    },
  };
});

// Mock Anthropic SDK to avoid browser env errors
vi.mock('@anthropic-ai/sdk', () => {
  class AnthropicMock {
    constructor(_opts?: unknown) {}
    messages = {
      create: vi.fn(async () => ({
        content: [{ text: 'Test response' }],
        usage: { input_tokens: 10, output_tokens: 20 },
      })),
    };
  }
  return { default: AnthropicMock };
});

// Mock Groq SDK to avoid browser env errors
vi.mock('groq-sdk', () => {
  class GroqMock {
    constructor(_opts?: unknown) {}
    chat = {
      completions: {
        create: vi.fn(async () => ({
          choices: [{ message: { content: 'Test response' } }],
        })),
      },
    };
  }
  return { default: GroqMock };
});

// Mock MongoDB module used in server-only code during route tests
vi.mock('@/lib/db/mongodb', () => {
  const collectionMock = () => ({
    findOne: vi.fn(async () => null),
    aggregate: vi.fn(() => ({ toArray: vi.fn(async () => []) })),
    countDocuments: vi.fn(async () => 0),
  });
  return {
    getMongoDb: vi.fn(async () => ({ collection: collectionMock })),
    getMongoClient: vi.fn(async () => ({})),
  };
});

// Mock NextAuth where needed by route code
vi.mock('next-auth', () => ({
  auth: vi.fn(async () => ({
    user: { id: 'test-user', email: 'test@example.com' },
  })),
}));
