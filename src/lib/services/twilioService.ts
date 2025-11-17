/**
 * Twilio SMS Service
 *
 * Handles SMS notifications, MFA/TOTP codes, and two-factor authentication
 */

import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';

// Twilio SDK types
interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  verifyServiceSid?: string;
}

// MFA Code Storage
interface MFACodeData {
  code: string;
  phoneNumber: string;
  createdAt: string;
  attempts: number;
  maxAttempts: number;
}

// Redis client singleton for MFA
let mfaRedisClient: Redis | UpstashRedis | null = null;
let isMfaUpstash = false;
let mfaRedisDisabled = false;

/**
 * Get Redis client for MFA code storage
 */
function getMFARedisClient(): Redis | UpstashRedis | null {
  if (mfaRedisDisabled) {
    return null;
  }

  if (!mfaRedisClient) {
    // Try Upstash first (serverless-friendly)
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (upstashUrl && upstashToken) {
      isMfaUpstash = true;
      mfaRedisClient = new UpstashRedis({
        url: upstashUrl,
        token: upstashToken,
      });
      return mfaRedisClient;
    }

    // Fallback to standard Redis for local development
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;

    if (redisHost && redisPort) {
      isMfaUpstash = false;
      mfaRedisClient = new Redis({
        host: redisHost,
        port: parseInt(redisPort),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
      return mfaRedisClient;
    }

    // No Redis available
    mfaRedisDisabled = true;
    return null;
  }

  return mfaRedisClient;
}

// MFA Code Storage Constants
const MFA_CODE_TTL = 600; // 10 minutes in seconds
const MFA_MAX_ATTEMPTS = 5;
const MFA_RATE_LIMIT_TTL = 3600; // 1 hour in seconds

/**
 * Generate MFA code key for Redis
 */
function getMFACodeKey(phoneNumber: string): string {
  // Normalize phone number (remove spaces, dashes, etc.)
  const normalized = phoneNumber.replace(/\D/g, '');
  return `mfa:code:${normalized}`;
}

/**
 * Generate rate limit key for Redis
 */
function getMFARateLimitKey(phoneNumber: string): string {
  const normalized = phoneNumber.replace(/\D/g, '');
  return `mfa:ratelimit:${normalized}`;
}

/**
 * Generate and store MFA code in Redis
 */
async function generateAndStoreCode(
  phoneNumber: string
): Promise<{ success: boolean; code?: string; error?: string }> {
  const redis = getMFARedisClient();

  if (!redis) {
    return {
      success: false,
      error: 'Redis not configured for MFA code storage',
    };
  }

  try {
    // Check rate limiting
    const rateLimitKey = getMFARateLimitKey(phoneNumber);
    const attempts = isMfaUpstash
      ? await (redis as UpstashRedis).get(rateLimitKey)
      : await (redis as Redis).get(rateLimitKey);

    const attemptCount = attempts ? parseInt(String(attempts), 10) : 0;

    if (attemptCount >= MFA_MAX_ATTEMPTS) {
      return {
        success: false,
        error: `Too many MFA requests. Please try again later.`,
      };
    }

    // Increment rate limit counter
    if (isMfaUpstash) {
      const newCount = await (redis as UpstashRedis).incr(rateLimitKey);
      if (newCount === 1) {
        await (redis as UpstashRedis).expire(rateLimitKey, MFA_RATE_LIMIT_TTL);
      }
    } else {
      const newCount = await (redis as Redis).incr(rateLimitKey);
      if (newCount === 1) {
        await (redis as Redis).expire(rateLimitKey, MFA_RATE_LIMIT_TTL);
      }
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code data
    const codeData: MFACodeData = {
      code,
      phoneNumber,
      createdAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3, // Allow 3 verification attempts per code
    };

    const key = getMFACodeKey(phoneNumber);
    const value = JSON.stringify(codeData);

    if (isMfaUpstash) {
      await (redis as UpstashRedis).setex(key, MFA_CODE_TTL, value);
    } else {
      await (redis as Redis).setex(key, MFA_CODE_TTL, value);
    }

    return { success: true, code };
  } catch (error) {
    const { logger } = await import('@/lib/logging/logger');
    logger.apiError('Failed to store MFA code', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify MFA code against stored code
 */
async function verifyStoredCode(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const redis = getMFARedisClient();

  if (!redis) {
    return {
      success: false,
      error: 'Redis not configured for MFA code verification',
    };
  }

  try {
    const key = getMFACodeKey(phoneNumber);

    // Get stored code data
    const storedValue = isMfaUpstash
      ? await (redis as UpstashRedis).get(key)
      : await (redis as Redis).get(key);

    if (!storedValue) {
      return {
        success: false,
        error: 'Code expired or not found. Please request a new code.',
      };
    }

    const codeData: MFACodeData = JSON.parse(String(storedValue));

    // Check if max attempts exceeded
    if (codeData.attempts >= codeData.maxAttempts) {
      // Delete the code to prevent further attempts
      if (isMfaUpstash) {
        await (redis as UpstashRedis).del(key);
      } else {
        await (redis as Redis).del(key);
      }

      return {
        success: false,
        error: 'Too many failed attempts. Please request a new code.',
      };
    }

    // Verify code
    if (codeData.code === code) {
      // Success - delete the code so it can only be used once
      if (isMfaUpstash) {
        await (redis as UpstashRedis).del(key);
      } else {
        await (redis as Redis).del(key);
      }

      return { success: true };
    } else {
      // Increment attempts
      codeData.attempts += 1;
      const updatedValue = JSON.stringify(codeData);

      // Get remaining TTL
      let ttl = MFA_CODE_TTL;
      if (isMfaUpstash) {
        const remainingTtl = await (redis as UpstashRedis).ttl(key);
        ttl = remainingTtl > 0 ? remainingTtl : MFA_CODE_TTL;
        await (redis as UpstashRedis).setex(key, ttl, updatedValue);
      } else {
        const remainingTtl = await (redis as Redis).ttl(key);
        ttl = remainingTtl > 0 ? remainingTtl : MFA_CODE_TTL;
        await (redis as Redis).setex(key, ttl, updatedValue);
      }

      const remainingAttempts = codeData.maxAttempts - codeData.attempts;
      return {
        success: false,
        error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
      };
    }
  } catch (error) {
    const { logger } = await import('@/lib/logging/logger');
    logger.apiError('Failed to verify MFA code', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Twilio client type (from @twilio/voice-sdk, but we use REST API)
type TwilioClient = {
  messages: {
    create: (options: unknown) => Promise<{ sid: string }>;
  };
  verify: {
    services: (serviceSid: string) => {
      verifications: {
        create: (options: {
          to: string;
          channel: 'sms' | 'call';
        }) => Promise<{ sid: string }>;
      };
      verificationChecks: {
        create: (options: {
          to: string;
          code: string;
        }) => Promise<{ status: string }>;
      };
    };
  };
};

class TwilioService {
  private config: TwilioConfig | null = null;
  private client: TwilioClient | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      try {
        // Dynamic import to avoid requiring Twilio in development
        const twilio = await import('twilio');
        this.config = {
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
          phoneNumber: process.env.TWILIO_PHONE_NUMBER,
          verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
        };
        this.client = twilio.default(
          this.config.accountSid,
          this.config.authToken
        ) as unknown as TwilioClient;
      } catch (error) {
        const { logger } = await import('@/lib/logging/logger');
        logger.warn('Twilio not available', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(
    to: string,
    message: string
  ): Promise<{ success: boolean; sid?: string; error?: string }> {
    if (!this.client || !this.config) {
      return {
        success: false,
        error: 'Twilio not configured. Check environment variables.',
      };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        to,
        from: this.config.phoneNumber,
      });

      return {
        success: true,
        sid: result.sid,
      };
    } catch (error) {
      const { logger } = await import('@/lib/logging/logger');
      logger.apiError('Twilio SMS error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send MFA/TOTP verification code via SMS
   */
  async sendMFACode(
    phoneNumber: string
  ): Promise<{ success: boolean; sid?: string; error?: string }> {
    if (!this.client || !this.config) {
      return {
        success: false,
        error: 'Twilio not configured',
      };
    }

    // Use Twilio Verify service if available (more secure)
    if (this.config.verifyServiceSid) {
      try {
        const result = await this.client.verify
          .services(this.config.verifyServiceSid)
          .verifications.create({
            to: phoneNumber,
            channel: 'sms',
          });

        return {
          success: true,
          sid: result.sid,
        };
      } catch (error) {
        const { logger } = await import('@/lib/logging/logger');
        logger.apiError('Twilio Verify error', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // Fallback: Generate code manually and store in Redis
    const codeResult = await generateAndStoreCode(phoneNumber);

    if (!codeResult.success || !codeResult.code) {
      return {
        success: false,
        error: codeResult.error || 'Failed to generate verification code',
      };
    }

    const message = `Your Engify.ai verification code is: ${codeResult.code}. Valid for 10 minutes.`;
    const smsResult = await this.sendSMS(phoneNumber, message);

    if (smsResult.success) {
      return {
        success: true,
        sid: smsResult.sid,
      };
    }

    return smsResult;
  }

  /**
   * Verify MFA code
   */
  async verifyMFACode(
    phoneNumber: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.client || !this.config) {
      return {
        success: false,
        error: 'Twilio not configured',
      };
    }

    // Use Twilio Verify service if available
    if (this.config.verifyServiceSid) {
      try {
        const result = await this.client.verify
          .services(this.config.verifyServiceSid)
          .verificationChecks.create({ to: phoneNumber, code });

        return {
          success: result.status === 'approved',
          error:
            result.status !== 'approved'
              ? 'Invalid or expired code'
              : undefined,
        };
      } catch (error) {
        const { logger } = await import('@/lib/logging/logger');
        logger.apiError('Twilio Verify check error', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // Fallback: Verify against stored code in Redis
    return await verifyStoredCode(phoneNumber, code);
  }

  /**
   * Send welcome SMS
   */
  async sendWelcomeSMS(
    phoneNumber: string,
    userName: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Welcome to Engify.ai, ${userName}! Your AI-powered prompt engineering platform is ready. Get started at https://engify.ai`;
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send notification SMS
   */
  async sendNotificationSMS(
    phoneNumber: string,
    notificationText: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Engify.ai: ${notificationText}`;
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Check if Twilio is configured
   */
  isConfigured(): boolean {
    return this.client !== null && this.config !== null;
  }
}

export const twilioService = new TwilioService();
