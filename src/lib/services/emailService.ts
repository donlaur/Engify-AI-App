import sgMail from '@sendgrid/mail';
import {
  SendGridTemplateBuilders,
  type ApiKeyAlertTemplateData,
} from '@/lib/email/templates';

function resolveSendGridApiKey(): string | undefined {
  return (
    process.env.SENDGRID_API_KEY ||
    process.env.SENDGRID_API ||
    process.env.ID_API
  );
}

// Initialize SendGrid
// Support both SENDGRID_API and legacy ID_API variable for flexibility
const sendGridApiKey = resolveSendGridApiKey();
if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}

export interface EmailData {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a simple email using SendGrid
 */
export async function sendEmail(emailData: EmailData): Promise<EmailResponse> {
  try {
    const sendGridApiKey = resolveSendGridApiKey();
    if (!sendGridApiKey) {
      throw new Error(
        'SendGrid API key not configured. Set SENDGRID_API_KEY or SENDGRID_API environment variable.'
      );
    }

    // Build message conforming to SendGrid union types:
    // If templateId is provided, SendGrid doesn't require content.
    // Otherwise, ensure at least html is provided.
    let msg: Parameters<typeof sgMail.send>[0];
    if (emailData.templateId) {
      msg = {
        to: emailData.to,
        from: emailData.from || 'donlaur@engify.ai',
        subject: emailData.subject || 'Engify.ai Notification',
        templateId: emailData.templateId,
        dynamicTemplateData: emailData.dynamicTemplateData,
      } as Parameters<typeof sgMail.send>[0];
    } else {
      msg = {
        to: emailData.to,
        from: emailData.from || 'donlaur@engify.ai',
        subject: emailData.subject || 'Engify.ai Notification',
        html:
          emailData.html ??
          (emailData.text ? `<pre>${emailData.text}</pre>` : ' '),
      } as Parameters<typeof sgMail.send>[0];
    }

    const [response] = await sgMail.send(msg);

    if (!response?.headers) {
      throw new Error('Invalid response from SendGrid');
    }

    return {
      success: true,
      messageId: (response.headers['x-message-id'] as string) || undefined,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('SendGrid error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a welcome email to new users using SendGrid template
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  useTemplate = true
): Promise<EmailResponse> {
  if (useTemplate && process.env.SENDGRID_WELCOME_TEMPLATE_ID) {
    const template = SendGridTemplateBuilders.welcome({
      userName,
      userEmail,
      loginUrl: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/login`,
      libraryUrl: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/library`,
      workbenchUrl: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/workbench`,
      supportUrl: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/contact`,
    });

    if (template) {
      return sendEmail({
        to: userEmail,
        subject: 'Welcome to Engify.ai! 🚀',
        templateId: template.templateId,
        dynamicTemplateData: template.dynamicTemplateData,
      });
    }
  }

  // Fallback to HTML email if template not configured
  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Engify.ai! 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Welcome to Engify.ai, ${userName}!</h1>
        <p>Thank you for joining our AI-powered prompt engineering platform.</p>
        
        <h2>What you can do:</h2>
        <ul>
          <li>📚 Browse our library of 100+ expert prompts</li>
          <li>🎯 Learn 15 proven prompt patterns</li>
          <li>🤖 Use our AI workbenches for OKRs, retrospectives, and tech debt</li>
          <li>💬 Chat with our RAG-powered AI assistant</li>
        </ul>
        
        <div style="margin: 30px 0;">
          <a href="https://engify.ai/library" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Explore Prompt Library
          </a>
        </div>
        
        <p>Happy prompting!</p>
        <p>The Engify.ai Team</p>
      </div>
    `,
  });
}

/**
 * Send a prompt sharing email
 */
export async function sendPromptEmail(
  recipientEmail: string,
  senderName: string,
  promptTitle: string,
  promptContent: string,
  promptUrl: string
): Promise<EmailResponse> {
  return sendEmail({
    to: recipientEmail,
    subject: `${senderName} shared a prompt with you: ${promptTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">${senderName} shared a prompt with you!</h1>
        
        <h2>${promptTitle}</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <pre style="white-space: pre-wrap; font-family: monospace;">${promptContent}</pre>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${promptUrl}" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Full Prompt
          </a>
        </div>
        
        <p>This prompt was shared from <a href="https://engify.ai">Engify.ai</a></p>
      </div>
    `,
  });
}

/**
 * Send a contact form email
 */
export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<EmailResponse> {
  return sendEmail({
    to: 'donlaur@engify.ai',
    subject: `Contact Form: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">New Contact Form Submission</h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <p>Reply directly to: <a href="mailto:${email}">${email}</a></p>
      </div>
    `,
  });
}

/**
 * Send a password reset email using SendGrid template
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  resetToken: string,
  userName: string,
  useTemplate = true
): Promise<EmailResponse> {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/auth/reset-password?token=${resetToken}`;

  if (useTemplate && process.env.SENDGRID_PASSWORD_RESET_TEMPLATE_ID) {
    const template = SendGridTemplateBuilders.passwordReset({
      userName,
      resetUrl,
      expirationMinutes: 60,
      supportUrl: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/contact`,
    });

    if (template) {
      return sendEmail({
        to: userEmail,
        subject: 'Reset your Engify.ai password',
        templateId: template.templateId,
        dynamicTemplateData: template.dynamicTemplateData,
      });
    }
  }

  // Fallback to HTML email
  return sendEmail({
    to: userEmail,
    subject: 'Reset your Engify.ai password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Password Reset Request</h1>
        
        <p>Hi ${userName},</p>
        <p>You requested a password reset for your Engify.ai account.</p>
        
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </div>
        
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        
        <p>Best regards,<br>The Engify.ai Team</p>
      </div>
    `,
  });
}

/**
 * Send API key usage alert email using SendGrid template
 */
export async function sendApiKeyAlertEmail(
  userEmail: string,
  alertData: ApiKeyAlertTemplateData,
  useTemplate = true
): Promise<EmailResponse> {
  if (useTemplate && process.env.SENDGRID_API_KEY_ALERT_TEMPLATE_ID) {
    const template = SendGridTemplateBuilders.apiKeyAlert(alertData);
    if (template) {
      return sendEmail({
        to: userEmail,
        subject: `API Key Alert: ${alertData.metric} threshold exceeded`,
        templateId: template.templateId,
        dynamicTemplateData: template.dynamicTemplateData,
      });
    }
  }

  // Fallback to HTML email
  return sendEmail({
    to: userEmail,
    subject: `API Key Alert: ${alertData.metric} threshold exceeded`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">API Key Usage Alert</h1>
        
        <p>Hi ${alertData.userName},</p>
        <p>Your API key <strong>${alertData.keyName}</strong> (${alertData.provider}) has exceeded the ${alertData.metric} threshold.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Current ${alertData.metric}:</strong> ${alertData.currentValue.toLocaleString()}</p>
          <p><strong>Threshold:</strong> ${alertData.threshold.toLocaleString()}</p>
          <p><strong>Period:</strong> ${alertData.period}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${alertData.dashboardUrl}" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Usage Dashboard
          </a>
        </div>
        
        <p>Best regards,<br>The Engify.ai Team</p>
      </div>
    `,
  });
}
