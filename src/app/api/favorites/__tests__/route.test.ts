/**
 * Tests for Favorites API Routes
 * Critical: Required for Day 7 enterprise compliance
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '../route';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/logging/audit';
import { ObjectId } from 'mongodb';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/mongodb');
vi.mock('@/lib/rate-limit');
vi.mock('@/lib/logging/audit');

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockGetDb = getDb as ReturnType<typeof vi.fn>;
const mockCheckRateLimit = checkRateLimit as ReturnType<typeof vi.fn>;
const mockAuditLog = auditLog as ReturnType<typeof vi.fn>;

describe('GET /api/favorites', () => {
  const mockUserId = new ObjectId().toString();
  const mockFavorites = ['prompt-1', 'prompt-2', 'prompt-3'];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default rate limit: allowed
    (mockCheckRateLimit as any).mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetAt: new Date(Date.now() + 60000),
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/favorites');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(data.favorites).toEqual([]);
  });

  it('returns empty array when user has no favorites', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const mockCollection = {
      findOne: vi.fn().mockResolvedValue({ _id: new ObjectId(mockUserId) }),
    };
    mockGetDb.mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/favorites');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.favorites).toEqual([]);
    expect(data.count).toBe(0);
  });

  it('returns user favorites successfully', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const mockCollection = {
      findOne: vi.fn().mockResolvedValue({
        _id: new ObjectId(mockUserId),
        favoritePrompts: mockFavorites,
      }),
    };
    mockGetDb.mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/favorites');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.favorites).toEqual(mockFavorites);
    expect(data.count).toBe(3);
  });

  it('enforces rate limiting', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const resetDate = new Date(Date.now() + 60000);
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: resetDate,
      reason: 'Too many requests',
    });

    const request = new NextRequest('http://localhost:3000/api/favorites');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Too many requests');
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(response.headers.get('X-RateLimit-Reset')).toBe(
      resetDate.toISOString()
    );
  });

  it('handles database errors gracefully', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    mockGetDb.mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/favorites');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch favorites');
    expect(data.favorites).toEqual([]);
  });
});

describe('POST /api/favorites', () => {
  const mockUserId = new ObjectId().toString();
  const mockPromptId = 'debugging-nodejs-memory-leak';

  beforeEach(() => {
    vi.clearAllMocks();

    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetAt: new Date(Date.now() + 60000),
    });

    mockAuditLog.mockResolvedValue(undefined);
  });

  it('returns 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ promptId: mockPromptId }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 when promptId is missing', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('returns 404 when prompt does not exist', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const mockPromptsCollection = {
      findOne: vi.fn().mockResolvedValue(null),
    };
    mockGetDb.mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockPromptsCollection),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ promptId: 'non-existent-prompt' }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Prompt not found');
  });

  it('adds prompt to favorites successfully', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const mockPrompt = {
      id: mockPromptId,
      title: 'Debug Node.js Memory Leak',
      active: true,
    };

    let collectionCalls = 0;
    const mockPromptsCollection = {
      findOne: vi.fn().mockResolvedValue(mockPrompt),
    };
    const mockUsersCollection = {
      updateOne: vi
        .fn()
        .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    };

    mockGetDb.mockResolvedValue({
      collection: vi.fn().mockImplementation((_name) => {
        collectionCalls++;
        if (collectionCalls === 1) return mockPromptsCollection;
        if (collectionCalls === 2) return mockUsersCollection;
        return mockPromptsCollection;
      }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ promptId: mockPromptId }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Added to favorites');
    expect(data.promptId).toBe(mockPromptId);

    // Verify $addToSet used to prevent duplicates
    expect(mockUsersCollection.updateOne).toHaveBeenCalledWith(
      { _id: new ObjectId(mockUserId) },
      {
        $addToSet: { favoritePrompts: mockPromptId },
        $set: { updatedAt: expect.any(Date) },
      }
    );
  });

  it('logs audit event when favorite is added', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const mockPrompt = {
      id: mockPromptId,
      title: 'Debug Node.js Memory Leak',
      active: true,
    };

    let collectionCalls = 0;
    const mockPromptsCollection = {
      findOne: vi.fn().mockResolvedValue(mockPrompt),
    };
    const mockUsersCollection = {
      updateOne: vi
        .fn()
        .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    };

    mockGetDb.mockResolvedValue({
      collection: vi.fn().mockImplementation((_name) => {
        collectionCalls++;
        if (collectionCalls === 1) return mockPromptsCollection;
        if (collectionCalls === 2) return mockUsersCollection;
        return mockPromptsCollection;
      }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ promptId: mockPromptId }),
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0',
      },
    });
    await POST(request);

    expect(mockAuditLog).toHaveBeenCalledWith({
      userId: mockUserId,
      action: 'user.favorite.added',
      details: {
        promptId: mockPromptId,
        promptTitle: mockPrompt.title,
      },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    });
  });

  it('returns 404 when user does not exist', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const mockPrompt = {
      id: mockPromptId,
      title: 'Debug Node.js Memory Leak',
      active: true,
    };

    let collectionCalls = 0;
    const mockPromptsCollection = {
      findOne: vi.fn().mockResolvedValue(mockPrompt),
    };
    const mockUsersCollection = {
      updateOne: vi
        .fn()
        .mockResolvedValue({ matchedCount: 0, modifiedCount: 0 }),
    };

    mockGetDb.mockResolvedValue({
      collection: vi.fn().mockImplementation((_name) => {
        collectionCalls++;
        if (collectionCalls === 1) return mockPromptsCollection;
        if (collectionCalls === 2) return mockUsersCollection;
        return mockPromptsCollection;
      }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ promptId: mockPromptId }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('User not found');
  });

  it('enforces rate limiting', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const resetDate = new Date(Date.now() + 60000);
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: resetDate,
      reason: 'Too many requests',
    });

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ promptId: mockPromptId }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Too many requests');
  });
});

describe('DELETE /api/favorites', () => {
  const mockUserId = new ObjectId().toString();
  const mockPromptId = 'debugging-nodejs-memory-leak';

  beforeEach(() => {
    vi.clearAllMocks();

    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetAt: new Date(Date.now() + 60000),
    });

    mockAuditLog.mockResolvedValue(undefined);
  });

  it('returns 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'DELETE',
      body: JSON.stringify({ promptId: mockPromptId }),
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 when promptId is missing', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('removes prompt from favorites successfully', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const mockUsersCollection = {
      updateOne: vi
        .fn()
        .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    };

    mockGetDb.mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockUsersCollection),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'DELETE',
      body: JSON.stringify({ promptId: mockPromptId }),
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Removed from favorites');
    expect(data.promptId).toBe(mockPromptId);

    // Verify $pull used to remove item
    expect(mockUsersCollection.updateOne).toHaveBeenCalledWith(
      { _id: new ObjectId(mockUserId) },
      {
        $pull: { favoritePrompts: mockPromptId },
        $set: { updatedAt: expect.any(Date) },
      }
    );
  });

  it('logs audit event when favorite is removed', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const mockUsersCollection = {
      updateOne: vi
        .fn()
        .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    };

    mockGetDb.mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockUsersCollection),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'DELETE',
      body: JSON.stringify({ promptId: mockPromptId }),
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0',
      },
    });
    await DELETE(request);

    expect(mockAuditLog).toHaveBeenCalledWith({
      userId: mockUserId,
      action: 'user.favorite.removed',
      details: {
        promptId: mockPromptId,
      },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    });
  });

  it('returns 404 when user does not exist', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const mockUsersCollection = {
      updateOne: vi
        .fn()
        .mockResolvedValue({ matchedCount: 0, modifiedCount: 0 }),
    };

    mockGetDb.mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockUsersCollection),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'DELETE',
      body: JSON.stringify({ promptId: mockPromptId }),
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('User not found');
  });

  it('enforces rate limiting', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    const resetDate = new Date(Date.now() + 60000);
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: resetDate,
      reason: 'Too many requests',
    });

    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'DELETE',
      body: JSON.stringify({ promptId: mockPromptId }),
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Too many requests');
  });
});
