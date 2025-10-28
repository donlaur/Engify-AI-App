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
import { getUserService } from '@/lib/di/Container';

// Request validation schemas
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.string().optional(),
  plan: z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
  organizationId: z.string().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    notifications: z.boolean().optional(),
    weeklyReports: z.boolean().optional(),
  }).optional(),
});

/**
 * GET /api/v2/users/[id]
 * Get user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userService = getUserService();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

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
    console.error('Error getting user:', error);
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
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userService = getUserService();
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

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
    console.error('Error updating user:', error);

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
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userService = getUserService();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

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
    console.error('Error deleting user:', error);
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
  try {
    const userService = getUserService();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Update last login
    await userService.updateLastLogin(id);

    return NextResponse.json({
      success: true,
      message: 'Last login updated successfully',
    });
  } catch (error) {
    console.error('Error updating last login:', error);
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
