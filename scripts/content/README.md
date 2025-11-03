# Content Management Scripts

Enterprise-grade content generation and publishing tools for Engify.ai.

---

## 📝 Publishing Articles

### `publish-article.ts`

Universal article publisher for learning resources.

**Usage:**
```bash
# Publish new article
tsx scripts/content/publish-article.ts content/drafts/my-article.md

# Publish as featured
tsx scripts/content/publish-article.ts content/drafts/my-article.md --featured

# Update existing article
tsx scripts/content/publish-article.ts content/drafts/my-article.md --update

# Publish as draft (not live)
tsx scripts/content/publish-article.ts content/drafts/my-article.md --draft
```

**Required Frontmatter:**
```yaml
---
title: "Your Article Title"
description: "Brief description for SEO"
slug: "custom-url-slug" (optional)
category: "AI Workflows" (optional, default: "AI & Development")
keywords: ["ai", "cursor", "workflows"] (optional)
author: "Engify.ai Team" (optional)
featured: true (optional)
level: "intermediate" (optional: beginner|intermediate|advanced)
---
```

**Features:**
- ✅ Automatic slug generation
- ✅ Markdown → HTML conversion
- ✅ Automatic read time calculation
- ✅ Placeholder images for drafts
- ✅ SEO metadata generation
- ✅ Prevents duplicate publishing
- ✅ Updates existing articles with --update

---

## 🤖 Multi-Agent Content Systems

### `content-publishing-pipeline.ts`

6-agent pipeline for generating SEO-rich, human-sounding articles.

**Agents:**
1. Content Generator (GPT-4 Turbo)
2. SEO Specialist (keyword optimization)
3. Human Tone Editor (removes AI patterns)
4. Learning Expert (educational structure)
5. Tech Accuracy SME (fact-checking)
6. Final Publisher (format & metadata)

**Usage:**
```bash
# See docs/content/MULTI_AGENT_SYSTEMS.md
tsx scripts/content/generate-article.ts "Topic Here"
```

### `multi-agent-review.ts`

3-agent editorial review system for existing content.

**Agents:**
1. Content Editor (flow & readability)
2. Visual Designer (image suggestions)
3. Actionability Expert (practical tips)

**Usage:**
```bash
tsx scripts/content/review-and-improve-article.ts
```

---

## 🎨 Image Generation

### `generate-article-images.ts`

Guide for creating article images with templates.

**Usage:**
```bash
tsx scripts/content/generate-article-images.ts
```

**Outputs:**
- DALL-E prompts
- Excalidraw templates
- Carbon.now.sh instructions
- SVG placeholders

---

## 📚 Bulk Operations

### `import-content-bulk.ts`

Bulk import of articles and playbooks.

**Usage:**
```bash
tsx scripts/data/import-content-bulk.ts
```

---

## 🔧 Best Practices

### Article Structure

1. **Frontmatter** - YAML metadata at top
2. **Introduction** - Hook + context
3. **Problem** - What pain points exist?
4. **Solution** - How to solve them
5. **Implementation** - Step-by-step code
6. **Examples** - Real-world use cases
7. **Conclusion** - Summary + CTA

### SEO Optimization

- **Title:** 50-60 characters
- **Description:** 150-160 characters
- **Keywords:** 5-10 relevant tags
- **Headings:** Proper H2/H3 hierarchy
- **Images:** Alt text for accessibility
- **Links:** Internal + external references

### Code Examples

- Use syntax highlighting
- Include comments
- Show complete examples
- Provide working code

### Images

- **Hero image:** 1200×630px (OG card)
- **Inline images:** 800×400px
- **Diagrams:** SVG for quality
- **Screenshots:** PNG for text clarity

---

## 📖 Documentation

- **Multi-Agent Systems:** `docs/content/MULTI_AGENT_SYSTEMS.md`
- **Content Strategy:** `docs/content/CONTENT_AUDIT_FINAL.md`
- **OpsHub Guide:** `docs/opshub/CONTENT_GENERATION_TOOLS.md`

---

## 🚀 Quick Start

**1. Write Article:**
```markdown
---
title: "My Article Title"
description: "Brief description"
keywords: ["tag1", "tag2"]
---

Your content here...
```

**2. Generate Images (optional):**
```bash
tsx scripts/content/generate-article-images.ts
```

**3. Publish:**
```bash
tsx scripts/content/publish-article.ts content/drafts/my-article.md --featured
```

**4. Verify:**
```
https://engify.ai/learn/my-article-title
```

---

## ✅ Checklist Before Publishing

- [ ] Frontmatter complete
- [ ] Title is SEO-friendly (50-60 chars)
- [ ] Description is compelling (150-160 chars)
- [ ] Keywords/tags added
- [ ] Code examples tested
- [ ] Images created or placeholders
- [ ] Links work
- [ ] Grammar/spelling checked
- [ ] Read-aloud test for flow
- [ ] Preview in local environment

---

**Last Updated:** November 2, 2025  
**Maintainer:** Engify.ai Team

