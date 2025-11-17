/**
 * Authentication Service
 *
 * Comprehensive auth service supporting:
 * - Email/password authentication
 * - OAuth providers (Google, GitHub, etc.)
 * - SSO integration (SAML, OIDC)
 * - Multi-factor authentication (TOTP)
 * - Session management
 * - Password reset
 * - Account verification
 */

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { userService } from '@/lib/services/UserService';
import {
  RBACService,
  type UserRole,
  type Permission,
  type Resource,
  type Action,
} from './rbac';
import type { User } from '@/lib/db/schema';
import { logger } from '@/lib/logging/logger';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  organizationId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// const resetPasswordSchema = z.object({
//   email: z.string().email('Invalid email address'),
// }); // TODO: Use when implementing password reset validation

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Auth result types
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  requiresVerification?: boolean;
  requiresMFA?: boolean;
}

export interface LoginResult extends AuthResult {
  sessionToken?: string;
}

export interface RegisterResult extends AuthResult {
  verificationToken?: string;
}

export class AuthService {
  private readonly saltRounds = 12;

  /**
   * Register a new user
   */
  async register(
    userData: z.infer<typeof registerSchema>
  ): Promise<RegisterResult> {
    try {
      // Validate input
      const validatedData = registerSchema.parse(userData);

      // Check if user already exists
      const existingUser = await userService.findByEmail(validatedData.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        validatedData.password,
        this.saltRounds
      );

      // Create user (service does not accept password)
      const newUser = await userService.createUser({
        email: validatedData.email,
        name: validatedData.name,
        role: 'user',
        organizationId: validatedData.organizationId,
      });

      // Set password directly in DB
      await userService.setPassword(newUser._id.toString(), hashedPassword);

      // Generate verification token (for email verification)
      const verificationToken = this.generateVerificationToken(
        newUser._id.toString()
      );

      return {
        success: true,
        user: newUser,
        verificationToken,
      };
    } catch (error) {
      logger.error('User registration failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  /**
   * Login user with email and password
   */
  async login(credentials: z.infer<typeof loginSchema>): Promise<LoginResult> {
    try {
      // Validate input
      const validatedData = loginSchema.parse(credentials);

      // Find user
      const user = await userService.findByEmail(validatedData.email);
      if (!user || !user.password) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Check if account is verified
      if (!user.emailVerified) {
        return {
          success: false,
          error: 'Please verify your email address before logging in',
          requiresVerification: true,
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        validatedData.password,
        user.password
      );
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Check if MFA is required (best-effort, optional field)
      const mfaEnabled =
        (user as unknown as { mfaEnabled?: boolean }).mfaEnabled === true;
      if (mfaEnabled) {
        return {
          success: false,
          error: 'MFA verification required',
          requiresMFA: true,
          user,
        };
      }

      // Update last login
      await userService.updateLastLogin(user._id.toString());

      // Generate session token
      const sessionToken = this.generateSessionToken(user._id.toString());

      return {
        success: true,
        user,
        sessionToken,
      };
    } catch (error) {
      logger.error('User login failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Login with OAuth provider
   */
  async loginWithOAuth(
    _provider: string,
    providerData: {
      id: string;
      email: string;
      name: string;
      image?: string;
    }
  ): Promise<LoginResult> {
    try {
      // Check if user exists with this provider
      let user = await userService.findByEmail(providerData.email);

      if (!user) {
        // Create new user
        user = await userService.createUser({
          email: providerData.email,
          name: providerData.name,
          role: 'free',
        });
      }

      // Note: image/emailVerified are not part of UpdateUserData; skip optional enrichment here

      // Generate session token
      const sessionToken = this.generateSessionToken(user._id.toString());

      return {
        success: true,
        user,
        sessionToken,
      };
    } catch (error) {
      logger.error('OAuth login failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth login failed',
      };
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<AuthResult> {
    try {
      // In a real implementation, you'd validate the token
      // For now, we'll assume the token is valid
      const userId = this.extractUserIdFromToken(token);

      if (!userId) {
        return {
          success: false,
          error: 'Invalid verification token',
        };
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Mark email as verified
      await userService.updateUser(userId, {
        emailVerified: new Date(),
      });

      return {
        success: true,
        user,
      };
    } catch (error) {
      logger.error('Email verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error: 'Email verification failed',
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      const validatedEmail = z.string().email().parse(email);

      const user = await userService.findByEmail(validatedEmail);
      if (!user) {
        // Don't reveal if user exists or not (security best practice)
        // Still return success to prevent email enumeration attacks
        logger.info('Password reset requested for non-existent email', {
          email: validatedEmail,
        });
        return {
          success: true,
        };
      }

      // Generate secure reset token with 1-hour expiration
      const resetToken = this.generateResetToken(user._id.toString());

      // Store reset token in database with expiration
      await userService.storePasswordResetToken(
        user._id.toString(),
        resetToken,
        new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      );

      // Send password reset email
      const { sendPasswordResetEmail } = await import('@/lib/services/emailService');
      const emailResult = await sendPasswordResetEmail(
        validatedEmail,
        resetToken,
        user.name || 'User'
      );

      if (!emailResult.success) {
        logger.error('Failed to send password reset email', {
          userId: user._id.toString(),
          email: validatedEmail,
          error: emailResult.error,
        });
        // Still return success to user to prevent email enumeration
      } else {
        logger.info('Password reset email sent', {
          userId: user._id.toString(),
          email: validatedEmail,
          messageId: emailResult.messageId,
        });
      }

      return {
        success: true,
      };
    } catch (error) {
      logger.error('Password reset request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error: 'Password reset request failed',
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      // Verify the reset token is valid and not expired
      const user = await userService.verifyPasswordResetToken(token);

      if (!user) {
        logger.warn('Invalid or expired password reset token', {
          tokenPrefix: token.substring(0, 10),
        });
        return {
          success: false,
          error: 'Invalid or expired reset token',
        };
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters',
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password directly in DB
      await userService.setPassword(user._id.toString(), hashedPassword);

      // Clear the reset token so it can't be reused
      await userService.clearPasswordResetToken(user._id.toString());

      logger.info('Password reset successful', {
        userId: user._id.toString(),
        email: user.email,
      });

      return {
        success: true,
        user,
      };
    } catch (error) {
      logger.error('Password reset failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error: 'Password reset failed',
      };
    }
  }

  /**
   * Change password (for logged-in users)
   */
  async changePassword(
    userId: string,
    passwords: z.infer<typeof changePasswordSchema>
  ): Promise<AuthResult> {
    try {
      const validatedData = changePasswordSchema.parse(passwords);

      const user = await userService.getUserById(userId);
      if (!user || !user.password) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        validatedData.currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Current password is incorrect',
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(
        validatedData.newPassword,
        this.saltRounds
      );

      // Update password directly in DB
      await userService.setPassword(userId, hashedPassword);

      return {
        success: true,
        user,
      };
    } catch (error) {
      logger.error('Password change failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error: 'Password change failed',
      };
    }
  }

  /**
   * Enable MFA for user (SMS-based via Twilio)
   * Note: For TOTP (authenticator apps), use a separate TOTP library
   */
  async enableMFA(
    userId: string,
    phoneNumber: string
  ): Promise<{ success: boolean; error?: string }> {
    // Use MFA service which integrates with Twilio
    const { mfaService } = await import('@/lib/services/mfaService');
    return mfaService.enableMFA(userId, phoneNumber);
  }

  /**
   * Verify MFA token (SMS code)
   */
  async verifyMFAToken(
    userId: string,
    phoneNumber: string,
    token: string
  ): Promise<boolean> {
    const { mfaService } = await import('@/lib/services/mfaService');
    const result = await mfaService.verifyMFACode(userId, phoneNumber, token);
    return result.success;
  }

  /**
   * Check if user has permission
   */
  hasPermission(userRole: UserRole, permission: string): boolean {
    return RBACService.hasPermission(userRole, permission as Permission);
  }

  /**
   * Check if user can access resource
   */
  canAccess(userRole: UserRole, resource: string, action: string): boolean {
    return RBACService.canAccess(
      userRole,
      resource as Resource,
      action as Action
    );
  }

  // Private helper methods
  private generateVerificationToken(userId: string): string {
    // In a real implementation, you'd generate a secure token
    return `verify_${userId}_${Date.now()}`;
  }

  private generateSessionToken(userId: string): string {
    // In a real implementation, you'd generate a JWT
    return `session_${userId}_${Date.now()}`;
  }

  private generateResetToken(userId: string): string {
    // Generate a cryptographically secure random token
    const crypto = require('crypto');
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();
    // Combine user ID, random bytes, and timestamp for uniqueness
    return `${randomBytes}_${timestamp}_${userId}`;
  }

  private extractUserIdFromToken(token: string): string | null {
    // In a real implementation, you'd decode and validate the token
    const parts = token.split('_');
    if (parts.length < 2) {
      return null;
    }
    return parts[1] || null;
  }
}

// Export singleton instance
export const authService = new AuthService();
