# Generate Cursor 2.0 Article - Quick Instructions

The script is ready! You just need to add your OpenAI API key.

## Option 1: Create .env.local (Recommended)

```bash
# Copy from main worktree or create new
cp /path/to/main/.env.local .env.local

# Or create fresh
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local
```

## Option 2: Use Vercel

```bash
# Pull environment from Vercel
vercel env pull .env.local
```

## Option 3: Pass directly

```bash
# Set for this session only
export OPENAI_API_KEY="sk-your-key-here"
tsx scripts/content/generate-cursor-article-simple.ts
```

## Then Run

```bash
tsx scripts/content/generate-cursor-article-simple.ts
```

## What It Does

1. **Generates content** (~1200-1500 words)
   - About Cursor 2.0 multi-agent features
   - Why you need workflows and guardrails
   - Real examples from our codebase

2. **SEO optimization**
   - Title, description, keywords
   - URL slug

3. **Human tone polish**
   - Removes AI patterns
   - Makes it conversational

4. **Saves to:** `content/drafts/2025-11-02-cursor-multi-agent-workflows-guardrails.md`

## Output Will Include

- ✅ Publication-ready markdown
- ✅ SEO metadata (title, description, keywords, slug)
- ✅ ~1200-1500 words
- ✅ Code examples
- ✅ Human-sounding tone
- ✅ Timely (Cursor 2.0.43 just released today!)

## Cost

- ~$0.30-0.50 (3 GPT-4 Turbo calls)
- Takes 2-3 minutes

## After Generation

1. Review the article in `content/drafts/`
2. Make any final tweaks
3. Publish to your blog
4. Share on social media (timely content!)

---

**Script:** `scripts/content/generate-cursor-article-simple.ts`  
**Status:** ✅ Ready to run (just needs API key)
