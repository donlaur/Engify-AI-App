# Configured Feed URLs

## Currently Active Feeds (7 total)

### 1. Cursor Blog
- **URL:** `https://cursor.sh/rss.xml`
- **Type:** RSS
- **Source:** `cursor-blog`
- **Update Type:** `blog-post`
- **Tool ID:** `cursor`
- **Description:** Cursor AI coding assistant blog posts and updates

### 2. Cursor Status
- **URL:** `https://status.cursor.com/history.rss`
- **Type:** RSS
- **Source:** `cursor-status`
- **Update Type:** `status-incident`
- **Tool ID:** `cursor`
- **Description:** Cursor service status and incident reports

### 3. Windsurf Changelog
- **URL:** `https://windsurf.com/changelog/feed.xml`
- **Type:** RSS
- **Source:** `windsurf-changelog`
- **Update Type:** `changelog`
- **Tool ID:** `windsurf`
- **Description:** Windsurf IDE changelog and feature updates

### 4. Codeium Status
- **URL:** `https://status.codeium.com/history.rss`
- **Type:** RSS
- **Source:** `codeium-status`
- **Update Type:** `status-incident`
- **Tool ID:** `windsurf`
- **Description:** Codeium service status and incidents

### 5. OpenRouter Status
- **URL:** `https://status.openrouter.ai/history.atom`
- **Type:** Atom
- **Source:** `openrouter-status`
- **Update Type:** `status-incident`
- **Description:** OpenRouter API status and incidents

### 6. Hugging Face Blog
- **URL:** `https://huggingface.co/blog/feed.xml`
- **Type:** RSS
- **Source:** `huggingface-blog`
- **Update Type:** `blog-post`
- **Description:** Hugging Face blog posts about AI models and tools

### 7. Warp Blog
- **URL:** `https://www.warp.dev/blog/feed.xml`
- **Type:** RSS
- **Source:** `warp-blog`
- **Update Type:** `blog-post`
- **Tool ID:** `warp`
- **Description:** Warp terminal blog posts and feature announcements

---

## Additional Feeds Available (Not Yet Configured)

### OpenAI
- **Blog RSS:** `https://openai.com/blog/rss.xml` (if available)
- **Status:** Check OpenAI status page for feed URL

### Anthropic
- **Blog RSS:** `https://www.anthropic.com/news/rss` (if available)
- **Status:** Check Anthropic status page for feed URL

### Google AI
- **Blog RSS:** Check Google AI blog for feed URL
- **Status:** Check Google Cloud status for feed URL

### Other Potential Feeds
- **PromptLayer:** `https://promptlayer.com/updates/feed.xml` (verify availability)
- **GitHub Copilot:** Check GitHub blog for feed URL
- **Tabnine:** Check Tabnine blog for feed URL
- **Sourcegraph Cody:** Check Sourcegraph blog for feed URL

---

## Feed Categories

### By Type
- **RSS Feeds:** 5 feeds
- **Atom Feeds:** 1 feed
- **API Feeds:** 0 feeds (ready to add)

### By Update Type
- **Blog Posts:** 3 feeds (Cursor Blog, Hugging Face Blog, Warp Blog)
- **Status Incidents:** 3 feeds (Cursor Status, Codeium Status, OpenRouter Status)
- **Changelog:** 1 feed (Windsurf Changelog)

### By Tool Association
- **Cursor:** 2 feeds (Blog + Status)
- **Windsurf:** 2 feeds (Changelog + Codeium Status)
- **Warp:** 1 feed (Blog)
- **No Tool Association:** 2 feeds (OpenRouter Status, Hugging Face Blog)

---

## How to Add More Feeds

### Via API
```bash
POST /api/admin/news/feeds
{
  "url": "https://example.com/feed.xml",
  "source": "other",
  "feedType": "rss",
  "type": "blog-post",
  "name": "Example Feed",
  "enabled": true
}
```

### Via Seed Script
Edit `scripts/db/seed-feed-configs.ts` and add to `DEFAULT_FEEDS` array, then run:
```bash
NODE_ENV=development pnpm tsx scripts/db/seed-feed-configs.ts
```

---

## Feed Validation

To check if a feed URL is valid:
```bash
curl -I https://example.com/feed.xml
```

Look for:
- Status code: `200 OK`
- Content-Type: `application/rss+xml` or `application/atom+xml`

---

## Notes

- Some feeds may return 404 if URLs have changed or feeds are no longer available
- The system handles errors gracefully and tracks `errorCount` for each feed
- Feeds with high error counts can be automatically disabled
- All feeds are stored in the `feed_configs` MongoDB collection
- Feed sync can be triggered via `POST /api/admin/news/sync`

