/**
 * API Route: Compare Two Prompt Revisions
 * Returns two revisions for side-by-side comparison
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const db = await getMongoDb();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const revision1 = searchParams.get('revision1');
    const revision2 = searchParams.get('revision2');

    if (!revision1 || !revision2) {
      return NextResponse.json(
        { error: 'Both revision1 and revision2 parameters are required' },
        { status: 400 }
      );
    }

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

    const promptId = prompt.id || prompt.slug || prompt._id.toString();

    // Get both revisions
    const [rev1, rev2] = await Promise.all([
      db.collection('prompt_revisions').findOne({
        promptId,
        revisionNumber: parseInt(revision1, 10),
      }),
      db.collection('prompt_revisions').findOne({
        promptId,
        revisionNumber: parseInt(revision2, 10),
      }),
    ]);

    if (!rev1 || !rev2) {
      return NextResponse.json(
        { error: 'One or both revisions not found' },
        { status: 404 }
      );
    }

    // Calculate differences
    const differences = calculateDifferences(rev1.snapshot, rev2.snapshot);

    return NextResponse.json({
      promptId,
      revision1: {
        revisionNumber: rev1.revisionNumber,
        createdAt: rev1.createdAt,
        changedBy: rev1.changedBy,
        changeReason: rev1.changeReason,
        snapshot: rev1.snapshot,
      },
      revision2: {
        revisionNumber: rev2.revisionNumber,
        createdAt: rev2.createdAt,
        changedBy: rev2.changedBy,
        changeReason: rev2.changeReason,
        snapshot: rev2.snapshot,
      },
      differences,
    });
  } catch (error) {
    console.error('Error comparing revisions:', error);
    return NextResponse.json(
      { error: 'Failed to compare revisions' },
      { status: 500 }
    );
  }
}

/**
 * Calculate differences between two revision snapshots
 */
function calculateDifferences(snapshot1: any, snapshot2: any) {
  const differences: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    changeType: 'created' | 'updated' | 'deleted';
  }> = [];

  const fieldsToCompare = [
    'title',
    'description',
    'content',
    'category',
    'role',
    'pattern',
    'tags',
    'caseStudies',
    'bestTimeToUse',
    'recommendedModel',
    'useCases',
    'examples',
    'bestPractices',
  ];

  fieldsToCompare.forEach((field) => {
    const val1 = snapshot1[field];
    const val2 = snapshot2[field];

    // Handle arrays
    if (Array.isArray(val1) || Array.isArray(val2)) {
      const arr1 = Array.isArray(val1) ? val1 : [];
      const arr2 = Array.isArray(val2) ? val2 : [];
      
      if (JSON.stringify(arr1.sort()) !== JSON.stringify(arr2.sort())) {
        differences.push({
          field,
          oldValue: arr1.length > 0 ? arr1 : undefined,
          newValue: arr2.length > 0 ? arr2 : undefined,
          changeType: arr1.length === 0 ? 'created' : arr2.length === 0 ? 'deleted' : 'updated',
        });
      }
      return;
    }

    // Handle primitive values
    if (val1 !== val2) {
      differences.push({
        field,
        oldValue: val1 !== undefined ? val1 : undefined,
        newValue: val2 !== undefined ? val2 : undefined,
        changeType: val1 === undefined ? 'created' : val2 === undefined ? 'deleted' : 'updated',
      });
    }
  });

  return differences;
}

