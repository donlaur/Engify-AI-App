/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * v2 AI Execute API Route Tests
 * Tests all providers through the new interface-based API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

// Mock AIProviderFactory
vi.mock('@/lib/ai/v2/factory/AIProviderFactory', () => ({
  AIProviderFactory: {
    hasProvider: vi.fn(),
    create: vi.fn(),
    getAvailableProviders: vi.fn(() => [
      'openai',
      'anthropic',
      'google',
      'groq',
    ]),
    getProvidersByCategory: vi.fn(() => ({
      'Text Generation': ['openai', 'anthropic'],
      'Fast Inference': ['groq'],
      Multimodal: ['google'],
    })),
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/workbench/contracts', () => ({
  getWorkbenchToolContract: vi.fn(() => null),
}));

vi.mock('@/lib/services/workbenchRuns', () => ({
  startWorkbenchRun: vi.fn(),
  completeWorkbenchRun: vi.fn(),
}));

describe('POST /api/v2/ai/execute', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin', role: 'super_admin' },
    } as any);
    const { getWorkbenchToolContract } = await import(
      '@/lib/workbench/contracts'
    );
    vi.mocked(getWorkbenchToolContract).mockReturnValue(null);
    const { startWorkbenchRun, completeWorkbenchRun } = await import(
      '@/lib/services/workbenchRuns'
    );
    vi.mocked(startWorkbenchRun).mockResolvedValue({
      status: 'started',
      runId: 'run-123',
    });
    vi.mocked(completeWorkbenchRun).mockResolvedValue();
  });

  it('should execute request with OpenAI provider', async () => {
    const { AIProviderFactory } = await import(
      '@/lib/ai/v2/factory/AIProviderFactory'
    );

    (AIProviderFactory.hasProvider as any).mockReturnValue(true);
    (AIProviderFactory.create as any).mockReturnValue({
      validateRequest: vi.fn().mockReturnValue(true),
      execute: vi.fn().mockResolvedValue({
        content: 'Test response',
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        cost: { input: 0.001, output: 0.002, total: 0.003 },
        latency: 1000,
        provider: 'openai',
        model: 'gpt-3.5-turbo',
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/v2/ai/execute', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'openai',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.response).toBe('Test response');
    expect(data.provider).toBe('openai');
    const { startWorkbenchRun } = await import('@/lib/services/workbenchRuns');
    expect(startWorkbenchRun).not.toHaveBeenCalled();
  });

  it('should execute request with Claude provider', async () => {
    const { AIProviderFactory } = await import(
      '@/lib/ai/v2/factory/AIProviderFactory'
    );

    (AIProviderFactory.hasProvider as any).mockReturnValue(true);
    (AIProviderFactory.create as any).mockReturnValue({
      validateRequest: vi.fn().mockReturnValue(true),
      execute: vi.fn().mockResolvedValue({
        content: 'Claude response',
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        cost: { input: 0.001, output: 0.002, total: 0.003 },
        latency: 1200,
        provider: 'anthropic',
        model: 'claude-3-sonnet',
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/v2/ai/execute', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'anthropic',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.provider).toBe('anthropic');
    const { startWorkbenchRun } = await import('@/lib/services/workbenchRuns');
    expect(startWorkbenchRun).not.toHaveBeenCalled();
  });

  it('should execute request with Gemini provider', async () => {
    const { AIProviderFactory } = await import(
      '@/lib/ai/v2/factory/AIProviderFactory'
    );

    (AIProviderFactory.hasProvider as any).mockReturnValue(true);
    (AIProviderFactory.create as any).mockReturnValue({
      validateRequest: vi.fn().mockReturnValue(true),
      execute: vi.fn().mockResolvedValue({
        content: 'Gemini response',
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        cost: { input: 0.001, output: 0.002, total: 0.003 },
        latency: 800,
        provider: 'google',
        model: 'gemini-pro',
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/v2/ai/execute', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'google',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.provider).toBe('google');
    const { startWorkbenchRun } = await import('@/lib/services/workbenchRuns');
    expect(startWorkbenchRun).not.toHaveBeenCalled();
  });

  it('should execute request with Groq provider', async () => {
    const { AIProviderFactory } = await import(
      '@/lib/ai/v2/factory/AIProviderFactory'
    );

    (AIProviderFactory.hasProvider as any).mockReturnValue(true);
    (AIProviderFactory.create as any).mockReturnValue({
      validateRequest: vi.fn().mockReturnValue(true),
      execute: vi.fn().mockResolvedValue({
        content: 'Groq response',
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        cost: { input: 0.001, output: 0.002, total: 0.003 },
        latency: 500,
        provider: 'groq',
        model: 'llama3-8b',
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/v2/ai/execute', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'groq',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.provider).toBe('groq');
    const { startWorkbenchRun } = await import('@/lib/services/workbenchRuns');
    expect(startWorkbenchRun).not.toHaveBeenCalled();
  });

  it('should return error for invalid provider', async () => {
    const { AIProviderFactory } = await import(
      '@/lib/ai/v2/factory/AIProviderFactory'
    );

    (AIProviderFactory.hasProvider as any).mockReturnValue(false);

    const request = new NextRequest('http://localhost:3000/api/v2/ai/execute', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'invalid-provider',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid provider');
  });

  it('should validate request before execution', async () => {
    const { AIProviderFactory } = await import(
      '@/lib/ai/v2/factory/AIProviderFactory'
    );

    (AIProviderFactory.hasProvider as any).mockReturnValue(true);
    (AIProviderFactory.create as any).mockReturnValue({
      validateRequest: vi.fn().mockReturnValue(false),
      execute: vi.fn(),
    });

    const request = new NextRequest('http://localhost:3000/api/v2/ai/execute', {
      method: 'POST',
      body: JSON.stringify({
        prompt: '',
        provider: 'openai',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('enforces workbench contract budgets', async () => {
    const { AIProviderFactory } = await import(
      '@/lib/ai/v2/factory/AIProviderFactory'
    );
    const { getWorkbenchToolContract } = await import(
      '@/lib/workbench/contracts'
    );
    const { startWorkbenchRun, completeWorkbenchRun } = await import(
      '@/lib/services/workbenchRuns'
    );

    vi.mocked(getWorkbenchToolContract).mockReturnValue({
      contractId: 'contract/prompt-optimizer@1',
      toolId: 'prompt-optimizer',
      version: 1,
      maxCostCents: 50,
      maxTotalTokens: 5000,
      costPerTokenCents: 0.02,
      replayWindowMinutes: 5,
    });

    vi.mocked(startWorkbenchRun).mockResolvedValue({
      status: 'started',
      runId: 'run-budget',
    });

    (AIProviderFactory.hasProvider as any).mockReturnValue(true);
    (AIProviderFactory.create as any).mockReturnValue({
      validateRequest: vi.fn().mockReturnValue(true),
      execute: vi.fn().mockResolvedValue({
        content: 'Expensive response',
        usage: { promptTokens: 1500, completionTokens: 700, totalTokens: 2200 },
        cost: { input: 0.30, output: 0.35, total: 0.65 },
        latency: 900,
        provider: 'openai',
        model: 'gpt-4',
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/v2/ai/execute', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'openai',
        toolId: 'prompt-optimizer',
        runId: 'run-budget',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('cost budget');
    expect(completeWorkbenchRun).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: 'run-budget',
        status: 'budget_exceeded',
      })
    );
  });

  it('handles workbench run replay', async () => {
    const { AIProviderFactory } = await import(
      '@/lib/ai/v2/factory/AIProviderFactory'
    );
    const { getWorkbenchToolContract } = await import(
      '@/lib/workbench/contracts'
    );
    const { startWorkbenchRun, completeWorkbenchRun } = await import(
      '@/lib/services/workbenchRuns'
    );

    vi.mocked(getWorkbenchToolContract).mockReturnValue({
      contractId: 'contract/prompt-optimizer@1',
      toolId: 'prompt-optimizer',
      version: 1,
      maxCostCents: 75,
      maxTotalTokens: 3500,
      costPerTokenCents: 0.02,
      replayWindowMinutes: 5,
    });

    vi.mocked(startWorkbenchRun).mockResolvedValue({
      status: 'replay',
      runId: 'existing-run',
      existing: {} as any,
    });

    (AIProviderFactory.hasProvider as any).mockReturnValue(true);

    const request = new NextRequest('http://localhost:3000/api/v2/ai/execute', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Replay prompt',
        provider: 'openai',
        toolId: 'prompt-optimizer',
        runId: 'existing-run',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Replay detected');
    expect(completeWorkbenchRun).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: 'existing-run',
        status: 'replay',
      })
    );
  });
});

describe('GET /api/v2/ai/execute', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin', role: 'super_admin' },
    } as any);
    const { getWorkbenchToolContract } = await import(
      '@/lib/workbench/contracts'
    );
    vi.mocked(getWorkbenchToolContract).mockReturnValue(null);
  });

  it('should return available providers', async () => {
    const response = await GET(
      new NextRequest('http://localhost:3000/api/v2/ai/execute')
    );
    const data = await response.json();

    expect(data.providers).toContain('openai');
    expect(data.providers).toContain('anthropic');
    expect(data.providers).toContain('google');
    expect(data.providers).toContain('groq');
  });

  it('should return providers by category', async () => {
    const response = await GET(
      new NextRequest('http://localhost:3000/api/v2/ai/execute')
    );
    const data = await response.json();

    expect(data.categories).toBeDefined();
    expect(data.categories['Text Generation']).toBeDefined();
  });
});

describe('RBAC /api/v2/ai/execute', () => {
  it('denies POST when role lacks workbench:ai_execution', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'user' } } as any);
    const { getWorkbenchToolContract } = await import(
      '@/lib/workbench/contracts'
    );
    vi.mocked(getWorkbenchToolContract).mockReturnValue(null);

    const request = new NextRequest('http://localhost:3000/api/v2/ai/execute', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test', provider: 'openai' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it('denies GET when role lacks workbench:ai_execution', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'user' } } as any);
    const { getWorkbenchToolContract } = await import(
      '@/lib/workbench/contracts'
    );
    vi.mocked(getWorkbenchToolContract).mockReturnValue(null);

    const request = new NextRequest('http://localhost:3000/api/v2/ai/execute');
    const response = await GET(request);
    expect(response.status).toBe(403);
  });
});
