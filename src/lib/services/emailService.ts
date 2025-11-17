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

  // Determine alert severity and color
  const percentage = alertData.percentage || 100;
  const thresholdLevel = alertData.thresholdLevel || 100;
  const severityConfig = {
    50: { color: '#f59e0b', bg: '#fef3c7', label: 'Warning', icon: '⚠️' },
    80: { color: '#f97316', bg: '#fed7aa', label: 'High', icon: '🔶' },
    90: { color: '#ef4444', bg: '#fecaca', label: 'Critical', icon: '🔴' },
    100: { color: '#dc2626', bg: '#fef2f2', label: 'Exceeded', icon: '🚨' },
  }[thresholdLevel] || { color: '#dc2626', bg: '#fef2f2', label: 'Alert', icon: '⚠️' };

  // Format values based on metric type
  const formatValue = (value: number, metric: string) => {
    if (metric === 'cost') {
      return `$${value.toFixed(2)}`;
    }
    return value.toLocaleString();
  };

  // Generate progress bar
  const progressPercentage = Math.min(percentage, 100);
  const progressColor =
    progressPercentage >= 90
      ? '#dc2626'
      : progressPercentage >= 80
        ? '#f97316'
        : progressPercentage >= 50
          ? '#f59e0b'
          : '#10b981';

  // Recommended actions based on threshold
  const recommendedAction =
    alertData.recommendedAction ||
    (thresholdLevel === 100
      ? 'Your API key has exceeded its quota. Consider upgrading your plan or reviewing your usage.'
      : thresholdLevel >= 90
        ? 'You are approaching your quota limit. Monitor usage closely.'
        : 'Your usage is increasing. Keep an eye on your consumption.');

  // Fallback to HTML email with enhanced design
  return sendEmail({
    to: userEmail,
    subject: `${severityConfig.icon} API Key Alert: ${thresholdLevel}% ${alertData.metric} threshold reached`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
              ${severityConfig.icon} API Usage Alert
            </h1>
            <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 14px;">
              ${severityConfig.label} - ${thresholdLevel}% threshold reached
            </p>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-top: 0;">
              Hi <strong>${alertData.userName}</strong>,
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.5;">
              Your API key <strong>${alertData.keyName}</strong> (${alertData.provider.toUpperCase()}) has reached the <strong>${thresholdLevel}%</strong> ${alertData.metric} threshold.
            </p>

            <!-- Alert Box -->
            <div style="background: ${severityConfig.bg}; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${severityConfig.color};">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">Current ${alertData.metric}:</td>
                  <td style="padding: 8px 0; color: ${severityConfig.color}; font-weight: 700; text-align: right; font-size: 18px;">
                    ${formatValue(alertData.currentValue, alertData.metric)}
                  </td>
                </tr>
                ${alertData.quota ? `
                <tr>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">Quota:</td>
                  <td style="padding: 8px 0; color: #1f2937; text-align: right; font-size: 16px;">
                    ${formatValue(alertData.quota, alertData.metric)}
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">Threshold:</td>
                  <td style="padding: 8px 0; color: #1f2937; text-align: right;">
                    ${formatValue(alertData.threshold, alertData.metric)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">Period:</td>
                  <td style="padding: 8px 0; color: #1f2937; text-align: right; text-transform: capitalize;">
                    ${alertData.period}
                  </td>
                </tr>
              </table>

              <!-- Progress Bar -->
              <div style="margin-top: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6b7280; font-size: 12px; font-weight: 600;">Usage</span>
                  <span style="color: ${progressColor}; font-size: 14px; font-weight: 700;">${progressPercentage}%</span>
                </div>
                <div style="background: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden;">
                  <div style="background: ${progressColor}; width: ${progressPercentage}%; height: 100%; border-radius: 6px; transition: width 0.3s ease;"></div>
                </div>
              </div>
            </div>

            <!-- Recommended Action -->
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #4b5563; font-size: 14px;">
                <strong>💡 Recommended Action:</strong><br>
                ${recommendedAction}
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${alertData.dashboardUrl}"
                 style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);">
                View Usage Dashboard →
              </a>
            </div>

            <!-- Footer Info -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
                You're receiving this alert because you've enabled API usage notifications. You can manage your notification preferences in your <a href="${alertData.dashboardUrl}" style="color: #7c3aed; text-decoration: none;">dashboard settings</a>.
              </p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 0; margin-top: 20px;">
              Best regards,<br>
              <strong>The Engify.ai Team</strong>
            </p>
          </div>

          <!-- Email Footer -->
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">
              <a href="https://engify.ai" style="color: #7c3aed; text-decoration: none;">Engify.ai</a> |
              <a href="${alertData.dashboardUrl}" style="color: #7c3aed; text-decoration: none;">Dashboard</a> |
              <a href="https://engify.ai/contact" style="color: #7c3aed; text-decoration: none;">Support</a>
            </p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Engify.ai. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
