/**
 * SendGrid Service for Email
 */

import sgMail from '@sendgrid/mail';

export class SendGridService {
  private fromEmail: string;
  
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@engify.ai';
  }
  
  /**
   * Send email verification code
   */
  async sendVerificationEmail(to: string, code: string): Promise<void> {
    await sgMail.send({
      to,
      from: this.fromEmail,
      subject: 'Verify Your Email - Engify.ai',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Verify Your Email</h1>
          <p>Your verification code is:</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center;">
            <h2 style="color: #1F2937; letter-spacing: 4px; margin: 0;">${code}</h2>
          </div>
          <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
            This code expires in 10 minutes.
          </p>
        </div>
      `,
    });
  }
  
  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await sgMail.send({
      to,
      from: this.fromEmail,
      subject: 'Welcome to Engify.ai!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Welcome to Engify.ai, ${name}!</h1>
          <p>We're excited to have you on board.</p>
          <p>Get started by exploring our AI workbench and learning paths.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/workbench" 
             style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Go to Workbench
          </a>
        </div>
      `,
    });
  }
  
  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    await sgMail.send({
      to,
      from: this.fromEmail,
      subject: 'Reset Your Password - Engify.ai',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Reset Your Password</h1>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Reset Password
          </a>
          <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
            This link expires in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });
  }
  
  /**
   * Send team invitation email
   */
  async sendTeamInvitation(
    to: string,
    organizationName: string,
    inviterName: string,
    inviteToken: string
  ): Promise<void> {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${inviteToken}`;
    
    await sgMail.send({
      to,
      from: this.fromEmail,
      subject: `You've been invited to join ${organizationName} on Engify.ai`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Team Invitation</h1>
          <p>${inviterName} has invited you to join <strong>${organizationName}</strong> on Engify.ai.</p>
          <a href="${inviteUrl}" 
             style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Accept Invitation
          </a>
          <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
            This invitation expires in 7 days.
          </p>
        </div>
      `,
    });
  }
}
