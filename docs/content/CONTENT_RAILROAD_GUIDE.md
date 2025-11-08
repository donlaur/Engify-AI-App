# CONTENT RAILROAD - Multi-Agent Article Generator

**Metaphor:** Research data is cargo, sections are train cars, each carrying specific E-E-A-T signals.

## Overview

The Content Railroad generates high-quality SEO articles section-by-section using MongoDB-stored research data and multi-agent review.

## Architecture

```
MongoDB Research → Section Generation → Simple Scoring → Cohesion Check → Quality Score → DB Storage
```

### Token Strategy

| Stage | Tokens | Purpose |
|-------|--------|---------|
| **Section Generation** | 4000 | Generate 250-600 word sections |
| **Section Scoring** | 0 | Instant pattern checks (no AI) |
| **Cohesion Check** | 2500 | Review full article flow |
| **Quality Scoring** | 0 | Comprehensive pattern analysis |

**Total per article:** ~28,500 tokens (6 sections × 4000 + 2500 cohesion + 2000 quality)

## Components

### 1. Research Data (MongoDB)

**Collection:** `article_research`

**Schema:**
```typescript
{
  workingTitle: string;
  status: 'draft' | 'ready' | 'generating' | 'review' | 'approved' | 'published';
  keywords: string[];
  userQuotes: { proCursor, proWindsurf, general };
  pricing: string; // Markdown table
  corePhilosophy: { cursor, windsurf };
  sections: ArticleSection[];
  generated: {
    finalTitle: string;
    content: string;
    slopScore: number;
    wordCount: number;
  };
}
```

### 2. Section Structure

Each section targets a specific E-E-A-T signal:

| Section | Purpose | Target Words | E-E-A-T Focus |
|---------|---------|--------------|---------------|
| Introduction | Hook | 250 | **Experience** - Real pain points |
| Core Philosophy | Technical depth | 600 | **Expertise** - How it works |
| Pricing Analysis | Cost transparency | 400 | **Trustworthiness** - Honest costs |
| User Experiences | Community consensus | 500 | **Authoritativeness** - Citations |
| Testing Results | First-hand data | 600 | **Experience** - Metrics, failures |
| Recommendations | Honest guidance | 400 | **Trustworthiness** - Trade-offs |

### 3. Section Scoring (Simple & Fast)

**Checks:**
- ✅ Word count (70-150% of target)
- ✅ Has code examples (```)
- ✅ Has numbers/metrics
- ✅ Has specific data

**Score:** 10 minus 2 per flag

**Example:**
```
Section 1: 282 words (target: 250) - Score: 10/10 ✅
Section 2: 650 words (target: 600) - Score: 8/10 (no-code)
Section 3: 150 words (target: 400) - Score: 6/10 (too-short, no-numbers)
```

### 4. Cohesion Check (High Tokens)

After all sections are combined, the Final Publisher agent reviews:

**Checks:**
1. Do sections transition smoothly?
2. Any repetition across sections?
3. Does it feel unified or disjointed?
4. Missing connections between ideas?

**Output:**
- Cohesion score (1-10)
- What works well
- What needs fixing
- Specific transition improvements

### 5. Quality Score (Comprehensive)

**4 Components:**

| Component | Weight | Signals |
|-----------|--------|---------|
| **AI Slop** | 30% | Forbidden phrases, em dashes, uniformity |
| **E-E-A-T** | 40% | Experience, expertise, authority, trust |
| **SEO** | 15% | Keywords, headings, links, readability |
| **Technical** | 15% | Code examples, versions, depth |

**Verdict:**
- 8.5+: Excellent 🌟
- 7.0-8.5: Good ✅
- 5.0-7.0: Needs Improvement ⚠️
- <5.0: Poor ❌

## Usage

### 1. Seed Research Data

```bash
pnpm tsx scripts/content/content-railroad-seed.ts
```

**Output:**
```
✅ Successfully inserted article research!
   ID: 690fbbc82c0c1e4770de29ed
   Status: ready
   Keywords: 4
   Sections: 6
   User Quotes: 5
```

### 2. List Available Articles

```bash
pnpm tsx src/scripts/content-railroad-generate.ts --list
```

**Output:**
```
📋 Available Articles:

✅ Ready for Generation:
   690fbbc82c0c1e4770de29ed - Cursor vs Windsurf comparison
```

### 3. Generate Article

```bash
pnpm tsx src/scripts/content-railroad-generate.ts 690fbbc82c0c1e4770de29ed
```

**Output:**
```
──────────────────────────────────────────────────────────────────────
📄 Section 1/6: Introduction: The 2025 AI IDE Battle
   Purpose: EXPERIENCE - Hook with real developer pain points
   Target: 250 words
──────────────────────────────────────────────────────────────────────

   ✅ Generated: 282 words (target: 250)
   📊 Quick score: 10/10

──────────────────────────────────────────────────────────────────────
📄 Section 2/6: Core Philosophy: Control vs Speed
   Purpose: EXPERTISE - Technical depth on how they work
   Target: 600 words
──────────────────────────────────────────────────────────────────────

   ✅ Generated: 650 words (target: 600)
   📊 Quick score: 8/10
   🚩 Flags: no-code

... (4 more sections)

======================================================================
🔗 COHESION CHECK - Reviewing Full Article Flow
======================================================================

📝 Cohesion Review:
Cohesion Score: 8/10

What works:
- Smooth transitions between philosophy and pricing sections
- Consistent tone throughout
- Good balance of technical depth and accessibility

What needs fixing:
- Slight repetition of "flow state" concept in sections 2 and 5
- Missing transition between user experiences and testing results

Specific improvements:
- Add bridge sentence at end of section 4: "But what do these user experiences mean in practice? Let me share my own testing results..."

======================================================================
🔍 FINAL QUALITY SCORE
======================================================================

╔════════════════════════════════════════════════════════════╗
║              CONTENT QUALITY SCORE REPORT                  ║
╚════════════════════════════════════════════════════════════╝

📊 OVERALL SCORE: 8.7/10 ✅ GOOD
   Publish Ready: ✅ YES

📈 COMPONENT SCORES:
   AI Slop:     9.2/10 ✅
   E-E-A-T:     8.5/10 ✅
   SEO:         8.0/10 ✅
   Technical:   8.5/10 ✅

🎯 E-E-A-T BREAKDOWN:
   Experience:        9/10
   Expertise:         8/10
   Authoritativeness: 8/10
   Trustworthiness:   9/10

💡 RECOMMENDATIONS:
   1. 📝 Add first-hand testing: "I tested...", "We found..."
   2. 🔗 Add citations: link to official docs, GitHub, Reddit

═══════════════════════════════════════════════════════════════

✅ Article saved: /Users/donlaur/dev/Engify-AI-App/content/drafts/2025-11-08-cursor-vs-windsurf-comparison-db.md
✅ Updated in DB: 690fbbc82c0c1e4770de29ed

📊 Summary:
   Total Words: 2958
   Avg Section Score: 8.7/10
   Overall Quality: 8.7/10 (good)
   Status: review
```

## Quality Signals

### E-E-A-T Signals Detected

**Experience (9/10):**
- ✅ First-hand testing: "I tested Cursor for 3 weeks..."
- ✅ Specific metrics: "reduced build time by 40%"
- ✅ Failure mentions: "Cursor's memory leaked after 2 hours..."
- ✅ Timestamps: "As of November 2025..."

**Expertise (8/10):**
- ✅ Specific versions: "Cursor 0.42", "GPT-4o"
- ✅ Code examples: 3 code blocks
- ✅ Explains why: "This works because..."
- ⚠️ Missing: More official doc citations

**Authoritativeness (8/10):**
- ✅ Citations: 5 links to Reddit, GitHub
- ✅ Data/metrics: Multiple performance numbers
- ✅ Community mentions: "Most developers prefer..."
- ⚠️ Missing: More authoritative sources

**Trustworthiness (9/10):**
- ✅ Admits limitations: "This won't work for..."
- ✅ Last updated: "November 2025"
- ✅ No exaggeration: Avoids "revolutionary", "best ever"
- ✅ Honest trade-offs: "Windsurf is cheaper but has credit limits"

## Benefits

### vs. Single-Pass Generation

| Metric | Single-Pass | Content Railroad |
|--------|-------------|------------------|
| **Token Usage** | 8000 | 28,500 |
| **Quality Score** | 8.3/10 | 8.7/10 |
| **E-E-A-T Signals** | Weak | Strong |
| **AI Slop** | 8.0/10 | 9.2/10 |
| **Cohesion** | Unknown | 8/10 (checked) |
| **Research Integration** | Generic | Specific data |

### Key Advantages

1. **Focused Sections** - Each section targets specific E-E-A-T signals
2. **Research Integration** - Uses real user quotes, pricing data, community feedback
3. **Quality Tracking** - Scores per section + overall
4. **Cohesion Check** - Ensures sections flow together
5. **Iterative Improvement** - Can regenerate individual sections
6. **Private Research** - Data stays in MongoDB, not git

## Next Steps

### Add Editor Agent

Create final SEO-optimized title from working title:

```typescript
Working Title: "Cursor vs Windsurf comparison"
↓
Editor Agent
↓
Final Title: "Cursor vs Windsurf: Speed vs Control (2025 Comparison)"
Slug: "cursor-vs-windsurf-speed-vs-control-2025"
```

### Add More Articles

Seed more research data:
- "Cursor Memory Problem: Why It Leaks and How to Fix"
- "Windsurf Context Loss: Understanding the Cascade Limits"
- "Best AI IDE 2025: Cursor vs Windsurf vs Copilot"

### Automate Publishing

```bash
# Generate → Review → Approve → Publish
pnpm tsx src/scripts/content-railroad-generate.ts <id>
pnpm tsx src/scripts/content-railroad-review.ts <id>
pnpm tsx src/scripts/content-railroad-publish.ts <id>
```

## Files

- `src/lib/content/content-quality-scorer.ts` - Quality scoring system
- `src/lib/content/ai-slop-detector.ts` - AI pattern detection
- `src/lib/db/schemas/article-research.schema.ts` - MongoDB schema
- `src/lib/db/repositories/article-research.repository.ts` - CRUD operations
- `scripts/content/content-railroad-seed.ts` - Seed research data
- `src/scripts/content-railroad-generate.ts` - Generate articles
- `docs/seo/ARTICLE_OUTLINES_FROM_RESEARCH.md` - Research source

## Troubleshooting

### "Article not found"
```bash
# List available articles
pnpm tsx src/scripts/content-railroad-generate.ts --list
```

### "Model quota exceeded"
The system automatically falls back:
- Gemini → Replicate → OpenAI

### "Section too short"
Adjust `targetWords` in research data or regenerate section.

### "Low cohesion score"
Review cohesion feedback and add transition sentences between sections.
