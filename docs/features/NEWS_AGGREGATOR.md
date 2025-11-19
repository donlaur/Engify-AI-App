# News Aggregator Feature

## Overview

The News Aggregator automatically fetches and parses RSS/Atom feeds and API endpoints for AI tools and models, storing updates in the database and displaying them on tool/model detail pages.

## Features

### 1. Multi-Source Feed Support
- **RSS/Atom Feeds**: Parses standard RSS and Atom feeds
- **API Feeds**: Supports custom API endpoints with transformation functions
- **Pre-configured Feeds**: Includes feeds for Cursor, Windsurf, OpenRouter, Hugging Face, and more

### 2. Intelligent Model/Tool Detection
- **Fuzzy Matching**: Uses Jaccard similarity to match article content to models/tools
- **Multi-Signal Detection**: Combines exact matches, fuzzy matches, and keyword matching
- **Confidence Scores**: Stores confidence scores for matches (0.0-1.0)
- **Multiple Matches**: Can link one article to multiple models/tools

### 3. Automatic Model Sync Triggering
- When articles mention AI models, the system can trigger model syncs
- Helps keep model data up-to-date when new releases are announced

### 4. Database Schema

**Collection**: `ai_tool_updates`

```typescript
{
  id: string;                    // Unique identifier
  toolId?: string;               // Primary tool ID
  modelId?: string;              // Primary model ID
  relatedTools: string[];        // Additional tool IDs
  relatedModels: string[];        // Additional model IDs
  matchConfidence?: number;       // Confidence score (0-1)
  type: 'tool-update' | 'model-release' | 'status-incident' | 'changelog' | 'blog-post' | 'announcement';
  title: string;
  description?: string;
  content?: string;
  link: string;
  publishedAt: Date;
  feedUrl: string;
  source: string;
  features: string[];             // Extracted features (e.g., "Full Terminal Use", "/plan")
  // ... other fields
}
```

## Usage

### Sync All Feeds

```bash
# Via API (requires admin auth)
POST /api/admin/news/sync
```

### Sync Specific Feed

```bash
POST /api/admin/news/sync
{
  "feedUrl": "https://cursor.sh/rss.xml"
}
```

### Get Updates for Tool

```typescript
import { newsAggregatorService } from '@/lib/services/NewsAggregatorService';

const updates = await newsAggregatorService.getToolUpdates('cursor', 10);
```

### Get Updates for Model

```typescript
const updates = await newsAggregatorService.getModelUpdates('gpt-5.1', 10);
```

## Feed Configuration

Feeds are configured in `NewsAggregatorService.ts`:

```typescript
const FEED_CONFIGS: FeedConfig[] = [
  {
    url: 'https://cursor.sh/rss.xml',
    source: 'cursor-blog',
    toolId: 'cursor',
    type: 'blog-post',
    feedType: 'rss',
  },
  // ... more feeds
];
```

## Model Detection Algorithm

1. **Exact Match**: Checks for exact model/tool ID, name, slug, or display name
2. **Fuzzy Match**: Calculates similarity using Jaccard coefficient
3. **Keyword Match**: Extracts keywords and matches against model/tool tags
4. **Confidence Scoring**: Combines multiple signals with weighted scores
5. **Threshold**: Only matches above 0.4 confidence are stored

## UI Component

The `AIToolUpdates` component displays updates on tool/model pages:

```tsx
<AIToolUpdates 
  updates={updates} 
  toolName="Cursor"
  emptyMessage="No recent updates available."
/>
```

## Supported Models

### New Models Added
- **GPT-5.1**: Enhanced version of GPT-5
- **Gemini 3.0 Pro**: Latest Gemini model
- **Gemini 3.0 Flash**: Fast Gemini 3.0 variant

### Model Sync Updates
- Model sync now includes GPT-5.1 and Gemini 3.0
- Pricing and context windows updated
- Tags and recommendations updated

## Future Enhancements

1. **OpenRouter API Integration**: Use OpenRouter API for model discovery
2. **Semantic Search**: Use embeddings for better article-to-model matching
3. **Automated Sync**: Cron job to sync feeds every 15-30 minutes
4. **Email Notifications**: Notify users when their favorite tools/models are updated
5. **Social Media Integration**: Pull updates from Twitter/X, LinkedIn

## Related Files

- `src/lib/services/NewsAggregatorService.ts` - Main service
- `src/lib/db/schemas/ai-tool-update.ts` - Database schema
- `src/components/features/AIToolUpdates.tsx` - UI component
- `src/app/api/admin/news/sync/route.ts` - Sync API endpoint
- `src/app/learn/ai-tools/[slug]/page.tsx` - Tool detail page (uses component)

