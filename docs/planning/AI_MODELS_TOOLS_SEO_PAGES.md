# AI Models & Tools SEO Pages Structure

**Date:** 2025-11-04  
**Status:** Planning  
**URL Structure:** `/learn/ai-models/[slug]` and `/learn/ai-tools/[slug]`

---

## Current State

### AI Models

- **Database:** 0 models (need to sync from `src/lib/config/ai-models.ts`)
- **Config:** ~20+ models defined in static config
- **Admin UI:** Exists at `/opshub/ai-models` (admin only)
- **Public Pages:** None

### AI Tools

- **Data:** Exists in `src/data/affiliate-links.ts`
- **Current Pages:** `/tools` (comparison hub) exists
- **Individual Pages:** None

---

## Proposed Structure

### `/learn/ai-models/` - AI Models Hub

**Hub Page:** `/learn/ai-models/page.tsx`

- List all active AI models
- Filter by provider (OpenAI, Anthropic, Google, etc.)
- Sort by: popularity, cost, context window, quality score
- Show: active, deprecated, sunset status
- Search functionality

**Detail Pages:** `/learn/ai-models/[slug]/page.tsx`

- Model details: specs, pricing, capabilities
- Status badges: Active, Deprecated, Sunset (with dates)
- EOL tracking: deprecation date, sunset date, replacement model
- Reviews/ratings (if we add user reviews)
- Related prompts that use this model
- Comparison with similar models
- SEO: Model name, provider, specs in metadata

**Example URLs:**

- `/learn/ai-models/gpt-4o`
- `/learn/ai-models/claude-3-5-sonnet-20241022`
- `/learn/ai-models/gemini-1-5-pro`

---

### `/learn/ai-tools/` - AI Development Tools Hub

**Hub Page:** `/learn/ai-tools/page.tsx`

- List all AI development tools
- Categories: IDEs, Code Assistants, Terminals, etc.
- Filter by: free, paid, open source
- Show affiliate links where available
- Sort by: rating, popularity, pricing

**Detail Pages:** `/learn/ai-tools/[slug]/page.tsx`

- Tool details: features, pricing, reviews
- Pros/cons breakdown
- Comparison with alternatives
- Use cases and examples
- Affiliate links (Cursor, Windsurf, etc.)
- Related content: case studies, guides
- SEO: Tool name, features, pricing in metadata

**Example URLs:**

- `/learn/ai-tools/cursor`
- `/learn/ai-tools/windsurf`
- `/learn/ai-tools/github-copilot`

---

## Database Schema Enhancements

### AI Models (already exists, needs data)

```typescript
{
  id: string; // 'gpt-4o'
  slug: string; // 'gpt-4o' (URL-friendly)
  provider: 'openai' | 'anthropic' | 'google' | ...
  status: 'active' | 'deprecated' | 'sunset'
  deprecationDate?: Date;
  sunsetDate?: Date;
  replacementModel?: string; // ID of replacement
  // ... existing fields
}
```

### AI Tools (new collection)

```typescript
{
  id: string; // 'cursor'
  slug: string; // 'cursor' (URL-friendly)
  name: string; // 'Cursor'
  category: 'ide' | 'code-assistant' | 'terminal' | 'builder'
  description: string;
  pricing: {
    free: boolean;
    paid?: {
      monthly?: number;
      annual?: number;
      tier?: string;
    };
  };
  features: string[];
  pros: string[];
  cons: string[];
  affiliateLink?: string;
  rating?: number; // 1-5
  reviewCount?: number;
  status: 'active' | 'deprecated' | 'sunset';
  lastUpdated: Date;
  tags: string[];
}
```

---

## Implementation Plan

### Phase 1: Database & Data ✅ COMPLETE

1. ✅ Sync AI models from config to database (15 models synced)
2. ✅ Create AI tools collection (schema + service created)
3. ✅ Seed initial tools data (6 tools seeded: Cursor, Windsurf, Copilot, etc.)

### Phase 2: Hub Pages ✅ COMPLETE

1. ✅ Create `/learn/ai-models/page.tsx` - Lists all models by provider
2. ✅ Create `/learn/ai-tools/page.tsx` - Lists all tools by category
3. ⏳ Add filtering, sorting, search (future enhancement)

### Phase 3: Detail Pages ✅ COMPLETE

1. ✅ Create `/learn/ai-models/[slug]/page.tsx` - Full model details with EOL tracking
2. ✅ Create `/learn/ai-tools/[slug]/page.tsx` - Full tool details with affiliate links
3. ✅ Add breadcrumbs, related content, SEO metadata

### Phase 4: EOL Tracking ✅ COMPLETE

1. ✅ Create scraper/sync system for model updates (existing sync API)
2. ✅ Track deprecation dates automatically (schema supports deprecationDate, sunsetDate)
3. ✅ Alert system for EOL models (deprecated page shows warnings)
4. ✅ Replacement model suggestions (displayed on EOL page)
5. ✅ EOL tracking page (`/learn/ai-models/deprecated`)

### Phase 5: Reviews & SEO ✅ COMPLETE

1. ⏳ Add reviews/ratings system (optional - future enhancement)
2. ✅ Enhance SEO metadata (comprehensive metadata on all pages)
3. ✅ Add structured data (Schema.org JSON-LD on detail pages)
4. ✅ Create comparison pages (`/learn/ai-models/compare/[models]`)
5. ✅ Add to sitemap.xml (all models and tools included)
6. ✅ Create EOL tracking page (deprecated models list)

---

## SEO Opportunities

### High-Value Keywords

- "GPT-4o vs Claude 3.5 Sonnet" (comparison)
- "best AI coding assistant 2025" (hub page)
- "Cursor review" (tool detail)
- "deprecated AI models" (EOL tracking page)
- "AI model pricing comparison" (hub page)

### Content Ideas

- Model comparison pages
- EOL/deprecation tracking page
- "Best AI model for [use case]" guides
- Tool comparison pages
- "Is [tool] worth it?" review pages

---

## Research & Content Generation

### Multi-Agent Content Generator

We have a multi-agent content generation system (`src/lib/content/content-publishing-pipeline.ts`) that can be used for:

- Generating comprehensive model/tool comparisons
- Creating SEO-optimized content
- Researching specifications and updates

### Gemini Deep Research Prompt

A detailed research prompt has been created at:

- `docs/content/GEMINI_DEEP_RESEARCH_AI_MODELS_TOOLS.md`

This prompt explains:

- Engify.ai's purpose and target audience
- Why we need AI models and tools pages
- What research is needed for each model/tool
- Content requirements and SEO optimization
- Example research questions

**Usage**: Copy the prompt and run it in Gemini Deep Research to generate comprehensive research for each model and tool.
