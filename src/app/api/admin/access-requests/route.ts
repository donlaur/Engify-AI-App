/**
 * Admin API for Access Requests
 *
 * GET - List all access requests
 * PATCH - Update request status (approve/reject/delete spam)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { sendEmail } from '@/lib/services/emailService';

// Helper to check admin access
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'Unauthorized', status: 401 };
  }

  const db = await getMongoDb();
  const user = await db.collection('users').findOne({ email: session.user.email });

  if (!user || !['admin', 'super_admin', 'org_admin'].includes(user.role)) {
    return { error: 'Admin access required', status: 403 };
  }

  return { user };
}

export async function GET() {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const db = await getMongoDb();
    const requests = await db.collection('access_requests')
      .find({})
      .sort({ requestedAt: -1 })
      .toArray();

    // Transform _id to string for JSON serialization
    const formatted = requests.map(r => ({
      ...r,
      _id: r._id.toString(),
    }));

    return NextResponse.json({ requests: formatted });
  } catch (error) {
    console.error('Error fetching access requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await req.json();
    const { id, status, sendApprovalEmail } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status required' },
        { status: 400 }
      );
    }

    if (!['pending', 'approved', 'rejected', 'spam'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    const request = await db.collection('access_requests').findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    await db.collection('access_requests').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          reviewedAt: new Date(),
          reviewedBy: authResult.user.email,
        }
      }
    );

    // Send approval email if requested
    if (status === 'approved' && sendApprovalEmail && request.email) {
      try {
        await sendEmail({
          to: request.email,
          subject: 'Your Engify.ai Beta Access Has Been Approved!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0070f3;">Welcome to Engify.ai Beta!</h2>
              <p>Hi ${request.name},</p>
              <p>Great news! Your beta access request has been approved.</p>
              <p>You can now:</p>
              <ul>
                <li>Sign up at <a href="https://engify.ai/signup">engify.ai/signup</a></li>
                <li>Connect your IDE using our <a href="https://engify.ai/mcp">MCP Server</a></li>
                <li>Access all beta features including memory, assess, and pattern tools</li>
              </ul>
              <p style="margin-top: 20px;">
                <a href="https://engify.ai/mcp"
                   style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Get Started
                </a>
              </p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
              <p style="color: #666; font-size: 12px;">
                Questions? Reply to this email or reach out at donlaur@engify.ai
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Don't fail the request - status is still updated
      }
    }

    return NextResponse.json({
      success: true,
      message: `Request ${status}`
    });
  } catch (error) {
    console.error('Error updating access request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID required' },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    await db.collection('access_requests').deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting access request:', error);
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}
