/**
 * Access Request API Route
 *
 * Handles beta access requests with tracking data
 * Stores requests in MongoDB for review and resume tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/logger';
import { getMongoDb } from '@/lib/db/mongodb';
import { sendEmail } from '@/lib/services/emailService';
import { auditLog } from '@/lib/logging/audit';
import { checkRateLimit } from '@/lib/rate-limit';

const accessRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  company: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  useCase: z.string().max(1000).optional(),
  // Tracking fields (for resume A/B testing)
  ref: z.string().max(200).optional(), // Company identifier
  version: z.string().max(50).optional(), // Resume version
  source: z.string().max(200).optional(), // Source identifier
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  // Rate limiting
  const ipAddress = 
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  
  const rateLimitResult = await checkRateLimit(ipAddress, 'anonymous');
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: rateLimitResult.reason || 'Rate limit exceeded. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
        },
      }
    );
  }

  try {
    const body = await req.json();

    // Validate input
    const result = accessRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = result.data;
    const db = await getMongoDb();
    const collection = db.collection('access_requests');

    // Check if email already requested access
    // SECURITY: access_requests is NOT a multi-tenant collection
    // It's user-scoped (each request is identified by email, not organizationId)
    // This query is intentionally user-scoped, not organization-scoped
    const existing = await collection.findOne({ email: data.email });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You already have a pending access request. We'll get back to you soon!",
        },
        { status: 400 }
      );
    }

    // Store access request with tracking data
    const request = {
      ...data,
      status: 'pending',
      requestedAt: new Date(),
      // Extract IP address for additional tracking
      ipAddress:
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    };

    await collection.insertOne(request);

    // Send confirmation email to requester
    try {
      await sendEmail({
        to: data.email,
        subject: 'Beta Access Request Received - Engify.ai',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Thanks for your interest in Engify.ai!</h2>
            <p>Hi ${data.name},</p>
            <p>We've received your beta access request and will review it within 24 hours.</p>
            <p>You'll receive an email once your access is activated.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">
              This is an automated confirmation. We'll be in touch soon!
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      // Log but don't fail the request
      logger.error('Failed to send confirmation email', {
        email: data.email,
        error:
          emailError instanceof Error ? emailError.message : String(emailError),
      });
    }

    // Send notification email to admin (you)
    const adminEmail =
      process.env.ADMIN_EMAIL ||
      process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
      'donlaur@engify.ai';
    try {
      const trackingInfo = [
        data.ref && `Company/Ref: ${data.ref}`,
        data.version && `Resume Version: ${data.version}`,
        data.source && `Source: ${data.source}`,
        data.utm_campaign && `Campaign: ${data.utm_campaign}`,
      ]
        .filter(Boolean)
        .join('\n');

      await sendEmail({
        to: adminEmail,
        subject: `New Beta Access Request - ${data.name}${data.company ? ` from ${data.company}` : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>New Beta Access Request</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
            ${data.role ? `<p><strong>Role:</strong> ${data.role}</p>` : ''}
            ${data.useCase ? `<p><strong>Use Case:</strong> ${data.useCase}</p>` : ''}
            ${trackingInfo ? `<hr /><pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${trackingInfo}</pre>` : ''}
            <p style="margin-top: 20px;">
              <a href="${process.env.NEXTAUTH_URL || 'https://engify.ai'}/opshub/access-requests" 
                 style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                Review Request
              </a>
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      // Log but don't fail
      logger.error('Failed to send admin notification', {
        adminEmail,
        error:
          emailError instanceof Error ? emailError.message : String(emailError),
      });
    }

    // Audit log
    await auditLog({
      action: 'beta_access_requested',
      severity: 'info',
      details: {
        email: data.email,
        company: data.company,
        role: data.role,
        ref: data.ref,
        version: data.version,
        source: data.source,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Access request received. We'll review and get back to you within 24 hours.",
    });
  } catch (error) {
    logger.apiError('/api/access-request', error, {
      method: 'POST',
    });

    // Audit log failure
    await auditLog({
      action: 'beta_access_request_failed',
      severity: 'warning',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }).catch(() => {
      // Ignore audit log errors
    });

    return NextResponse.json(
      {
        success: false,
        error:
          'Failed to process access request. Please try again or contact support.',
      },
      { status: 500 }
    );
  }
}
