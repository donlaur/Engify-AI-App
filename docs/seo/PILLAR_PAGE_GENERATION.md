# Pillar Page Generation Guide

## Where Pillar Pages Go

**✅ RECOMMENDED:** MongoDB `learning_resources` collection
- Pages are stored in MongoDB and accessed via `/learn/[slug]` route
- Dynamic routing handles all pages automatically
- SEO metadata, schema markup, and content are managed in the database

**⚠️ CURRENT:** Static pages (`/learn/prompt-engineering-masterclass/page.tsx`)
- The "Prompt Engineering Masterclass" page I created is a static file
- This works but isn't scalable for many pillar pages
- Should migrate to MongoDB or use the generator for future pages

**✅ RECOMMENDED APPROACH:** Use the AI content generator to create pillar pages:
1. Generate content through 6-agent pipeline
2. Save to MongoDB `learning_resources` collection
3. Automatically accessible via `/learn/[slug]` route
4. Include SEO metadata, schema markup, and proper formatting
5. Easy to update/edit via CMS or API

---

## Using the Content Generator

### Option 1: Script (Recommended)

```bash
# Generate a pillar page
tsx scripts/content/generate-article.ts "Prompt Engineering Masterclass: Complete Guide for Developers" \
  --category="Masterclass" \
  --tone="advanced" \
  --keywords="prompt engineering training,prompt engineering course,prompt engineering tutorial" \
  --word-count=8000

# This will:
# 1. Generate 8,000-word content through 6-agent pipeline
# 2. Save to content/drafts/YYYY-MM-DD-prompt-engineering-masterclass.md
# 3. Include SEO metadata, schema markup, internal links
```

### Option 2: API Endpoint

```bash
POST /api/content/publish
{
  "topic": "Prompt Engineering Masterclass: Complete Guide for Developers",
  "category": "Masterclass",
  "tone": "advanced",
  "targetKeywords": [
    "prompt engineering training",
    "prompt engineering course",
    "prompt engineering tutorial"
  ]
}
```

### Option 3: Publish Existing Markdown

```bash
# If you have markdown content already
tsx scripts/content/publish-article.ts content/drafts/prompt-engineering-masterclass.md \
  --featured \
  --category="Masterclass"
```

---

## Content Generator Pipeline

The generator uses 7 agents:

1. **Content Generator (GPT-4)** → Creates initial draft
2. **SEO Specialist (Claude)** → Optimizes keywords, meta, structure
3. **Human Tone Editor (GPT-4)** → Removes AI voice, sounds natural
4. **Learning Expert (Claude)** → Ensures actionable & educational
5. **Tech Accuracy SME (GPT-4)** → Verifies technical correctness
6. **Web Designer (Claude)** → Optimizes for web formatting & visual hierarchy
7. **Final Publisher (Claude)** → Polish & approve for publication

**Output:**
- SEO-optimized content
- Human-sounding tone
- Proper headings and structure
- Code examples
- Internal links
- Schema markup ready

---

## Pillar Page Requirements

For pillar pages (8,000-10,000 words), specify:

```bash
tsx scripts/content/generate-article.ts "Your Pillar Page Title" \
  --category="Masterclass" \
  --tone="advanced" \
  --keywords="primary,secondary,keywords" \
  --word-count=8000 \
  --include-patterns=true \  # Links to all pattern pages
  --include-faq=true         # Generate FAQ section
```

---

## Where Pages Are Stored

**MongoDB Collection:** `learning_resources`

**Fields:**
- `id`: Unique identifier
- `title`: Article title
- `description`: Meta description
- `contentHtml`: Full HTML content
- `seo.slug`: URL slug (e.g., "prompt-engineering-masterclass")
- `seo.metaTitle`: SEO title
- `seo.metaDescription`: SEO description
- `seo.keywords`: Keyword array
- `category`: "Masterclass", "Tutorial", etc.
- `level`: "beginner", "intermediate", "advanced"
- `status`: "active" or "inactive"
- `featured`: boolean

**Access:** Pages are automatically accessible at `/learn/[slug]` once saved to MongoDB

---

## Next Steps for Pillar Pages

1. **Use content generator** for remaining pillar pages (recommended):
   ```bash
   # Generate pillar page (8,000+ words)
   tsx scripts/content/generate-article.ts "Building a High-ROI AI Upskilling Program for Engineering Teams" \
     --category="Masterclass" \
     --tone="advanced" \
     --keywords="corporate AI training,AI upskilling,engineering team training"
   
   # Then publish to MongoDB
   tsx scripts/content/publish-article.ts content/drafts/[generated-file].md --featured
   ```

2. **Migrate existing static page** to MongoDB:
   - Convert `/learn/prompt-engineering-masterclass/page.tsx` content to markdown
   - Use `publish-article.ts` to add to MongoDB
   - Or keep as static but use generator for future pages

3. **Enhance generator** for pillar pages:
   - Add `--word-count=8000` option for longer content
   - Add `--include-patterns` to auto-link to pattern pages
   - Add `--include-faq` to generate FAQ sections

