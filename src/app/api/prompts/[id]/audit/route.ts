/**
 * API Route: Get/Create Audit Scores for a Prompt
 * GET: Returns the latest audit scores
 * POST: Triggers a new audit and saves results
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
// import { auth } from '@/lib/auth'; // Disabled - audit functionality only via CLI

// Audit tool version - must match the version in audit-prompts-patterns.ts
// const AUDIT_TOOL_VERSION = '1.1'; // Disabled - only used in CLI audits

// Dynamic import disabled in production builds - audit functionality available via CLI only
// To run audits, use: npm run content:audit-prompts
// Original function removed - was: async function getAuditor() {...}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getMongoDb();
    const { id: promptId } = await params;

    if (!ObjectId.isValid(promptId)) {
      return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 });
    }

    // Fetch the latest audit result from database
    const auditResult = await db.collection('prompt_audit_results').findOne(
      { promptId },
      { sort: { auditedAt: -1 } }
    );

    if (!auditResult) {
      return NextResponse.json(
        { error: 'No audit results found for this prompt' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      audit: {
        auditVersion: auditResult.auditVersion,
        auditDate: auditResult.auditDate,
        overallScore: auditResult.overallScore,
        categoryScores: auditResult.categoryScores,
        agentReviews: auditResult.agentReviews,
        issues: auditResult.issues,
        recommendations: auditResult.recommendations,
        missingElements: auditResult.missingElements,
        needsFix: auditResult.needsFix,
        auditedAt: auditResult.auditedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching audit scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit scores' },
      { status: 500 }
    );
  }
}

export async function POST(
  _request: NextRequest,
  _params: { params: Promise<{ id: string }> }
) {
  try {
    // Audit functionality disabled in production builds
    return NextResponse.json({
      error: 'Audit functionality is only available via CLI',
      message: 'To run prompt audits, use: npm run content:audit-prompts',
      cli_command: 'npm run content:audit-prompts',
    }, { status: 501 }); // 501 Not Implemented

    /* Original code disabled for production builds:
    const session = await auth();
    const db = await getMongoDb();
    const { id } = await params;

    const prompt = await db.collection('prompts').findOne({...});
    if (!prompt) {...}

    // Run audit with AuditorClass
    // Save results to database
    // Return audit results
    */
  } catch (error) {
    console.error('Error running audit:', error);
    return NextResponse.json(
      { error: 'Failed to run audit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
