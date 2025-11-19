# News Aggregator Feed Registration Guide

## Overview

The News Aggregator system supports registering RSS/Atom feeds and API endpoints to automatically fetch and parse news updates for AI tools and models.

## Feed Types

### 1. RSS/Atom Feeds
Standard RSS or Atom feeds that can be parsed directly.

**Example:**
```json
{
  "url": "https://cursor.sh/rss.xml",
  "source": "cursor-blog",
  "feedType": "rss",
  "type": "blog-post",
  "toolId": "cursor"
}
```

### 2. API Feeds
Custom API endpoints that return JSON data, which can be transformed into feed items.

**Example:**
```json
{
  "url": "https://api.example.com/news",
  "source": "other",
  "feedType": "api",
  "type": "announcement",
  "apiConfig": {
    "endpoint": "https://api.example.com/news",
    "headers": {
      "Authorization": "Bearer YOUR_API_KEY"
    }
  }
}
```

## Registering Feeds

### Via API (Recommended)

#### Register a New Feed

```bash
POST /api/admin/news/feeds
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "url": "https://cursor.sh/rss.xml",
  "source": "cursor-blog",
  "feedType": "rss",
  "type": "blog-post",
  "toolId": "cursor",
  "name": "Cursor Blog",
  "description": "Cursor AI coding assistant blog posts",
  "enabled": true
}
```

#### List All Feeds

```bash
GET /api/admin/news/feeds
Authorization: Bearer YOUR_ADMIN_TOKEN

# List only enabled feeds
GET /api/admin/news/feeds?enabled=true
```

#### Update a Feed

```bash
PUT /api/admin/news/feeds
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "id": "feed-id-here",
  "enabled": false,
  "name": "Updated Feed Name"
}
```

#### Delete a Feed

```bash
DELETE /api/admin/news/feeds?id=feed-id-here
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Via Code

```typescript
import { FeedConfigRepository } from '@/lib/repositories/FeedConfigRepository';
import { randomUUID } from 'crypto';

const repository = new FeedConfigRepository();

const feedConfig = {
  id: randomUUID(),
  url: 'https://example.com/feed.xml',
  source: 'other',
  feedType: 'rss',
  type: 'blog-post',
  name: 'Example Feed',
  description: 'Example RSS feed',
  enabled: true,
};

await repository.create(feedConfig);
```

## Feed Configuration Schema

```typescript
{
  id: string;                    // Unique identifier (auto-generated if not provided)
  url: string;                    // Feed URL (required)
  source: string;                 // Source identifier (see enum below)
  feedType: 'rss' | 'atom' | 'api'; // Feed type (default: 'rss')
  type: 'tool-update' | 'model-release' | 'status-incident' | 'changelog' | 'blog-post' | 'announcement';
  toolId?: string;                // ID of the AI tool this feed is for
  modelId?: string;               // ID of the AI model this feed is for
  name?: string;                  // Human-readable name
  description?: string;           // Description of the feed
  enabled: boolean;               // Whether this feed is active (default: true)
  organizationId?: string;        // For multi-tenant support
  apiConfig?: {                  // For API feeds only
    endpoint: string;
    headers?: Record<string, string>;
    transform?: string;           // Function name for transformation
  };
  syncInterval?: number;          // Minutes between syncs (default: 60)
  lastSyncedAt?: Date;           // Last successful sync time
  lastError?: string;             // Last error message
  errorCount: number;             // Number of consecutive errors
}
```

## Source Types

Available source identifiers:
- `cursor-blog` - Cursor blog posts
- `cursor-status` - Cursor status page
- `windsurf-changelog` - Windsurf changelog
- `codeium-status` - Codeium status page
- `openrouter-status` - OpenRouter status
- `huggingface-blog` - Hugging Face blog
- `warp-blog` - Warp blog
- `openai-blog` - OpenAI blog
- `anthropic-blog` - Anthropic blog
- `google-ai-blog` - Google AI blog
- `other` - Other sources

## Feed Types

- `tool-update` - Tool feature update (e.g., Warp's /plan feature)
- `model-release` - New model release (e.g., GPT-5.1, Gemini 3)
- `status-incident` - Status page incident
- `changelog` - Changelog entry
- `blog-post` - Blog post about the tool/model
- `announcement` - General announcement

## Examples

### Example 1: Register RSS Feed for OpenAI Blog

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

### Example 2: Register Atom Feed

```bash
curl -X POST http://localhost:3000/api/admin/news/feeds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://status.example.com/history.atom",
    "source": "other",
    "feedType": "atom",
    "type": "status-incident",
    "name": "Example Status",
    "enabled": true
  }'
```

### Example 3: Register API Feed

```bash
curl -X POST http://localhost:3000/api/admin/news/feeds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://api.example.com/news",
    "source": "other",
    "feedType": "api",
    "type": "announcement",
    "name": "Example API Feed",
    "apiConfig": {
      "endpoint": "https://api.example.com/news",
      "headers": {
        "Authorization": "Bearer API_KEY"
      }
    },
    "enabled": true
  }'
```

## Seeding Initial Feeds

To seed the database with default feed configurations:

```bash
pnpm tsx scripts/db/seed-feed-configs.ts
```

This will create feed configurations for:
- Cursor Blog & Status
- Windsurf Changelog & Codeium Status
- OpenRouter Status
- Hugging Face Blog
- Warp Blog

## Testing

Test the news aggregator:

```bash
pnpm tsx scripts/test-news-aggregator.ts
```

This will:
1. Seed feed configurations
2. List all feeds
3. Test fetching a feed
4. Test syncing a feed

## Syncing Feeds

### Sync All Feeds

```bash
POST /api/admin/news/sync
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Sync Specific Feed

Currently, the sync endpoint syncs all enabled feeds. To sync a specific feed, you can:
1. Disable other feeds temporarily
2. Run the sync
3. Re-enable other feeds

Or modify the service to support single-feed syncing.

## Monitoring

The system tracks:
- `lastSyncedAt` - Last successful sync time
- `lastError` - Last error message (if any)
- `errorCount` - Number of consecutive errors

Feeds with high error counts can be automatically disabled or alerted.

## Best Practices

1. **Use descriptive names** - Makes it easier to identify feeds
2. **Set appropriate types** - Helps with filtering and categorization
3. **Link to tools/models** - Set `toolId` or `modelId` for automatic matching
4. **Monitor error counts** - Disable feeds that consistently fail
5. **Use API feeds sparingly** - RSS/Atom feeds are more reliable and standardized

