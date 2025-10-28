/**
 * Users API Route (v2)
 * 
 * New version using the Repository Pattern and Dependency Injection.
 * This route demonstrates:
 * - Clean separation of concerns
 * - Dependency injection for testability
 * - Service layer for business logic
 * - Repository pattern for data access
 * 
 * SOLID Principles:
 * - Single Responsibility: Just handles HTTP request/response
 * - Open/Closed: Can extend functionality without modifying existing code
 * - Liskov Substitution: All services are interchangeable
 * - Interface Segregation: Depends only on what it needs
 * - Dependency Inversion: Depends on service abstractions
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserService } from '@/lib/di/Container';

// Request validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.string().optional(),
  plan: z.enum(['free', 'basic', 'pro', 'enterprise']).default('free'),
  organizationId: z.string().optional(),
});

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
 * GET /api/v2/users
 * Get all users or users with filters
 */
export async function GET(request: NextRequest) {
  try {
    const userService = getUserService();
    const { searchParams } = new URL(request.url);

    // Handle different query parameters
    const role = searchParams.get('role');
    const plan = searchParams.get('plan');
    const organizationId = searchParams.get('organizationId');
    const stats = searchParams.get('stats');

    // Return user statistics if requested
    if (stats === 'true') {
      const userStats = await userService.getUserStats();
      return NextResponse.json({
        success: true,
        data: userStats,
      });
    }

    // Apply filters
    let users;
    if (role) {
      users = await userService.getUsersByRole(role);
    } else if (plan) {
      users = await userService.getUsersByPlan(plan);
    } else if (organizationId) {
      users = await userService.getUsersByOrganization(organizationId);
    } else {
      users = await userService.getAllUsers();
    }

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
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
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const userService = getUserService();
    const body = await request.json();
    
    // Validate request body
    const validatedData = createUserSchema.parse(body);

    // Create user
    const newUser = await userService.createUser(validatedData);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully',
    }, { status: 201 });
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
