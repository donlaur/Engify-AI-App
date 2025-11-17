import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/rag/route';

// Mock dependencies
vi.mock('@/lib/middleware/rbac', () => ({
  RBACPresets: {
    requireWorkbenchAccess: () => () => null,
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 100,
    resetAt: new Date(Date.now() + 3600000),
  }),
}));

describe('POST /api/rag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAG_API_URL = 'https://test-api.execute-api.us-east-1.amazonaws.com/prod';
  });

  it('should return 400 if query is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/rag', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should call Lambda RAG service and return results', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        results: [{ _id: '1', title: 'Test', content: 'Content', score: 0.9 }],
        query_embedding: [0.1, 0.2],
        total_results: 1,
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/rag', {
      method: 'POST',
      body: JSON.stringify({ query: 'test', top_k: 5 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.results).toHaveLength(1);
  });
});

describe('GET /api/rag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAG_API_URL = 'https://test-api.execute-api.us-east-1.amazonaws.com/prod';
  });

  it('should return healthy status in non-production', async () => {
    (process.env as any).NODE_ENV = 'development';
    const request = new NextRequest('http://localhost:3000/api/rag');
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });
});
