# Content Generation API Documentation

## Overview

The Content Generation API provides production-ready, cloud-based endpoints for generating, reviewing, and publishing high-quality content using AI agents. The system follows SOLID principles and uses a factory pattern for dependency injection.

## Architecture

### SOLID Principles Applied

1. **Single Responsibility Principle (SRP)**
   - Each service has one clear responsibility
   - `SingleAgentContentGenerator`: Fast, simple generation
   - `MultiAgentContentGenerator`: High-quality, SEO-optimized generation
   - `ContentReviewService`: Multi-agent content review
   - `ContentPublishingServiceAdapter`: Publishing workflow

2. **Open/Closed Principle (OCP)**
   - Easy to add new generator types without modifying existing code
   - Factory pattern allows extension without modification

3. **Liskov Substitution Principle (LSP)**
   - All generators implement `IContentGenerator` interface
   - Can swap implementations without breaking consumers

4. **Interface Segregation Principle (ISP)**
   - Separate interfaces for generation, review, and publishing
   - Clients only depend on interfaces they use

5. **Dependency Inversion Principle (DIP)**
   - High-level modules depend on abstractions (interfaces)
   - Factory creates concrete implementations

### Service Layer

```
src/lib/services/content/
├── interfaces/
│   ├── IContentGenerator.ts      # Generation interface
│   ├── IContentReviewer.ts       # Review interface
│   └── IContentPublisher.ts      # Publishing interface
├── implementations/
│   ├── SingleAgentContentGenerator.ts
│   ├── MultiAgentContentGenerator.ts
│   ├── ContentReviewService.ts
│   └── ContentPublishingServiceAdapter.ts
└── ContentGenerationService.ts   # Facade pattern
```

### Factory Pattern

```typescript
import { ContentGeneratorFactory } from '@/lib/factories/ContentGeneratorFactory';

// Create a generator
const generator = ContentGeneratorFactory.createGenerator('multi-agent', {
  organizationId: 'org-123',
});

// Get recommended generator based on requirements
const type = ContentGeneratorFactory.getRecommendedGenerator({
  wordCount: 1500,
  quality: 'production',
  budget: 'medium',
});
```

## API Endpoints

### 1. Batch Content Generation

**POST** `/api/admin/content/generate/batch`

Generate multiple articles in a single batch request. Jobs are processed asynchronously in the background.

**Request Body:**
```json
{
  "generatorType": "multi-agent",
  "topics": [
    {
      "topic": "How to use Cursor AI for React Development",
      "category": "Tutorial",
      "targetWordCount": 1200,
      "keywords": ["cursor ai", "react", "development"]
    },
    {
      "topic": "Next.js 15 New Features",
      "category": "Guide",
      "targetWordCount": 1500,
      "keywords": ["nextjs", "react server components"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "cg-1234567890-abc123",
  "message": "Batch job submitted with 2 topics",
  "statusUrl": "/api/admin/content/generation-status/cg-1234567890-abc123"
}
```

**Generator Types:**
- `single-agent`: Fast, budget-friendly (~$0.01/article)
- `multi-agent`: High quality, SEO-optimized (~$0.05/article)

**Limits:**
- Max 50 topics per batch
- Rate limited per user

---

### 2. Section Regeneration

**POST** `/api/admin/content/regenerate`

Regenerate specific sections of existing articles with improved quality or readability.

**Request Body:**
```json
{
  "articleId": "507f1f77bcf86cd799439011",
  "sectionIndex": 2,
  "generatorType": "multi-agent",
  "targetWordCount": 800,
  "improveReadability": true
}
```

**Response:**
```json
{
  "success": true,
  "articleId": "507f1f77bcf86cd799439011",
  "sectionIndex": 2,
  "section": {
    "title": "Implementation Guide",
    "originalWordCount": 650,
    "newWordCount": 820
  },
  "content": "# Implementation Guide\n\n...",
  "metadata": {
    "wordCount": 820,
    "tokensUsed": 3280,
    "costUSD": 0.039,
    "model": "multi-agent-pipeline",
    "provider": "mixed",
    "generatedAt": "2025-11-17T10:30:00Z",
    "qualityScore": 8.5
  },
  "validation": {
    "isValid": true,
    "errors": [],
    "warnings": ["Some AI slop detected: utilize"],
    "qualityScore": 8.5
  }
}
```

**Options:**
- `improveReadability`: Focus on simpler language and sentence structure
- `targetWordCount`: Override default section word count
- `generatorType`: Choose generator type

---

### 3. Job Status Tracking

**GET** `/api/admin/content/generation-status/[jobId]`

Get real-time status of batch generation jobs. Supports polling for updates.

**Response:**
```json
{
  "success": true,
  "job": {
    "jobId": "cg-1234567890-abc123",
    "status": "processing",
    "progress": {
      "total": 10,
      "completed": 6,
      "failed": 1,
      "pending": 3,
      "percentComplete": 70
    },
    "timing": {
      "createdAt": "2025-11-17T10:00:00Z",
      "startedAt": "2025-11-17T10:00:05Z",
      "completedAt": null,
      "durationMs": 180000,
      "estimatedTimeRemainingMs": 90000
    },
    "results": [
      {
        "topic": "How to use Cursor AI",
        "status": "completed",
        "contentId": "content-123",
        "wordCount": 1245,
        "costUSD": 0.048
      },
      {
        "topic": "React Server Components",
        "status": "processing",
        "wordCount": null,
        "costUSD": null
      }
    ]
  }
}
```

**Job Statuses:**
- `queued`: Waiting to start
- `processing`: Currently generating content
- `completed`: All topics generated successfully
- `partial`: Some topics succeeded, some failed
- `failed`: All topics failed

**Polling Recommendation:**
- Poll every 3-5 seconds while `status === 'processing'`
- Stop polling when status is `completed`, `partial`, or `failed`

---

## Usage Examples

### Example 1: Quick Draft Generation

```typescript
import { ContentGenerationService } from '@/lib/services/content/ContentGenerationService';

// Create draft service
const service = ContentGenerationService.createDraftService('org-123');

// Generate quick draft
const result = await service.quickDraft({
  topic: 'How to use TypeScript with React',
  category: 'Tutorial',
  targetWordCount: 800,
  keywords: ['typescript', 'react', 'tutorial'],
});

console.log(result.content);
console.log(`Cost: $${result.metadata.costUSD}`);
```

### Example 2: Production Content Workflow

```typescript
import { ContentGenerationService } from '@/lib/services/content/ContentGenerationService';

// Create production service (multi-agent)
const service = ContentGenerationService.createProductionService('org-123');

// Full workflow: generate + review + publish
const result = await service.generateAndPublish({
  topic: 'Advanced React Patterns',
  category: 'Guide',
  targetWordCount: 1500,
  keywords: ['react', 'patterns', 'advanced'],
  tone: 'advanced',
  autoRevise: true, // Automatically apply review improvements
});

console.log('Generated Content:', result.content);
console.log('Review Score:', result.review?.finalScore);
console.log('Publish Ready:', result.publish?.publishReady);
console.log('Total Cost:', result.totalCost);
console.log('Total Time:', result.totalTime, 'ms');
```

### Example 3: Batch Generation via API

```typescript
// Submit batch job
const response = await fetch('/api/admin/content/generate/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    generatorType: 'multi-agent',
    topics: [
      { topic: 'Topic 1', category: 'Tutorial', targetWordCount: 1000 },
      { topic: 'Topic 2', category: 'Guide', targetWordCount: 1200 },
    ],
  }),
});

const { jobId } = await response.json();

// Poll for status
const pollStatus = async () => {
  const statusResponse = await fetch(
    `/api/admin/content/generation-status/${jobId}`
  );
  const { job } = await statusResponse.json();

  console.log(`Progress: ${job.progress.percentComplete}%`);

  if (job.status === 'processing') {
    setTimeout(pollStatus, 3000); // Poll every 3 seconds
  } else {
    console.log('Job complete:', job.status);
    console.log('Results:', job.results);
  }
};

pollStatus();
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": []
}
```

**Common Status Codes:**
- `200`: Success
- `400`: Bad request (validation error)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `429`: Rate limit exceeded
- `500`: Internal server error

## Rate Limits

- **Batch Generation**: 10 requests per hour per user
- **Section Regeneration**: 30 requests per hour per user
- **Status Tracking**: 100 requests per minute per user

## Cost Estimation

### Single Agent Generator
- **Model**: GPT-4o or CreatorAgent default
- **Cost**: ~$0.01 per 800-word article
- **Speed**: ~10-20 seconds
- **Best for**: Drafts, simple content, high volume

### Multi-Agent Generator
- **Models**: Mix of GPT-4o and Claude Sonnet
- **Cost**: ~$0.05 per 1500-word article
- **Speed**: ~60-120 seconds (7 agents)
- **Best for**: Production content, SEO-optimized, pillar pages

## OpsHub UI

Access the Content Generator panel in OpsHub:

1. Navigate to `/admin/opshub`
2. Click the "Generator" tab
3. Configure generation settings
4. Submit batch job
5. Monitor progress in real-time

**Features:**
- Real-time progress tracking
- Cost estimation
- Success/failure breakdown
- Result preview
- Automatic polling

## Migration Guide

### Migrating from Scripts to API

**Before (Script):**
```bash
pnpm tsx src/scripts/content-railroad-generate.ts <article-id>
```

**After (API):**
```typescript
// Use the API endpoint or service directly
const service = new ContentGenerationService('org-123', 'multi-agent');
const result = await service.generate({
  topic: 'Article Title',
  category: 'Tutorial',
  targetWordCount: 1500,
});
```

**Benefits:**
- Cloud-based (no local dependencies)
- Rate limiting and budget enforcement
- Background job processing
- Progress tracking
- Audit logging
- RBAC security

## Best Practices

1. **Choose the Right Generator**
   - Use `single-agent` for drafts and simple content
   - Use `multi-agent` for production and SEO-critical content

2. **Set Realistic Word Counts**
   - Tutorials: 800-1200 words
   - Guides: 1200-2000 words
   - Pillar pages: 2000-3000 words

3. **Use Keywords Strategically**
   - 3-5 keywords per article
   - Focus on search intent
   - Include LSI keywords

4. **Monitor Costs**
   - Track costs per job
   - Set budget limits
   - Use single-agent for bulk generation

5. **Review Generated Content**
   - Always review before publishing
   - Check for AI slop
   - Verify technical accuracy
   - Add personal experience

## Support

For issues or questions:
- Check logs in OpsHub Dead Letter Queue
- Review audit logs for cost tracking
- Contact engineering team for API changes
