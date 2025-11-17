/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GitHub Repos API Route Tests
 * Tests listing user's GitHub repositories
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/services/GitHubConnectionService');
vi.mock('@/lib/integrations/github');
vi.mock('@/lib/middleware/rbac');

const mockAuth = vi.mocked(await import('@/lib/auth')).auth;
const mockGitHubConnectionService = vi.mocked(
  await import('@/lib/services/GitHubConnectionService')
).githubConnectionService;
const mockGitHubClient = vi.mocked(await import('@/lib/integrations/github'))
  .GitHubClient;
const mockRBACPresets = vi.mocked(await import('@/lib/middleware/rbac'))
  .RBACPresets;

describe('GET /api/github/repos', () => {
  const mockUserId = new ObjectId().toString();
  const mockAccessToken = 'gho_test_access_token_123';

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

    // Default: user has GitHub connected
    mockGitHubConnectionService.getAccessToken.mockResolvedValue(
      mockAccessToken
    );
  });

  it('should return 403 when RBAC check fails', async () => {
    mockRBACPresets.requireUserRead.mockReturnValue(
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
      )
    );

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should return 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 when GitHub is not connected', async () => {
    mockGitHubConnectionService.getAccessToken.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('GitHub not connected');
  });

  it('should list repositories successfully', async () => {
    const mockRepos = [
      {
        id: 1,
        name: 'repo1',
        full_name: 'user/repo1',
        private: false,
        description: 'Test repo 1',
        html_url: 'https://github.com/user/repo1',
        language: 'TypeScript',
        stargazers_count: 10,
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'repo2',
        full_name: 'user/repo2',
        private: true,
        description: 'Test repo 2',
        html_url: 'https://github.com/user/repo2',
        language: 'JavaScript',
        stargazers_count: 5,
        updated_at: '2024-01-02T00:00:00Z',
      },
    ];

    const mockListRepos = vi.fn().mockResolvedValue(mockRepos);
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.repos).toEqual(mockRepos);
    expect(mockGitHubClient).toHaveBeenCalledWith(mockAccessToken);
    expect(mockListRepos).toHaveBeenCalledWith({
      type: 'all',
      sort: 'updated',
      per_page: 100,
    });
  });

  it('should support type query parameter', async () => {
    const mockListRepos = vi.fn().mockResolvedValue([]);
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/github/repos?type=owner'
    );
    await GET(request);

    expect(mockListRepos).toHaveBeenCalledWith({
      type: 'owner',
      sort: 'updated',
      per_page: 100,
    });
  });

  it('should support sort query parameter', async () => {
    const mockListRepos = vi.fn().mockResolvedValue([]);
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/github/repos?sort=created'
    );
    await GET(request);

    expect(mockListRepos).toHaveBeenCalledWith({
      type: 'all',
      sort: 'created',
      per_page: 100,
    });
  });

  it('should support both type and sort query parameters', async () => {
    const mockListRepos = vi.fn().mockResolvedValue([]);
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/github/repos?type=private&sort=pushed'
    );
    await GET(request);

    expect(mockListRepos).toHaveBeenCalledWith({
      type: 'private',
      sort: 'pushed',
      per_page: 100,
    });
  });

  it('should handle all type options', async () => {
    const mockListRepos = vi.fn().mockResolvedValue([]);
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const types = ['all', 'owner', 'public', 'private'] as const;

    for (const type of types) {
      const request = new NextRequest(
        `http://localhost:3000/api/github/repos?type=${type}`
      );
      await GET(request);

      expect(mockListRepos).toHaveBeenCalledWith(
        expect.objectContaining({ type })
      );
    }
  });

  it('should handle all sort options', async () => {
    const mockListRepos = vi.fn().mockResolvedValue([]);
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const sorts = ['created', 'updated', 'pushed', 'full_name'] as const;

    for (const sort of sorts) {
      const request = new NextRequest(
        `http://localhost:3000/api/github/repos?sort=${sort}`
      );
      await GET(request);

      expect(mockListRepos).toHaveBeenCalledWith(
        expect.objectContaining({ sort })
      );
    }
  });

  it('should handle empty repository list', async () => {
    const mockListRepos = vi.fn().mockResolvedValue([]);
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.repos).toEqual([]);
  });

  it('should handle GitHub API errors', async () => {
    const mockListRepos = vi.fn().mockRejectedValue(new Error('API rate limit exceeded'));
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch repositories');
    expect(data.message).toBe('API rate limit exceeded');
  });

  it('should handle access token retrieval errors', async () => {
    mockGitHubConnectionService.getAccessToken.mockRejectedValue(
      new Error('Database error')
    );

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch repositories');
  });

  it('should handle invalid access token', async () => {
    const mockListRepos = vi
      .fn()
      .mockRejectedValue(new Error('Bad credentials'));
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch repositories');
    expect(data.message).toBe('Bad credentials');
  });

  it('should call getAccessToken with correct user ID', async () => {
    const mockListRepos = vi.fn().mockResolvedValue([]);
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    await GET(request);

    expect(mockGitHubConnectionService.getAccessToken).toHaveBeenCalledWith(
      mockUserId
    );
  });

  it('should handle network errors gracefully', async () => {
    const mockListRepos = vi
      .fn()
      .mockRejectedValue(new Error('Network timeout'));
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch repositories');
  });

  it('should handle large repository lists', async () => {
    const mockRepos = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `repo${i}`,
      full_name: `user/repo${i}`,
      private: i % 2 === 0,
    }));

    const mockListRepos = vi.fn().mockResolvedValue(mockRepos);
    mockGitHubClient.mockImplementation(
      () =>
        ({
          listRepos: mockListRepos,
        }) as any
    );

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.repos).toHaveLength(100);
  });
});
