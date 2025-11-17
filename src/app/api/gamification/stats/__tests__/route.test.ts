/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Gamification Stats API Route Tests
 * Tests user gamification stats (XP, levels, achievements, streaks)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/middleware/rbac');
vi.mock('@/lib/rate-limit');
vi.mock('@/lib/logging/logger');
vi.mock('@/lib/services/GamificationService');
vi.mock('@/lib/gamification/levels');

const mockAuth = vi.mocked(await import('@/lib/auth')).auth;
const mockRBACPresets = vi.mocked(await import('@/lib/middleware/rbac'))
  .RBACPresets;
const mockCheckRateLimit = vi.mocked(await import('@/lib/rate-limit'))
  .checkRateLimit;
const mockGamificationService = vi.mocked(
  await import('@/lib/services/GamificationService')
).GamificationService;
const mockGetXPForNextLevel = vi.mocked(
  await import('@/lib/gamification/levels')
).getXPForNextLevel;

describe('GET /api/gamification/stats', () => {
  const mockUserId = new ObjectId().toString();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock RBAC to pass by default
    mockRBACPresets.requireUserRead.mockReturnValue(
      vi.fn().mockResolvedValue(null)
    );

    // Default: authenticated user
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    // Default: rate limit allowed
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 99,
      resetAt: new Date(Date.now() + 3600000),
    });

    // Default: XP calculation
    mockGetXPForNextLevel.mockReturnValue(500);
  });

  it('should return 403 when RBAC check fails', async () => {
    mockRBACPresets.requireUserRead.mockReturnValue(
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
      )
    );

    const request = new NextRequest(
      'http://localhost:3000/api/gamification/stats'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should return 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/gamification/stats'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should enforce rate limiting', async () => {
    const resetDate = new Date(Date.now() + 3600000);
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: resetDate,
      reason: 'Too many requests',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/gamification/stats'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded');
    expect(data.resetAt).toBe(resetDate.toISOString());
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response.headers.get('X-RateLimit-Reset')).toBe(
      resetDate.toISOString()
    );
  });

  it('should return user gamification stats successfully', async () => {
    const mockGamificationData = {
      xp: 1250,
      level: 5,
      dailyStreak: 7,
      achievements: [
        { id: 'first-prompt', name: 'First Prompt', unlockedAt: new Date() },
        { id: 'week-streak', name: 'Week Streak', unlockedAt: new Date() },
      ],
      stats: {
        promptsCreated: 42,
        promptsViewed: 156,
        favoriteCount: 8,
      },
    };

    const mockInstance = {
      getUserGamification: vi.fn().mockResolvedValue(mockGamificationData),
    };
    mockGamificationService.mockImplementation(() => mockInstance as any);

    const request = new NextRequest(
      'http://localhost:3000/api/gamification/stats'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.xp).toBe(1250);
    expect(data.data.level).toBe(5);
    expect(data.data.xpForNextLevel).toBe(500);
    expect(data.data.dailyStreak).toBe(7);
    expect(data.data.achievements).toHaveLength(2);
    expect(data.data.stats.promptsCreated).toBe(42);
  });

  it('should handle user with no gamification data', async () => {
    const mockGamificationData = {
      xp: 0,
      level: 1,
      dailyStreak: 0,
      achievements: [],
      stats: {
        promptsCreated: 0,
        promptsViewed: 0,
        favoriteCount: 0,
      },
    };

    const mockInstance = {
      getUserGamification: vi.fn().mockResolvedValue(mockGamificationData),
    };
    mockGamificationService.mockImplementation(() => mockInstance as any);

    const request = new NextRequest(
      'http://localhost:3000/api/gamification/stats'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.xp).toBe(0);
    expect(data.data.level).toBe(1);
    expect(data.data.achievements).toEqual([]);
  });

  it('should calculate XP for next level correctly', async () => {
    const mockGamificationData = {
      xp: 2500,
      level: 10,
      dailyStreak: 15,
      achievements: [],
      stats: {},
    };

    const mockInstance = {
      getUserGamification: vi.fn().mockResolvedValue(mockGamificationData),
    };
    mockGamificationService.mockImplementation(() => mockInstance as any);

    mockGetXPForNextLevel.mockReturnValue(3000);

    const request = new NextRequest(
      'http://localhost:3000/api/gamification/stats'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(mockGetXPForNextLevel).toHaveBeenCalledWith(2500);
    expect(data.data.xpForNextLevel).toBe(3000);
  });

  it('should handle service errors gracefully', async () => {
    const mockInstance = {
      getUserGamification: vi
        .fn()
        .mockRejectedValue(new Error('Database error')),
    };
    mockGamificationService.mockImplementation(() => mockInstance as any);

    const request = new NextRequest(
      'http://localhost:3000/api/gamification/stats'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch stats');
  });

  it('should handle rate limit check errors', async () => {
    mockCheckRateLimit.mockRejectedValue(new Error('Redis error'));

    const request = new NextRequest(
      'http://localhost:3000/api/gamification/stats'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch stats');
  });

  it('should call GamificationService with correct user ID', async () => {
    const mockInstance = {
      getUserGamification: vi.fn().mockResolvedValue({
        xp: 100,
        level: 2,
        dailyStreak: 1,
        achievements: [],
        stats: {},
      }),
    };
    mockGamificationService.mockImplementation(() => mockInstance as any);

    const request = new NextRequest(
      'http://localhost:3000/api/gamification/stats'
    );
    await GET(request);

    expect(mockInstance.getUserGamification).toHaveBeenCalledWith(mockUserId);
  });

  it('should include all required fields in response', async () => {
    const mockGamificationData = {
      xp: 750,
      level: 4,
      dailyStreak: 3,
      achievements: [{ id: 'test', name: 'Test' }],
      stats: { promptsCreated: 10 },
    };

    const mockInstance = {
      getUserGamification: vi.fn().mockResolvedValue(mockGamificationData),
    };
    mockGamificationService.mockImplementation(() => mockInstance as any);

    const request = new NextRequest(
      'http://localhost:3000/api/gamification/stats'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('xp');
    expect(data.data).toHaveProperty('level');
    expect(data.data).toHaveProperty('xpForNextLevel');
    expect(data.data).toHaveProperty('dailyStreak');
    expect(data.data).toHaveProperty('achievements');
    expect(data.data).toHaveProperty('stats');
  });

  it('should handle high level users', async () => {
    const mockGamificationData = {
      xp: 50000,
      level: 50,
      dailyStreak: 100,
      achievements: Array.from({ length: 30 }, (_, i) => ({
        id: `achievement-${i}`,
        name: `Achievement ${i}`,
      })),
      stats: {
        promptsCreated: 500,
        promptsViewed: 2000,
        favoriteCount: 150,
      },
    };

    const mockInstance = {
      getUserGamification: vi.fn().mockResolvedValue(mockGamificationData),
    };
    mockGamificationService.mockImplementation(() => mockInstance as any);

    mockGetXPForNextLevel.mockReturnValue(55000);

    const request = new NextRequest(
      'http://localhost:3000/api/gamification/stats'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.level).toBe(50);
    expect(data.data.achievements).toHaveLength(30);
    expect(data.data.xpForNextLevel).toBe(55000);
  });
});
