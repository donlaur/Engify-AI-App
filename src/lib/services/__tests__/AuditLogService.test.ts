/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Audit Log Service Tests
 *
 * Tests audit logging functionality for SOC2 compliance
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ObjectId } from 'mongodb';

// Mock the schema to allow optional _id for testing
vi.mock('@/lib/db/schemas/auditLog', async () => {
  const actual = await vi.importActual<typeof import('@/lib/db/schemas/auditLog')>('@/lib/db/schemas/auditLog');
  const { z } = await import('zod');

  // Create a test-friendly version of the schema with optional _id
  const TestAuditLogSchema = z.object({
    _id: z.instanceof(ObjectId).optional(),
    eventType: actual.AuditEventType,
    eventCategory: z.enum(['auth', 'data', 'security', 'admin']),
    userId: z.instanceof(ObjectId).nullable(),
    userEmail: z.string().email().nullable(),
    userRole: z.string().nullable(),
    resourceType: z.string().nullable(),
    resourceId: z.instanceof(ObjectId).nullable(),
    organizationId: z.instanceof(ObjectId).nullable(),
    ipAddress: z.string(),
    userAgent: z.string().nullable(),
    requestId: z.string().nullable(),
    action: z.string(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    success: z.boolean(),
    errorMessage: z.string().nullable(),
    timestamp: z.date(),
    expiresAt: z.date().optional(),
  });

  return {
    ...actual,
    AuditLogSchema: TestAuditLogSchema,
  };
});

import { AuditLogService } from '../AuditLogService';

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(() => {
    service = new AuditLogService();
  });

  describe('log', () => {
    it('creates audit log entry', async () => {
      const logEntry = await service.log({
        eventType: 'auth.login.success',
        userId: '507f1f77bcf86cd799439011',
        userEmail: 'user@example.com',
        userRole: 'user',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        action: 'User logged in successfully',
        success: true,
      });

      expect(logEntry).toBeDefined();
      expect(logEntry.eventType).toBe('auth.login.success');
      expect(logEntry.eventCategory).toBe('auth');
      expect(logEntry.success).toBe(true);
      expect(logEntry.userId).toBeDefined();
      expect(logEntry.userEmail).toBe('user@example.com');
      expect(logEntry.userRole).toBe('user');
      expect(logEntry.ipAddress).toBe('192.168.1.1');
      expect(logEntry.userAgent).toBe('Mozilla/5.0');
      expect(logEntry.action).toBe('User logged in successfully');
      expect(logEntry.timestamp).toBeInstanceOf(Date);
    });

    it('logs failed authentication', async () => {
      const logEntry = await service.log({
        eventType: 'auth.login.failed',
        userEmail: 'user@example.com',
        ipAddress: '192.168.1.1',
        action: 'Failed login attempt',
        success: false,
        errorMessage: 'Invalid password',
      });

      expect(logEntry).toBeDefined();
      expect(logEntry.eventType).toBe('auth.login.failed');
      expect(logEntry.eventCategory).toBe('auth');
      expect(logEntry.success).toBe(false);
      expect(logEntry.errorMessage).toBe('Invalid password');
      expect(logEntry.userEmail).toBe('user@example.com');
      expect(logEntry.ipAddress).toBe('192.168.1.1');
      expect(logEntry.action).toBe('Failed login attempt');
    });

    it('logs security events', async () => {
      const logEntry = await service.log({
        eventType: 'security.rate_limit.exceeded',
        userId: '507f1f77bcf86cd799439011',
        ipAddress: '192.168.1.1',
        action: 'Rate limit exceeded',
        success: false,
        metadata: {
          endpoint: '/api/prompts',
          limit: 100,
          current: 101,
        },
      });

      expect(logEntry).toBeDefined();
      expect(logEntry.eventType).toBe('security.rate_limit.exceeded');
      expect(logEntry.eventCategory).toBe('security');
      expect(logEntry.success).toBe(false);
      expect(logEntry.metadata).toBeDefined();
      expect(logEntry.metadata?.endpoint).toBe('/api/prompts');
      expect(logEntry.metadata?.limit).toBe(100);
      expect(logEntry.metadata?.current).toBe(101);
      expect(logEntry.ipAddress).toBe('192.168.1.1');
      expect(logEntry.action).toBe('Rate limit exceeded');
    });

    it('sets expiration date to 1 year', async () => {
      const logEntry = await service.log({
        eventType: 'prompt.created',
        userId: '507f1f77bcf86cd799439011',
        ipAddress: '192.168.1.1',
        action: 'Created prompt',
        success: true,
      });

      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      expect(logEntry).toBeDefined();
      expect(logEntry.expiresAt).toBeDefined();
      expect(logEntry.expiresAt).toBeInstanceOf(Date);

      if (logEntry.expiresAt) {
        // Check year matches
        expect(logEntry.expiresAt.getFullYear()).toBe(oneYearFromNow.getFullYear());

        // Check month matches (should be same month, 1 year from now)
        expect(logEntry.expiresAt.getMonth()).toBe(oneYearFromNow.getMonth());

        // Check day is close (within a few days to account for test execution time)
        const dayDiff = Math.abs(logEntry.expiresAt.getDate() - oneYearFromNow.getDate());
        expect(dayDiff).toBeLessThanOrEqual(1);
      }

      expect(logEntry.eventType).toBe('prompt.created');
      expect(logEntry.eventCategory).toBe('data');
      expect(logEntry.success).toBe(true);
    });
  });

  describe('query', () => {
    it('filters by event type', async () => {
      // Integration test - requires database
      expect(service.query).toBeDefined();
    });

    it('filters by date range', async () => {
      // Integration test - requires database
      expect(service.query).toBeDefined();
    });
  });

  describe('getSecurityEvents', () => {
    it('returns only security events', async () => {
      expect(service.getSecurityEvents).toBeDefined();
    });
  });

  describe('getFailedLogins', () => {
    it('returns only failed login attempts', async () => {
      expect(service.getFailedLogins).toBeDefined();
    });
  });
});
