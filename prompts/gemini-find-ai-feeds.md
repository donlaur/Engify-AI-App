# Gemini Prompt: Find AI Model & Tool Feed Sources

## Context

Engify.ai is a comprehensive platform that helps developers and teams discover, compare, and stay updated on AI models and AI-powered development tools. We aggregate information about:

1. **AI Models** - Large language models (LLMs) from providers like OpenAI, Google, Anthropic, etc.
2. **AI Tools** - Development tools powered by AI (e.g., Cursor, Windsurf, Warp, GitHub Copilot)
3. **Model Updates** - New model releases, pricing changes, feature updates
4. **Tool Updates** - Feature announcements, changelogs, status updates

## What We Need

I need you to find **RSS/Atom feed URLs** and **API endpoints** for the following AI model providers and AI tool vendors. For each vendor, please find:

### For Each AI Model Provider:
1. **Blog/News Feed** - RSS or Atom feed for blog posts, announcements, model releases
2. **Status Page Feed** - RSS or Atom feed for service status, incidents, maintenance
3. **Changelog/Updates Feed** - RSS or Atom feed for API changes, model updates
4. **Documentation Updates** - If available, feed for documentation changes

### For Each AI Tool Vendor:
1. **Blog/News Feed** - RSS or Atom feed for product announcements, feature releases
2. **Changelog Feed** - RSS or Atom feed for version updates, new features
3. **Status Page Feed** - RSS or Atom feed for service status, outages
4. **Release Notes Feed** - If available, feed for release notes

## Vendors to Research

### AI Model Providers:
1. **Google (Gemini)**
   - Google AI Blog
   - Gemini API status
   - Google Cloud AI updates
   - Vertex AI updates

2. **OpenAI (ChatGPT, GPT models)**
   - OpenAI Blog
   - OpenAI Status page
   - API changelog/updates
   - Model release announcements

3. **Anthropic (Claude)**
   - Anthropic Blog
   - Anthropic Status page
   - API updates
   - Model release announcements

4. **Meta (Llama)**
   - Meta AI Blog
   - Llama model releases
   - Status updates

5. **Mistral AI**
   - Mistral AI Blog
   - Status page
   - Model releases

6. **Cohere**
   - Cohere Blog
   - Status page
   - Model updates

7. **xAI (Grok)**
   - xAI Blog
   - Status updates

### AI Tool Vendors:
1. **Cursor** ✅ (Already have: cursor.sh/rss.xml, status.cursor.com/history.rss)
2. **Windsurf/Codeium** ✅ (Already have: windsurf.com/changelog/feed.xml, status.codeium.com/history.rss)
3. **Warp** ✅ (Already have: warp.dev/blog/feed.xml)
4. **GitHub Copilot**
5. **Sourcegraph Cody**
6. **Tabnine**
7. **Replit**
8. **Continue.dev**
9. **Codeium** (separate from Windsurf)
10. **Amazon CodeWhisperer**
11. **JetBrains AI Assistant**

### AI Model Aggregators:
1. **OpenRouter** ✅ (Already have: status.openrouter.ai/history.atom)
2. **Together AI**
3. **Anyscale**
4. **Hugging Face** ✅ (Already have: huggingface.co/blog/feed.xml)

## Output Format

For each vendor, please provide:

```markdown
### [Vendor Name]

#### Blog/News Feed
- **URL:** [RSS/Atom feed URL]
- **Type:** RSS | Atom
- **Content:** [What it contains - e.g., "Blog posts, announcements, model releases"]
- **Verified:** ✅ | ⚠️ (if you can verify it works)

#### Status Page Feed
- **URL:** [RSS/Atom feed URL]
- **Type:** RSS | Atom
- **Content:** [What it contains - e.g., "Service status, incidents, maintenance"]
- **Verified:** ✅ | ⚠️

#### Changelog/Updates Feed
- **URL:** [RSS/Atom feed URL]
- **Type:** RSS | Atom
- **Content:** [What it contains]
- **Verified:** ✅ | ⚠️

#### API Documentation Feed (if available)
- **URL:** [RSS/Atom feed URL]
- **Type:** RSS | Atom
- **Content:** [What it contains]
- **Verified:** ✅ | ⚠️
```

## Important Notes

1. **Feed Format:** Prefer RSS or Atom feeds. If only JSON API endpoints are available, note that.
2. **Verification:** If possible, verify the feed URL returns valid XML/Atom content (status 200, correct content-type)
3. **Alternatives:** If no feed exists, suggest alternative sources (e.g., Twitter/X accounts, GitHub releases, email newsletters)
4. **Status Pages:** Many vendors use statuspage.io or similar - these usually have RSS/Atom feeds
5. **Blog Platforms:** Most blogs (WordPress, Medium, etc.) have RSS feeds at `/feed` or `/rss.xml`
6. **GitHub Releases:** If vendors publish releases on GitHub, note the repository and that we can use GitHub's Atom feed format

## Special Focus Areas

1. **Model Release Announcements** - We want to know immediately when new models are released (e.g., GPT-5.1, Gemini 3.0)
2. **Pricing Updates** - Changes to model pricing
3. **Feature Updates** - New capabilities, API changes
4. **Status Incidents** - Service outages, degradation
5. **Tool Feature Releases** - New features in AI coding tools

## Example Output

Here's an example of what we're looking for:

```markdown
### OpenAI

#### Blog/News Feed
- **URL:** https://openai.com/blog/rss.xml
- **Type:** RSS
- **Content:** Blog posts, model announcements, research papers, product updates
- **Verified:** ✅

#### Status Page Feed
- **URL:** https://status.openai.com/history.rss
- **Type:** RSS
- **Content:** Service status, incidents, scheduled maintenance
- **Verified:** ✅

#### API Changelog
- **URL:** https://platform.openai.com/docs/changelog (check for RSS feed)
- **Type:** [RSS | Atom | None]
- **Content:** API changes, deprecations, new features
- **Verified:** ⚠️ (needs verification)
```

## Your Task

Please research and find feed URLs for all the vendors listed above. Focus especially on:
- Google/Gemini feeds (since you're Gemini!)
- OpenAI/ChatGPT feeds
- Anthropic/Claude feeds
- Major AI tool vendors we don't have yet

Provide the feed URLs in the format above, and indicate which ones you can verify work and which need manual verification.

Thank you!

