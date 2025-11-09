# AI Tool RSS & Status Feed Reference

Curated endpoints for Cursor, Windsurf, and adjacent AI-tool ecosystems. Use these when wiring a feed reader or adding freshness/uptime callouts across Engify.ai.

---

## Cursor
- **Blog (RSS):** https://cursor.sh/rss.xml  
- **Blog (Atom):** https://cursor.sh/atom.xml  
- **Status incidents (Atom):** https://status.cursor.com/history.atom  
- **Status incidents (RSS):** https://status.cursor.com/history.rss  

**Notes:** Blog feed covers release notes and product deep-dives. Status feeds provide uptime history—ideal for a concise “Latest incident” widget on `/tools/cursor`.

---

## Windsurf / Codeium
- **Changelog (Atom):** https://windsurf.com/changelog/feed.xml  
- **Status incidents (Atom):** https://status.codeium.com/history.atom  
- **Status incidents (RSS):** https://status.codeium.com/history.rss  

**Notes:** Windsurf’s changelog feed includes major IDE and Cascade updates. Codeium status feeds report outages across their services, including Windsurf.

---

## Additional Feeds Worth Aggregating
- **OpenRouter status (Atom):** https://status.openrouter.ai/history.atom  
- **Hugging Face blog (RSS):** https://huggingface.co/blog/feed.xml  
- **PromptLayer updates (Atom):** https://promptlayer.com/updates/feed.xml *(verify when integrating)*

These add credibility around multi-provider coverage and can drive fresher snippets on `/learn/ai-models` and `/tools`.

---

## Implementation Ideas
1. **Feed Poller:** schedule a worker (15–30 min cadence) that fetches all feeds, stores normalized entries in Mongo or Redis, and dedupes by GUID/URL.  
2. **Surface in UI:** add “Latest tool updates” modules to Cursor/Windsurf tool pages, plus a global digest block on the AI tools hub.  
3. **Uptime Callouts:** display the most recent incident summary with a “View full history” link to the provider’s status feed for instant credibility.

Cache aggressively and respect provider ToS/rate limits when polling these endpoints.
