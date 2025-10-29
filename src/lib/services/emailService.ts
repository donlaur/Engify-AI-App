import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    const msg = {
      to: emailData.to,
      from: emailData.from || 'donlaur@engify.ai',
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      templateId: emailData.templateId,
      dynamicTemplateData: emailData.dynamicTemplateData,
    };

    const response = await sgMail.send(msg);
    
    if (response.length === 0 || !response[0]?.headers) {
      throw new Error('Invalid response from SendGrid');
    }
    
    return {
      success: true,
      messageId: response[0].headers['x-message-id'] as string,
    };
  } catch (error) {
    console.error('SendGrid error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a welcome email to new users
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<EmailResponse> {
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
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  resetToken: string,
  userName: string
): Promise<EmailResponse> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
  
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
