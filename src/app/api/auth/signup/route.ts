/**
 * Signup API Route
 *
 * Create new user account with email/password
 */

import { NextRequest } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { logger } from '@/lib/logging/logger';
import { userService } from '@/lib/services/UserService';
import { success, fail, validationError } from '@/lib/api/response';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  name: z.string().min(1, 'Name is required').max(100),
});

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; name?: string } = {};

  try {
    body = await req.json();

    // Validate input
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return validationError(result.error.flatten());
    }

    const { email, password, name } = result.data;

    // Check if user already exists
    const existing = await userService.findByEmail(email);
    if (existing) {
      return fail('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await userService.insertOne({
      _id: new ObjectId(),
      email,
      name,
      password: hashedPassword,
      emailVerified: null,
      image: null,
      role: 'user',
      organizationId: null,
      plan: 'free',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return success (don't include password)
    return success({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    logger.apiError('/api/auth/signup', error, {
      method: 'POST',
      email: body?.email || 'unknown',
    });
    return fail('Failed to create account', 500);
  }
}
