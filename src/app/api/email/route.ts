import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomeEmail,
  sendPromptEmail,
  sendContactEmail,
  sendPasswordResetEmail,
} from '@/lib/services/emailService';
import { logger } from '@/lib/logging/logger';
import { RBACPresets } from '@/lib/middleware/rbac';
import { z } from 'zod';

/**
 * Send welcome email to new users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const BaseSchema = z.object({
      action: z.enum(['welcome', 'share-prompt', 'contact', 'password-reset']),
    });

    const WelcomeSchema = BaseSchema.extend({
      action: z.literal('welcome'),
      userEmail: z.string().email(),
      userName: z.string().min(1),
    });

    const ShareSchema = BaseSchema.extend({
      action: z.literal('share-prompt'),
      recipientEmail: z.string().email(),
      senderName: z.string().min(1),
      promptTitle: z.string().min(1),
      promptContent: z.string().min(1),
      promptUrl: z.string().url().optional(),
    });

    const ContactSchema = BaseSchema.extend({
      action: z.literal('contact'),
      name: z.string().min(1),
      email: z.string().email(),
      subject: z.string().min(1),
      message: z.string().min(1),
    });

    const PasswordResetSchema = BaseSchema.extend({
      action: z.literal('password-reset'),
      userEmail: z.string().email(),
      resetToken: z.string().min(10),
      userName: z.string().min(1),
    });

    const ParsedUnion = z
      .discriminatedUnion('action', [
        WelcomeSchema,
        ShareSchema,
        ContactSchema,
        PasswordResetSchema,
      ])
      .safeParse(body);

    if (!ParsedUnion.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: ParsedUnion.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = ParsedUnion.data;
    const { action } = data;

    switch (action) {
      case 'welcome':
        // Welcome emails are typically internal - but allow with auth or rate-limit in future
        const welcomeResult = await sendWelcomeEmail(
          data.userEmail,
          data.userName
        );
        return NextResponse.json(welcomeResult);

      case 'share-prompt':
        // Sharing prompts requires authentication
        const shareRbacCheck = await RBACPresets.requireUserWrite()(request);
        if (shareRbacCheck) return shareRbacCheck;
        const shareResult = await sendPromptEmail(
          data.recipientEmail,
          data.senderName,
          data.promptTitle,
          data.promptContent,
          data.promptUrl || 'https://engify.ai/library'
        );
        return NextResponse.json(shareResult);

      case 'contact':
        const contactResult = await sendContactEmail(
          data.name,
          data.email,
          data.subject,
          data.message
        );
        return NextResponse.json(contactResult);

      case 'password-reset':
        const resetResult = await sendPasswordResetEmail(
          data.userEmail,
          data.resetToken,
          data.userName
        );
        return NextResponse.json(resetResult);

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              'Invalid action. Supported actions: welcome, share-prompt, contact, password-reset',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.apiError('/api/email', error, { method: 'POST' });
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
