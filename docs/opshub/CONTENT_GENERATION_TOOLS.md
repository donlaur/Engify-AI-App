# OpsHub - Content Generation Tools

**Admin Only** - Multi-agent content publishing system for generating articles

---

## Quick Start

### Generate an Article

```bash
# Basic usage
tsx scripts/content/generate-article.ts "How to use Cursor Agent Review"

# With options
tsx scripts/content/generate-article.ts "Mastering AI Prompts" \
  --category="Guide" \
  --tone="beginner" \
  --keywords="ai,prompts,best-practices"
```

### Output Location

Articles are saved to `content/drafts/`:
- `YYYY-MM-DD-slug.md` - Final content with SEO metadata
- `YYYY-MM-DD-slug-REVIEW.md` - Multi-agent review report
- `YYYY-MM-DD-slug-DRAFT.md` - Original draft for comparison

---

## The Pipeline

```
Content Generator → SEO Specialist → Human Tone Editor → 
Learning Expert → Tech Accuracy SME → Web Designer → Final Publisher
```

### Agents

1. **Content Generator** - Creates initial 800-1500 word draft
2. **SEO Specialist** - Optimizes keywords, meta, structure
3. **Human Tone Editor** - Removes AI voice, sounds natural
4. **Learning Expert** - Ensures actionable & educational
5. **Tech Accuracy SME** - Verifies technical correctness
6. **Web Designer** - Optimizes for web formatting & visual hierarchy
7. **Final Publisher** - Final approval for publication

---

## Scoring

- Each agent scores 1-10
- Overall score = average of all agents
- **8.0+ = Ready to publish**
- **7.0-7.9 = Minor revisions needed**
- **<7.0 = Major revisions needed**

---

## What Gets Generated

### SEO Metadata
- ✅ Title (50-60 chars, keyword-optimized)
- ✅ Description (150-160 chars)
- ✅ URL slug (short, descriptive)
- ✅ Keywords (primary + secondary)

### Content Quality
- ✅ Human-sounding tone (no AI patterns)
- ✅ Actionable & educational
- ✅ Technically accurate
- ✅ Code examples included
- ✅ Clear structure with headings

---

## API Usage (Alternative)

```bash
POST /api/content/publish
{
  "topic": "How to use Cursor Agent Review",
  "category": "Tutorial",
  "targetKeywords": ["cursor", "ai-coding"],
  "tone": "intermediate"
}
```

---

## Cost & Time

- **Cost:** ~$0.50-1.00 per article
- **Time:** 2-3 minutes
- **Output:** Publication-ready content

---

## Publishing Workflow

1. Generate article with CLI tool
2. Review the output in `content/drafts/`
3. Check the review report
4. Make any final tweaks
5. Move to appropriate content directory
6. Add to CMS or deploy

---

## Future Plans

- [ ] Auto-publish to CMS
- [ ] Image generation integration
- [ ] Social media post generation
- [ ] A/B testing variations
- [ ] Scheduled publishing

---

## Documentation

- Full Documentation: [Multi-Agent Systems](../content/MULTI_AGENT_SYSTEMS.md)
- API Route: `src/app/api/content/publish/route.ts`
- Script: `scripts/content/generate-article.ts`

---

**Status:** ✅ Active (OpsHub Admin Only)  
**Last Updated:** November 2, 2025

