/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GitHub Code Context API Route Tests
 * Tests extracting code context from GitHub repositories
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
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
const mockGitHub = vi.mocked(await import('@/lib/integrations/github'));
const mockRBACPresets = vi.mocked(await import('@/lib/middleware/rbac'))
  .RBACPresets;

describe('POST /api/github/code-context', () => {
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

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'test-repo' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should return 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'test-repo' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 when GitHub is not connected', async () => {
    mockGitHubConnectionService.getAccessToken.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'test-repo' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('GitHub not connected');
  });

  it('should return 400 when owner is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ repo: 'test-repo' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Owner and repo are required');
  });

  it('should return 400 when repo is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Owner and repo are required');
  });

  it('should extract code context successfully', async () => {
    const mockContext = {
      files: [
        { path: 'src/index.ts', content: 'console.log("hello");', size: 23 },
        { path: 'README.md', content: '# Test Repo', size: 11 },
      ],
      structure: {
        name: 'root',
        type: 'directory',
        children: [],
      },
    };

    mockGitHub.extractCodeContext.mockResolvedValue(mockContext);
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'test-repo' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.context).toEqual(mockContext);
    expect(data.filesAnalyzed).toBe(2);
    expect(data.totalSize).toBe(34); // 23 + 11
  });

  it('should use default maxFiles of 50', async () => {
    const mockContext = { files: [], structure: {} };
    mockGitHub.extractCodeContext.mockResolvedValue(mockContext as any);
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'test-repo' }),
      }
    );
    await POST(request);

    expect(mockGitHub.extractCodeContext).toHaveBeenCalledWith(
      expect.anything(),
      'user',
      'test-repo',
      expect.objectContaining({
        maxFiles: 50,
      })
    );
  });

  it('should respect custom maxFiles parameter', async () => {
    const mockContext = { files: [], structure: {} };
    mockGitHub.extractCodeContext.mockResolvedValue(mockContext as any);
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({
          owner: 'user',
          repo: 'test-repo',
          maxFiles: 100,
        }),
      }
    );
    await POST(request);

    expect(mockGitHub.extractCodeContext).toHaveBeenCalledWith(
      expect.anything(),
      'user',
      'test-repo',
      expect.objectContaining({
        maxFiles: 100,
      })
    );
  });

  it('should pass includePatterns to extractCodeContext', async () => {
    const mockContext = { files: [], structure: {} };
    mockGitHub.extractCodeContext.mockResolvedValue(mockContext as any);
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const includePatterns = ['*.ts', '*.tsx', '*.js'];

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({
          owner: 'user',
          repo: 'test-repo',
          includePatterns,
        }),
      }
    );
    await POST(request);

    expect(mockGitHub.extractCodeContext).toHaveBeenCalledWith(
      expect.anything(),
      'user',
      'test-repo',
      expect.objectContaining({
        includePatterns,
      })
    );
  });

  it('should pass excludePatterns to extractCodeContext', async () => {
    const mockContext = { files: [], structure: {} };
    mockGitHub.extractCodeContext.mockResolvedValue(mockContext as any);
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const excludePatterns = ['node_modules/**', 'dist/**', '*.test.ts'];

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({
          owner: 'user',
          repo: 'test-repo',
          excludePatterns,
        }),
      }
    );
    await POST(request);

    expect(mockGitHub.extractCodeContext).toHaveBeenCalledWith(
      expect.anything(),
      'user',
      'test-repo',
      expect.objectContaining({
        excludePatterns,
      })
    );
  });

  it('should handle empty repository', async () => {
    const mockContext = { files: [], structure: {} };
    mockGitHub.extractCodeContext.mockResolvedValue(mockContext as any);
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'empty-repo' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.filesAnalyzed).toBe(0);
    expect(data.totalSize).toBe(0);
  });

  it('should handle GitHub API errors', async () => {
    mockGitHub.extractCodeContext.mockRejectedValue(
      new Error('Repository not found')
    );
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'nonexistent' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to extract code context');
    expect(data.message).toBe('Repository not found');
  });

  it('should handle access token retrieval errors', async () => {
    mockGitHubConnectionService.getAccessToken.mockRejectedValue(
      new Error('Database error')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'test-repo' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to extract code context');
  });

  it('should create GitHubClient with correct access token', async () => {
    const mockContext = { files: [], structure: {} };
    mockGitHub.extractCodeContext.mockResolvedValue(mockContext as any);
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'test-repo' }),
      }
    );
    await POST(request);

    expect(mockGitHub.GitHubClient).toHaveBeenCalledWith(mockAccessToken);
  });

  it('should calculate total size correctly', async () => {
    const mockContext = {
      files: [
        { path: 'file1.ts', content: 'a'.repeat(100), size: 100 },
        { path: 'file2.ts', content: 'b'.repeat(200), size: 200 },
        { path: 'file3.ts', content: 'c'.repeat(300), size: 300 },
      ],
      structure: {},
    };

    mockGitHub.extractCodeContext.mockResolvedValue(mockContext as any);
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'test-repo' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(data.totalSize).toBe(600); // 100 + 200 + 300
  });

  it('should handle large repositories', async () => {
    const mockFiles = Array.from({ length: 100 }, (_, i) => ({
      path: `file${i}.ts`,
      content: `content ${i}`,
      size: 10,
    }));

    const mockContext = {
      files: mockFiles,
      structure: {},
    };

    mockGitHub.extractCodeContext.mockResolvedValue(mockContext as any);
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({
          owner: 'user',
          repo: 'large-repo',
          maxFiles: 100,
        }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.filesAnalyzed).toBe(100);
  });

  it('should handle invalid JSON in request body', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: 'invalid json',
      }
    );

    await expect(POST(request)).rejects.toThrow();
  });

  it('should handle private repositories', async () => {
    const mockContext = {
      files: [{ path: 'private.ts', content: 'private code', size: 12 }],
      structure: {},
    };

    mockGitHub.extractCodeContext.mockResolvedValue(mockContext as any);
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'private-repo' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should handle rate limit errors', async () => {
    mockGitHub.extractCodeContext.mockRejectedValue(
      new Error('API rate limit exceeded')
    );
    mockGitHub.GitHubClient.mockImplementation(() => ({}) as any);

    const request = new NextRequest(
      'http://localhost:3000/api/github/code-context',
      {
        method: 'POST',
        body: JSON.stringify({ owner: 'user', repo: 'test-repo' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('API rate limit exceeded');
  });
});
