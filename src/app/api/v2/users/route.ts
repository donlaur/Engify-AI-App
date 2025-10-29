/**
 * Users API Route (v2)
 *
 * Enhanced version using Repository Pattern, Dependency Injection, and CQRS.
 * This route demonstrates:
 * - Clean separation of concerns
 * - Dependency injection for testability
 * - Service layer for business logic
 * - Repository pattern for data access
 * - CQRS pattern for command/query separation
 *
 * SOLID Principles:
 * - Single Responsibility: Just handles HTTP request/response
 * - Open/Closed: Can extend functionality without modifying existing code
 * - Liskov Substitution: All services are interchangeable
 * - Interface Segregation: Depends only on what it needs
 * - Dependency Inversion: Depends on service abstractions
 *
 * CQRS Benefits:
 * - Commands handle write operations (POST, PUT, DELETE)
 * - Queries handle read operations (GET)
 * - Optimized read/write performance
 * - Clear separation of concerns
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logging/logger';
import { getUserService } from '@/lib/di/Container';
import { RBACPresets } from '@/lib/middleware/rbac';

// For V2 tests, we directly use UserService methods (DI) instead of CQRS

// Request validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.string().optional(),
  plan: z.enum(['free', 'basic', 'pro', 'enterprise']).default('free'),
  organizationId: z.string().optional(),
});

// Note: updateUserSchema removed as it's not used in this route

/**
 * GET /api/v2/users
 * Query: Get all users or users with filters using CQRS pattern
 * Requires users:read permission
 */
export async function GET(request: NextRequest) {
  // RBAC: users:read permission
  const rbacCheck = await RBACPresets.requireUserRead()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const userService = getUserService();
    const { searchParams } = new URL(request.url);

    // Handle different query parameters
    const role = searchParams.get('role');
    const plan = searchParams.get('plan');
    const organizationId = searchParams.get('organizationId');
    const stats = searchParams.get('stats');
    const search = searchParams.get('search');

    if (stats === 'true') {
      const statsData = await userService.getUserStats();
      return NextResponse.json({ success: true, data: statsData });
    }

    if (role) {
      const users = await userService.getUsersByRole(role);
      return NextResponse.json({
        success: true,
        data: users,
        count: users.length,
      });
    }

    if (plan) {
      const users = await userService.getUsersByPlan(plan);
      return NextResponse.json({
        success: true,
        data: users,
        count: users.length,
      });
    }

    if (organizationId) {
      const users = await userService.getUsersByOrganization(organizationId);
      return NextResponse.json({
        success: true,
        data: users,
        count: users.length,
      });
    }

    if (search) {
      // Basic fallback search using getAllUsers and filter by term in name/email
      const all = (await userService.getAllUsers()) as Array<{
        name?: string | null;
        email?: string | null;
      }>;
      const term = search.toLowerCase();
      const filtered = all.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
      return NextResponse.json({
        success: true,
        data: filtered,
        count: filtered.length,
      });
    }

    const users = await userService.getAllUsers();
    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    const session = await auth();
    logger.apiError('/api/v2/users', error, {
      userId: session?.user?.id,
      method: 'GET',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get users',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v2/users
 * Command: Create a new user using CQRS pattern
 * Requires users:write permission
 */
export async function POST(request: NextRequest) {
  // RBAC: users:write permission
  const rbacCheck = await RBACPresets.requireUserWrite()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const userService = getUserService();
    const body = await request.json();

    // Validate request body
    const validatedData = createUserSchema.parse(body);

    type CreateUserArg = Parameters<typeof userService.createUser>[0];
    const created = await userService.createUser({
      email: validatedData.email,
      name: validatedData.name,
      role: validatedData.role,
      plan: validatedData.plan,
      organizationId: validatedData.organizationId ?? null,
    } as unknown as CreateUserArg);

    return NextResponse.json(
      {
        success: true,
        data: created,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    const session = await auth();
    logger.apiError('/api/v2/users', error, {
      userId: session?.user?.id,
      method: 'POST',
    });

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle business logic errors
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already exists',
          message: error.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
