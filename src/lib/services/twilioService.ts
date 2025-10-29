/**
 * Twilio SMS Service
 *
 * Handles SMS notifications, MFA/TOTP codes, and two-factor authentication
 */

// Twilio SDK types
interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  verifyServiceSid?: string;
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
        );
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

    // Fallback: Generate code manually (less secure)
    // In production, use Twilio Verify service
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const message = `Your Engify.ai verification code is: ${code}. Valid for 10 minutes.`;

    const smsResult = await this.sendSMS(phoneNumber, message);

    if (smsResult.success) {
      // Store code in database (TODO: implement code storage with expiration)
      // For now, this is a placeholder
      return {
        success: true,
        sid: smsResult.sid,
        // In production, store code in DB and return it to AuthService
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

    // Fallback: Verify against stored code (TODO: implement)
    // For now, this should not be used in production
    return {
      success: false,
      error:
        'Twilio Verify service not configured. Please configure TWILIO_VERIFY_SERVICE_SID.',
    };
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
