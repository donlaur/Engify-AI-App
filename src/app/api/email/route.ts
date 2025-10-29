import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendPromptEmail, sendContactEmail, sendPasswordResetEmail } from '@/lib/services/emailService';

/**
 * Send welcome email to new users
 */
export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'welcome':
        const { userEmail, userName } = data;
        if (!userEmail || !userName) {
          return NextResponse.json(
            { success: false, error: 'userEmail and userName are required' },
            { status: 400 }
          );
        }
        
        const welcomeResult = await sendWelcomeEmail(userEmail, userName);
        return NextResponse.json(welcomeResult);

      case 'share-prompt':
        const { recipientEmail, senderName, promptTitle, promptContent, promptUrl } = data;
        if (!recipientEmail || !senderName || !promptTitle || !promptContent) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for prompt sharing' },
            { status: 400 }
          );
        }
        
        const shareResult = await sendPromptEmail(
          recipientEmail,
          senderName,
          promptTitle,
          promptContent,
          promptUrl || 'https://engify.ai/library'
        );
        return NextResponse.json(shareResult);

      case 'contact':
        const { name, email, subject, message } = data;
        if (!name || !email || !subject || !message) {
          return NextResponse.json(
            { success: false, error: 'All contact form fields are required' },
            { status: 400 }
          );
        }
        
        const contactResult = await sendContactEmail(name, email, subject, message);
        return NextResponse.json(contactResult);

      case 'password-reset':
        const { userEmail: resetEmail, resetToken, userName: resetUserName } = data;
        if (!resetEmail || !resetToken || !resetUserName) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for password reset' },
            { status: 400 }
          );
        }
        
        const resetResult = await sendPasswordResetEmail(resetEmail, resetToken, resetUserName);
        return NextResponse.json(resetResult);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Supported actions: welcome, share-prompt, contact, password-reset' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    service: 'email-service',
    status: 'healthy',
    sendgridConfigured: !!process.env.SENDGRID_API_KEY,
  });
}
