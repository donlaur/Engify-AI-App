# SEO Strategy Action Plan

**Based on:** Comprehensive SEO Strategy Document  
**Created:** Today  
**Status:** Ready for Implementation

---

## Quick Wins We Can Implement Now

### 1. Metadata Templates (High Priority, High Impact)

The strategy recommends programmatic metadata templates for dynamic pages. This directly addresses our current inconsistent metadata issue.

**Action Items:**
- [ ] Review current `generateMetadata` implementations
- [ ] Create template system for prompt pages
- [ ] Create template system for pattern pages  
- [ ] Update collection pages with template-based metadata
- [ ] Test on 10-20 pages, then roll out to all

**Files to Update:**
- `src/app/prompts/[id]/page.tsx`
- `src/app/patterns/[slug]/page.tsx`
- `src/app/collections/[slug]/page.tsx` (if exists)

**Example Template:**
```typescript
// Prompt page metadata template
title: `${prompt.title} | A Proven AI Prompt for ${prompt.useCase} | Engify.ai`
description: `Learn to use the ${prompt.title} prompt to solve ${prompt.problem}. Get examples and best practices from Engify.ai.`

// Pattern page metadata template  
title: `The ${pattern.name} Pattern | Master this Prompt Engineering Technique | Engify.ai`
description: `A complete guide to the ${pattern.name} prompt engineering pattern. Understand how it works, see examples, and learn how to apply it.`
```

### 2. Schema Markup Enhancements (High Priority, High Impact)

**Course Schema for Patterns:**
- Each pattern page is a "mini-course"
- Rich results showing provider, description, ratings
- Implementation: Add Course schema JSON-LD to pattern pages

**HowTo Schema for Prompts:**
- Prompt pages become step-by-step guides
- Rich snippets with steps, images, time required
- Implementation: Enhance prompt pages with structured steps, add HowTo schema

**FAQPage Schema:**
- Add FAQ sections to role landing pages
- Answer question-based queries identified in strategy
- Implementation: Create FAQ component, add to key pages

**Status Check:**
- ✅ Article schema: Already implemented
- ✅ CollectionPage schema: Already implemented
- ⏳ Course schema: Add to patterns
- ⏳ HowTo schema: Add to prompts
- ⏳ FAQPage schema: Add to pillar/landing pages

### 3. Thematic Collection Pages (Medium Priority, High Impact)

Transform existing prompts into SEO-friendly collections.

**Collections to Create:**
- `/collections/prompts-for-product-managers`
- `/collections/prompts-for-agile-retrospectives`
- `/collections/prompts-for-database-optimization`
- `/collections/prompts-for-writing-secure-code`
- `/collections/prompts-for-code-review`
- `/collections/prompts-for-testing`

**Implementation:**
- Create collection page template
- Group prompts by tags/categories
- Add collection pages to sitemap
- Link from role landing pages

### 4. Internal Linking Strategy (High Priority, High Impact)

**Current State:** Sporadic internal linking  
**Goal:** Systematic hub-and-spoke model

**Action Items:**
- [ ] Identify pillar pages (or create them)
- [ ] Audit all cluster content (blog posts, tutorials)
- [ ] Add contextual links from clusters → pillars
- [ ] Add curated links from pillars → clusters
- [ ] Create cross-cluster linking guidelines

**Quick Fix:**
- Add "Related Content" sections to prompt/pattern pages
- Link to related patterns, prompts, and articles
- Use descriptive anchor text with keywords

---

## Content Strategy Alignment

### Pillar Pages to Create

Based on the strategy, we need three major pillar pages:

1. **"The Ultimate Guide to AI-Assisted Software Development"**
   - Target: AI in SDLC cluster
   - 10,000+ words
   - Comprehensive overview of AI across SDLC

2. **"Building a High-ROI AI Upskilling Program for Engineering Teams"**
   - Target: Corporate AI Training cluster
   - Playbook with templates, ROI frameworks
   - Lead generation asset

3. **"The Prompt Engineering Masterclass for Developers"**
   - Target: Prompt Engineering cluster
   - Features our 15 patterns
   - Comprehensive educational resource

**Status:** These are major content pieces. Start with #3 (can leverage existing pattern content).

### Cluster Content Opportunities

**High-Value Topics Identified:**

**For Buyers (Alex - VP Eng):**
- "How to measure ROI of AI training for developers"
- "Enterprise AI adoption risks and mitigation"
- "AI upskilling roadmap for engineering teams"
- "AI governance best practices for development teams"

**For Practitioners (Sam - Senior Engineer):**
- "Chain-of-thought prompting pattern deep dive"
- "Multi-agent workflow tutorial using LangGraph"
- "AI debugging complex code tutorial"
- "RAG vs fine-tuning for code generation"

**Action:** Create these as blog posts or learning articles targeting long-tail keywords.

---

## Messaging Alignment

### Current Messaging Audit

**To Review:**
- Homepage messaging
- About page
- Product pages
- Role landing pages

**Key Questions:**
- Do we position as "AI-Assisted Software Development" or just "AI training"?
- Do we emphasize workflow integration?
- Do we speak to both buyers AND practitioners?

**Positioning Statement to Test:**
> "Engify.ai is the AI-Assisted Software Development platform that transforms engineering teams into elite AI power users, enabling them to ship higher-quality code, faster."

---

## Technical SEO Checklist

| Task | Priority | Status | Owner |
|------|----------|--------|-------|
| Programmatic metadata templates | High | ⏳ To Do | Dev |
| Course schema for patterns | High | ⏳ To Do | Dev |
| HowTo schema for prompts | High | ⏳ To Do | Dev |
| FAQPage schema | Medium | ⏳ To Do | Dev |
| Thematic collection pages | Medium | ⏳ To Do | Dev + Content |
| RSS feed generation | Medium | ⏳ To Do | Dev |
| Internal linking audit | High | ⏳ To Do | Content |
| Sitemap enhancements (lastmod, priority) | Low | ⏳ To Do | Dev |

---

## Keyword Opportunities

### High-Value Keywords to Target

**Corporate AI Training (Buyer Intent):**
- "AI training for engineers" (2,000+ searches, KD 65)
- "enterprise AI adoption" (1,200+ searches, KD 72)
- "corporate AI training programs" (500+ searches, KD 68)
- "AI upskilling for engineering teams" (400+ searches, KD 62)

**Prompt Engineering (Practitioner Intent):**
- "prompt engineering training" (1,500+ searches, KD 58)
- "prompt engineering for developers"
- "advanced prompt engineering" (200+ searches, KD 40)

**AI in SDLC (Strategic Blue Ocean):**
- "AI in software development" (900+ searches, KD 55)
- "AI for code review" (300+ searches, KD 45)
- "multi-agent AI workflows" (350+ searches, KD 50)

**Action:** Create content targeting these keywords, prioritize by search volume × (1 - difficulty).

---

## Integration with Existing Work

### What We've Already Done
- ✅ Dynamic sitemap generation
- ✅ Role-based landing pages (aligned with strategy)
- ✅ Pattern and prompt detail pages
- ✅ Basic schema markup

### What This Strategy Adds
- 📋 Systematic metadata templates
- 📋 Enhanced schema (Course, HowTo, FAQ)
- 📋 Thematic collections
- 📋 Internal linking architecture
- 📋 Content pillar strategy
- 📋 Keyword cluster focus

---

## Next Steps (This Week)

1. **Review messaging** - Align homepage/About with positioning statement
2. **Audit metadata** - Check current prompt/pattern metadata consistency
3. **Plan schema** - Design Course/HowTo/FAQ schema implementation
4. **Create template** - Build programmatic metadata template system
5. **Identify collections** - List existing prompts that could form collections

---

## Questions to Answer

1. Do we want to create the three pillar pages? (Major content effort)
2. Should we prioritize buyer-focused or practitioner-focused content first?
3. Are we ready to commit to "AI-Assisted Software Development" positioning?
4. How do we measure success? (Set up KPI tracking)

---

**Reference:** See `docs/seo/SEO_STRATEGY_COMPREHENSIVE.md` for full strategy details.

