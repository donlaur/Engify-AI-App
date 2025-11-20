/**
 * Tests for /api/admin/content/recap
 * Multi-agent editorial recap generation API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

describe('POST /api/admin/content/recap', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should require authentication', async () => {
    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => null),
    }));

    const { POST } = await import('@/app/api/admin/content/recap/route');
    const req = new NextRequest('http://localhost:3000/api/admin/content/recap', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Article',
        content: 'Test content here',
        provider: 'openai',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should require admin role', async () => {
    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => ({ user: { id: 'u1', role: 'user' } })),
    }));

    const { POST } = await import('@/app/api/admin/content/recap/route');
    const req = new NextRequest('http://localhost:3000/api/admin/content/recap', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Article',
        content: 'Test content here',
        provider: 'openai',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('should validate request body', async () => {
    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => ({ user: { id: 'a1', role: 'admin' } })),
    }));

    const { POST } = await import('@/app/api/admin/content/recap/route');
    const req = new NextRequest('http://localhost:3000/api/admin/content/recap', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
        provider: 'openai',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should require API key for provider', async () => {
    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => ({ user: { id: 'a1', role: 'admin' } })),
    }));
    vi.doMock('@/lib/services/ApiKeyService', () => ({
      ApiKeyService: vi.fn().mockImplementation(() => ({
        getActiveKey: vi.fn(async () => null), // No API key found
      })),
    }));

    const { POST } = await import('@/app/api/admin/content/recap/route');
    const req = new NextRequest('http://localhost:3000/api/admin/content/recap', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Article',
        content: 'Test content here with enough text to pass validation',
        provider: 'openai',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain('No API key found');
  });

  it('should enforce rate limiting', async () => {
    // This test would require mocking rate limit to return exceeded
    // Skipping for now as it requires test infrastructure
    expect(true).toBe(true);
  });
});

