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
// Do not set MONGODB_URI in repo; mock DB modules instead in tests
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
    // Do not force external /health to succeed; tests may override to simulate unhealthy
    // Mock RAG health endpoint explicitly
    if (url.includes('/api/rag/health')) {
      return new Response(
        JSON.stringify({ status: 'healthy', rag_service: 'ok' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
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
            choices: [{ message: { content: 'Chain of Thought response' } }],
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

// Also mock MongoDB low-level client module if imported directly
vi.mock('@/lib/db/client', () => {
  type Doc = Record<string, unknown> & { _id?: string };
  const store = new Map<string, Doc[]>();
  const getList = (name: string) => store.get(name) || [];
  const setList = (name: string, list: Doc[]) => store.set(name, list);
  type Stringable = { toString: () => string };
  const toStr = (v: unknown): string => {
    if (
      typeof v === 'object' &&
      v !== null &&
      'toString' in v &&
      typeof (v as Stringable).toString === 'function'
    ) {
      return (v as Stringable).toString();
    }
    return String(v);
  };
  const equals = (a: unknown, b: unknown) => toStr(a) === toStr(b);
  const makeCollection = (name: string) => ({
    findOne: vi.fn(async (query: Record<string, unknown>) => {
      return (
        getList(name).find((d) =>
          Object.entries(query).every(([k, v]) => equals(d[k], v))
        ) || null
      );
    }),
    find: vi.fn((query: Record<string, unknown> = {}) => {
      let arr = getList(name).filter((d) =>
        Object.entries(query).every(([k, v]) =>
          v === undefined ? true : equals(d[k], v)
        )
      );
      let offset = 0;
      let take: number | undefined;
      type FindChain = {
        sort: (s: Record<string, number>) => FindChain;
        skip: (n: number) => FindChain;
        limit: (n: number) => FindChain;
        toArray: () => Promise<Array<Record<string, unknown>>>;
      };
      const chain: FindChain = {
        sort: vi.fn((s: Record<string, number>) => {
          const [[key, dir]] = Object.entries(s);
          arr = arr
            .slice()
            .sort((a, b) => Number(a[key] ?? 0) - Number(b[key] ?? 0));
          if (Number(dir) < 0) arr.reverse();
          return chain;
        }),
        skip: vi.fn((n: number) => {
          offset = n;
          return chain;
        }),
        limit: vi.fn((n: number) => {
          take = n;
          return chain;
        }),
        toArray: vi.fn(async () =>
          take === undefined
            ? arr.slice(offset)
            : arr.slice(offset, offset + take)
        ),
      };
      return chain;
    }),
    deleteOne: vi.fn(async (query: Record<string, unknown>) => {
      const before = getList(name);
      const idx = before.findIndex((d) =>
        Object.entries(query).every(([k, v]) => equals(d[k], v))
      );
      if (idx === -1) return { deletedCount: 0 };
      const after = before.slice();
      after.splice(idx, 1);
      setList(name, after);
      return { deletedCount: 1 };
    }),
    deleteMany: vi.fn(async () => ({ deletedCount: 0 })),
    updateOne: vi.fn(
      async (
        query: Record<string, unknown>,
        update?: Record<string, unknown>
      ) => {
        const list = getList(name).slice();
        const idx = list.findIndex((d) =>
          Object.entries(query).every(([k, v]) => equals(d[k], v))
        );
        if (idx === -1) return { modifiedCount: 0 };
        if (update && update.$set && typeof update.$set === 'object') {
          list[idx] = { ...list[idx], ...update.$set };
          setList(name, list);
        }
        return { modifiedCount: 1 };
      }
    ),
    updateMany: vi.fn(
      async (
        query: Record<string, unknown>,
        update?: Record<string, unknown>
      ) => {
        const list = getList(name).slice();
        let modified = 0;
        for (let i = 0; i < list.length; i++) {
          const d = list[i];
          if (Object.entries(query).every(([k, v]) => equals(d[k], v))) {
            if (update && update.$set && typeof update.$set === 'object') {
              list[i] = { ...d, ...update.$set };
              modified++;
            }
          }
        }
        if (modified > 0) setList(name, list);
        return { modifiedCount: modified };
      }
    ),
    countDocuments: vi.fn(async (query: Record<string, unknown> = {}) => {
      return getList(name).filter((d) =>
        Object.entries(query).every(([k, v]) =>
          v === undefined ? true : d[k] === v
        )
      ).length;
    }),
    aggregate: vi.fn((pipeline: Array<Record<string, unknown>>) => ({
      toArray: vi.fn(async () => {
        let arr: Array<Record<string, unknown>> = getList(name).slice();
        for (const stageUnknown of pipeline) {
          const stage = stageUnknown as Record<string, unknown>;
          if (stage.$match) {
            const q = stage.$match as Record<string, unknown>;
            arr = arr.filter((d) =>
              Object.entries(q).every(([k, v]) => d[k] === v)
            );
          }
          if (stage.$group) {
            const group = stage.$group as Record<string, unknown> & {
              _id: unknown;
            };
            const groupId = group._id;
            const out: Array<Record<string, unknown>> = [];
            const map = new Map<string, number>();
            for (const d of arr) {
              const id =
                typeof groupId === 'string' &&
                (groupId as string).startsWith('$')
                  ? String(d[(groupId as string).slice(1)])
                  : JSON.stringify(groupId);
              map.set(id, (map.get(id) || 0) + 1);
            }
            for (const [id, count] of map.entries()) {
              out.push({ _id: id, count } as Record<string, unknown>);
            }
            arr = out;
          }
          if (stage.$sort) {
            const sort = stage.$sort as Record<string, number>;
            const [[key, dir]] = Object.entries(sort);
            arr = arr.sort((a, b) => Number(a[key] ?? 0) - Number(b[key] ?? 0));
            if (Number(dir) < 0) arr.reverse();
          }
          if (stage.$limit) {
            arr = arr.slice(0, Number(stage.$limit));
          }
        }
        return arr;
      }),
    })),
    insertOne: vi.fn(async (doc: Doc) => {
      const list = getList(name).slice();
      const genHex = () =>
        Array.from({ length: 24 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
      const insertedId = doc._id || genHex();
      list.push({ ...doc, _id: insertedId });
      setList(name, list);
      return { insertedId };
    }),
  });
  const db = { collection: vi.fn((name: string) => makeCollection(name)) };
  return { getDb: vi.fn(async () => db) };
});

// Mock NextAuth where needed by route code (default export and named auth)
vi.mock('next-auth', () => {
  const auth = vi.fn(async () => ({
    user: {
      id: 'test-user',
      email: 'test@example.com',
      role: 'super_admin',
      plan: 'pro',
      organizationId: 'org-1',
    },
  }));
  const defaultExport = vi.fn(() => ({
    auth,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }));
  return { default: defaultExport, auth };
});
