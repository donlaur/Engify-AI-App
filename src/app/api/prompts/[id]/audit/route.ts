/**
 * API Route: Get/Create Audit Scores for a Prompt
 * GET: Returns the latest audit scores
 * POST: Triggers a new audit and saves results
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { auth } from '@/lib/auth';

// Dynamic import using webpack alias configured in next.config.js
async function getAuditor() {
  try {
    // Use the webpack alias configured in next.config.js
    const auditModule = await import('@/scripts/content/audit-prompts-patterns');
    return auditModule.PromptPatternAuditor;
  } catch (error) {
    console.error('Error importing auditor:', error);
    throw new Error(`Failed to import audit module: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const db = await getMongoDb();
    
    // Find prompt by id or slug
    const prompt = await db.collection('prompts').findOne({
      $or: [
        { id: params.id },
        { slug: params.id },
        { _id: params.id },
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
    })
    .sort({ auditedAt: -1 });

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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const db = await getMongoDb();
    
    // Find prompt
    const prompt = await db.collection('prompts').findOne({
      $or: [
        { id: params.id },
        { slug: params.id },
        { _id: params.id },
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
    const auditor = new AuditorClass('system');
    const auditResult = await auditor.auditPrompt(prompt);

    // Save audit result to database
    await db.collection('prompt_audit_results').updateOne(
      { promptId: prompt.id || prompt.slug || prompt._id.toString() },
      {
        $set: {
          promptId: prompt.id || prompt.slug || prompt._id.toString(),
          promptTitle: prompt.title,
          overallScore: auditResult.overallScore,
          categoryScores: auditResult.categoryScores,
          agentReviews: auditResult.agentReviews,
          issues: auditResult.issues,
          recommendations: auditResult.recommendations,
          missingElements: auditResult.missingElements,
          needsFix: auditResult.needsFix,
          auditedAt: new Date(),
          auditedBy: session?.user?.id || 'system',
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      auditResult: {
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


