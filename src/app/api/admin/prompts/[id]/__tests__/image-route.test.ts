import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/middleware/rbac', () => ({
  RBACPresets: {
    requireSuperAdmin: vi.fn(() => vi.fn(async () => null)),
  },
}));

const mockFindOne = vi.fn();

vi.mock('@/lib/db/client', () => ({
  getDb: vi.fn(async () => ({
    collection: vi.fn(() => ({
      findOne: mockFindOne,
    })),
  })),
}));

const mockGenerate = vi.fn();

vi.mock('@/lib/services/ImageAssetService', () => ({
  ImageAssetService: {
    generateAndPersistPromptMedia: mockGenerate,
  },
}));

describe('Admin prompt image route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns prompt media on GET', async () => {
    mockFindOne.mockResolvedValueOnce({
      media: { coverImageUrl: 'https://example.com/cover.png' },
    });

    const { GET } = await import('../image/route');
    const res = await GET(new NextRequest('http://localhost:3000'), {
      params: Promise.resolve({ id: '655f5f8a9772238ea0a5f301' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.media.coverImageUrl).toBe('https://example.com/cover.png');
  });

  it('generates media on POST', async () => {
    mockFindOne.mockResolvedValueOnce({
      title: 'Prompt Title',
      description: 'Prompt description',
    });
    mockGenerate.mockResolvedValueOnce({
      coverImageUrl: 'https://example.com/new-cover.png',
    });

    const { POST } = await import('../image/route');
    const res = await POST(
      new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ regen: true }),
      }),
      { params: Promise.resolve({ id: '655f5f8a9772238ea0a5f301' }) }
    );

    expect(res.status).toBe(200);
    expect(mockGenerate).toHaveBeenCalled();
    const body = await res.json();
    expect(body.media.coverImageUrl).toContain('example.com');
  });
});
