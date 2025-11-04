# ISR Cache Warming with Vercel Cron

## Overview

Vercel Cron Jobs automatically warm up ISR cache by hitting prompt pages before they expire. This ensures:
- Fast response times for users
- Pages stay cached and ready
- SEO benefits from pre-rendered pages
- No cold starts

## Configuration

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/warm-isr-cache?type=prompts&limit=50",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/cron/warm-isr-cache?type=all&limit=20",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

## Schedule

- **Every 2 hours:** Warm up top 50 prompt pages
- **Every 6 hours:** Warm up main pages + top 20 prompts

## API Route

**Endpoint:** `/api/cron/warm-isr-cache`

**Query Parameters:**
- `type`: `prompts` | `all` (default: `prompts`)
- `limit`: Number of prompts to warm (default: 50)

**Security:**
- Protected by Vercel Cron secret header
- Automatically verified by Vercel

## How It Works

1. Vercel Cron triggers the API route at scheduled times
2. API fetches top prompts from MongoDB (sorted by featured + views)
3. For each prompt, makes a GET request to its page URL
4. Next.js ISR generates the page if needed, or uses cached version
5. Pages are now warm and ready for users

## ISR Cache Strategy

- **Prompt Pages:** `revalidate = 3600` (1 hour)
- **Cron Warms:** Every 2 hours (before expiry)
- **Result:** Pages stay cached, users get instant responses

## Monitoring

Check Vercel Cron logs:
- Dashboard → Cron Jobs → View logs
- Look for successful warm-up messages
- Monitor average duration per page

## Manual Trigger

For testing or manual warm-up:

```bash
# Set CRON_SECRET in environment
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://engify.ai/api/cron/warm-isr-cache?type=prompts&limit=10"
```

## Cost Considerations

- Vercel Cron Jobs: Included in Pro plan
- API route execution: Uses serverless functions
- Warm-up requests: Minimal cost (cached responses)
- Benefit: Faster page loads = better UX = more engagement

## Troubleshooting

**Pages not warming:**
- Check Vercel Cron logs
- Verify CRON_SECRET is set
- Ensure API route is accessible
- Check MongoDB connection

**Slow warm-up:**
- Reduce limit parameter
- Increase delay between requests
- Check MongoDB query performance

**High costs:**
- Reduce cron frequency
- Lower limit parameter
- Focus on featured prompts only

