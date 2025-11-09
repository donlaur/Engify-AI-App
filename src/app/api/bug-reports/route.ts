import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      intent,
      description,
      pageUrl,
      selector,
      elementText,
      elementSize,
      timestamp,
      userAgent,
      userId, // Optional: can be sent from extension
    } = body;

    // Validate required fields
    if (!intent || !description || !pageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: intent, description, pageUrl' },
        { status: 400 }
      );
    }

    // Get user from session or use provided userId
    let finalUserId = userId;
    if (!finalUserId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        finalUserId = session.user.id;
      }
    }

    // If still no userId, create a temporary one for demo
    if (!finalUserId) {
      finalUserId = 'demo-user-' + Math.random().toString(36).substr(2, 9);
    }

    // Connect to database
    const db = await getDb();
    
    // Insert bug report
    const result = await db.collection('bug_reports').insertOne({
      userId: finalUserId,
      intent,
      description,
      pageUrl,
      selector: selector || null,
      elementText: elementText || null,
      elementSize: elementSize || null,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || null,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      reportId: result.insertedId,
      message: 'Bug report submitted successfully',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error submitting bug report:', error);
    return NextResponse.json(
      { error: 'Failed to submit bug report' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    // Get user from session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Connect to database
    const db = await getDb();
    
    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    
    // If user is authenticated, filter by their reports
    if (userId) {
      query.userId = userId;
    }

    // Get bug reports
    const reports = await db
      .collection('bug_reports')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      reports,
      count: reports.length,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bug reports' },
      { status: 500, headers: corsHeaders }
    );
  }
}
