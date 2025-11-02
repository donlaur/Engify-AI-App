<!--
AI Summary: Replace mock audit results with real AI-powered prompt analysis using GPT-4o-mini.
Implements KERNEL framework evaluation for credibility and user value.
Part of Day 6 Content Hardening: Phase 3.
-->

# Phase 3: Real Audit Analysis Implementation

**Status:** ⚠️ In Progress  
**Part of:** [Day 6 Content Hardening](../planning/DAY_6_CONTENT_HARDENING.md) → Phase 3

## Problem Statement

Audit page shows fake scores and mock delay, destroying user trust.

## Solution

### API Endpoint

**Route:** `POST /api/prompts/audit`

**File:** `src/app/api/prompts/audit/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { getModelById } from '@/lib/config/ai-models';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';
import { z } from 'zod';

const auditSchema = z.object({
  prompt: z.string().min(10).max(10000),
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
        { error: rateLimitResult.reason },
        { status: 429 }
      );
    }

    // Validate input
    const body = await request.json();
    const { prompt } = auditSchema.parse(body);

    // Get AI provider (GPT-4o-mini)
    const modelConfig = getModelById('gpt-4o-mini');
    const provider = AIProviderFactory.createProvider(
      modelConfig?.provider || 'openai'
    );

    // Analyze with KERNEL framework
    const analysis = await analyzeWithKernel(provider, prompt);

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze prompt' },
      { status: 500 }
    );
  }
}
```

### KERNEL Framework Analysis

**Prompt Template:**

```
Analyze the following prompt using the KERNEL framework:

K - Knowledge: Does it provide sufficient context?
E - Expectations: Are goals clearly defined?
R - Role: Is the AI's role explicit?
N - Nuance: Does it handle edge cases?
E - Example: Are examples provided?
L - Language: Is it clear and unambiguous?

Prompt:
${prompt}

Score each dimension 1-5 and provide specific feedback.
```

**Response Format:**

```typescript
interface AnalysisResult {
  scores: {
    knowledge: number;
    expectations: number;
    role: number;
    nuance: number;
    example: number;
    language: number;
  };
  averageScore: number;
  feedback: string;
  suggestions: string[];
}
```

### Cost Estimation

- Model: GPT-4o-mini
- Input tokens: ~500-1000
- Output tokens: ~200-500
- Cost per audit: ~$0.001-0.003
- Expected usage: 100 audits/day = $0.10-0.30/day

## Related Documentation

- [AI Provider Factory](../architecture/OVERVIEW.md)
- [Multi-Model Testing](../content/MULTI_MODEL_TESTING.md)
- [Day 6 Content Hardening Plan](../planning/DAY_6_CONTENT_HARDENING.md)
- [Rate Limiting](../security/SECURITY_ARCHITECTURE_REVIEW.md)
