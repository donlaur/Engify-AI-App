# News Aggregator Quick Start Guide

## ✅ System Status: Working

The news aggregator is fully functional and tested. Here's how to use it:

## Quick Start

### 1. Seed Initial Feeds

```bash
NODE_ENV=development pnpm tsx scripts/db/seed-feed-configs.ts
```

This creates 7 default feed configurations:
- Cursor Blog & Status
- Windsurf Changelog & Codeium Status
- OpenRouter Status
- Hugging Face Blog
- Warp Blog

### 2. Test the System

```bash
NODE_ENV=development pnpm tsx scripts/test-news-aggregator.ts
```

This will:
- ✅ Seed/update feed configurations
- ✅ List all enabled feeds
- ✅ Test fetching a feed
- ✅ Test syncing a feed

### 3. Register a New Feed

#### Via API (Recommended)

```bash
curl -X POST http://localhost:3000/api/admin/news/feeds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "url": "https://example.com/feed.xml",
    "source": "other",
    "feedType": "rss",
    "type": "blog-post",
    "name": "Example Feed",
    "description": "Example RSS feed",
    "enabled": true
  }'
```

#### Via Code

```typescript
import { FeedConfigRepository } from '@/lib/repositories/FeedConfigRepository';
import { randomUUID } from 'crypto';

const repository = new FeedConfigRepository();

await repository.create({
  id: randomUUID(),
  url: 'https://example.com/feed.xml',
  source: 'other',
  feedType: 'rss',
  type: 'blog-post',
  name: 'Example Feed',
  enabled: true,
});
```

### 4. Sync All Feeds

```bash
curl -X POST http://localhost:3000/api/admin/news/sync \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

This will:
- Fetch all enabled feeds from the database
- Parse RSS/Atom/API feeds
- Match articles to AI tools/models
- Store updates in the `ai_tool_updates` collection
- Trigger model syncs if models are mentioned

## Feed Types Supported

### RSS Feeds
```json
{
  "url": "https://example.com/feed.xml",
  "feedType": "rss",
  "source": "other",
  "type": "blog-post"
}
```

### Atom Feeds
```json
{
  "url": "https://example.com/feed.atom",
  "feedType": "atom",
  "source": "other",
  "type": "blog-post"
}
```

### API Feeds
```json
{
  "url": "https://api.example.com/news",
  "feedType": "api",
  "source": "other",
  "type": "announcement",
  "apiConfig": {
    "endpoint": "https://api.example.com/news",
    "headers": {
      "Authorization": "Bearer API_KEY"
    }
  }
}
```

## API Endpoints

### List Feeds
```bash
GET /api/admin/news/feeds
GET /api/admin/news/feeds?enabled=true  # Only enabled feeds
```

### Register Feed
```bash
POST /api/admin/news/feeds
Content-Type: application/json

{
  "url": "https://example.com/feed.xml",
  "source": "other",
  "feedType": "rss",
  "type": "blog-post",
  "name": "Example Feed",
  "enabled": true
}
```

### Update Feed
```bash
PUT /api/admin/news/feeds
Content-Type: application/json

{
  "id": "feed-id-here",
  "enabled": false
}
```

### Delete Feed
```bash
DELETE /api/admin/news/feeds?id=feed-id-here
```

### Sync Feeds
```bash
POST /api/admin/news/sync
```

## Database Collections

### `feed_configs`
Stores feed configurations:
- `id` - Unique identifier
- `url` - Feed URL
- `source` - Source identifier
- `feedType` - 'rss' | 'atom' | 'api'
- `type` - Update type
- `enabled` - Whether feed is active
- `lastSyncedAt` - Last sync time
- `errorCount` - Consecutive errors

### `ai_tool_updates`
Stores parsed feed items:
- `id` - Unique identifier
- `toolId` - Primary tool ID (if matched)
- `modelId` - Primary model ID (if matched)
- `relatedTools` - Additional tool IDs
- `relatedModels` - Additional model IDs
- `matchConfidence` - Confidence score (0-1)
- `title` - Article title
- `link` - Original URL
- `publishedAt` - Publication date
- `source` - Source identifier

## Features

### ✅ Automatic Entity Matching
Articles are automatically matched to AI tools and models using:
- Exact name matching
- Fuzzy matching (Jaccard similarity)
- Keyword extraction
- Multi-signal confidence scoring

### ✅ Model Sync Triggering
When articles mention AI models, the system can trigger model syncs to keep data up-to-date.

### ✅ Error Tracking
The system tracks:
- Last sync time
- Error count
- Last error message

### ✅ Multi-Tenant Support
Feeds can be scoped to organizations via `organizationId`.

## Example: Register OpenAI Blog

```bash
curl -X POST http://localhost:3000/api/admin/news/feeds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://openai.com/blog/rss.xml",
    "source": "openai-blog",
    "feedType": "rss",
    "type": "blog-post",
    "name": "OpenAI Blog",
    "description": "OpenAI official blog posts",
    "enabled": true
  }'
```

## Example: Register Anthropic Blog

```bash
curl -X POST http://localhost:3000/api/admin/news/feeds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://www.anthropic.com/news/rss",
    "source": "anthropic-blog",
    "feedType": "rss",
    "type": "blog-post",
    "name": "Anthropic Blog",
    "description": "Anthropic official blog posts",
    "enabled": true
  }'
```

## Troubleshooting

### Feed Returns 404
Some feeds may not exist or have moved. Check the feed URL manually:
```bash
curl -I https://example.com/feed.xml
```

### Feed Not Syncing
1. Check if feed is enabled: `GET /api/admin/news/feeds`
2. Check error count: High error counts may indicate issues
3. Check logs for specific error messages

### No Matches Found
- Ensure tools/models exist in the database
- Check match confidence threshold (default: 0.4)
- Verify feed content mentions tool/model names

## Next Steps

1. **Add More Feeds**: Register feeds for your favorite AI tools/models
2. **Set Up Cron Job**: Automatically sync feeds on a schedule
3. **Monitor Errors**: Check `errorCount` and `lastError` fields
4. **Customize Matching**: Adjust confidence thresholds in `EntityMatcherService`

## Documentation

- **Full Guide**: `docs/features/NEWS_AGGREGATOR_FEED_REGISTRATION.md`
- **Code Quality**: `docs/development/NEWS_AGGREGATOR_CODE_QUALITY_ASSESSMENT.md`
- **Feature Docs**: `docs/features/NEWS_AGGREGATOR.md`

