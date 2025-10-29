# Feedback & Learning System Architecture

**Purpose**: Collect user feedback to improve AI patterns and recommendations  
**Principle**: System learns what's helpful, adapts over time  
**Date**: October 29, 2025

---

## Overview

Every interactive pattern collects feedback to improve:

1. **Question clarity** - Are AI questions easy to understand?
2. **Recommendation quality** - Are AI suggestions helpful?
3. **Output format** - Is the presentation clear?
4. **Educational value** - Did users learn the framework?

---

## Feedback Collection Points

### 1. Pattern Completion Feedback (Primary)

**When**: After user completes a pattern and receives output

**UI Component**:

```tsx
<FeedbackWidget>
  <Question>Was this helpful?</Question>

  <ButtonGroup>
    <Button value="very_helpful" icon="👍">
      Very helpful
    </Button>
    <Button value="somewhat_helpful" icon="😐">
      Somewhat helpful
    </Button>
    <Button value="not_helpful" icon="👎">
      Not helpful
    </Button>
  </ButtonGroup>

  <OptionalComment>
    <Label>What would make this better?</Label>
    <TextArea
      placeholder="More detail on..., I wish it..., etc."
      maxLength={500}
    />
  </OptionalComment>

  <SubmitButton>Submit Feedback</SubmitButton>
</FeedbackWidget>
```

**Data Collected**:

```typescript
interface PatternFeedback {
  feedbackId: string;
  userId: string;
  patternId: string; // e.g., "rice_prioritization"
  sessionId: string;

  // Primary feedback
  helpfulness: 'very_helpful' | 'somewhat_helpful' | 'not_helpful';
  comment?: string; // Optional free text

  // Context
  completedAt: Date;
  timeSpent: number; // seconds
  stagesCompleted: number;
  totalStages: number;

  // Metadata
  userLevel: 1 | 2 | 3 | 4 | 5;
  userRole: Role;
}
```

---

### 2. Pattern-Specific Feedback (Secondary)

Some patterns ask additional questions to understand impact:

#### RICE Prioritization

```
Did this framework help you make a decision?
[ ] Yes, changed my priority
[ ] Yes, confirmed my thinking
[ ] No, still unsure
[ ] No, didn't apply to my situation
```

#### Value vs. Effort Matrix

```
What did you find most valuable?
[ ] Visual matrix
[ ] Strategic recommendations
[ ] Portfolio balance insight
[ ] Next steps guidance
```

#### Agentic AI Opportunity Finder

```
Did this change how you think about AI opportunities?
[ ] Yes, completely new perspective
[ ] Somewhat, learned a few things
[ ] No, I already knew this
```

#### Build vs. Buy Framework

```
Did this framework help you make a decision?
[ ] Yes, decided to BUY
[ ] Yes, decided to BUILD
[ ] Yes, decided on HYBRID
[ ] Still unsure
[ ] Need more information
```

**Data Structure**:

```typescript
interface ExtendedFeedback extends PatternFeedback {
  patternSpecific: {
    [key: string]: string | string[]; // Flexible for different patterns
  };
}
```

---

### 3. In-Progress Feedback (Tertiary)

**When**: User abandons pattern mid-flow

**Trigger**: User closes pattern before completion

**UI**: Simple modal

```
You're about to leave. Quick question:

Why are you stopping?
[ ] Too long / too many questions
[ ] Questions unclear
[ ] Not relevant to my situation
[ ] Found what I needed
[ ] Just exploring

[Skip] [Submit]
```

**Data Collected**:

```typescript
interface AbandonmentFeedback {
  feedbackId: string;
  userId: string;
  patternId: string;

  abandonedAt: number; // Stage number (e.g., 3 of 6)
  reason?: string;
  timeSpent: number;
}
```

---

## Data Storage

### Database Schema

```sql
-- Main feedback table
CREATE TABLE pattern_feedback (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_id VARCHAR(50) NOT NULL,
  session_id UUID NOT NULL,

  -- Feedback
  helpfulness VARCHAR(20) NOT NULL, -- very_helpful, somewhat_helpful, not_helpful
  comment TEXT,

  -- Context
  completed_at TIMESTAMP NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  stages_completed INTEGER NOT NULL,
  total_stages INTEGER NOT NULL,

  -- User context
  user_level INTEGER NOT NULL,
  user_role VARCHAR(50) NOT NULL,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_pattern_id (pattern_id),
  INDEX idx_user_id (user_id),
  INDEX idx_helpfulness (helpfulness)
);

-- Pattern-specific feedback
CREATE TABLE pattern_feedback_extended (
  id UUID PRIMARY KEY,
  feedback_id UUID REFERENCES pattern_feedback(id),
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,

  INDEX idx_feedback_id (feedback_id)
);

-- Abandonment tracking
CREATE TABLE pattern_abandonment (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_id VARCHAR(50) NOT NULL,
  session_id UUID NOT NULL,

  abandoned_at_stage INTEGER NOT NULL,
  reason VARCHAR(100),
  time_spent_seconds INTEGER NOT NULL,

  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_pattern_id (pattern_id)
);
```

---

## Privacy & Anonymization

### What We Store

✅ **Anonymized metrics**:

- Pattern usage counts
- Helpfulness scores
- Time spent
- Completion rates
- User level/role (demographic)

✅ **Aggregated data**:

- "85% of Level 3 users found RICE helpful"
- "Average time: 7 minutes"
- "Most common abandonment point: Stage 4"

### What We DON'T Store

❌ **User inputs** (the actual data they entered):

- No feature names
- No company metrics
- No strategic plans
- No calculations with real numbers

**Exception**: We may store **anonymized examples** with explicit user consent:

```
After pattern completion:

"Your analysis was great! Can we use it as an anonymized example
to help other users learn? We'll remove all identifying details."

[Yes, use as example] [No thanks]
```

### Data Retention

- **Feedback scores**: Indefinite (aggregated)
- **Comments**: 90 days, then anonymized
- **Session data**: 30 days, then deleted
- **User-specific**: Deleted on account deletion

---

## Learning & Improvement Loop

### Weekly Analysis

**Metrics Dashboard**:

```
Pattern Performance (Last 7 Days)

RICE Prioritization Assistant
├─ Completions: 247
├─ Helpfulness: 82% very helpful, 15% somewhat, 3% not helpful
├─ Avg time: 6m 42s
├─ Completion rate: 73%
├─ Top abandonment point: Stage 4 (Effort questions)
└─ Common feedback: "Effort estimation is hard" (12 mentions)

Value vs. Effort Matrix
├─ Completions: 189
├─ Helpfulness: 91% very helpful, 8% somewhat, 1% not helpful
├─ Avg time: 4m 18s
├─ Completion rate: 88%
└─ Common feedback: "Love the visual!" (23 mentions)

Agentic AI Opportunity Finder
├─ Completions: 67
├─ Helpfulness: 76% very helpful, 18% somewhat, 6% not helpful
├─ Avg time: 11m 34s
├─ Completion rate: 58%
├─ Top abandonment point: Stage 2 (Pain point questions)
└─ Common feedback: "Too many questions" (8 mentions)
```

### Monthly Improvements

Based on feedback, we iterate:

**Example: RICE Pattern Improvement**

```
Problem: 15% abandonment at Stage 4 (Effort questions)
Feedback: "Effort estimation is hard"

Solution:
1. Add examples: "Design: 3 days, Frontend: 10 days..."
2. Add calculator: "Total: 35 days = 1.75 person-months"
3. Add ranges: "Small (0.5), Medium (1.0), Large (2.0)"

Test: A/B test new version vs. old
Measure: Abandonment rate, helpfulness score
```

**Example: Opportunity Finder Simplification**

```
Problem: 42% abandonment, "Too many questions"
Feedback: "Lost interest after 10 questions"

Solution:
1. Reduce questions: 15 → 8 (focus on highest signal)
2. Add progress bar: "Question 3 of 8"
3. Add "Skip" option: "Not sure? Skip this question"

Test: Deploy to 50% of users
Measure: Completion rate, time spent
```

---

## AI Model Improvement

### Fine-tuning Recommendations

**Data Collection**:

```typescript
interface RecommendationFeedback {
  patternId: string;
  userInput: {
    reach: number;
    impact: number;
    confidence: number;
    effort: number;
  };
  aiRecommendation: string;
  userFeedback: 'helpful' | 'not_helpful';
}
```

**Learning Loop**:

1. Collect 1,000+ feedback samples per pattern
2. Identify patterns in "helpful" vs. "not helpful"
3. Fine-tune prompt templates
4. A/B test improved prompts
5. Deploy winners

**Example Insights**:

```
Finding: Users rate recommendations "not helpful" when:
- RICE score is borderline (40-60 range)
- AI is too definitive ("You MUST do this")
- No risk factors mentioned

Improvement:
- Add nuance for borderline scores
- Use softer language ("Consider prioritizing...")
- Always include "Risk Factors" section
```

---

## User Feedback Loop (Closing the Loop)

### Acknowledging Feedback

**Immediate**:

```
After user submits feedback:

"Thanks for your feedback! 🙏

Your input helps us improve Engify.ai for everyone.
We review all feedback weekly and ship improvements monthly.

Want to see what we've shipped based on user feedback?
[View Changelog]"
```

**Monthly**:

```
Email to active users:

"What We Improved This Month (Based on YOUR Feedback)

🎯 RICE Pattern
- Added effort estimation examples (requested by 12 users)
- Reduced questions from 7 to 5 (faster!)
- New: Compare multiple features side-by-side

📊 Value/Effort Matrix
- Bigger, clearer visual (requested by 8 users)
- Export to PDF (top request!)

Thanks for helping us build a better product!
- The Engify.ai Team"
```

---

## Success Metrics

### Pattern Health Scorecard

For each pattern, track:

| Metric                        | Target  | Current | Status |
| ----------------------------- | ------- | ------- | ------ |
| Completion Rate               | >70%    | 73%     | ✅     |
| Helpfulness (Very + Somewhat) | >85%    | 97%     | ✅     |
| Avg Time                      | <10 min | 6m 42s  | ✅     |
| Return Usage                  | >30%    | 28%     | ⚠️     |
| NPS                           | >40     | 52      | ✅     |

**Actions**:

- ✅ Green: Maintain quality
- ⚠️ Yellow: Investigate, plan improvement
- 🔴 Red: Urgent fix needed

---

## Implementation Roadmap

### Phase 1: Basic Feedback (Week 1-2)

- [ ] Add thumbs up/down to all patterns
- [ ] Store in database
- [ ] Create admin dashboard to view feedback

### Phase 2: Rich Feedback (Week 3-4)

- [ ] Add pattern-specific questions
- [ ] Add optional comment field
- [ ] Track abandonment points

### Phase 3: Analysis (Month 2)

- [ ] Weekly metrics dashboard
- [ ] Automated alerts (e.g., "Completion rate dropped 10%")
- [ ] Feedback categorization (NLP on comments)

### Phase 4: Closed Loop (Month 3)

- [ ] Monthly improvement cycles
- [ ] User communication (changelog, emails)
- [ ] A/B testing framework

### Phase 5: AI Learning (Month 4+)

- [ ] Fine-tune prompts based on feedback
- [ ] Personalization (adapt to user level/role)
- [ ] Predictive abandonment prevention

---

## Privacy Compliance

### GDPR / CCPA Compliance

**User Rights**:

1. **Right to Access**: Users can download all their feedback
2. **Right to Delete**: Delete all feedback on account deletion
3. **Right to Opt-out**: Don't collect feedback (but lose learning benefits)

**Implementation**:

```typescript
// User settings
interface FeedbackSettings {
  collectFeedback: boolean; // Default: true
  useForExamples: boolean; // Default: false (opt-in)
  shareAnonymized: boolean; // Default: true
}

// Data export
async function exportUserFeedback(userId: string): Promise<FeedbackExport> {
  return {
    patternFeedback: await db.patternFeedback.findMany({ userId }),
    abandonments: await db.patternAbandonment.findMany({ userId }),
    // Exclude: Aggregated data (not user-specific)
  };
}

// Data deletion
async function deleteUserFeedback(userId: string): Promise<void> {
  await db.patternFeedback.deleteMany({ userId });
  await db.patternAbandonment.deleteMany({ userId });
  // Keep: Anonymized aggregates
}
```

---

## Example: Feedback-Driven Iteration

### Case Study: RICE Pattern Evolution

**Version 1.0** (Launch)

- 7 questions
- No examples
- Completion rate: 58%
- Helpfulness: 72%

**Feedback Received**:

- "Effort estimation is confusing" (18 users)
- "What's a good RICE score?" (12 users)
- "Too abstract" (9 users)

**Version 1.1** (Month 1)

- Added effort examples
- Added "good score" context
- Added visual progress bar
- Completion rate: 68% (+10%)
- Helpfulness: 81% (+9%)

**Feedback Received**:

- "Love the examples!" (14 users)
- "Still too many questions" (7 users)
- "Can I compare features?" (11 users)

**Version 1.2** (Month 2)

- Reduced to 5 questions (combined some)
- Added "Compare Features" mode
- Added export to CSV
- Completion rate: 73% (+5%)
- Helpfulness: 89% (+8%)

**Result**: 15% improvement in completion, 17% improvement in helpfulness

---

## Key Principles

1. **Ask, don't assume** - Let users tell us what's helpful
2. **Close the loop** - Show users their feedback matters
3. **Iterate fast** - Weekly analysis, monthly improvements
4. **Respect privacy** - Never store sensitive user data
5. **Learn continuously** - System gets smarter over time

---

**Status**: Design Complete  
**Owner**: Product + Engineering  
**Implementation**: Phase 5 (Core Features)  
**Related**:

- `/docs/content/STRATEGIC_PLANNING_PATTERNS.md`
- `/docs/architecture/DATA_PRIVACY_POLICY.md` (to be created)
