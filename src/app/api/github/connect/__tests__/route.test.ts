/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GitHub Connect API Route Tests
 * Tests GitHub OAuth initiation flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/integrations/github');

const mockAuth = vi.mocked(await import('@/lib/auth')).auth;
const mockGetGitHubAuthUrl = vi.mocked(
  await import('@/lib/integrations/github')
).getGitHubAuthUrl;

describe('GET /api/github/connect', () => {
  const mockUserId = new ObjectId().toString();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated user
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    // Default: mock GitHub OAuth URL
    mockGetGitHubAuthUrl.mockReturnValue(
      'https://github.com/login/oauth/authorize?client_id=test&state=xyz'
    );
  });

  it('should return 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/github/connect');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 401 when session has no user', async () => {
    mockAuth.mockResolvedValue({} as any);

    const request = new NextRequest('http://localhost:3000/api/github/connect');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should redirect to GitHub OAuth URL', async () => {
    const mockAuthUrl =
      'https://github.com/login/oauth/authorize?client_id=test123&state=abc123';
    mockGetGitHubAuthUrl.mockReturnValue(mockAuthUrl);

    const request = new NextRequest('http://localhost:3000/api/github/connect');
    const response = await GET(request);

    expect(response.status).toBe(307); // Redirect status
    expect(response.headers.get('location')).toBe(mockAuthUrl);
  });

  it('should generate state with user ID and timestamp', async () => {
    const request = new NextRequest('http://localhost:3000/api/github/connect');
    await GET(request);

    expect(mockGetGitHubAuthUrl).toHaveBeenCalledWith(
      expect.stringMatching(/^[A-Za-z0-9+/=]+$/) // Base64 pattern
    );

    // Decode the state to verify it contains userId and timestamp
    const callArg = mockGetGitHubAuthUrl.mock.calls[0][0];
    const decodedState = JSON.parse(Buffer.from(callArg, 'base64').toString());

    expect(decodedState).toHaveProperty('userId', mockUserId);
    expect(decodedState).toHaveProperty('timestamp');
    expect(typeof decodedState.timestamp).toBe('number');
  });

  it('should handle getGitHubAuthUrl errors', async () => {
    mockGetGitHubAuthUrl.mockImplementation(() => {
      throw new Error('GitHub client ID not configured');
    });

    const request = new NextRequest('http://localhost:3000/api/github/connect');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to initiate GitHub connection');
  });

  it('should handle auth errors', async () => {
    mockAuth.mockRejectedValue(new Error('Session expired'));

    const request = new NextRequest('http://localhost:3000/api/github/connect');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to initiate GitHub connection');
  });

  it('should create unique state for each request', async () => {
    const request1 = new NextRequest(
      'http://localhost:3000/api/github/connect'
    );
    await GET(request1);
    const state1 = mockGetGitHubAuthUrl.mock.calls[0][0];

    // Wait a bit to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 10));

    const request2 = new NextRequest(
      'http://localhost:3000/api/github/connect'
    );
    await GET(request2);
    const state2 = mockGetGitHubAuthUrl.mock.calls[1][0];

    expect(state1).not.toBe(state2);
  });

  it('should preserve user ID in state for CSRF protection', async () => {
    const differentUserId = new ObjectId().toString();
    mockAuth.mockResolvedValue({
      user: {
        id: differentUserId,
        email: 'other@example.com',
        name: 'Other User',
      },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/github/connect');
    await GET(request);

    const callArg = mockGetGitHubAuthUrl.mock.calls[0][0];
    const decodedState = JSON.parse(Buffer.from(callArg, 'base64').toString());

    expect(decodedState.userId).toBe(differentUserId);
  });

  it('should handle missing user email gracefully', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, name: 'Test User' },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/github/connect');
    const response = await GET(request);

    // Should still succeed
    expect(response.status).toBe(307);
  });

  it('should handle missing user name gracefully', async () => {
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com' },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/github/connect');
    const response = await GET(request);

    // Should still succeed
    expect(response.status).toBe(307);
  });

  it('should handle very long user IDs', async () => {
    const longUserId = new ObjectId().toString() + new ObjectId().toString();
    mockAuth.mockResolvedValue({
      user: { id: longUserId, email: 'test@example.com', name: 'Test' },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/github/connect');
    const response = await GET(request);

    expect(response.status).toBe(307);

    const callArg = mockGetGitHubAuthUrl.mock.calls[0][0];
    const decodedState = JSON.parse(Buffer.from(callArg, 'base64').toString());
    expect(decodedState.userId).toBe(longUserId);
  });

  it('should encode state as valid base64', async () => {
    const request = new NextRequest('http://localhost:3000/api/github/connect');
    await GET(request);

    const state = mockGetGitHubAuthUrl.mock.calls[0][0];

    // Should be valid base64
    expect(() => Buffer.from(state, 'base64')).not.toThrow();

    // Should decode to valid JSON
    const decoded = Buffer.from(state, 'base64').toString();
    expect(() => JSON.parse(decoded)).not.toThrow();
  });
});
