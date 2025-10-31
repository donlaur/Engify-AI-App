import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

process.env.OPENAI_API_KEY = 'test-key';
delete process.env.GROQ_API_KEY;

const createMock = vi.fn();

class OpenAIMock {
  chat = {
    completions: {
      create: createMock,
    },
  };

  constructor() {
    // no-op
  }
}

vi.mock('openai', () => ({
  default: OpenAIMock,
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/workbench/contracts', () => ({
  getWorkbenchToolContract: vi.fn(),
}));

vi.mock('@/lib/services/workbenchRuns', () => ({
  startWorkbenchRun: vi.fn(),
  completeWorkbenchRun: vi.fn(),
}));

describe('POST /api/multi-agent', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } });

    const { getWorkbenchToolContract } = await import(
      '@/lib/workbench/contracts'
    );
    vi.mocked(getWorkbenchToolContract).mockReturnValue({
      contractId: 'contract/multi-agent@1',
      toolId: 'multi-agent',
      version: 1,
      maxCostCents: 400,
      maxTotalTokens: 4000,
      costPerTokenCents: 0.03,
      replayWindowMinutes: 15,
    });

    const { startWorkbenchRun, completeWorkbenchRun } = await import(
      '@/lib/services/workbenchRuns'
    );
    vi.mocked(startWorkbenchRun).mockResolvedValue({
      status: 'started',
      runId: 'run-abc',
    });
    vi.mocked(completeWorkbenchRun).mockResolvedValue();

    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Simulated collaborative output',
          },
        },
      ],
      usage: {
        prompt_tokens: 600,
        completion_tokens: 800,
        total_tokens: 1400,
      },
      created: Math.floor(Date.now() / 1000),
    });
  });

  it('returns simulation when within contract limits', async () => {
    const { POST } = await import('../route');

    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Ship a new AI feature',
        roles: ['engineer', 'architect'],
        mode: 'sequential',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(createMock).toHaveBeenCalled();
    expect(data.metadata.runId).toBe('run-abc');
  });

  it('rejects simulations that exceed token budget', async () => {
    const { getWorkbenchToolContract } = await import(
      '@/lib/workbench/contracts'
    );
    vi.mocked(getWorkbenchToolContract).mockReturnValue({
      contractId: 'contract/multi-agent@1',
      toolId: 'multi-agent',
      version: 1,
      maxCostCents: 400,
      maxTotalTokens: 500,
      costPerTokenCents: 0.03,
      replayWindowMinutes: 15,
    });

    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Very long output',
          },
        },
      ],
      usage: {
        prompt_tokens: 600,
        completion_tokens: 800,
        total_tokens: 1400,
      },
      created: Math.floor(Date.now() / 1000),
    });

    const { POST } = await import('../route');
    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Ship a new AI feature',
        roles: ['engineer', 'architect'],
        mode: 'sequential',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('token budget');
    const { completeWorkbenchRun } = await import(
      '@/lib/services/workbenchRuns'
    );
    expect(completeWorkbenchRun).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'budget_exceeded',
      })
    );
  });
});
