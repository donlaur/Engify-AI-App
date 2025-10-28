/**
 * Twilio Service for SMS-based MFA
 */

import twilio from 'twilio';

export class TwilioService {
  private client: twilio.Twilio;
  private verifyServiceSid: string;
  private fromNumber: string;
  
  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured');
    }
    
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || '';
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
  }
  
  /**
   * Send SMS verification code
   */
  async sendVerificationCode(phoneNumber: string): Promise<void> {
    if (!this.verifyServiceSid) {
      throw new Error('Twilio Verify Service not configured');
    }
    
    await this.client.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
      });
  }
  
  /**
   * Verify SMS code
   */
  async verifyCode(phoneNumber: string, code: string): Promise<boolean> {
    if (!this.verifyServiceSid) {
      throw new Error('Twilio Verify Service not configured');
    }
    
    const verification = await this.client.verify.v2
      .services(this.verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code,
      });
    
    return verification.status === 'approved';
  }
  
  /**
   * Send SMS message (for notifications)
   */
  async sendSMS(to: string, message: string): Promise<void> {
    if (!this.fromNumber) {
      throw new Error('Twilio phone number not configured');
    }
    
    await this.client.messages.create({
      body: message,
      from: this.fromNumber,
      to,
    });
  }
}
