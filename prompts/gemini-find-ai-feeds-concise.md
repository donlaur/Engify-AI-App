# Find AI Model & Tool Feed Sources

## About Engify.ai

Engify.ai is a platform that helps developers discover, compare, and track AI models (LLMs like GPT, Gemini, Claude) and AI-powered development tools (like Cursor, Windsurf, GitHub Copilot). We aggregate news, updates, and status information to keep users informed about the latest in AI.

## What We Need

Find **RSS/Atom feed URLs** for AI model providers and AI tool vendors. For each vendor, find:

1. **Blog/News Feed** - Announcements, releases, updates
2. **Status Page Feed** - Service status, incidents
3. **Changelog Feed** - Version updates, API changes (if available)

## Vendors to Research

### AI Model Providers (Priority):
- **Google (Gemini)** - Blog, status, API updates
- **OpenAI (ChatGPT/GPT)** - Blog, status, API changelog
- **Anthropic (Claude)** - Blog, status, API updates
- **Meta (Llama)** - Blog, releases
- **Mistral AI** - Blog, status, releases
- **Cohere** - Blog, status
- **xAI (Grok)** - Blog, updates

### AI Tool Vendors (Priority):
- **GitHub Copilot** - Blog, status, release notes
- **Sourcegraph Cody** - Blog, changelog
- **Tabnine** - Blog, status
- **Replit** - Blog, updates
- **Continue.dev** - Blog, changelog
- **Amazon CodeWhisperer** - Blog, status
- **JetBrains AI** - Blog, updates

### AI Aggregators:
- **Together AI** - Blog, status
- **Anyscale** - Blog, status

*Note: We already have feeds for Cursor, Windsurf, Warp, OpenRouter, and Hugging Face.*

## Output Format

For each vendor:

```markdown
### [Vendor Name]

**Blog Feed:**
- URL: [feed URL]
- Type: RSS | Atom
- Verified: ✅ | ⚠️

**Status Feed:**
- URL: [feed URL]
- Type: RSS | Atom
- Verified: ✅ | ⚠️

**Changelog Feed (if available):**
- URL: [feed URL]
- Type: RSS | Atom
- Verified: ✅ | ⚠️
```

## Notes

- Prefer RSS/Atom feeds over JSON APIs
- Status pages often use statuspage.io (usually have feeds at `/history.rss` or `/history.atom`)
- Blogs typically have feeds at `/feed`, `/rss.xml`, or `/atom.xml`
- If no feed exists, suggest alternatives (GitHub releases, Twitter, etc.)

## Focus Areas

1. **Model Releases** - New model announcements (e.g., GPT-5.1, Gemini 3.0)
2. **Pricing Updates** - Cost changes
3. **Feature Updates** - New capabilities
4. **Status Incidents** - Outages, degradation
5. **Tool Features** - New AI coding tool features

Please find feed URLs for all vendors, especially Google/Gemini, OpenAI, and Anthropic. Verify which feeds work and which need manual checking.

