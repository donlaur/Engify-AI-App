# Content Generation System Audit

**Date:** 2025-11-20  
**Status:** Audit Complete  
**Purpose:** Inventory existing content generation systems and plan pillar page generation

---

## Executive Summary

✅ **You already have a content generation system!**

**Current System:**
- ✅ Multi-agent infrastructure (LangGraph in Lambda)
- ✅ Content generator panel in OpsHub
- ✅ Batch job processing
- ✅ Single-agent and multi-agent modes
- ⚠️ **Missing:** Pillar page-specific agents (SEO, SME, Agile, Editor)

**Recommendation:** Extend existing system with pillar page agents rather than building from scratch.

---

## Existing Infrastructure

### 1. Multi-Agent System (Lambda)
**Location:** `/lambda/agents/scrum_meeting.py`

**Current Agents:**
- Director of Engineering
- Engineering Manager
- Tech Lead
- Architect

**Features:**
- ✅ LangGraph workflow
- ✅ State management
- ✅ RAG-enhanced (prompt library context)
- ✅ GPT-4o-mini for cost efficiency
- ✅ 5-minute timeout
- ✅ Deployed to Lambda

**Cost:** ~$0.20-0.40 per multi-agent session

---

### 2. Content Generator Panel (OpsHub)
**Location:** `/src/components/admin/ContentGeneratorPanel.tsx`

**Features:**
- ✅ Batch content generation (up to 50 topics)
- ✅ Single-agent vs multi-agent selection
- ✅ Job queue with progress tracking
- ✅ Real-time status updates (3-second polling)
- ✅ Category selection (Tutorial, Guide, Case Study, etc.)
- ✅ Target word count
- ✅ Keyword input

**UI Features:**
- Progress bar
- Completed/Pending/Failed counters
- Duration tracking
- Estimated time remaining
- Results list with status badges

---

### 3. API Endpoints

#### `/api/admin/content/generate/batch`
**Location:** `/src/app/api/admin/content/generate/batch/route.ts`

**Features:**
- ✅ Auth & RBAC (admin only)
- ✅ Rate limiting
- ✅ Zod validation
- ✅ Job queue integration
- ✅ Batch job submission (1-50 topics)

**Request Schema:**
```typescript
{
  generatorType: 'single-agent' | 'multi-agent',
  topics: [
    {
      topic: string,
      category: string,
      targetWordCount?: number,
      keywords?: string[]
    }
  ]
}
```

**Response:**
```typescript
{
  success: true,
  jobId: string,
  message: string,
  statusUrl: string
}
```

#### `/api/admin/content/generation-status/[jobId]`
**Location:** `/src/app/api/admin/content/generation-status/[jobId]/route.ts`

**Features:**
- ✅ Job status polling
- ✅ Progress tracking
- ✅ Results with word count and cost

---

### 4. Job Queue System
**Location:** `/src/lib/services/jobs/ContentGenerationJobQueue.ts`

**Features:**
- ✅ Background job processing
- ✅ Progress tracking
- ✅ Error handling
- ✅ Cost tracking
- ✅ MongoDB persistence

---

## What's Missing for Pillar Pages

### Current Agents
❌ No SEO expert agent  
❌ No SME (technical depth) agent  
❌ No Agile/Scrum expert agent  
❌ No Content editor agent  

### Current Workflow
❌ Not optimized for long-form content (8,000+ words)  
❌ No multi-pass review process  
❌ No SEO optimization (H1/H2 structure, meta descriptions)  
❌ No internal linking suggestions  
❌ No FAQ schema generation  

---

## Recommended Approach

### Option A: Extend Existing System (Recommended) ⭐
**Effort:** 6-8 hours  
**Cost:** Low (reuse infrastructure)

**Steps:**
1. Create new Lambda agent: `content_generation.py` (3-4 hours)
   - Add 4 new agents (SEO, SME, Agile, Editor)
   - Add 4-pass workflow
   - Add pillar page-specific state schema
2. Update API endpoint to support pillar pages (1 hour)
3. Add "Pillar Page" mode to ContentGeneratorPanel (2 hours)
4. Test with AI-SDLC pillar (1 hour)

**Benefits:**
- ✅ Reuse existing infrastructure
- ✅ Reuse existing UI
- ✅ Reuse existing job queue
- ✅ Consistent admin experience

---

### Option B: Build Separate System
**Effort:** 15-20 hours  
**Cost:** High (duplicate infrastructure)

**Not recommended** - duplicates existing work.

---

## Implementation Plan (Option A)

### Phase 1: Create Pillar Page Agent (3-4 hours)

**File:** `/lambda/agents/pillar_page_generation.py`

**Agents:**
1. **SEO Expert** - Keywords, H1/H2 structure, meta descriptions
2. **SME** - Technical depth, code examples, accuracy
3. **Agile Expert** - Ceremony guidance, team adoption
4. **Editor** - Readability, CTAs, internal links

**Workflow:**
```
Brief → SEO Expert → SME → Agile Expert → Editor → Final Content
```

**State Schema:**
```python
class PillarPageState(TypedDict):
    brief: str
    target_keywords: List[str]
    outline: str
    seo_pass: str
    sme_pass: str
    agile_pass: str
    editor_pass: str
    meta_description: str
    internal_links: List[str]
    faqs: List[dict]
```

---

### Phase 2: Update API Endpoint (1 hour)

**File:** `/src/app/api/admin/content/generate/batch/route.ts`

**Changes:**
- Add `contentType: 'article' | 'pillar-page'` to schema
- Add `pillarPageConfig` for pillar-specific settings
- Route to appropriate generator based on `contentType`

**New Schema:**
```typescript
{
  generatorType: 'single-agent' | 'multi-agent',
  contentType: 'article' | 'pillar-page',
  topics: [...],
  pillarPageConfig?: {
    targetWordCount: 8000,
    includeCodeExamples: true,
    includeFAQs: true,
    includeInternalLinks: true
  }
}
```

---

### Phase 3: Update ContentGeneratorPanel (2 hours)

**File:** `/src/components/admin/ContentGeneratorPanel.tsx`

**Changes:**
- Add "Content Type" selector (Article vs Pillar Page)
- Show pillar page options when selected:
  - Target word count (default: 8000)
  - Include code examples (checkbox)
  - Include FAQs (checkbox)
  - Include internal links (checkbox)
- Update UI to show 4-pass progress for pillar pages

**UI Mock:**
```
Content Type: [Article ▼] [Pillar Page]

Pillar Page Options:
☑ Include code examples
☑ Include FAQs
☑ Include internal links
Target Word Count: [8000]

Progress:
✓ SEO Expert (25%)
✓ SME (50%)
→ Agile Expert (75%)
  Editor (100%)
```

---

### Phase 4: Deploy & Test (1 hour)

**Steps:**
1. Build Lambda container with new agent
2. Push to ECR
3. Update Lambda function
4. Test with AI-SDLC pillar brief
5. Review output quality

---

## Cost Estimate

### Per Pillar Page (8,000 words)
- SEO Expert: 1 call × GPT-4o-mini = $0.01
- SME: 1 call × GPT-4 = $0.20 (higher quality)
- Agile Expert: 1 call × GPT-4o-mini = $0.01
- Editor: 1 call × GPT-4o-mini = $0.01

**Total: ~$0.25 per pillar page**

### For 4 Pillars + 23 Spokes
- 4 pillars × $0.25 = $1.00
- 23 spokes × $0.15 (shorter) = $3.45

**Total: ~$4.50 for all 27 pages**

---

## Timeline

### Week 1 (6-8 hours)
- ✅ Create pillar page agent (3-4 hours)
- ✅ Update API endpoint (1 hour)
- ✅ Update UI (2 hours)
- ✅ Deploy & test (1 hour)

### Week 2 (4-6 hours)
- Generate 4 pillar pages (4 hours)
- Human review & edit (2 hours)

### Week 3-4 (8-12 hours)
- Generate 23 spoke articles (8 hours)
- Human review & edit (4 hours)

**Total Time:** 18-26 hours (vs 40-60 hours manual writing)

---

## Quality Control

### Agent Output → Human Review
**Workflow:**
1. Agent generates content (5 min)
2. Human reviews for:
   - ✅ Technical accuracy
   - ✅ Brand voice
   - ✅ Example realism
   - ✅ SEO optimization
3. Human edits (30-60 min)
4. Publish

**Time Savings:** 50-70% reduction

---

## Next Steps

1. **Review this audit** - Confirm approach
2. **Create pillar page agent** - 3-4 hours
3. **Update API & UI** - 3 hours
4. **Test with AI-SDLC** - 1 hour
5. **Generate all pillars** - 4 hours
6. **Generate spokes** - 8 hours

**Total:** 19-23 hours

---

## Files to Create/Modify

### New Files
- `/lambda/agents/pillar_page_generation.py` - New agent
- `/docs/content/PILLAR_PAGE_GENERATION_GUIDE.md` - Usage guide

### Modified Files
- `/src/app/api/admin/content/generate/batch/route.ts` - Add pillar page support
- `/src/components/admin/ContentGeneratorPanel.tsx` - Add pillar page UI
- `/lambda/Dockerfile.multi-agent` - Include new agent
- `/lambda/requirements-multi-agent.txt` - Dependencies (if needed)

---

## Recommendation

**Use existing system with pillar page extension.**

**Why:**
- ✅ Reuse 80% of existing infrastructure
- ✅ Consistent admin experience
- ✅ Faster implementation (6-8 hours vs 15-20 hours)
- ✅ Lower cost (no duplicate infrastructure)
- ✅ Proven job queue and UI

**Next Action:** Create `/lambda/agents/pillar_page_generation.py`

Ready to proceed?
