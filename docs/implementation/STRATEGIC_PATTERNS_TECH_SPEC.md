# Strategic Patterns: Technical Implementation Spec

**Stack**: Next.js 15.5.4, Node.js, MongoDB, OpenAI API  
**No Python/AWS Required**: Pure JavaScript/TypeScript  
**Date**: October 29, 2025

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (Next.js 15 + React 18)                        │
│ ├─ Pattern UI Components                                │
│ ├─ Conversational Interface                             │
│ └─ Feedback Widgets                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ API Routes (Next.js App Router)                         │
│ ├─ /api/patterns/rice                                   │
│ ├─ /api/patterns/value-effort                           │
│ ├─ /api/feedback                                        │
│ └─ /api/ai/chat                                         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Business Logic (TypeScript)                             │
│ ├─ Pattern Orchestrators                                │
│ ├─ RICE Calculator                                      │
│ ├─ AI Prompt Templates                                  │
│ └─ Feedback Analyzer                                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────┬──────────────────────────────────┐
│ MongoDB              │ OpenAI API                       │
│ ├─ pattern_sessions  │ ├─ GPT-4 (conversation)          │
│ ├─ feedback          │ └─ GPT-3.5 (calculations)        │
│ └─ users             │                                  │
└──────────────────────┴──────────────────────────────────┘
```

---

## Database Schema (MongoDB)

### Collections

```typescript
// Pattern Sessions (ephemeral, 24-hour TTL)
interface PatternSession {
  _id: ObjectId;
  userId: ObjectId;
  patternId: 'rice' | 'value_effort' | 'opportunity_finder' | 'build_buy';

  // State management
  currentStage: number;
  totalStages: number;
  stageData: Record<string, any>; // User inputs per stage

  // Metadata
  startedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;

  // TTL index - auto-delete after 24 hours
  expiresAt: Date; // Set to startedAt + 24 hours
}

// Feedback (permanent, anonymized)
interface PatternFeedback {
  _id: ObjectId;
  userId: ObjectId; // For user's own history only
  patternId: string;
  sessionId: ObjectId;

  // Primary feedback
  helpfulness: 'very_helpful' | 'somewhat_helpful' | 'not_helpful';
  comment?: string;

  // Pattern-specific (flexible schema)
  patternSpecific?: Record<string, any>;

  // Context (anonymized)
  timeSpent: number; // seconds
  stagesCompleted: number;
  userLevel: number;
  userRole: string;

  createdAt: Date;
}

// Abandonment tracking
interface PatternAbandonment {
  _id: ObjectId;
  userId: ObjectId;
  patternId: string;
  abandonedAtStage: number;
  reason?: string;
  timeSpent: number;
  createdAt: Date;
}
```

### Indexes

```typescript
// MongoDB indexes
db.pattern_sessions.createIndex({ userId: 1, patternId: 1 });
db.pattern_sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

db.pattern_feedback.createIndex({ patternId: 1, createdAt: -1 });
db.pattern_feedback.createIndex({ userId: 1 });
db.pattern_feedback.createIndex({ helpfulness: 1 });

db.pattern_abandonment.createIndex({ patternId: 1, createdAt: -1 });
```

---

## API Routes (Next.js App Router)

### Pattern Session Management

```typescript
// app/api/patterns/[patternId]/session/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';

export async function POST(
  req: NextRequest,
  { params }: { params: { patternId: string } }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectDB();

  // Create new pattern session
  const patternSession = await db.collection('pattern_sessions').insertOne({
    userId: session.user.id,
    patternId: params.patternId,
    currentStage: 0,
    totalStages: getPatternStageCount(params.patternId),
    stageData: {},
    startedAt: new Date(),
    lastActivityAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  return NextResponse.json({ sessionId: patternSession.insertedId });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { patternId: string } }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectDB();

  // Get active session for this pattern
  const patternSession = await db.collection('pattern_sessions').findOne({
    userId: session.user.id,
    patternId: params.patternId,
    completedAt: { $exists: false },
  });

  return NextResponse.json({ session: patternSession });
}
```

### Pattern Stage Progression

```typescript
// app/api/patterns/[patternId]/stage/route.ts

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  const { sessionId, stageNumber, userInput } = await req.json();

  const db = await connectDB();

  // Update session with user input
  await db.collection('pattern_sessions').updateOne(
    { _id: new ObjectId(sessionId), userId: session.user.id },
    {
      $set: {
        [`stageData.stage${stageNumber}`]: userInput,
        currentStage: stageNumber + 1,
        lastActivityAt: new Date(),
      },
    }
  );

  // Get AI response for next stage
  const patternSession = await db.collection('pattern_sessions').findOne({
    _id: new ObjectId(sessionId),
  });

  const aiResponse = await getNextStagePrompt(
    patternSession.patternId,
    stageNumber + 1,
    patternSession.stageData
  );

  return NextResponse.json({ aiResponse });
}
```

---

## Business Logic

### RICE Calculator (Pure TypeScript)

```typescript
// lib/calculators/rice.ts

export interface RICEInput {
  reach: number;
  impact: number; // 0.25, 0.5, 1.0, 2.0, 3.0
  confidence: number; // 0.5, 0.8, 1.0
  effort: number; // person-months
}

export interface RICEOutput {
  score: number;
  priorityLevel: 'very_high' | 'high' | 'medium' | 'low';
  recommendation: string;
  riskFactors: string[];
  nextSteps: string[];
}

export function calculateRICE(input: RICEInput): RICEOutput {
  const score = (input.reach * input.impact * input.confidence) / input.effort;

  return {
    score: Math.round(score),
    priorityLevel: getPriorityLevel(score),
    recommendation: generateRecommendation(score, input),
    riskFactors: identifyRisks(input),
    nextSteps: generateNextSteps(score),
  };
}

function getPriorityLevel(score: number): RICEOutput['priorityLevel'] {
  if (score >= 1000) return 'very_high';
  if (score >= 100) return 'high';
  if (score >= 10) return 'medium';
  return 'low';
}

function generateRecommendation(score: number, input: RICEInput): string {
  const level = getPriorityLevel(score);

  if (level === 'very_high') {
    return `This is a top-priority initiative. With a RICE score of ${Math.round(score)}, this should be added to your immediate roadmap.`;
  }
  // ... more logic
}

function identifyRisks(input: RICEInput): string[] {
  const risks: string[] = [];

  if (input.confidence <= 0.5) {
    risks.push('Low confidence - gather more data before committing resources');
  }

  if (input.effort >= 3) {
    risks.push('High effort - consider breaking into smaller milestones');
  }

  // ... more risk logic

  return risks;
}
```

### AI Prompt Templates

```typescript
// lib/ai/pattern-prompts.ts

export function getRICEStagePrompt(stage: number, previousData: any): string {
  const prompts = {
    1: `I'll help you prioritize this feature using the RICE framework. This will take about 5 minutes.

First, what feature or initiative are you evaluating?

(Remember: Use anonymized data - "GitHub integration" not "Project Falcon")`,

    2: `Great! Let's estimate how many users this will affect.

Questions:
1. How many total active users do you have per month?
2. What percentage would likely use this feature?
3. Over what timeframe? (default: per month)

Example: "10,000 monthly users, about 50% are developers, per month"`,

    3: `Now let's assess the impact. This will affect ${previousData.reach} users per month.

Which best describes the expected impact?
- Massive (3.0): Transforms your core value proposition
- High (2.0): Significantly improves a key metric
- Medium (1.0): Noticeable improvement
- Low (0.5): Minor improvement
- Minimal (0.25): Barely noticeable

What specific metric will this improve?`,

    // ... more stages
  };

  return prompts[stage] || '';
}
```

---

## Frontend Components

### Conversational Pattern Interface

```typescript
// components/patterns/ConversationalPattern.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Stage {
  number: number;
  aiPrompt: string;
  userInput: string;
}

export function ConversationalPattern({ patternId }: { patternId: string }) {
  const { data: session } = useSession();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize session
  useEffect(() => {
    async function initSession() {
      const res = await fetch(`/api/patterns/${patternId}/session`, {
        method: 'POST',
      });
      const data = await res.json();
      setSessionId(data.sessionId);

      // Get first stage prompt
      const firstPrompt = await getStagePrompt(0);
      setStages([{ number: 0, aiPrompt: firstPrompt, userInput: '' }]);
    }

    if (session?.user) {
      initSession();
    }
  }, [session, patternId]);

  async function handleSubmit() {
    if (!currentInput.trim()) return;

    setIsLoading(true);

    // Save user input
    const updatedStages = [...stages];
    updatedStages[updatedStages.length - 1].userInput = currentInput;
    setStages(updatedStages);

    // Get next stage
    const res = await fetch(`/api/patterns/${patternId}/stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        stageNumber: stages.length - 1,
        userInput: currentInput,
      }),
    });

    const { aiResponse, isComplete } = await res.json();

    if (!isComplete) {
      setStages([...updatedStages, {
        number: stages.length,
        aiPrompt: aiResponse,
        userInput: '',
      }]);
      setCurrentInput('');
    } else {
      // Show results
      showResults(aiResponse);
    }

    setIsLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Privacy Warning */}
      <PrivacyWarning patternId={patternId} />

      {/* Conversation History */}
      <div className="space-y-6 mb-6">
        {stages.map((stage) => (
          <div key={stage.number}>
            {/* AI Message */}
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                🤖
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{stage.aiPrompt}</p>
              </div>
            </div>

            {/* User Response */}
            {stage.userInput && (
              <div className="flex gap-3 justify-end">
                <div className="flex-1 max-w-md bg-blue-50 rounded-lg p-4">
                  <p>{stage.userInput}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  👤
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t pt-4">
        <div className="flex gap-2">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 border rounded-lg p-3 resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !currentInput.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Feedback Widget

```typescript
// components/patterns/FeedbackWidget.tsx

'use client';

import { useState } from 'react';

export function FeedbackWidget({ sessionId, patternId }: Props) {
  const [helpfulness, setHelpfulness] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        patternId,
        helpfulness,
        comment,
      }),
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg">
        <p className="text-green-800">Thanks for your feedback! 🙏</p>
      </div>
    );
  }

  return (
    <div className="border-t pt-6 mt-6">
      <h3 className="font-semibold mb-4">📊 Was this helpful?</h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setHelpfulness('very_helpful')}
          className={`px-4 py-2 rounded-lg ${
            helpfulness === 'very_helpful' ? 'bg-green-100' : 'bg-gray-100'
          }`}
        >
          👍 Very helpful
        </button>
        <button
          onClick={() => setHelpfulness('somewhat_helpful')}
          className={`px-4 py-2 rounded-lg ${
            helpfulness === 'somewhat_helpful' ? 'bg-yellow-100' : 'bg-gray-100'
          }`}
        >
          😐 Somewhat helpful
        </button>
        <button
          onClick={() => setHelpfulness('not_helpful')}
          className={`px-4 py-2 rounded-lg ${
            helpfulness === 'not_helpful' ? 'bg-red-100' : 'bg-gray-100'
          }`}
        >
          👎 Not helpful
        </button>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What would make this better? (optional)"
        className="w-full border rounded-lg p-3 mb-4"
        rows={3}
      />

      <button
        onClick={handleSubmit}
        disabled={!helpfulness}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        Submit Feedback
      </button>
    </div>
  );
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)

- [ ] MongoDB collections & indexes
- [ ] API routes for session management
- [ ] RICE calculator (pure TypeScript)
- [ ] Basic conversational UI

### Phase 2: RICE Pattern (Week 2)

- [ ] 5-stage conversation flow
- [ ] AI prompt templates
- [ ] Results display
- [ ] Feedback widget

### Phase 3: Testing (Week 3)

- [ ] Unit tests for calculator
- [ ] Integration tests for API
- [ ] E2E tests for user flow
- [ ] Internal team testing

### Phase 4: Polish (Week 4)

- [ ] Privacy warnings
- [ ] Error handling
- [ ] Loading states
- [ ] Analytics tracking

---

**Status**: Ready for Development  
**Stack**: 100% Next.js/Node/MongoDB  
**No AWS/Python Required**: ✅  
**Owner**: Engineering Team
