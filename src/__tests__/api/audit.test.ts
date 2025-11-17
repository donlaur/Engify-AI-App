/**
 * Prompt Audit API Tests
 * Tests for POST /api/prompts/audit endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/prompts/audit/route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/config/ai-models', () => ({
  getModelById: vi.fn(),
}));

vi.mock('@/lib/ai/v2/factory/AIProviderFactory', () => ({
  AIProviderFactory: {
    create: vi.fn(),
  },
}));

vi.mock('@/server/middleware/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('POST /api/prompts/audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new NextRequest('http://localhost/api/prompts/audit', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test prompt' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 429 when rate limit exceeded', async () => {
    const { auth } = await import('@/lib/auth');
    const { checkRateLimit } = await import('@/lib/rate-limit');

    vi.mocked(auth).mockResolvedValue({ user: { id: 'test-user' } } as any);
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      reason: 'Rate limit exceeded',
    });

    const request = new NextRequest('http://localhost/api/prompts/audit', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test prompt' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
  });

  it('should analyze prompt successfully', async () => {
    const { auth } = await import('@/lib/auth');
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const { getModelById } = await import('@/lib/config/ai-models');
    const { AIProviderFactory } = await import(
      '@/lib/ai/v2/factory/AIProviderFactory'
    );

    vi.mocked(auth).mockResolvedValue({ user: { id: 'test-user' } } as any);
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 9,
      resetAt: new Date(),
    });

    vi.mocked(getModelById).mockReturnValue({
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
    } as any);

    const mockProvider = {
      execute: vi.fn().mockResolvedValue({
        content: JSON.stringify({
          overallScore: 85,
          kernelScores: {
            keepSimple: 90,
            easyToVerify: 80,
            reproducible: 85,
            narrowScope: 80,
            explicitConstraints: 70,
            logicalStructure: 85,
          },
          issues: [],
          recommendations: [],
          improvedVersion: 'Improved test prompt',
        }),
      }),
      validateRequest: vi.fn().mockReturnValue(true),
    };

    vi.mocked(AIProviderFactory.create).mockReturnValue(mockProvider as any);

    const request = new NextRequest('http://localhost/api/prompts/audit', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test prompt for analysis' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.analysis.overallScore).toBe(85);
  });
});
