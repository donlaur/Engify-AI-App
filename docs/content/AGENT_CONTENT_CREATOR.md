<!--
AI Summary: Automated agent content creator with provider-agnostic execution, budget controls, and provenance tracking.
Uses CreatorAgent for deterministic content generation with allowlisted models. Part of Day 5 Phase 2.5.
-->

# Automated Agent Content Creator

This work is part of Day 5: [Day 5 Plan](../planning/DAY_5_PLAN.md).

## Overview

Provider-agnostic content creation agent that generates high-quality articles using AI, with built-in budget controls, provenance tracking, and deterministic behavior. Uses the new model carrier system with allowlisted models and hard cost limits.

## Architecture

### CreatorAgent (`src/lib/agents/CreatorAgent.ts`)

**Core Features:**
- Provider-agnostic execution using `AIProviderFactory`
- Budget enforcement ($0.50 default limit per creation)
- Model allowlisting for safety and cost control
- Deterministic defaults (temperature 0.7, retries via provider harness)
- Automatic content quality validation (minimum 100 words)
- Provenance tracking for audit trails

**Key Methods:**
- `createContent()`: Main content generation with full validation
- `selectModelForContent()`: Intelligent model selection by category
- `buildContentPrompt()`: Structured prompt engineering
- `getStats()`: Creation statistics and analytics

### API Integration (`src/app/api/agents/creator/route.ts`)

**Endpoints:**
- `POST /api/agents/creator`: Trigger single content creation
- `GET /api/agents/creator`: Retrieve creation statistics

**Security:**
- RBAC protected (org_admin/super_admin only)
- Comprehensive audit logging
- Input validation with Zod schemas

### Batch Processing (`scripts/content/generate-batch.ts`)

**Features:**
- Curated topic processing from `src/lib/content/topics.ts`
- Parallel execution with rate limiting
- Progress tracking and error handling
- Results logging with cost analysis

### Content Topics (`src/lib/content/topics.ts`)

**Topic Management:**
- Environment-gated allowlist
- Category-based organization
- Priority-based processing
- Configurable word counts and tags

## Content Pipeline Integration

### Provenance Tracking

All generated content includes:
```javascript
{
  source: 'agent-generated',
  reviewStatus: 'pending',
  metadata: {
    topic: string,
    category: string,
    wordCount: number,
    tokensUsed: number,
    cost: number,
    model: string,
    generationTimeMs: number
  }
}
```

### OpsHub Integration

**ContentReviewQueue Updates:**
- "Generated" source filter button
- Regenerate action for agent-generated content
- Quality metrics display in review interface

### Quality Gates

**Automatic Validation:**
- Minimum word count (100 words)
- Content structure validation
- Readability scoring (future enhancement)
- Duplicate detection (future enhancement)

## Usage Examples

### Single Content Creation
```bash
curl -X POST /api/agents/creator \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Building Scalable APIs with Next.js",
    "category": "engineering",
    "targetWordCount": 800,
    "tags": ["api", "nextjs", "scalability"]
  }'
```

### Batch Processing
```bash
# Generate top 5 priority topics
npx tsx scripts/content/generate-batch.ts 5

# Show current statistics
npx tsx scripts/content/generate-batch.ts --stats
```

### Topic Management
```typescript
import { getEnabledTopics, getTopicsByCategory } from '@/lib/content/topics';

// Get all available topics
const topics = getEnabledTopics();

// Get engineering topics only
const engTopics = getTopicsByCategory('engineering');
```

## Configuration

### Environment Variables
- `CONTENT_CREATION_ENABLED`: Enable/disable feature (default: true)
- `CONTENT_CREATION_BUDGET_LIMIT`: Max cost per creation (default: 0.50)
- `CONTENT_CREATION_ALLOWED_MODELS`: Comma-separated model allowlist

### Topic Configuration
Topics can be enabled/disabled per environment:
```typescript
{
  topic: "Advanced React Patterns",
  category: "engineering",
  enabled: process.env.NODE_ENV === 'production', // Production only
  priority: 8
}
```

## Monitoring & Analytics

### Statistics Available
- Total content created
- Total words generated
- Total cost incurred
- Average quality scores
- Success/failure rates

### Audit Logging
All creation activities are logged with:
- User ID and permissions
- Content metadata
- Cost and performance metrics
- Error details (if applicable)

## Acceptance Criteria

- ✅ Provider-agnostic CreatorAgent with budget controls
- ✅ Deterministic behavior with allowlisted models
- ✅ Draft persistence with `reviewStatus='pending'`
- ✅ Provenance events recorded in database
- ✅ API route with RBAC protection
- ✅ Batch script for topic processing
- ✅ Topic allowlist with environment gating
- ✅ OpsHub "Generated" filter and Regenerate action
- ✅ Quality validation (word count, structure)
- ✅ Audit logging for all operations

## Future Enhancements

- **Quality Scoring**: Automated readability and coherence metrics
- **Duplicate Detection**: Similarity checking against existing content
- **A/B Testing**: Multiple model outputs for quality comparison
- **Personalization**: User preference-based content adaptation
- **Multi-language**: Support for non-English content creation
- **SEO Optimization**: Built-in keyword research and optimization