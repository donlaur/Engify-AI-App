import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * RAG Integration Tests
 * Tests the RAG chatbot functionality
 */

// Mock fetch for testing
global.fetch = vi.fn() as unknown as typeof fetch;

describe('RAG Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RAG API Route', () => {
    it('should handle valid RAG requests', async () => {
      // Mock successful RAG service response
      (
        global.fetch as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              _id: 'test-1',
              title: 'Test Document',
              content: 'Test content',
              score: 0.95,
            },
          ],
          query_embedding: [0.1, 0.2, 0.3],
        }),
      });

      const { POST } = await import('@/app/api/rag/route');
      const request = new NextRequest('http://localhost:3000/api/rag', {
        method: 'POST',
        body: JSON.stringify({
          query: 'test query',
          collection: 'knowledge_base',
          top_k: 3,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toHaveLength(1);
      expect(data.results.length > 0 ? data.results[0].title : '').toBe(
        'Test Document'
      );
    });

    it('should handle RAG service errors gracefully', async () => {
      // Mock failed RAG service response
      (
        global.fetch as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { POST } = await import('@/app/api/rag/route');
      const request = new NextRequest('http://localhost:3000/api/rag', {
        method: 'POST',
        body: JSON.stringify({
          query: 'test query',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.results).toEqual([]);
    });
  });

  describe('Chat API with RAG', () => {
    it('should integrate RAG context into chat responses', async () => {
      // Mock RAG service response
      (
        global.fetch as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [
            {
              title: 'Chain of Thought Pattern',
              content: 'Chain of thought is a prompting technique...',
              score: 0.92,
            },
          ],
        }),
      });

      // Mock OpenAI response
      (
        global.fetch as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content:
                  'Chain of Thought is a powerful prompting technique that...',
              },
            },
          ],
        }),
      });

      const { POST } = await import('@/app/api/chat/route');
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'What is chain of thought?' }],
          useRAG: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('Chain of Thought');
      expect(data.usedRAG).toBe(true);
      expect(data.sources).toHaveLength(1);
      expect(data.sources.length > 0 ? data.sources[0]?.title : '').toBe(
        'Chain of Thought Pattern'
      );
    });

    it('should fallback gracefully when RAG service is unavailable', async () => {
      // Mock failed RAG service response
      (
        global.fetch as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

      // Mock OpenAI response
      (
        global.fetch as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Chain of Thought is a prompting technique...',
              },
            },
          ],
        }),
      });

      const { POST } = await import('@/app/api/chat/route');
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'What is chain of thought?' }],
          useRAG: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('Chain of Thought');
      expect(data.usedRAG).toBe(false);
      expect(data.sources).toEqual([]);
    });
  });

  describe('RAG Health Check', () => {
    it('should return healthy status when RAG service is available', async () => {
      const { GET } = await import('@/app/api/rag/route');
      const request = new NextRequest('http://localhost:3000/api/rag');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.rag_service).toBeDefined();
    });

    it('should return unhealthy status when RAG service is unavailable', async () => {
      const { GET } = await import('@/app/api/rag/route');
      const request = new NextRequest(
        'http://localhost:3000/api/rag?unhealthy=true'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
      expect(data.error).toBeDefined();
    });
  });
});
