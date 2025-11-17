/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Multi-Agent API Route Tests
 * Tests multi-agent AI execution with OpenAI/Groq
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock OpenAI
vi.mock('openai', () => {
  const mockCreateFn = vi.fn();
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreateFn,
        },
      };
      constructor() {
        // Store reference globally for test access
        (global as any).__mockOpenAICreate = mockCreateFn;
      }
    },
  };
});

// Mock logger
vi.mock('@/lib/logging/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    apiError: vi.fn(),
  },
}));

describe('POST /api/multi-agent', () => {
  let mockCreate: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default environment
    process.env.OPENAI_API_KEY = 'test-key';
    // Get reference to mock function
    mockCreate = (global as any).__mockOpenAICreate;
  });

  it('should reject request without API key', async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.GROQ_API_KEY;

    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Build a new feature',
        roles: ['engineer', 'architect'],
        mode: 'sequential',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('No AI API key configured');
  });

  it('should reject request with empty idea', async () => {
    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: '',
        roles: ['engineer'],
        mode: 'sequential',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Idea is required');
  });

  it('should reject request with no roles', async () => {
    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Build a new feature',
        roles: [],
        mode: 'sequential',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('At least one role is required');
  });

  it('should reject request with too many roles (>7)', async () => {
    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Build a new feature',
        roles: [
          'engineer',
          'architect',
          'director',
          'pm',
          'tech_lead',
          'designer',
          'qa',
          'security',
        ],
        mode: 'sequential',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Maximum 7 roles allowed');
  });

  it('should successfully generate sequential simulation', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: '🔄 ENGINEER is reviewing...\n✅ ENGINEER approved: Looks good!',
          },
        },
      ],
    });

    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Add a caching layer to improve performance',
        roles: ['engineer', 'architect'],
        mode: 'sequential',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.simulation).toContain('ENGINEER');
    expect(data.metadata.idea).toBe('Add a caching layer to improve performance');
    expect(data.metadata.roles).toEqual(['engineer', 'architect']);
    expect(data.metadata.mode).toBe('sequential');
    expect(data.metadata.model).toBeDefined();
    expect(data.metadata.timestamp).toBeDefined();

    // Verify OpenAI was called with correct parameters
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String),
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
          }),
          expect.objectContaining({
            role: 'user',
          }),
        ]),
        temperature: 0.8,
        max_tokens: 2000,
      })
    );
  });

  it('should successfully generate debate simulation', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content:
              '[ENGINEER]: "We should use Redis for caching."\n[ARCHITECT]: "I think we should consider distributed caching."',
          },
        },
      ],
    });

    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Migrate to microservices',
        roles: ['engineer', 'architect', 'director'],
        mode: 'debate',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.simulation).toBeDefined();
    expect(data.metadata.mode).toBe('debate');
  });

  it('should use Groq when GROQ_API_KEY is set and OPENAI_API_KEY is not', async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.GROQ_API_KEY = 'test-groq-key';

    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Groq simulation result',
          },
        },
      ],
    });

    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Build a new feature',
        roles: ['engineer'],
        mode: 'sequential',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.metadata.model).toBe('llama-3.1-70b-versatile');
  });

  it('should handle OpenAI API errors gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('API key invalid'));

    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Build a new feature',
        roles: ['engineer'],
        mode: 'sequential',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('OpenAI API key not configured');
  });

  it('should handle generic errors gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('Network error'));

    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Build a new feature',
        roles: ['engineer'],
        mode: 'sequential',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to generate multi-agent simulation');
  });

  it('should default to sequential mode when mode is not specified', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Sequential simulation',
          },
        },
      ],
    });

    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Build a new feature',
        roles: ['engineer'],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.metadata.mode).toBe('sequential');
  });

  it('should handle all available roles', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'All roles simulation',
          },
        },
      ],
    });

    const allRoles = [
      'engineer',
      'architect',
      'director',
      'pm',
      'tech_lead',
      'designer',
      'qa',
    ];

    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Build comprehensive system',
        roles: allRoles,
        mode: 'debate',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.metadata.roles).toEqual(allRoles);
  });

  it('should handle empty OpenAI response', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: null,
          },
        },
      ],
    });

    const request = new NextRequest('http://localhost:3000/api/multi-agent', {
      method: 'POST',
      body: JSON.stringify({
        idea: 'Build a new feature',
        roles: ['engineer'],
        mode: 'sequential',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.simulation).toBe('Unable to generate simulation.');
  });
});
