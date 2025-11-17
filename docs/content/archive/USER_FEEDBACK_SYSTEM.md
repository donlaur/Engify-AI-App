# Two-Tier User Feedback System

**Purpose:** Collect user feedback to improve prompts, train recommendation systems, and build RAG training data.

---

## Overview

Two-tier approach balances **low-friction engagement** with **thoughtful quality ratings**:

### Tier 1: Quick Feedback (Immediate, Low Friction)
- ❤️ **Like** - Simple heart button
- 🔖 **Save** - Add to collection
- 👍 **Helpful** - "Was this helpful?" yes/no

**When:** Immediately after viewing a prompt  
**Effort:** 1 click  
**Purpose:** Measure engagement and initial usefulness

### Tier 2: Detailed Rating (After Usage, Thoughtful)
- ⭐ **1-5 Star Rating** - Overall quality
- 📊 **Dimension Scores** (optional):
  - Clarity: Easy to understand?
  - Usefulness: Solved your problem?
  - Completeness: All info included?
  - Accuracy: Correct output?
- 💬 **Comment** - What worked/didn't work
- 🔧 **Improvement Suggestions** - Checkboxes for common issues
- 🤖 **Usage Context** - Which AI model, did it work, etc.

**When:** After using the prompt with AI  
**Effort:** 2-3 minutes  
**Purpose:** Deep quality insights, RAG training data

---

## Why Two Tiers?

### Problem with Single-Tier Systems
- **Too simple:** Just stars = no context
- **Too complex:** Long surveys = low response rate
- **Wrong timing:** Asking for detailed feedback before usage

### Our Solution
1. **Quick feedback first** - Low barrier, high engagement
2. **Detailed rating later** - After they've actually used it
3. **Progressive disclosure** - Optional dimensions if they want to help more

**Result:**
- High engagement rate (60-80% quick feedback)
- Quality insights (10-20% detailed ratings)
- Better data for training and recommendations

---

## User Flow

```
User visits prompt page
    ↓
[TIER 1] See Like/Save/Helpful buttons
    ↓
User clicks "Like" ❤️
    ↓
✅ "Thanks! Your feedback helps us improve"
    ↓
User copies prompt and uses with AI
    ↓
[TIER 2] Prompt appears: "Rate your experience?"
    ↓
User clicks "Rate" button
    ↓
Modal opens with 1-5 stars
    ↓
User selects 4 stars ⭐⭐⭐⭐
    ↓
(Optional) Expands dimensions, adds comment
    ↓
Clicks "Submit Rating"
    ↓
✅ "Thanks! This helps us recommend better prompts"
    ↓
Data saved to MongoDB for:
  - Prompt improvement
  - Recommendation algorithm
  - RAG training data
```

---

## Implementation

### Database Schema

**File:** `src/lib/db/schemas/user-feedback.ts`

**Collections:**

#### 1. `prompt_quick_feedback`
```typescript
{
  _id: ObjectId,
  userId: "user123" | null,        // Logged in or anonymous
  promptId: "cg-001",
  action: "like" | "save" | "helpful" | "not-helpful" | "share",
  timestamp: ISODate("2025-10-31..."),
  sessionId: "sess_abc123",
  metadata: {
    timeOnPage: 45,                // Seconds
    scrollDepth: 85,               // Percentage
    copiedContent: true,           // Did they copy?
    source: "search"               // How they found it
  }
}
```

#### 2. `prompt_detailed_ratings`
```typescript
{
  _id: ObjectId,
  userId: "user123" | null,
  promptId: "cg-001",
  
  // Overall rating
  rating: 4,                       // 1-5 stars
  
  // Dimension scores (optional)
  dimensions: {
    clarity: 5,
    usefulness: 4,
    completeness: 4,
    accuracy: 4
  },
  
  // Usage context
  usageContext: {
    aiModel: "gpt-4o",
    modelCost: 0.005,
    timeToComplete: 180,           // Seconds
    iterationCount: 2,             // How many tries
    achievedGoal: true
  },
  
  // Feedback
  comment: "Great prompt! Added examples helped a lot.",
  tags: ["kubernetes", "debugging"],
  suggestedImprovements: ["add-edge-cases"],
  
  timestamp: ISODate("2025-10-31..."),
  sessionId: "sess_abc123"
}
```

#### 3. `prompt_score_aggregates` (Computed)
```typescript
{
  _id: ObjectId,
  promptId: "cg-001",
  
  // Quick feedback totals
  quickFeedback: {
    likes: 145,
    saves: 89,
    helpful: 203,
    notHelpful: 12,
    shares: 34,
    totalInteractions: 483
  },
  
  // Detailed ratings
  detailedRatings: {
    averageRating: 4.2,
    ratingCount: 67,
    ratingDistribution: {
      stars1: 2,
      stars2: 5,
      stars3: 12,
      stars4: 28,
      stars5: 20
    },
    averageClarity: 4.5,
    averageUsefulness: 4.1,
    averageCompleteness: 4.0,
    averageAccuracy: 4.3
  },
  
  // Computed scores
  overallScore: 85,                // 0-100 (engagement 40% + quality 60%)
  confidenceScore: 95,             // How confident? (more data = higher)
  trendingScore: 12,               // Recent activity spike
  
  // Quality flags
  qualityFlags: {
    isHighQuality: true,           // Overall score >= 80
    needsImprovement: false,       // Overall score < 60
    hasIssues: false,              // notHelpful > helpful
    isPopular: true                // totalInteractions >= 50
  },
  
  // RAG training readiness
  ragReadiness: {
    isReady: true,                 // Ready for RAG training
    score: 92,                     // 0-100
    reasoning: "Meets all quality criteria for RAG training"
  },
  
  lastUpdated: ISODate("2025-10-31...")
}
```

---

## UI Components

### 1. Quick Feedback Widget
**File:** `src/components/feedback/QuickFeedback.tsx`  
**Location:** On prompt detail page, always visible

**Features:**
- ❤️ Like button (heart icon, fills when clicked)
- 🔖 Save button (bookmark, adds to collection)
- 👍 "Was this helpful?" (yes/no buttons)
- Privacy notice: "We collect feedback to improve our prompts"

**UX:**
- One-click actions
- Immediate visual feedback
- Toast notification: "Thanks! Your feedback helps us improve"
- Buttons disable after action (can't spam)

### 2. Detailed Rating Modal
**File:** `src/components/feedback/DetailedRatingModal.tsx`  
**Location:** Triggered after user has used the prompt

**Triggers:**
- After copying prompt (delay 30 seconds)
- Manual "Rate this prompt" button
- After saving to collection

**Features:**
- Required: 1-5 star rating
- Optional: Dimension ratings (clarity, usefulness, completeness, accuracy)
- Optional: Which AI model used, did it work?
- Optional: Comment (500 chars max)
- Optional: Improvement suggestions (checkboxes)

**UX:**
- Progressive disclosure (simple by default, can expand)
- Real-time character count
- Clear privacy notice
- Submit button disabled until 1+ stars selected

---

## API Endpoints

### POST /api/feedback/quick
**Purpose:** Save quick feedback (like, save, helpful)

**Request:**
```json
{
  "promptId": "cg-001",
  "action": "like",
  "metadata": {
    "timeOnPage": 45,
    "copiedContent": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback recorded. Thank you for helping us improve!"
}
```

### POST /api/feedback/rating
**Purpose:** Save detailed 1-5 star rating

**Request:**
```json
{
  "promptId": "cg-001",
  "rating": 4,
  "dimensions": {
    "clarity": 5,
    "usefulness": 4
  },
  "usageContext": {
    "aiModel": "gpt-4o",
    "achievedGoal": true
  },
  "comment": "Great prompt!",
  "suggestedImprovements": ["add-examples"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your detailed feedback!"
}
```

### GET /api/feedback/rating?promptId=cg-001
**Purpose:** Retrieve aggregate scores for a prompt

**Response:**
```json
{
  "promptId": "cg-001",
  "quickFeedback": {
    "likes": 145,
    "saves": 89,
    "helpful": 203
  },
  "detailedRatings": {
    "averageRating": 4.2,
    "ratingCount": 67
  },
  "overallScore": 85,
  "confidenceScore": 95,
  "qualityFlags": {
    "isHighQuality": true
  }
}
```

---

## Scoring Algorithm

### Overall Score (0-100)

**Formula:**
```
Overall Score = (Engagement Score × 40%) + (Quality Score × 60%)
```

**Engagement Score (0-40 points):**
```
Engagement Ratio = (likes + saves + helpful) / totalInteractions
Engagement Score = Engagement Ratio × 40
```

**Quality Score (0-60 points):**
```
Quality Score = (Average Star Rating / 5) × 60
```

**Example:**
```
Quick Feedback:
  145 likes + 89 saves + 203 helpful = 437 positive
  12 not-helpful
  Total = 449 interactions
  Ratio = 437/449 = 0.973
  Engagement Score = 0.973 × 40 = 38.9

Detailed Ratings:
  Average = 4.2/5
  Quality Score = (4.2/5) × 60 = 50.4

Overall = 38.9 + 50.4 = 89.3/100 ⭐ HIGH QUALITY
```

### Confidence Score (0-100)

**Formula:**
```
Total Feedback = quick_count + (detailed_count × 3)
// Detailed ratings count 3x more

< 5 feedback   = 20% confidence
5-10 feedback  = 40% confidence
10-25 feedback = 60% confidence
25-50 feedback = 80% confidence
50+ feedback   = 100% confidence
```

**Why it matters:** A prompt with 2 five-star ratings isn't as reliable as one with 50 four-star ratings.

### RAG Readiness Score (0-100)

**Criteria:**
1. Overall score >= 75 (30 points)
2. Sufficient data (confidence >= 60) (25 points)
3. Positive ratings (avg >= 4.0) (30 points)
4. Many ratings (>= 10 detailed) (15 points)

**Threshold:** >= 80 points = Ready for RAG training

**Example:**
```
Prompt: "Kubernetes Debugging Guide"
Overall Score: 89 ✅ (30 pts)
Confidence: 95% ✅ (25 pts)
Avg Rating: 4.5 ✅ (30 pts)
Rating Count: 67 ✅ (15 pts)

RAG Score: 100/100 ✅ READY FOR RAG TRAINING
```

---

## Use Cases

### 1. Improve Prompt Quality
**Process:**
1. Identify low-scoring prompts (overall < 60)
2. Review user comments and suggested improvements
3. Regenerate or edit prompt
4. Re-test with AI models
5. Monitor if score improves

**Example:**
```
Prompt: "Junior Dev Mentorship Prep"
Overall Score: 58 ⚠️ NEEDS IMPROVEMENT

User Feedback:
  - "Too verbose" (15 users)
  - "Add more specific examples" (8 users)
  - "Simplify language" (12 users)

Action:
  1. Reduce length by 30%
  2. Add 3 concrete examples
  3. Simplify technical jargon
  4. Re-test and monitor feedback
```

### 2. Recommendation System
**Process:**
1. User rates Prompt A highly (5 stars)
2. System finds similar prompts with high scores
3. Recommends: "Users who liked this also liked..."
4. Tracks which recommendations are helpful

**Example:**
```
You rated "Code Review Assistant" 5 stars

Recommended for you:
  1. "Pull Request Review Co-Pilot" (4.5⭐, 89% match)
  2. "Secure Coding Practices" (4.3⭐, 82% match)
  3. "Technical Debt Analysis" (4.1⭐, 76% match)
```

### 3. RAG Training Data
**Process:**
1. Filter prompts with RAG readiness score >= 80
2. Extract high-quality prompt-response pairs
3. Use for:
   - Training custom models
   - Fine-tuning embeddings
   - Building vector database for semantic search
   - Creating example datasets

**Criteria for RAG Training:**
- ✅ Overall score >= 75
- ✅ Confidence >= 60% (sufficient sample size)
- ✅ Average rating >= 4.0 stars
- ✅ At least 10 detailed ratings
- ✅ No major quality flags

**Example:**
```
RAG-Ready Prompts: 45 of 90 (50%)

Top Performers for RAG Training:
1. "Security Audit for Production API" (RAG: 100/100)
   - 9.2/10 red-hat score
   - 4.8⭐ average rating (143 ratings)
   - 95% confidence
   - Includes 67 real usage examples from users

2. "Kubernetes Pod Investigation" (RAG: 98/100)
   - 8.5/10 red-hat score
   - 4.5⭐ average rating (89 ratings)
   - 92% confidence
```

### 4. Content Curation
**Process:**
1. Auto-feature prompts with overall score >= 80
2. Flag prompts needing improvement (score < 60)
3. Archive unused prompts (low engagement, low ratings)
4. Prioritize improvement efforts

**Dashboard View:**
```
📊 Content Quality Dashboard

HIGH QUALITY (80+): 45 prompts
  → Auto-featured in library
  → Ready for RAG training

GOOD QUALITY (60-79): 32 prompts
  → Included in library
  → Monitor for improvements

NEEDS WORK (<60): 13 prompts
  ⚠️ Priority for improvement:
    1. "Junior Dev Mentorship" (58) - "Too verbose"
    2. "Product Strategy Red Team" (55) - "Not actionable"
    3. "User Research Script" (52) - "Too generic"
```

---

## Privacy & Transparency

### User Consent
**On first interaction:**
```
💡 Help Us Improve
We collect feedback to improve our prompts and recommend 
better content. Your ratings help the community.

[ ] Allow feedback collection (required for features)
[ ] Anonymous tracking (no personally identifiable data)
[ ] Share my ratings with community (show publicly)

Learn more: Privacy Policy
```

### Data Collection Notice
**On every feedback widget:**
```
💡 We collect feedback to improve our site and recommend
better prompts. See our Privacy Policy for details.
```

### What We Collect
**Transparent disclosure:**
- ✅ Which prompts you viewed
- ✅ Which prompts you liked/saved
- ✅ Your star ratings and comments
- ✅ Which AI models you used (if you tell us)
- ✅ Whether prompts helped you
- ❌ No prompt content you entered
- ❌ No AI outputs you generated
- ❌ No personal/company data

### User Control
**Users can:**
- Opt out of feedback collection (loses features)
- Delete their ratings
- Export their data
- Make ratings anonymous
- Control public sharing

---

## Analytics & Insights

### Feedback Analytics Dashboard

**Weekly Report:**
```
📊 Weekly Feedback Report (Oct 24-31)

ENGAGEMENT:
  Total quick feedback: 1,234
    ❤️ Likes: 456
    🔖 Saves: 234
    👍 Helpful: 478
    👎 Not helpful: 66
    
  Total detailed ratings: 89
  Average rating: 4.3⭐
  
TRENDS:
  Quality trend: ↗️ Improving (+0.2 from last week)
  New featured prompts: 3
  Prompts needing attention: 2
  
TOP PERFORMERS:
  1. "Security Audit API" (9.2/10, 4.8⭐)
  2. "K8s Pod Investigation" (8.5/10, 4.5⭐)
  3. "1-on-1 Facilitator" (8.3/10, 4.4⭐)
  
NEEDS IMPROVEMENT:
  1. "Junior Dev Mentorship" (58/100)
     Issues: Too verbose (15 users)
     Action: Reduce by 30%, add examples
     
  2. "Product Strategy" (55/100)
     Issues: Not actionable (12 users)
     Action: Add concrete examples
```

### User Engagement Metrics
```
ACTIVE RATERS:
  This week: 423 users
  Quick feedback: 356 users (84%)
  Detailed ratings: 67 users (16%)
  
AVERAGE BEHAVIOR:
  2.9 quick actions per user
  1.3 detailed ratings per user
  
CONVERSION:
  View → Quick feedback: 62%
  Quick feedback → Detailed: 19%
  View → Detailed: 12%
```

---

## RAG Training Pipeline

### Step 1: Identify RAG-Ready Prompts
```typescript
// Query for RAG-ready prompts
db.prompt_score_aggregates.find({
  'ragReadiness.isReady': true,
  'ragReadiness.score': { $gte: 80 }
});

// Result: 45 prompts ready for training
```

### Step 2: Extract Training Data
```typescript
// For each RAG-ready prompt:
{
  prompt: {
    title: "Security Audit for Production API",
    content: "You are a security engineer...",
    tags: ["security", "api", "production"]
  },
  
  userFeedback: {
    averageRating: 4.8,
    totalRatings: 143,
    commonSuccessPatterns: [
      "Used with gpt-4o, found 3 vulnerabilities",
      "Comprehensive checklist, nothing missed",
      "Clear structure, easy to follow"
    ]
  },
  
  qualityScore: 92,
  confidence: 95
}
```

### Step 3: Build Training Dataset
```json
{
  "high_quality_prompts": [
    {
      "id": "sec-001",
      "category": "security",
      "rating": 4.8,
      "usage_count": 143,
      "success_rate": 0.89,
      "prompt_text": "...",
      "recommended_model": "gpt-4o",
      "recommended_framework": "KERNEL"
    }
  ],
  "total_examples": 45,
  "average_quality": 4.5,
  "training_ready": true
}
```

### Step 4: Use for Recommendations
```typescript
// When user views Prompt A
const similar = await findSimilarPrompts({
  basedOn: "cg-001",
  minRagScore: 80,
  minOverallScore: 75,
  sameCategory: true
});

// Recommend top 3 similar high-quality prompts
```

---

## Implementation Checklist

### Backend ✅
- [x] Create feedback schemas (Zod validation)
- [x] Create API routes (quick feedback, detailed rating)
- [x] Implement score aggregation
- [x] Calculate RAG readiness

### Frontend (Next)
- [ ] Add QuickFeedback component to prompt pages
- [ ] Add DetailedRatingModal component
- [ ] Add "Rate this prompt" button trigger
- [ ] Show aggregate scores on prompt cards
- [ ] Display quality badges (⭐ 4.5, 143 ratings)

### Analytics (Next)
- [ ] Create admin dashboard for feedback analytics
- [ ] Weekly quality report generator
- [ ] Identify prompts needing improvement
- [ ] RAG training data export

### Training (Future)
- [ ] Build RAG dataset from high-quality prompts
- [ ] Train recommendation algorithm
- [ ] Fine-tune embeddings for search
- [ ] A/B test recommendation quality

---

## Success Metrics

### Engagement Targets (Month 1)
- Quick feedback rate: 50-60% of viewers
- Detailed rating rate: 10-15% of viewers
- Average rating: 4.0+ stars
- Ratings per prompt: 10+ (for confidence)

### Quality Targets (Month 3)
- High-quality prompts (80+): 50%
- RAG-ready prompts (80+): 40%
- Prompts needing work (<60): <10%
- Average overall score: 75+

### Training Targets (Month 6)
- RAG-ready prompts: 100+
- Training dataset size: 500+ examples
- Recommendation accuracy: 80%+
- User satisfaction: 4.5+ stars

---

## Next Steps

### Week 1: Backend Complete ✅
- [x] Create schemas
- [x] Create API routes
- [x] Implement scoring algorithm

### Week 2: UI Integration
- [ ] Add QuickFeedback to prompt detail page
- [ ] Add DetailedRatingModal
- [ ] Test feedback flow end-to-end
- [ ] Deploy to production

### Week 3: Analytics
- [ ] Build admin dashboard
- [ ] Create weekly report generator
- [ ] Identify improvement opportunities
- [ ] Act on user feedback

### Week 4: Training Data
- [ ] Export RAG-ready prompts
- [ ] Build training dataset
- [ ] Test recommendation algorithm
- [ ] Plan A/B tests

---

## Related Documentation

- [Prompt Library Expansion](./PROMPT_LIBRARY_EXPANSION.md) - AI-driven prompt generation
- [Multi-Model Testing](./MULTI_MODEL_TESTING.md) - AI model testing
- [Test Results Summary](./TEST_RESULTS_SUMMARY.md) - Latest test results
- [Current Status](../CURRENT_STATUS.md) - Overall project status

---

**Status:** ✅ Backend complete, ready for UI integration  
**Cost:** $0 (no AI usage, just data collection)  
**Privacy:** Transparent, user-controlled, GDPR-ready  
**Purpose:** Improve prompts, train systems, build RAG data

