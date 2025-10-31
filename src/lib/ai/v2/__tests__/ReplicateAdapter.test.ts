/**
 * AI Summary: Validates ReplicateAdapter safety features (allowlist, retries, placeholders).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

const mockRun = vi.fn();

class MockReplicate {
  run = mockRun;
}

vi.doMock('replicate', () => ({
  default: MockReplicate,
}));

describe('ReplicateAdapter', () => {
  beforeEach(async () => {
    vi.resetModules();
    Object.assign(process.env, ORIGINAL_ENV);
    mockRun.mockReset();
  });

  it('returns placeholder when API token is missing', async () => {
    delete process.env.REPLICATE_API_TOKEN;
    process.env.REPLICATE_ALLOWED_MODELS = 'gemini-2.5-flash';

    const { ReplicateAdapter } = await import('../adapters/ReplicateAdapter');
    const adapter = new ReplicateAdapter('gemini-2.5-flash');
    const response = await adapter.execute({ prompt: 'hello world' });

    expect(response.content).toContain('placeholder');
    expect(response.provider).toBe('replicate');
    expect(response.model).toBe('gemini-2.5-flash');
    expect(mockRun).not.toHaveBeenCalled();
  });

  it('throws when requested model is not allowlisted', async () => {
    process.env.REPLICATE_ALLOWED_MODELS = 'allowed-model';
    const { ReplicateAdapter } = await import('../adapters/ReplicateAdapter');
    const adapter = new ReplicateAdapter('disallowed-model');

    await expect(() => adapter.execute({ prompt: 'test' })).rejects.toThrow(
      'not in allowlist'
    );
  });

  it('retries failed requests before succeeding', async () => {
    process.env.REPLICATE_API_TOKEN = 'token';
    process.env.REPLICATE_MODEL = 'gemini-2.5-flash';
    process.env.REPLICATE_MAX_RETRIES = '2';
    process.env.REPLICATE_ALLOWED_MODELS = 'gemini-2.5-flash';
    process.env.REPLICATE_TIMEOUT_MS = '0';

    const { ReplicateAdapter } = await import('../adapters/ReplicateAdapter');
    mockRun
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce('success output');

    const adapter = new ReplicateAdapter('gemini-2.5-flash');
    const response = await adapter.execute({ prompt: 'retry please' });

    expect(mockRun).toHaveBeenCalledTimes(2);
    expect(response.content).toBe('success output');
    expect(response.usage.totalTokens).toBeGreaterThan(0);
  });
});
