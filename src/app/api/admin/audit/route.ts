import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { auditLogService } from '@/lib/services/AuditLogService';
import { AuditLogFilters } from '@/lib/db/schemas/auditLog';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { logger } from '@/lib/logging/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { auth } from '@/lib/auth';

const QuerySchema = z.object({
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  eventType: z.string().optional(),
  eventCategory: z.enum(['auth', 'data', 'security', 'admin']).optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  success: z.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export async function GET(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) return r;

  try {
    // Rate limiting for admin routes
    const session = await auth();
    const userId = session?.user?.id || 'anonymous';
    const rateLimitResult = await checkRateLimit(userId, 'authenticated');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.reason || 'Rate limit exceeded',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);

    const rawParams: Record<string, unknown> = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
    };

    if (searchParams.get('userId')) {
      rawParams.userId = searchParams.get('userId');
    }
    if (searchParams.get('organizationId')) {
      rawParams.organizationId = searchParams.get('organizationId');
    }
    if (searchParams.get('eventType')) {
      rawParams.eventType = searchParams.get('eventType');
    }
    if (searchParams.get('eventCategory')) {
      rawParams.eventCategory = searchParams.get('eventCategory');
    }
    if (searchParams.get('resourceType')) {
      rawParams.resourceType = searchParams.get('resourceType');
    }
    if (searchParams.get('resourceId')) {
      rawParams.resourceId = searchParams.get('resourceId');
    }
    if (searchParams.get('startDate')) {
      rawParams.startDate = searchParams.get('startDate');
    }
    if (searchParams.get('endDate')) {
      rawParams.endDate = searchParams.get('endDate');
    }
    if (searchParams.get('success') !== null) {
      rawParams.success = searchParams.get('success') === 'true';
    }

    const parsed = QuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { page, limit, ...filters } = parsed.data;

    // Convert string IDs to ObjectIds and dates for AuditLogService
    const serviceFilters: AuditLogFilters = {
      ...(filters.userId && { userId: new ObjectId(filters.userId) }),
      ...(filters.organizationId && { organizationId: new ObjectId(filters.organizationId) }),
      ...(filters.resourceId && { resourceId: new ObjectId(filters.resourceId) }),
      ...(filters.eventType && { eventType: filters.eventType as AuditLogFilters['eventType'] }),
      ...(filters.eventCategory && { eventCategory: filters.eventCategory }),
      ...(filters.resourceType && { resourceType: filters.resourceType }),
      ...(filters.success !== undefined && { success: filters.success }),
      ...(filters.startDate && { startDate: new Date(filters.startDate) }),
      ...(filters.endDate && { endDate: new Date(filters.endDate) }),
    };

    const result = await auditLogService.query(serviceFilters, page, limit);

    const totalPages = Math.ceil(result.total / limit);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
      },
    });
  } catch (error) {
    logger.apiError('/api/admin/audit', error, { method: 'GET' });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to query audit logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
