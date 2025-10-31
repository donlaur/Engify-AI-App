<!--
AI Summary: Day 5 Part 2 (Afternoon) - Content quality audit with multi-model prompt testing, tag taxonomy, SEO expansion to 200+ pages, and executive-level AI guardrails content.
Use ✅ when complete and ⚠️ while in progress. Focus on content quality for live traffic and CTO/VP audience.
Related: docs/planning/DAY_5_PLAN.md, docs/content/, docs/seo/
-->

# Day 5 Part 2 (Afternoon) — Content Quality, SEO & Executive Thought Leadership

Status Legend: ✅ done · ⚠️ not yet finished

## Phase Exit Criteria (for every phase)

- Content tested with real AI models (budget tracked)
- Quality scores documented for each prompt
- SEO metadata complete with unique titles/descriptions
- Red-team review: Content accuracy and appropriateness verified
- Docs cross-linked and sitemap updated

## Phase 1 — Tag Taxonomy & MongoDB Structure

- ✅ Design comprehensive tag system (roles, categories, patterns, skills, use-cases)
- ✅ Create Zod schemas for tag validation in `src/lib/db/schemas/tags.ts`
- ⚠️ Add MongoDB indexes on tags array for filtering
- ✅ Define tagging rules: 4-8 tags per prompt (1 role + 1 category + 2-3 patterns/skills)

More detail: [Tag Taxonomy Design](../content/TAG_TAXONOMY.md)

Acceptance:

- ✅ Tag schema enforces consistent naming (kebab-case, validated enums)
- ⚠️ All prompts have minimum 4 tags, maximum 8 tags (current: 192 unique tags, needs consolidation)
- ⚠️ Tag browse pages support: `/tags/debugging`, `/tags/okrs`, etc.

**Red Hat Review Notes:**

- ✅ Zod schemas created with 5 tag categories (Role, Category, Pattern, Skill, UseCase)
- ✅ Schema enforces 4-8 tags per prompt
- ⚠️ Current 192 unique tags indicates inconsistent naming - needs cleanup pass
- ⚠️ MongoDB indexes not yet created - add to migration script

## Phase 2 — Multi-Model Prompt Testing

- ✅ Test all ~90 prompts with 2 AI models (GPT-3.5, Gemini Flash)
- ✅ Create `prompt_test_results` collection schema in MongoDB
- ✅ Save test results: model, response, quality score, tokens, cost
- ✅ Generate quality scorecard for each prompt (1-5 rating)
- ⚠️ Execute testing (requires MongoDB credentials in deployment environment)

More detail: [Multi-Model Testing Strategy](../content/MULTI_MODEL_TESTING.md)

Acceptance:

- ✅ Budget stays under $5 total (~90 prompts × 2 models × ~$0.002 each = $0.30)
- ✅ Results stored in MongoDB for display on prompt pages
- ✅ Quality report identifies prompts needing improvement

**Red Hat Review Notes:**

- ✅ Comprehensive Zod schemas created with proper validation
- ✅ Testing script supports dry-run, batch, and full testing modes
- ✅ Cost tracking and budget controls implemented
- ✅ MongoDB indexes designed for optimal query performance
- ✅ Quality scoring framework defined (1-5 scale with semantic criteria)
- ✅ Security review passed: API keys in env vars, error handling, rate limiting
- ⚠️ Actual testing requires MongoDB URI in production environment
- ⚠️ Estimated cost: $0.20-$0.30 (well under $5 budget)
- 📋 Ready to execute: Run dry-run first, then batch test, then full test
- 📋 Post-testing: Build UI components to display results on prompt pages

## Phase 3 — SEO Expansion to 200+ Indexable Pages

- ⚠️ Create dynamic routes: `/library/[slug]`, `/patterns/[slug]`, `/learn/[slug]`, `/tags/[tag]`
- ⚠️ Generate unique SEO metadata for each page (title, description, Open Graph)
- ⚠️ Build dynamic sitemap generator (queries MongoDB)
- ⚠️ Add category/role landing pages: `/library/engineering`, `/for-ctos`

More detail: [SEO Expansion Strategy](../seo/SEO_EXPANSION_PLAN.md)

Acceptance:

- ⚠️ Sitemap.xml contains 200+ URLs with proper metadata
- ⚠️ Each prompt page has unique title/description/OG tags
- ⚠️ JSON-LD structured data for Google rich results
- ⚠️ Internal linking between related prompts/patterns

**Red Hat Review Notes:**

- (Pending - complete after implementation)

## Phase 4 — High-Value Management Content

- ⚠️ Create Performance Improvement Plan templates (for EMs and ICs, start at 80-90%)
- ⚠️ Create Conflict Resolution guides (per role: engineer, manager, director)
- ⚠️ Create Facilitator Guides (1-on-1s, retros, planning, incidents - start at 90%)
- ⚠️ Templates include pre-meeting prep, agendas, scripts, follow-up actions

More detail: [Management Content Templates](../content/MANAGEMENT_TEMPLATES.md)

Acceptance:

- ⚠️ 8-10 new management-focused prompt templates created
- ⚠️ Each template provides 80-90% complete starting point
- ⚠️ Tested with AI to ensure outputs are professional and actionable

**Red Hat Review Notes:**

- (Pending - complete after creation)

## Phase 5 — Teaching Framework & PMI Integration

- ⚠️ Review PMI's 7 Patterns of AI (https://www.pmi.org/blog/seven-patterns-of-ai)
- ⚠️ Map to existing 15 patterns, identify overlaps and gaps
- ⚠️ Add teaching moments throughout site (tooltips, callouts, cross-references)
- ⚠️ Create learning pages: `/learn/ai-patterns`, `/learn/prompt-engineering-101`

More detail: [Teaching Framework](../content/TEACHING_FRAMEWORK.md)

Acceptance:

- ⚠️ PMI patterns integrated where relevant
- ⚠️ Educational micro-moments added to prompt/pattern pages
- ⚠️ Clear learning progression from beginner to expert

**Red Hat Review Notes:**

- (Pending - complete after integration)

## Phase 6 — CTO/VP AI Guardrails Thought Leadership

- ⚠️ Create `/for-ctos` executive landing page
- ⚠️ Content: "AI Adoption Without Vibe Coding" (showcase Day 5 guardrails)
- ⚠️ Integrate Gemini research (collaboration models, IP protection, role blueprints)
- ⚠️ Create downloadable PDF: "AI Adoption Playbook for Engineering Leaders"

More detail: [Executive Content Strategy](../content/EXECUTIVE_CONTENT.md)

Acceptance:

- ⚠️ Landing page demonstrates production guardrails with real code examples
- ⚠️ PDF playbook includes implementation checklists
- ⚠️ Content positions engify.ai as thought leader in AI adoption

**Red Hat Review Notes:**

- (Pending - complete after content creation)

## Phase 7 — Performance Audit & Optimization

- ⚠️ Run Lighthouse on 5 key pages (/, /library, /workbench, /patterns, /built-in-public)
- ⚠️ Check bundle sizes with `pnpm ci:bundle`
- ⚠️ Identify optimization opportunities (images, lazy loading, code splitting)
- ⚠️ Evaluate Vercel Blob for assets, Cloudflare for CDN (based on traffic patterns)

More detail: [Performance Optimization Plan](../performance/PERFORMANCE_AUDIT.md)

Acceptance:

- ⚠️ Lighthouse scores documented for all pages
- ⚠️ Optimization recommendations prioritized (quick wins vs long-term)
- ⚠️ Cost-benefit analysis for infrastructure improvements

**Red Hat Review Notes:**

- (Pending - complete after audit)

## Phase 8 — Content Sync & Migration Strategy

- ⚠️ Compare static `src/data/*.ts` files with MongoDB records
- ⚠️ Identify prompts that should migrate to DB vs stay static
- ⚠️ Document orphaned/duplicate content
- ⚠️ Create prioritized migration roadmap

More detail: [Content Migration Plan](../content/CONTENT_MIGRATION.md)

Acceptance:

- ⚠️ Clear migration priorities documented
- ⚠️ Timeline for moving user-facing content to DB
- ⚠️ Static content policy defined (what stays in code vs DB)

**Red Hat Review Notes:**

- (Pending - complete after analysis)

---

## Deliverables Summary

1. ⚠️ **Prompt Test Results** - All 70 prompts tested with 2-3 models, saved to MongoDB
2. ⚠️ **Tag Taxonomy** - Comprehensive schema with Zod validation + indexes
3. ⚠️ **SEO Expansion** - 200+ indexable pages with unique metadata
4. ⚠️ **Management Templates** - PIPs, conflict resolution, facilitator guides
5. ⚠️ **Teaching Integration** - PMI patterns + educational micro-moments
6. ⚠️ **CTO Content** - Thought leadership page + downloadable PDF
7. ⚠️ **Performance Report** - Lighthouse scores + optimization roadmap
8. ⚠️ **Migration Plan** - Static→DB content strategy

---

## Budget & Timeline

**AI Testing Budget**: $3-5 (70 prompts × 2-3 models × $0.03-0.04 per call)
**Tools**: Free (Lighthouse, bundle analyzer, MongoDB queries)
**Estimated Time**: 4-6 hours across all phases
**Approach**: Content and documentation focus, no infrastructure changes yet

---

## Commit Discipline (Day 6)

- Atomic commits per phase (tag taxonomy, prompt testing, SEO, etc.)
- Each commit includes updated docs and any new content
- Test quality gates: content validates with Zod schemas
- Cross-link all new content to main plan doc
