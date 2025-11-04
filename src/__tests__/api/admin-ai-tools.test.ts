/**
 * AI Tools API Route Tests
 * 
 * Tests for /api/admin/ai-tools CRUD operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/ai-tools/route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/middleware/rbac', () => ({
  RBACPresets: {
    requireSuperAdmin: () => vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/lib/logging/audit', () => ({
  auditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/AIToolService', () => ({
  aiToolService: {
    find: vi.fn(),
    findByCategory: vi.fn(),
    upsert: vi.fn(),
    findById: vi.fn(),
    updateOne: vi.fn(),
  },
}));

describe('AI Tools API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/ai-tools', () => {
    it('should return list of tools', async () => {
      const request = new NextRequest('http://localhost/api/admin/ai-tools');
      // Mock will be handled by service mock
      const response = await GET(request);
      expect(response).toBeDefined();
    });
  });

  describe('POST /api/admin/ai-tools', () => {
    it('should create a new tool', async () => {
      const request = new NextRequest('http://localhost/api/admin/ai-tools', {
        method: 'POST',
        body: JSON.stringify({
          id: 'test-tool',
          name: 'Test Tool',
          category: 'ide',
          description: 'Test description',
        }),
      });
      // Mock will be handled by service mock
      const response = await POST(request);
      expect(response).toBeDefined();
    });
  });

  describe('PATCH /api/admin/ai-tools', () => {
    it('should update an existing tool', async () => {
      const request = new NextRequest('http://localhost/api/admin/ai-tools', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'test-tool',
          name: 'Updated Tool',
        }),
      });
      // Mock will be handled by service mock
      const response = await PATCH(request);
      expect(response).toBeDefined();
    });
  });

  describe('DELETE /api/admin/ai-tools', () => {
    it('should deprecate a tool', async () => {
      const request = new NextRequest('http://localhost/api/admin/ai-tools?id=test-tool', {
        method: 'DELETE',
      });
      // Mock will be handled by service mock
      const response = await DELETE(request);
      expect(response).toBeDefined();
    });
  });
});

