/**
 * AI Summary: Validates the RagClient health and search methods with fetch mocks.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RagClient } from '../client';

describe('RagClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('health returns ok on valid response', async () => {
    global.fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
    ) as unknown as typeof fetch;

    const client = new RagClient({ baseUrl: 'http://localhost:8000' });
    const res = await client.health();
    expect(res.ok).toBe(true);
  });

  it('search validates input and returns error for empty query', async () => {
    const client = new RagClient();
    const res = await client.search({ query: '' as unknown as string });
    expect(res.ok).toBe(false);
  });

  it('search returns parsed results', async () => {
    global.fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            success: true,
            results: [{ _id: '1', content: 'hello' }],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
    ) as unknown as typeof fetch;

    const client = new RagClient();
    const res = await client.search({ query: 'test' });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.results.length).toBe(1);
    }
  });
});
