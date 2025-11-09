import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

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
    } = body;

    // Validate required fields
    if (!intent || !description || !pageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: intent, description, pageUrl' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDb();
    
    // Insert bug report
    const result = await db.collection('bug_reports').insertOne({
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
    });
  } catch (error) {
    console.error('Error submitting bug report:', error);
    return NextResponse.json(
      { error: 'Failed to submit bug report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    // Connect to database
    const db = await getDb();
    
    // Build query
    const query: any = {};
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
    });
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bug reports' },
      { status: 500 }
    );
  }
}
