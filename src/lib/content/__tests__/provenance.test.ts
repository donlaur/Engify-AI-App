import { describe, it, expect, vi, beforeEach } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

describe('recordProvenance', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  it('inserts provenance document with metadata', async () => {
    const insertOne = vi.fn().mockResolvedValue({ acknowledged: true });
    vi.doMock('@/lib/db/client', () => ({
      getDb: vi.fn(async () => ({ collection: vi.fn(() => ({ insertOne })) })),
    }));
    vi.doMock('@/lib/db/schema', async () => {
      const actual =
        await vi.importActual<typeof import('@/lib/db/schema')>(
          '@/lib/db/schema'
        );
      return { ...actual, Collections: { ...actual.Collections } };
    });
    const { recordProvenance } = await import('../provenance');
    await recordProvenance({
      stage: 'rss',
      source: 'https://example.com/feed.xml',
      status: 'queued',
      metadata: { idx: 0 },
    });
    expect(insertOne).toHaveBeenCalledTimes(1);
    const doc = insertOne.mock.calls[0][0];
    expect(doc.stage).toBe('rss');
    expect(doc.status).toBe('queued');
    expect(doc.metadata).toEqual({ idx: 0 });
    expect(doc.createdAt).toBeInstanceOf(Date);
  });
});
