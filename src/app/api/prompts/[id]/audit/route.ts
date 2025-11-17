/**
 * API Route: Get/Create Audit Scores for a Prompt
 * GET: Returns the latest audit scores
 * POST: Triggers a new audit and saves results
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';

// Audit tool version - must match the version in audit-prompts-patterns.ts
const AUDIT_TOOL_VERSION = '1.1';

// Dynamic import using webpack alias configured in next.config.js
async function getAuditor() {
  try {
    // Use the webpack alias configured in next.config.js
    // @ts-expect-error - Dynamic import may not exist at build time
    const auditModule = await import(
      /* webpackIgnore: true */
      '@/scripts/content/audit-prompts-patterns'
    );
    return auditModule.PromptPatternAuditor;
  } catch (error) {
    console.error('Error importing auditor:', error);
    throw new Error(`Failed to import audit module: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getMongoDb();
    const { id } = await params;
    
    // Find prompt by id or slug
    const prompt = await db.collection('prompts').findOne({
      $or: [
        { id },
        { slug: id },
        ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : []),
      ],
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Check for audit results in a dedicated collection
    const auditResult = await db.collection('prompt_audit_results').findOne({
      promptId: prompt.id || prompt.slug || prompt._id.toString(),
    }, {
      sort: { auditVersion: -1 } // Get latest version
    });

    if (!auditResult) {
      return NextResponse.json({
        hasAudit: false,
        promptId: prompt.id || prompt.slug,
      });
    }

    return NextResponse.json({
      hasAudit: true,
      promptId: prompt.id || prompt.slug,
      auditResult: {
        auditVersion: auditResult.auditVersion,
        auditDate: auditResult.auditDate,
        auditToolVersion: auditResult.auditToolVersion,
        auditType: auditResult.auditType,
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const db = await getMongoDb();
    const { id } = await params;
    
    // Find prompt
    const prompt = await db.collection('prompts').findOne({
      $or: [
        { id },
        { slug: id },
        ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : []),
      ],
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Run audit
    const AuditorClass = await getAuditor();
    // API route defaults to full audit (can be extended to accept quick mode via query param)
    const quickMode = new URL(request.url).searchParams.get('quick') === 'true';
    const auditor = new AuditorClass('system', { quickMode });
    const auditResult = await auditor.auditPrompt(prompt);

    // Get existing audit to determine audit count (not prompt revision)
    const existingAudit = await db.collection('prompt_audit_results').findOne(
      { promptId: prompt.id || prompt.slug || prompt._id.toString() },
      { sort: { auditVersion: -1 } }
    );

    // Calculate audit version (audit count - can be multiple audits per prompt revision)
    // This tracks how many times we've audited this prompt (not prompt content changes)
    const auditVersion = existingAudit ? (existingAudit.auditVersion || 0) + 1 : 1;
    const auditDate = new Date();
    const promptRevision = prompt.currentRevision || 1;
    
    // Determine audit type based on mode
    const auditType = quickMode ? 'quick' : 'full';

    // Save audit result to database
    // Note: This is just an audit record, NOT a prompt content update
    await db.collection('prompt_audit_results').insertOne({
      promptId: prompt.id || prompt.slug || prompt._id.toString(),
      promptTitle: prompt.title,
      promptRevision: promptRevision, // Track which prompt revision this audit is for
      auditVersion, // Audit count (how many times we've audited)
      auditDate,
      auditToolVersion: AUDIT_TOOL_VERSION, // Version of audit tool used (e.g., "1.1")
      auditType, // 'quick' or 'full' - indicates which audit mode was used
      overallScore: auditResult.overallScore,
      categoryScores: auditResult.categoryScores,
      agentReviews: auditResult.agentReviews,
      issues: auditResult.issues,
      recommendations: auditResult.recommendations,
      missingElements: auditResult.missingElements,
      needsFix: auditResult.needsFix,
      auditedAt: auditDate,
      auditedBy: session?.user?.id || 'system',
      createdAt: auditDate,
      updatedAt: auditDate,
    });

    return NextResponse.json({
      success: true,
      auditResult: {
        auditVersion,
        auditDate,
        overallScore: auditResult.overallScore,
        categoryScores: auditResult.categoryScores,
        issues: auditResult.issues,
        recommendations: auditResult.recommendations,
        missingElements: auditResult.missingElements,
      },
    });
  } catch (error) {
    console.error('Error running audit:', error);
    return NextResponse.json(
      { error: 'Failed to run audit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


