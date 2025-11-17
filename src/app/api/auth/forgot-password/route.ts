/**
 * Forgot Password API Route
 *
 * POST /api/auth/forgot-password
 * Generates a password reset token and sends reset email
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { getDb } from '@/lib/mongodb';
import { userService } from '@/lib/services/UserService';
import { sendPasswordResetEmail } from '@/lib/services/emailService';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { logAuditEvent } from '@/server/middleware/audit';
import { AuditEventType } from '@/lib/db/schemas/auditLog';
import { cognitoForgotPassword } from '@/lib/auth/providers/cognito-password-reset';

// Check if Cognito is enabled
const USE_COGNITO = !!process.env.COGNITO_USER_POOL_ID;

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || null;

  try {
    // Rate limiting
    const identifier = ipAddress;
    const rateLimitResult = await checkRateLimit(identifier, 'anonymous');

    if (!rateLimitResult.allowed) {
      // Log rate limit event
      await logAuditEvent({
        eventType: AuditEventType.enum['security.rate_limit.exceeded'],
        ipAddress,
        userAgent,
        action: 'password_reset.request',
        metadata: { email: 'REDACTED' },
        success: false,
        errorMessage: 'Rate limit exceeded',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // If Cognito is enabled, use Cognito password reset
    if (USE_COGNITO) {
      const cognitoResult = await cognitoForgotPassword(email);

      // Audit log
      await logAuditEvent({
        eventType: AuditEventType.enum['auth.password_reset.requested'],
        ipAddress,
        userAgent,
        action: 'password_reset.request',
        metadata: {
          provider: 'cognito',
          emailRequested: email,
        },
        success: cognitoResult.success,
      });

      return NextResponse.json({
        success: true,
        message:
          cognitoResult.message ||
          'If an account exists, a password reset code has been sent to your email.',
      });
    }

    // MongoDB-based password reset (fallback)
    const user = await userService.findByEmail(email);

    // Don't reveal if user exists or not (security best practice)
    // Always return success to prevent email enumeration attacks
    if (!user) {
      // Log for monitoring but don't reveal to user
      logger.info('Password reset requested for non-existent email', { email });

      // Audit log: password reset requested for non-existent email
      await logAuditEvent({
        eventType: AuditEventType.enum['auth.password_reset.requested'],
        ipAddress,
        userAgent,
        action: 'password_reset.request',
        metadata: { emailRequested: email },
        success: true,
      });

      return NextResponse.json({
        success: true,
        message:
          'If an account exists with that email, a password reset link has been sent.',
      });
    }

    // Generate secure reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in database
    const db = await getDb();
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
          updatedAt: new Date(),
        },
      }
    );

    // Send password reset email
    let emailSent = false;
    try {
      await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name || user.email.split('@')[0]
      );

      emailSent = true;
      logger.info('Password reset email sent', {
        userId: user._id.toString(),
        email: user.email,
      });
    } catch (emailError) {
      // Log email error but don't reveal to user
      logger.apiError('/api/auth/forgot-password', emailError, {
        userId: user._id.toString(),
        email: user.email,
      });

      // Still return success to prevent email enumeration
      // Email failures are logged for admin investigation
    }

    // Audit log: password reset requested successfully
    await logAuditEvent({
      eventType: AuditEventType.enum['auth.password_reset.requested'],
      userId: user._id.toString(),
      userEmail: user.email,
      userRole: user.role || null,
      organizationId: user.organizationId?.toString() || null,
      ipAddress,
      userAgent,
      action: 'password_reset.request',
      metadata: {
        emailSent,
        resetTokenExpiry: resetTokenExpiry.toISOString(),
      },
      success: true,
    });

    return NextResponse.json({
      success: true,
      message:
        'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    logger.apiError('/api/auth/forgot-password', error, { method: 'POST' });

    // Audit log: password reset request failed
    await logAuditEvent({
      eventType: AuditEventType.enum['auth.password_reset.requested'],
      ipAddress,
      userAgent,
      action: 'password_reset.request',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Don't reveal internal errors
    return NextResponse.json(
      {
        success: true,
        message:
          'If an account exists with that email, a password reset link has been sent.',
      },
      { status: 200 }
    );
  }
}
