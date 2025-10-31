/**
 * Individual User API Route (v2)
 *
 * Handles operations on individual users using the Repository Pattern.
 * This route demonstrates:
 * - Clean separation of concerns
 * - Dependency injection for testability
 * - Service layer for business logic
 * - Repository pattern for data access
 *
 * SOLID Principles:
 * - Single Responsibility: Just handles HTTP request/response for individual users
 * - Open/Closed: Can extend functionality without modifying existing code
 * - Liskov Substitution: All services are interchangeable
 * - Interface Segregation: Depends only on what it needs
 * - Dependency Inversion: Depends on service abstractions
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logging/logger';
import { RBACPresets } from '@/lib/middleware/rbac';
import { getUserService } from '@/lib/di/Container';

// Request validation schemas
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.string().optional(),
  plan: z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
  organizationId: z.string().optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark']).optional(),
      notifications: z.boolean().optional(),
      weeklyReports: z.boolean().optional(),
    })
    .optional(),
});

/**
 * GET /api/v2/users/[id]
 * Get user by ID
 * Requires users:read permission
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // RBAC: users:read permission
  const rbacCheck = await RBACPresets.requireUserRead()(request);
  if (rbacCheck) return rbacCheck;

  let id: string | undefined;
  try {
    const session = await auth();
    id = (await params).id;

    // Users can only read their own data unless they're admins
    if (
      session?.user?.id !== id &&
      session?.user?.role !== 'admin' &&
      session?.user?.role !== 'super_admin'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden - You can only view your own profile',
        },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const userService = getUserService();
    const user = await userService.getUserById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    const session = await auth();
    logger.apiError(`/api/v2/users/${id}`, error, {
      userId: session?.user?.id,
      method: 'GET',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v2/users/[id]
 * Update user by ID
 * Requires users:write permission
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // RBAC: users:write permission
  const rbacCheck = await RBACPresets.requireUserWrite()(request);
  if (rbacCheck) return rbacCheck;

  let id: string | undefined;
  try {
    const session = await auth();
    id = (await params).id;

    // Users can only update their own data unless they're admins
    if (
      session?.user?.id !== id &&
      session?.user?.role !== 'admin' &&
      session?.user?.role !== 'super_admin'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden - You can only update your own profile',
        },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const userService = getUserService();
    const body = await request.json();

    // Validate request body
    const validatedData = updateUserSchema.parse(body);

    // Update user
    const updatedUser = await userService.updateUser(id, validatedData);

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    const session = await auth();
    logger.apiError(`/api/v2/users/${id}`, error, {
      userId: session?.user?.id,
      method: 'PUT',
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
    if (error instanceof Error && error.message.includes('already taken')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already taken',
          message: error.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v2/users/[id]
 * Delete user by ID
 * Requires users:write permission (users can delete their own account or admins can delete any)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // RBAC: users:write permission
  const rbacCheck = await RBACPresets.requireUserWrite()(_request);
  if (rbacCheck) return rbacCheck;

  let id: string | undefined;
  try {
    const session = await auth();
    id = (await params).id;

    // Users can only delete their own account unless they're admins
    if (
      session?.user?.id !== id &&
      session?.user?.role !== 'admin' &&
      session?.user?.role !== 'super_admin'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden - You can only delete your own account',
        },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const userService = getUserService();
    // Delete user
    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    const session = await auth();
    logger.apiError(`/api/v2/users/${id}`, error, {
      userId: session?.user?.id,
      method: 'DELETE',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v2/users/[id]/last-login
 * Update user's last login timestamp
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // RBAC: users:write permission (restricted to self or admin)
  const rbacCheck = await RBACPresets.requireUserWrite()(request);
  if (rbacCheck) return rbacCheck;

  let id: string | undefined;
  let session: Awaited<ReturnType<typeof auth>> | null = null;

  try {
    session = await auth();
    id = (await params).id;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Users can only update their own last login unless elevated
    const role = (session?.user as { role?: string } | null)?.role;
    const sessionUserId = session?.user?.id;
    const isElevated = role === 'admin' || role === 'super_admin';

    if (!isElevated && sessionUserId !== id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden - You can only update your own last login',
        },
        { status: 403 }
      );
    }

    const userService = getUserService();
    await userService.updateLastLogin(id);

    return NextResponse.json({
      success: true,
      message: 'Last login updated successfully',
    });
  } catch (error) {
    logger.apiError(`/api/v2/users/${id}/update-last-login`, error, {
      userId: session?.user?.id,
      method: 'PATCH',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update last login',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
