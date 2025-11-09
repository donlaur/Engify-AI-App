import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

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

    // MVP: Use hardcoded user ID to match MCP token
    // TODO: Implement proper session/auth for production
    const finalUserId = '68ffe3d1e4cf6420d1fdc474';

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

    // MVP: Use hardcoded user ID to match MCP token
    // TODO: Implement proper session/auth for production
    const userId = '68ffe3d1e4cf6420d1fdc474';

    // Connect to database
    const db = await getDb();
    
    // Build query - always filter by user ID for MVP
    const query: any = { userId };
    if (status) {
      query.status = status;
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
