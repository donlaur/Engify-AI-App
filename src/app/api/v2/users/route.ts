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
import { z } from 'zod';
import { getUserService } from '@/lib/di/Container';
import { cqrsBus } from '@/lib/cqrs/bus';
import { initializeCQRS } from '@/lib/cqrs/registration';
import { UserCommands } from '@/lib/cqrs/commands/UserCommands';
import { UserQueries } from '@/lib/cqrs/queries/UserQueries';
import { RBACPresets } from '@/lib/middleware/rbac';

// Initialize CQRS lazily
let cqrsInitialized = false;

function ensureCQRSInitialized(): void {
  if (!cqrsInitialized) {
    const userService = getUserService();
    initializeCQRS(userService);
    cqrsInitialized = true;
  }
}

// Export for testing - allows resetting CQRS between tests
export function resetCQRSForTesting(): void {
  cqrsInitialized = false;
}

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
    // Ensure CQRS is initialized
    ensureCQRSInitialized();

    const { searchParams } = new URL(request.url);

    // Handle different query parameters
    const role = searchParams.get('role');
    const plan = searchParams.get('plan');
    const organizationId = searchParams.get('organizationId');
    const stats = searchParams.get('stats');
    const search = searchParams.get('search');

    let result;

    // Return user statistics if requested
    if (stats === 'true') {
      const statsQuery = UserQueries.getStatistics({
        correlationId: `stats-${Date.now()}`,
      });
      result = await cqrsBus.sendQuery(statsQuery);
    } else if (search) {
      // Search users query
      const searchQuery = UserQueries.search({
        searchTerm: search,
        filters: {
          role: role || undefined,
          plan: plan || undefined,
          organizationId: organizationId || undefined,
        },
        correlationId: `search-${Date.now()}`,
      });
      result = await cqrsBus.sendQuery(searchQuery);
    } else if (role) {
      // Get users by role query
      const roleQuery = UserQueries.getByRole({
        role,
        correlationId: `role-${Date.now()}`,
      });
      result = await cqrsBus.sendQuery(roleQuery);
    } else if (plan) {
      // Get users by plan query
      const planQuery = UserQueries.getByPlan({
        plan,
        correlationId: `plan-${Date.now()}`,
      });
      result = await cqrsBus.sendQuery(planQuery);
    } else if (organizationId) {
      // Get users by organization query
      const orgQuery = UserQueries.getByOrganization({
        organizationId,
        correlationId: `org-${Date.now()}`,
      });
      result = await cqrsBus.sendQuery(orgQuery);
    } else {
      // Get all users query
      const allUsersQuery = UserQueries.getAll({
        correlationId: `all-${Date.now()}`,
      });
      result = await cqrsBus.sendQuery(allUsersQuery);
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          correlationId: result.correlationId,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      totalCount: result.totalCount,
      correlationId: result.correlationId,
    });
  } catch (error) {
    console.error('Error getting users:', error);
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
    // Ensure CQRS is initialized
    ensureCQRSInitialized();

    const body = await request.json();

    // Validate request body
    const validatedData = createUserSchema.parse(body);

    // Create user command
    const createCommand = UserCommands.createUser({
      email: validatedData.email,
      name: validatedData.name,
      role: validatedData.role,
      plan: validatedData.plan,
      organizationId: validatedData.organizationId,
      correlationId: `create-${Date.now()}`,
    });

    const result = await cqrsBus.send(createCommand);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          correlationId: result.correlationId,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: 'User created successfully',
        correlationId: result.correlationId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);

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
