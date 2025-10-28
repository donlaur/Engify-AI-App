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
    getAvailableProviders: vi.fn(() => ['openai', 'anthropic', 'google', 'groq']),
    getProvidersByCategory: vi.fn(() => ({
      'Text Generation': ['openai', 'anthropic'],
      'Fast Inference': ['groq'],
      'Multimodal': ['google'],
    })),
  },
}));

describe('POST /api/v2/ai/execute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute request with OpenAI provider', async () => {
    const { AIProviderFactory } = await import('@/lib/ai/v2/factory/AIProviderFactory');
    
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
  });

  it('should execute request with Claude provider', async () => {
    const { AIProviderFactory } = await import('@/lib/ai/v2/factory/AIProviderFactory');
    
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
  });

  it('should execute request with Gemini provider', async () => {
    const { AIProviderFactory } = await import('@/lib/ai/v2/factory/AIProviderFactory');
    
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
  });

  it('should execute request with Groq provider', async () => {
    const { AIProviderFactory } = await import('@/lib/ai/v2/factory/AIProviderFactory');
    
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
  });

  it('should return error for invalid provider', async () => {
    const { AIProviderFactory } = await import('@/lib/ai/v2/factory/AIProviderFactory');
    
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
    const { AIProviderFactory } = await import('@/lib/ai/v2/factory/AIProviderFactory');
    
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
});

describe('GET /api/v2/ai/execute', () => {
  it('should return available providers', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.providers).toContain('openai');
    expect(data.providers).toContain('anthropic');
    expect(data.providers).toContain('google');
    expect(data.providers).toContain('groq');
  });

  it('should return providers by category', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.categories).toBeDefined();
    expect(data.categories['Text Generation']).toBeDefined();
  });
});
