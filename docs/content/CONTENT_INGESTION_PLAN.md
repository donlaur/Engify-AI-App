# Content Ingestion Plan (Web & Email)

Goal: ingest high-quality external content to power RAG and knowledge workflows.

## Pipelines

- Web
  - RSS/Atom fetch → NDJSON records (title, url, publishedAt)
  - Sitemap crawl → save raw HTML → extract/clean → enrich (hash, lang, reading time)
- Email (phase 1)
  - SendGrid Inbound Parse webhook stores raw payload
  - Normalizer converts to content records (subject/from/text/html)

## Commands

```bash
# RSS → NDJSON
npm run content:rss -- https://example.com/feed.xml > tmp/ingest/rss.jsonl

# Sitemap → raw HTML (rate-limited)
SITEMAP_URL=https://example.com/sitemap.xml npm run content:sitemap > tmp/ingest/sitemap.jsonl

# HTML extract → JSON
npm run content:extract tmp/ingest/html/<file>.html > tmp/ingest/extracted.jsonl

# Enrich metadata (hash/lang/reading time)
cat tmp/ingest/extracted.jsonl | npm run content:enrich > tmp/ingest/enriched.jsonl
```

## Guardrails

- Respect robots.txt and site terms; set `FETCH_DELAY_MS` (default 500ms)
- Sanitize: no scripts/styles, remove navigation/footers
- Dedupe: use `hash(url + text)` before storage
- Provenance: keep `source` and canonical URL for each record

## Next Steps

- Persist to MongoDB with collections: `web_content` (indexed on `hash`, `url`)
- Add language detection library for accuracy
- Integrate captioning for images (optional via Replicate)
