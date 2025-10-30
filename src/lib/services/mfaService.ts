/**
 * MFA/TOTP Service
 *
 * Manages Multi-Factor Authentication using Twilio for SMS codes
 * Also supports TOTP (Time-based One-Time Password) for authenticator apps
 */

import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { twilioService } from './twilioService';
import { auditLog } from '@/lib/logging/audit';
import _crypto from 'crypto';

export interface MFACode {
  _id?: ObjectId;
  userId: string;
  phoneNumber?: string; // For SMS-based MFA
  code: string;
  type: 'sms' | 'totp';
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
}

export interface MFAStatus {
  enabled: boolean;
  method?: 'sms' | 'totp';
  phoneNumber?: string; // Masked
  backupCodes?: string[]; // Only when enabling
}

const CODE_EXPIRY_MINUTES = 10;
const MAX_VERIFICATION_ATTEMPTS = 3;

export class MFAService {
  private collectionName = 'mfa_codes';
  private userMfaCollectionName = 'user_mfa';

  /**
   * Generate a 6-digit verification code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Mask phone number for display (e.g., +1234567890 -> +1***7890)
   */
  maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length < 8) return phoneNumber;
    const start = phoneNumber.slice(0, 2);
    const end = phoneNumber.slice(-4);
    return `${start}****${end}`;
  }

  /**
   * Send MFA code via SMS using Twilio
   */
  async sendMFACode(
    userId: string,
    phoneNumber: string
  ): Promise<{ success: boolean; expiresAt: Date; error?: string }> {
    try {
      // Use Twilio Verify service (recommended) or manual code
      const twilioResult = await twilioService.sendMFACode(phoneNumber);

      if (!twilioResult.success) {
        return {
          success: false,
          expiresAt: new Date(),
          error: twilioResult.error,
        };
      }

      // Store code in database for verification (only if using manual fallback)
      // Twilio Verify handles code storage internally
      const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

      // Only store if using manual code (not Twilio Verify)
      // Twilio Verify service manages codes internally
      const db = await getDb();
      const collection = db.collection<MFACode>(this.collectionName);

      // If using Twilio Verify, we don't need to store the code
      // Just record the attempt for audit
      if (process.env.TWILIO_VERIFY_SERVICE_SID) {
        // Using Twilio Verify - code is managed by Twilio
        await auditLog({
          userId,
          action: 'MFA_CODE_SENT',
          resource: 'mfa',
          details: {
            phoneNumber: this.maskPhoneNumber(phoneNumber),
            method: 'sms',
            provider: 'twilio_verify',
          },
        });

        return {
          success: true,
          expiresAt,
        };
      }

      // Manual code generation (fallback)
      const code = this.generateCode();
      await collection.insertOne({
        userId,
        phoneNumber,
        code,
        type: 'sms',
        createdAt: new Date(),
        expiresAt,
        verified: false,
        attempts: 0,
      });

      await auditLog({
        userId,
        action: 'MFA_CODE_SENT',
        resource: 'mfa',
        details: {
          phoneNumber: this.maskPhoneNumber(phoneNumber),
          method: 'sms',
          provider: 'manual',
        },
      });

      return {
        success: true,
        expiresAt,
      };
    } catch (error) {
      console.error('Error sending MFA code:', error);
      return {
        success: false,
        expiresAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify MFA code
   */
  async verifyMFACode(
    userId: string,
    phoneNumber: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Try Twilio Verify first if configured
      if (process.env.TWILIO_VERIFY_SERVICE_SID) {
        const twilioResult = await twilioService.verifyMFACode(
          phoneNumber,
          code
        );

        if (twilioResult.success) {
          await auditLog({
            userId,
            action: 'MFA_CODE_VERIFIED',
            resource: 'mfa',
            details: {
              phoneNumber: this.maskPhoneNumber(phoneNumber),
              method: 'sms',
              provider: 'twilio_verify',
            },
          });

          return { success: true };
        }

        return {
          success: false,
          error: twilioResult.error || 'Invalid verification code',
        };
      }

      // Manual code verification (fallback)
      const db = await getDb();
      const collection = db.collection<MFACode>(this.collectionName);

      const codeDoc = await collection.findOne({
        userId,
        phoneNumber,
        code,
        verified: false,
        expiresAt: { $gt: new Date() },
      });

      if (!codeDoc) {
        // Track failed attempts
        const failedAttempt = await collection.findOne({
          userId,
          phoneNumber,
          verified: false,
          expiresAt: { $gt: new Date() },
        });

        if (failedAttempt) {
          await collection.updateOne(
            { _id: failedAttempt._id },
            { $inc: { attempts: 1 } }
          );

          if (failedAttempt.attempts + 1 >= MAX_VERIFICATION_ATTEMPTS) {
            await auditLog({
              userId,
              action: 'MFA_VERIFICATION_FAILED_MAX_ATTEMPTS',
              resource: 'mfa',
              details: {
                phoneNumber: this.maskPhoneNumber(phoneNumber),
                attempts: failedAttempt.attempts + 1,
              },
            });
            return {
              success: false,
              error: `Maximum attempts exceeded. Please request a new code.`,
            };
          }
        }

        await auditLog({
          userId,
          action: 'MFA_VERIFICATION_FAILED',
          resource: 'mfa',
          details: {
            phoneNumber: this.maskPhoneNumber(phoneNumber),
            reason: 'Invalid or expired code',
          },
        });

        return {
          success: false,
          error: 'Invalid or expired verification code',
        };
      }

      // Mark code as verified
      await collection.updateOne(
        { _id: codeDoc._id },
        { $set: { verified: true } }
      );

      await auditLog({
        userId,
        action: 'MFA_CODE_VERIFIED',
        resource: 'mfa',
        details: {
          phoneNumber: this.maskPhoneNumber(phoneNumber),
          method: 'sms',
          provider: 'manual',
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error verifying MFA code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Enable MFA for a user
   */
  async enableMFA(
    userId: string,
    phoneNumber: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const db = await getDb();
      const collection = db.collection(this.userMfaCollectionName);

      await collection.updateOne(
        { userId },
        {
          $set: {
            userId,
            phoneNumber,
            method: 'sms',
            enabled: true,
            enabledAt: new Date(),
          },
        },
        { upsert: true }
      );

      await auditLog({
        userId,
        action: 'MFA_ENABLED',
        resource: 'mfa',
        details: {
          phoneNumber: this.maskPhoneNumber(phoneNumber),
          method: 'sms',
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error enabling MFA:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Disable MFA for a user
   */
  async disableMFA(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const db = await getDb();
      const collection = db.collection(this.userMfaCollectionName);

      await collection.updateOne(
        { userId },
        {
          $set: {
            enabled: false,
            disabledAt: new Date(),
          },
        }
      );

      // Clean up any pending codes
      const codesCollection = db.collection<MFACode>(this.collectionName);
      await codesCollection.deleteMany({
        userId,
        verified: false,
      });

      await auditLog({
        userId,
        action: 'MFA_DISABLED',
        resource: 'mfa',
      });

      return { success: true };
    } catch (error) {
      console.error('Error disabling MFA:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get MFA status for a user
   */
  async getMFAStatus(userId: string): Promise<MFAStatus> {
    try {
      const db = await getDb();
      const collection = db.collection(this.userMfaCollectionName);

      const mfaDoc = await collection.findOne({ userId });

      if (!mfaDoc || !mfaDoc.enabled) {
        return { enabled: false };
      }

      return {
        enabled: true,
        method: mfaDoc.method || 'sms',
        phoneNumber: mfaDoc.phoneNumber
          ? this.maskPhoneNumber(mfaDoc.phoneNumber)
          : undefined,
      };
    } catch (error) {
      console.error('Error getting MFA status:', error);
      return { enabled: false };
    }
  }

  /**
   * Clean up expired codes (run periodically via cron or scheduled job)
   */
  async cleanupExpiredCodes(): Promise<number> {
    try {
      const db = await getDb();
      const collection = db.collection<MFACode>(this.collectionName);

      const result = await collection.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired codes:', error);
      return 0;
    }
  }
}

export const mfaService = new MFAService();
