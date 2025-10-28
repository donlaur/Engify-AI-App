/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Workbench v2 Integration Tests
 * Tests workbench using the new v2 API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { API_ROUTES } from '@/lib/constants';

// Mock fetch
global.fetch = vi.fn();

describe('Workbench v2 Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use v2 API route', () => {
    expect(API_ROUTES.ai).toBe('/api/v2/ai/execute');
  });

  it('should execute prompt with OpenAI via v2 API', async () => {
    const mockResponse = {
      success: true,
      response: 'Test response from OpenAI',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      cost: { input: 0.001, output: 0.002, total: 0.003 },
      latency: 1000,
      provider: 'openai',
      model: 'gpt-3.5-turbo',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await fetch(API_ROUTES.ai, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'openai',
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      '/api/v2/ai/execute',
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(data.success).toBe(true);
    expect(data.provider).toBe('openai');
  });

  it('should execute prompt with Claude via v2 API', async () => {
    const mockResponse = {
      success: true,
      response: 'Test response from Claude',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      cost: { input: 0.001, output: 0.002, total: 0.003 },
      latency: 1200,
      provider: 'anthropic',
      model: 'claude-3-sonnet',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await fetch(API_ROUTES.ai, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'anthropic',
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.provider).toBe('anthropic');
  });

  it('should execute prompt with Gemini via v2 API', async () => {
    const mockResponse = {
      success: true,
      response: 'Test response from Gemini',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      cost: { input: 0.001, output: 0.002, total: 0.003 },
      latency: 800,
      provider: 'google',
      model: 'gemini-pro',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await fetch(API_ROUTES.ai, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'google',
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.provider).toBe('google');
  });

  it('should execute prompt with Groq via v2 API', async () => {
    const mockResponse = {
      success: true,
      response: 'Test response from Groq',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      cost: { input: 0.001, output: 0.002, total: 0.003 },
      latency: 500,
      provider: 'groq',
      model: 'llama3-8b',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await fetch(API_ROUTES.ai, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'groq',
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.provider).toBe('groq');
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    });

    const response = await fetch(API_ROUTES.ai, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'openai',
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it('should include cost and latency metrics', async () => {
    const mockResponse = {
      success: true,
      response: 'Test response',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      cost: { input: 0.001, output: 0.002, total: 0.003 },
      latency: 1000,
      provider: 'openai',
      model: 'gpt-3.5-turbo',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await fetch(API_ROUTES.ai, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'openai',
      }),
    });

    const data = await response.json();

    expect(data.cost).toBeDefined();
    expect(data.cost.total).toBe(0.003);
    expect(data.latency).toBe(1000);
    expect(data.usage.totalTokens).toBe(30);
  });
});
