# Multi-Agent Content Review System

**Parent Document:** [OpsHub Enterprise Build-Out](../planning/OPSHUB_ENTERPRISE_BUILDOUT.md)  
**Related:** [Agent Content Creator](./AGENT_CONTENT_CREATOR.md), [Multi-Agent Team Simulation](./MULTI_AGENT_TEAM_SIMULATION.md)  
**Status:** 📋 Planned (Defer to Day 8+)  
**Priority:** High - Quality content critical for brand

---

## Overview

Sophisticated multi-agent system that reviews and validates content through multiple expert personas, using different AI models and providers for each role, with iterative feedback loops until content meets all quality standards.

## The Problem

Current content generation:

- Single AI call → publish (no review)
- No fact-checking or validation
- No readability or virality assessment
- No security/accuracy review
- Content might be factually wrong or insecure

## The Solution

**Multi-Agent Review Pipeline:**

```
Source Article
    ↓
1. Content Editor (GPT-4) → Initial review
    ↓
2. SME Expert (Claude Opus) → Technical fact-check
    ↓
3. Content Writer (GPT-4) → Revise based on feedback
    ↓
4. Red Hat Security (o1-preview thinking mode) → Security review
    ↓
5. Engineering Director (Claude Sonnet) → Final technical review
    ↓
6. Marketing/Viral Reviewer (Gemini Pro) → Readability & virality
    ↓
7. Final QA (GPT-4) → Polish & publish
    ↓
Approved Content → MongoDB
```

---

## Agent Personas & Responsibilities

### Agent 1: Content Editor (Initial Review)

**Model:** GPT-4 (good at structured analysis)  
**Role:** First-pass editor, identifies structure issues  
**Prompt Pattern:** Critic + Checklist

**Responsibilities:**

- Check article structure (intro, body, conclusion)
- Identify grammar/spelling issues
- Flag unclear sections
- Suggest improvements for flow
- Rate readability (Flesch-Kincaid)

**Output:**

```json
{
  "agentName": "Content Editor",
  "pass": false,
  "score": 6.5,
  "issues": [
    {
      "severity": "medium",
      "section": "Introduction",
      "issue": "Lacks clear value proposition",
      "suggestion": "Start with concrete problem statement"
    }
  ],
  "recommendations": [
    "Add concrete examples in section 2",
    "Simplify technical jargon in section 3"
  ]
}
```

---

### Agent 2: SME Expert (Technical Fact-Check)

**Model:** Claude Opus (best reasoning, long context)  
**Role:** Subject Matter Expert in CS/Engineering  
**Prompt Pattern:** Expert + Chain-of-Thought

**Responsibilities:**

- Verify technical accuracy
- Check code examples (if any)
- Validate engineering principles
- Research claims if needed (web search mode)
- Flag outdated information

**Research Mode:**

- If uncertain, agent can request web search
- Cross-reference with documentation
- Check latest best practices

**Output:**

```json
{
  "agentName": "SME Expert",
  "pass": true,
  "score": 8.5,
  "technicalAccuracy": {
    "verifiedFacts": 12,
    "corrections": [
      {
        "claim": "React 19 uses Server Components by default",
        "correction": "React 19 supports Server Components, but they're opt-in",
        "source": "https://react.dev/blog/2024/02/15/react-19"
      }
    ],
    "confidence": 0.92
  }
}
```

---

### Agent 3: Content Writer (Revision)

**Model:** GPT-4 Turbo (fast, creative)  
**Role:** Revise content based on feedback  
**Prompt Pattern:** Persona + Few-Shot

**Input:**

- Original content
- Feedback from Editor + SME
- Style guide

**Responsibilities:**

- Implement all suggested changes
- Maintain original voice
- Fix technical inaccuracies
- Improve readability
- Add examples if missing

**Output:**

- Revised content (full text)
- Changelog of what was modified

---

### Agent 4: Red Hat Security Reviewer

**Model:** o1-preview (deep reasoning mode)  
**Role:** Security & accuracy auditor  
**Prompt Pattern:** Red Team + Adversarial

**Responsibilities:**

- Identify security concerns (SQL injection examples, XSS vulnerabilities)
- Flag potentially harmful advice
- Check for bias or misinformation
- Verify no leaked secrets in examples
- Ensure engineering best practices

**Red Hat Questions:**

- Could this advice lead to security vulnerabilities?
- Are there better, safer alternatives?
- Does this follow OWASP/SANS guidelines?
- Is this advice from an authoritative source?

**Output:**

```json
{
  "agentName": "Red Hat Security",
  "pass": true,
  "score": 9.0,
  "securityIssues": [],
  "recommendations": [
    "Add note about parameterized queries",
    "Include link to OWASP top 10"
  ],
  "riskLevel": "low"
}
```

---

### Agent 5: Engineering Director (Final Technical Review)

**Model:** Claude Sonnet (balanced, authoritative)  
**Role:** Senior engineering leadership perspective  
**Prompt Pattern:** Executive + Strategic

**Responsibilities:**

- Validate scalability advice
- Check architectural recommendations
- Ensure production-readiness
- Verify enterprise applicability
- Assess team impact

**Director's Lens:**

- Is this advice scalable for teams of 50+?
- Does this consider operational concerns?
- Is the ROI clear?
- Would I recommend this to my team?

**Output:**

```json
{
  "agentName": "Engineering Director",
  "pass": true,
  "score": 8.8,
  "recommendation": "approve",
  "concerns": [],
  "executiveSummary": "Content provides actionable, scalable advice for engineering teams. Recommend publishing."
}
```

---

### Agent 6: Marketing & Virality Reviewer

**Model:** Gemini Pro (creative, multi-modal)  
**Role:** Content marketing expert  
**Prompt Pattern:** Audience + Engagement

**Responsibilities:**

- Assess human readability
- Evaluate viral potential
- Check emotional hooks
- Validate problem-solution fit
- Optimize for shareability

**Viral Checklist:**

- [ ] Clear hook in first 30 seconds
- [ ] Solves specific, relatable problem
- [ ] Includes surprising insight
- [ ] Actionable takeaways
- [ ] Share-worthy quotes
- [ ] Meme-able concepts

**Output:**

```json
{
  "agentName": "Marketing Reviewer",
  "pass": true,
  "score": 7.5,
  "viralityScore": 6.8,
  "readabilityGrade": 8,
  "emotionalHooks": ["frustration with technical debt", "aha moment"],
  "improvements": [
    "Add pull quote at line 42",
    "Create visual diagram for concept in section 3"
  ],
  "shareability": "high"
}
```

---

### Agent 7: Final QA (Polish & Publish)

**Model:** GPT-4 (detail-oriented)  
**Role:** Final quality check  
**Prompt Pattern:** Checklist + Polish

**Responsibilities:**

- Final grammar/spelling pass
- Format for web (headings, lists, etc.)
- Add SEO metadata
- Generate social share text
- Verify all links work

**Output:**

```json
{
  "agentName": "Final QA",
  "pass": true,
  "score": 9.2,
  "status": "ready_to_publish",
  "metadata": {
    "title": "5 Ways to Reduce Technical Debt Without Stopping Feature Work",
    "description": "Proven strategies from engineering leaders...",
    "tags": ["technical-debt", "engineering", "leadership"],
    "estimatedReadTime": "7 min"
  }
}
```

---

## Technical Architecture

### Database Schema

```typescript
// src/lib/db/schemas/content-review.ts
export const ContentReviewSchema = z.object({
  _id: z.instanceof(ObjectId),
  contentId: z.instanceof(ObjectId),
  organizationId: z.string(),

  sourceArticle: z.object({
    url: z.string().url().optional(),
    rawText: z.string(),
    extractedAt: z.date(),
  }),

  reviewPipeline: z.array(
    z.object({
      agentName: z.enum([
        'content_editor',
        'sme_expert',
        'content_writer',
        'red_hat_security',
        'engineering_director',
        'marketing_reviewer',
        'final_qa',
      ]),
      model: z.string(), // gpt-4, claude-opus, etc.
      provider: z.string(), // openai, anthropic, google
      startedAt: z.date(),
      completedAt: z.date().optional(),
      status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
      pass: z.boolean().optional(),
      score: z.number().min(0).max(10).optional(),
      output: z.record(z.unknown()), // Agent-specific output
      cost: z.number(), // Track cost per agent
      tokensUsed: z.object({
        input: z.number(),
        output: z.number(),
      }),
    })
  ),

  iterations: z.array(
    z.object({
      round: z.number(),
      contentVersion: z.string(),
      feedback: z.array(z.string()),
      revisionsMade: z.array(z.string()),
    })
  ),

  finalContent: z.string().optional(),
  overallScore: z.number().min(0).max(10).optional(),
  status: z.enum(['in_review', 'needs_revision', 'approved', 'rejected']),

  totalCost: z.number(),
  totalTimeSeconds: z.number(),

  approvedBy: z.string().optional(), // userId
  approvedAt: z.date().optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});
```

### Service Layer

```typescript
// src/lib/services/ContentReviewService.ts
export class ContentReviewService {
  private agents: Map<string, AgentConfig>;

  constructor() {
    this.agents = new Map([
      [
        'content_editor',
        {
          model: 'gpt-4',
          provider: 'openai',
          systemPrompt: CONTENT_EDITOR_PROMPT,
        },
      ],
      [
        'sme_expert',
        {
          model: 'claude-3-opus-20240229',
          provider: 'anthropic',
          systemPrompt: SME_EXPERT_PROMPT,
        },
      ],
      // ... other agents
    ]);
  }

  async reviewContent(
    sourceArticle: string,
    orgId: string
  ): Promise<ContentReview> {
    const review = await this.createReview(sourceArticle, orgId);

    // Run agents in sequence
    let currentContent = sourceArticle;
    let needsRevision = true;
    let iteration = 1;
    const maxIterations = 3;

    while (needsRevision && iteration <= maxIterations) {
      // Step 1: Content Editor
      const editorResult = await this.runAgent(
        'content_editor',
        currentContent,
        review
      );

      // Step 2: SME Expert
      const smeResult = await this.runAgent(
        'sme_expert',
        currentContent,
        review
      );

      // If either failed, revise
      if (!editorResult.pass || !smeResult.pass) {
        const feedback = [
          ...editorResult.recommendations,
          ...smeResult.corrections,
        ];

        // Step 3: Content Writer revises
        currentContent = await this.runWriterRevision(
          currentContent,
          feedback,
          review
        );
        iteration++;
      } else {
        needsRevision = false;
      }
    }

    // If passed initial review, continue with security & final checks
    if (!needsRevision) {
      await this.runAgent('red_hat_security', currentContent, review);
      await this.runAgent('engineering_director', currentContent, review);
      await this.runAgent('marketing_reviewer', currentContent, review);
      await this.runAgent('final_qa', currentContent, review);
    }

    // Calculate overall score and status
    const overallScore = this.calculateOverallScore(review);
    const status = overallScore >= 8.0 ? 'approved' : 'needs_revision';

    await this.updateReview(review._id, {
      finalContent: currentContent,
      overallScore,
      status,
    });

    return review;
  }

  private async runAgent(
    agentName: string,
    content: string,
    review: ContentReview
  ): Promise<AgentResult> {
    const config = this.agents.get(agentName)!;

    // Get API key from AWS Secrets Manager
    const apiKey = await secretsService.getOrgApiKey(
      review.organizationId,
      config.provider
    );

    // Create provider
    const provider = await AIProviderFactory.create(
      config.provider,
      review.organizationId
    );

    // Execute agent
    const startTime = Date.now();
    const result = await provider.execute({
      model: config.model,
      systemPrompt: config.systemPrompt,
      userPrompt: this.buildAgentPrompt(agentName, content, review),
      temperature: 0.3, // Lower for consistency
      maxTokens: 4000,
    });

    const endTime = Date.now();

    // Parse and validate result
    const parsed = this.parseAgentResult(agentName, result.content);

    // Store in review pipeline
    await this.addAgentResult(review._id, {
      agentName,
      model: config.model,
      provider: config.provider,
      startedAt: new Date(startTime),
      completedAt: new Date(endTime),
      status: 'completed',
      pass: parsed.pass,
      score: parsed.score,
      output: parsed,
      cost: result.cost,
      tokensUsed: result.tokensUsed,
    });

    return parsed;
  }

  private buildAgentPrompt(
    agentName: string,
    content: string,
    review: ContentReview
  ): string {
    // Build context-aware prompt for each agent
    // Include previous agent feedback for later agents

    switch (agentName) {
      case 'content_editor':
        return `Review this article for structure, clarity, and readability:\n\n${content}`;

      case 'sme_expert':
        const editorFeedback = this.getAgentFeedback(review, 'content_editor');
        return `As a CS/Engineering SME, fact-check this article. Previous editor noted: ${editorFeedback}\n\n${content}`;

      case 'content_writer':
        const allFeedback = this.getAllFeedback(review);
        return `Revise this article based on expert feedback:\n\nFeedback:\n${allFeedback}\n\nOriginal:\n${content}`;

      // ... other agents

      default:
        return content;
    }
  }
}
```

### API Endpoint

```typescript
// src/app/api/admin/content/review/route.ts
import { ContentReviewService } from '@/lib/services/ContentReviewService';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { sourceArticle, sourceUrl } = await req.json();

  const reviewService = new ContentReviewService();
  const review = await reviewService.reviewContent(
    sourceArticle,
    session.user.organizationId
  );

  return NextResponse.json({
    reviewId: review._id,
    status: review.status,
    overallScore: review.overallScore,
    totalCost: review.totalCost,
    agentResults: review.reviewPipeline.map((agent) => ({
      agent: agent.agentName,
      pass: agent.pass,
      score: agent.score,
    })),
  });
}
```

---

## UI Integration

### OpsHub Content Review Panel

```typescript
// src/components/admin/ContentReviewPanel.tsx
'use client';

export function ContentReviewPanel() {
  const [sourceArticle, setSourceArticle] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewProgress, setReviewProgress] = useState<AgentProgress[]>([]);

  const handleStartReview = async () => {
    setIsReviewing(true);

    const response = await fetch('/api/admin/content/review', {
      method: 'POST',
      body: JSON.stringify({ sourceArticle }),
    });

    const result = await response.json();

    // Poll for progress updates
    const intervalId = setInterval(async () => {
      const status = await fetch(`/api/admin/content/review/${result.reviewId}`);
      const data = await status.json();

      setReviewProgress(data.agentResults);

      if (data.status !== 'in_review') {
        clearInterval(intervalId);
        setIsReviewing(false);
      }
    }, 2000);
  };

  return (
    <div>
      <h2>Multi-Agent Content Review</h2>

      <Textarea
        placeholder="Paste article or source content here..."
        value={sourceArticle}
        onChange={(e) => setSourceArticle(e.target.value)}
        rows={10}
      />

      <Button onClick={handleStartReview} disabled={isReviewing}>
        {isReviewing ? 'Reviewing...' : 'Start Review Pipeline'}
      </Button>

      {isReviewing && (
        <div className="mt-4">
          <h3>Review Progress</h3>
          {reviewProgress.map((agent, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Icons.check className={agent.pass ? 'text-green-600' : 'text-red-600'} />
              <span>{agent.agentName}</span>
              <Badge>{agent.score}/10</Badge>
              {agent.status === 'in_progress' && <Icons.spinner className="animate-spin" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Cost Estimation

**Per Article Review:**

| Agent                | Model         | Tokens (est.) | Cost         |
| -------------------- | ------------- | ------------- | ------------ |
| Content Editor       | GPT-4         | 3000          | $0.09        |
| SME Expert           | Claude Opus   | 4000          | $0.15        |
| Content Writer       | GPT-4 Turbo   | 5000          | $0.05        |
| Red Hat Security     | o1-preview    | 2000          | $0.40        |
| Engineering Director | Claude Sonnet | 3000          | $0.09        |
| Marketing Reviewer   | Gemini Pro    | 3000          | $0.00 (free) |
| Final QA             | GPT-4         | 2000          | $0.06        |

**Total per article:** ~$0.84 (assuming 1 revision)  
**With 3 revisions:** ~$2.50

---

## Success Metrics

**Quality Metrics:**

- Overall score: Average 8.5+/10
- Pass rate: 90%+ approved on first review
- Revision rate: Average 1.2 iterations per article

**Cost Metrics:**

- Average cost per article: < $1.50
- Cost per published article: < $3.00 (including revisions)

**Time Metrics:**

- Average review time: 5-10 minutes
- End-to-end (with revisions): 15-30 minutes

---

## Future Enhancements

1. **Parallel Agent Execution**
   - Run Editor + SME in parallel (save time)
   - Only serialize when agents need each other's output

2. **Agent Learning**
   - Track which agents catch most issues
   - Adjust agent ordering based on effectiveness
   - Fine-tune models on past reviews

3. **Human-in-the-Loop**
   - Allow manual override at any stage
   - Super admin can skip certain agents
   - Human expert can join as reviewer

4. **A/B Testing**
   - Test different agent combinations
   - Compare single-pass vs. multi-pass
   - Measure published content performance

---

## Implementation Priority

**Phase 1 (MVP):**

- [ ] Set up 3 core agents: Editor, SME, Writer
- [ ] Single iteration pipeline
- [ ] Basic UI in OpsHub
- [ ] Track costs and scores

**Phase 2 (Enhancement):**

- [ ] Add Security & Director reviewers
- [ ] Multi-iteration logic
- [ ] Real-time progress UI
- [ ] Agent performance analytics

**Phase 3 (Advanced):**

- [ ] Add Marketing reviewer
- [ ] Parallel agent execution
- [ ] Agent learning system
- [ ] Human-in-the-loop

---

## Related Documentation

- [Agent Content Creator](./AGENT_CONTENT_CREATOR.md)
- [Multi-Agent Team Simulation](./MULTI_AGENT_TEAM_SIMULATION.md)
- [OpsHub Enterprise Build-Out](../planning/OPSHUB_ENTERPRISE_BUILDOUT.md)
- [AI Provider Architecture](../architecture/AI_PROVIDER_ARCHITECTURE.md)

---

**Last Updated:** November 2, 2025  
**Status:** 📋 Planned for Day 8+  
**Estimated Implementation:** 2-3 days
