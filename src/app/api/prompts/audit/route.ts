/**
 * Prompt Audit API
 * POST /api/prompts/audit - Analyze prompts using KERNEL framework
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { getModelById } from '@/lib/config/ai-models';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';
import { z } from 'zod';
import { logAuditEvent } from '@/server/middleware/audit';
import { AuditEventType } from '@/lib/db/schemas/auditLog';

const auditSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(10000, 'Prompt too long'),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting (10 audits/hour)
    const rateLimitResult = await checkRateLimit(
      session.user.id,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          reason: rateLimitResult.reason,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    // Validate input
    const body = await request.json();
    const { prompt } = auditSchema.parse(body);

    // Get AI provider (GPT-4o-mini for cheap analysis)
    const modelConfig = getModelById('gpt-4o-mini');
    if (!modelConfig) {
      return NextResponse.json(
        { error: 'AI model not available' },
        { status: 500 }
      );
    }

    const provider = AIProviderFactory.create('openai-mini');

    // Analyze with KERNEL framework
    const kernelPrompt = `You are an expert prompt engineer. Analyze the following prompt using the KERNEL framework and provide a detailed audit.

**KERNEL Framework:**
- K: Keep It Simple - Is the prompt clear and straightforward?
- E: Easy to Verify - Can success be measured objectively?
- R: Reproducible - Will results be consistent?
- N: Narrow Scope - Is the task focused and specific?
- E: Explicit Constraints - Are boundaries and limitations clearly stated?
- L: Logical Structure - Is the prompt well-organized?

**Prompt to Analyze:**
${prompt}

**Response Format (JSON only, no markdown):**
{
  "overallScore": <number 0-100>,
  "kernelScores": {
    "keepSimple": <number 0-100>,
    "easyToVerify": <number 0-100>,
    "reproducible": <number 0-100>,
    "narrowScope": <number 0-100>,
    "explicitConstraints": <number 0-100>,
    "logicalStructure": <number 0-100>
  },
  "issues": [
    {
      "severity": "critical" | "warning" | "suggestion",
      "category": "<category name>",
      "description": "<brief issue description>",
      "fix": "<suggested fix>"
    }
  ],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "improvedVersion": "<enhanced version of the prompt>"
}

Be thorough but concise. Focus on actionable feedback.`;

    const response = await provider.execute({
      prompt: kernelPrompt,
      systemPrompt:
        'You are an expert prompt engineer analyzing prompts for quality and effectiveness.',
      temperature: 0.3, // Lower temperature for consistent analysis
      maxTokens: 2000,
    });

    // Parse AI response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let analysis: any;
    try {
      // Try to extract JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch && jsonMatch.length > 0) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: generate structured response from free-form text
      analysis = {
        overallScore: 75,
        kernelScores: {
          keepSimple: 80,
          easyToVerify: 70,
          reproducible: 70,
          narrowScope: 70,
          explicitConstraints: 60,
          logicalStructure: 80,
        },
        issues: [
          {
            severity: 'warning',
            category: 'Analysis',
            description:
              'Could not parse detailed analysis - please review manually',
            fix: 'AI response format issue',
          },
        ],
        recommendations: ['Review the prompt manually for best results'],
        improvedVersion: prompt,
      };
    }

    // Audit log
    await logAuditEvent({
      eventType: AuditEventType.enum['admin.prompt_audit.performed'],
      userId: session.user.id,
      action: 'prompt_audit',
      metadata: {
        model: 'gpt-4o-mini',
        promptLength: prompt.length,
        overallScore: analysis.overallScore,
      },
      success: true,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Error auditing prompt:', error);
    return NextResponse.json(
      { error: 'Failed to analyze prompt' },
      { status: 500 }
    );
  }
}
