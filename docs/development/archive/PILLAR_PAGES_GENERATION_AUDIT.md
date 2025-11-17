# Pillar Pages: Multi-Agent Generation & Audit System

**Date:** November 6, 2025  
**Status:** Implementation Plan  
**Related:** `docs/strategy/PILLAR_PAGES_STRATEGY.md`, `docs/content/MULTI_AGENT_SYSTEMS.md`

---

## 🎯 Overview

Adapt existing multi-agent content generation and audit/improvement systems for pillar pages. Handle large context (8,000-10,000 words) by splitting into sections, and connect to roles, collections, and other content.

---

## 📋 Current Systems to Adapt

### 1. Content Generation Pipeline
**File:** `scripts/content/generate-article.ts` + `src/lib/content/content-publishing-pipeline.ts`

**Current Pipeline (7 agents):**
1. Content Generator (GPT-4) → Creates initial draft
2. SEO Specialist (Claude) → Optimizes keywords, meta, structure
3. Human Tone Editor (GPT-4) → Removes AI voice
4. Learning Expert (Claude) → Ensures actionable & educational
5. Tech Accuracy SME (GPT-4) → Verifies technical correctness
6. Web Designer (Claude) → Optimizes formatting & visual hierarchy
7. Final Publisher (Claude) → Polish & approve

**Current Output:** 800-1,500 word articles

**Needed for Pillar Pages:** 8,000-10,000 words with section-based processing

### 2. Audit System
**File:** `scripts/content/audit-prompts-patterns.ts`

**Current Features:**
- Multi-agent scoring (8 categories)
- Saves to `prompt_audit_results` collection
- Tracks audit version
- Supports quick/fast modes

**Needed for Pillar Pages:** Section-based auditing, large context handling

### 3. Improvement System
**File:** `scripts/content/batch-improve-from-audits.ts`

**Current Features:**
- Analyzes audit patterns
- Applies improvements based on audit findings
- Generates missing fields
- Supports dry-run and audit-first modes

**Needed for Pillar Pages:** Section-based improvements, context-aware linking

### 4. Pillar Pages Configuration
**File:** `src/lib/data/pillar-pages.ts` ⭐ NEW

**Purpose:** Central registry of all pillar pages

**Features:**
- Lists all 4 pillar pages (1 complete, 3 planned)
- Provides metadata (slug, keywords, audience, etc.)
- Helper functions to find pillar pages by role/tags
- Used by generation, audit, and linking scripts

**Current Pillar Pages:**
1. ✅ Prompt Engineering Masterclass (complete, static file)
2. ⏳ AI Upskilling Program for Engineering Teams (planned)
3. ⏳ Ultimate Guide to AI-Assisted Software Development (planned)
4. ⏳ Building an AI-First Engineering Organization (planned)

---

## 🚀 Implementation Plan

### Phase 1: Pillar Page Generation Script

**New File:** `scripts/content/generate-pillar-page.ts`

#### 1.1 Section-Based Generation

**Problem:** 8,000-10,000 words exceeds token limits for single generation

**Solution:** Generate by sections, then combine

**Structure:**
```typescript
interface PillarPageSection {
  id: string;
  title: string;
  order: number;
  targetWordCount: number;
  content: string;
  keywords: string[];
  relatedRoles: string[];
  relatedPrompts: string[];
  relatedPatterns: string[];
}

interface PillarPage {
  title: string;
  slug: string;
  description: string;
  sections: PillarPageSection[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  faq: FAQItem[];
  hubAndSpokeLinks: {
    roles: string[];
    prompts: string[];
    patterns: string[];
    articles: string[];
    tools: string[];
  };
}
```

#### 1.2 Generation Process

**Step 1: Generate Outline**
```typescript
// Use Content Generator agent
const outline = await generateOutline(topic, {
  targetWordCount: 8000,
  sections: 6-8,
  audience: 'engineering-leaders'
});
```

**Step 2: Generate Each Section**
```typescript
for (const section of outline.sections) {
  // Generate section content (1,000-1,500 words each)
  const sectionContent = await generateSection(section, {
    context: previousSections, // Include previous sections for context
    relatedContent: findRelatedContent(section.keywords),
    wordCount: section.targetWordCount
  });
  
  // Review section with agents
  const reviewedSection = await reviewSection(sectionContent, {
    agents: ['seo', 'tone', 'learning', 'tech', 'design']
  });
  
  sections.push(reviewedSection);
}
```

**Step 3: Combine and Final Review**
```typescript
// Combine all sections
const fullContent = combineSections(sections);

// Final review with all agents
const finalResult = await reviewFullPage(fullContent, {
  agents: ['seo', 'tone', 'learning', 'tech', 'design', 'publisher']
});
```

#### 1.3 Hub-and-Spoke Link Generation

**During Section Generation:**
```typescript
// For each section, identify related content
const relatedContent = await findRelatedContent({
  keywords: section.keywords,
  roles: section.relatedRoles,
  type: 'pillar-section'
});

// Find:
// - Related prompts (by tags/keywords)
// - Related patterns (by category/useCases)
// - Related role pages (by role)
// - Related articles (by tags)
// - Related AI tools (by use case)
```

**After Generation:**
```typescript
// Aggregate all related content from sections
const hubAndSpokeLinks = aggregateRelatedContent(sections);

// Generate internal links in content
const contentWithLinks = injectInternalLinks(fullContent, hubAndSpokeLinks);
```

#### 1.4 Usage

```bash
# Generate pillar page (uses config from pillar-pages.ts)
tsx scripts/content/generate-pillar-page.ts \
  --id=ai-first-engineering-organization

# Generate by title (will match config)
tsx scripts/content/generate-pillar-page.ts \
  "Building an AI-First Engineering Organization" \
  --target-word-count=8000 \
  --audience=engineering-leaders \
  --keywords="AI-first,AI-native,engineering transformation"

# Generate all planned pillar pages
tsx scripts/content/generate-pillar-page.ts --all-planned

# With section outline
tsx scripts/content/generate-pillar-page.ts \
  --id=ai-upskilling-program \
  --sections="Introduction,ROI Framework,Implementation,Measuring Success" \
  --target-word-count=10000
```

---

### Phase 2: Pillar Page Audit Script

**New File:** `scripts/content/audit-pillar-pages.ts`

#### 2.1 Section-Based Auditing

**Problem:** Full page (8,000-10,000 words) exceeds context window

**Solution:** Audit by sections, then aggregate

**Process:**
```typescript
// 1. Load pillar page
const pillarPage = await getPillarPage(slug);

// 2. Audit each section separately
for (const section of pillarPage.sections) {
  const sectionAudit = await auditSection(section, {
    agents: ['completeness', 'seo', 'accuracy', 'readability'],
    context: {
      fullPageTitle: pillarPage.title,
      previousSections: previousSectionAudits
    }
  });
  
  sectionAudits.push(sectionAudit);
}

// 3. Audit full page structure
const structureAudit = await auditStructure(pillarPage, {
  sections: sectionAudits,
  agents: ['seo', 'linking', 'schema']
});

// 4. Aggregate results
const fullAudit = aggregateAuditResults({
  sections: sectionAudits,
  structure: structureAudit
});
```

#### 2.2 Audit Categories

**Section-Level Audits:**
- Completeness (content depth, examples)
- SEO (keywords, headings, meta)
- Technical Accuracy
- Readability (tone, clarity)
- Internal Linking (within section)

**Page-Level Audits:**
- Overall Structure (TOC, navigation)
- Hub-and-Spoke Links (to/from cluster content)
- Schema Markup (Course, FAQPage)
- Cross-Section Flow (transitions, coherence)
- Related Content Coverage

#### 2.3 Storage

**Collection:** `pillar_page_audit_results`

**Schema:**
```typescript
{
  pillarPageId: string;
  slug: string;
  auditVersion: number;
  auditDate: Date;
  sectionAudits: {
    sectionId: string;
    sectionTitle: string;
    scores: {
      completeness: number;
      seo: number;
      accuracy: number;
      readability: number;
      linking: number;
    };
    issues: string[];
    recommendations: string[];
  }[];
  structureAudit: {
    overallScore: number;
    issues: string[];
    recommendations: string[];
  };
  hubAndSpokeAudit: {
    linksTo: {
      roles: { count: number; missing: string[] };
      prompts: { count: number; missing: string[] };
      patterns: { count: number; missing: string[] };
      articles: { count: number; missing: string[] };
    };
    linksFrom: {
      roles: { count: number; expected: number };
      prompts: { count: number; expected: number };
      patterns: { count: number; expected: number };
    };
  };
}
```

#### 2.4 Usage

```bash
# Audit all pillar pages (from pillar-pages.ts config)
tsx scripts/content/audit-pillar-pages.ts

# Audit specific pillar page
tsx scripts/content/audit-pillar-pages.ts --slug=ai-first-engineering-organization

# Audit by ID (from config)
tsx scripts/content/audit-pillar-pages.ts --id=prompt-engineering-masterclass

# Quick audit (fewer agents)
tsx scripts/content/audit-pillar-pages.ts --quick

# Audit specific sections only
tsx scripts/content/audit-pillar-pages.ts --sections="Introduction,ROI Framework"

# Audit all planned pillar pages (even if not complete)
tsx scripts/content/audit-pillar-pages.ts --include-planned
```

---

### Phase 3: Pillar Page Improvement Script

**New File:** `scripts/content/batch-improve-pillar-pages-from-audits.ts`

#### 3.1 Section-Based Improvements

**Process:**
```typescript
// 1. Load audit results
const audits = await getPillarPageAudits({ auditVersion: latest });

// 2. Identify improvement patterns
const patterns = analyzeAuditPatterns(audits);

// 3. Apply improvements by section
for (const pillarPage of pillarPages) {
  const audit = audits.find(a => a.pillarPageId === pillarPage.id);
  
  // Improve each section
  for (const section of pillarPage.sections) {
    const sectionAudit = audit.sectionAudits.find(a => a.sectionId === section.id);
    
    if (sectionAudit.needsImprovement) {
      const improvedSection = await improveSection(section, {
        audit: sectionAudit,
        patterns: patterns,
        context: {
          fullPage: pillarPage,
          relatedContent: await findRelatedContent(section)
        }
      });
      
      section.content = improvedSection.content;
    }
  }
  
  // Improve structure
  if (audit.structureAudit.needsImprovement) {
    pillarPage = await improveStructure(pillarPage, audit.structureAudit);
  }
  
  // Improve hub-and-spoke links
  if (audit.hubAndSpokeAudit.needsImprovement) {
    pillarPage = await improveHubAndSpokeLinks(pillarPage, audit.hubAndSpokeAudit);
  }
  
  // Save improved page
  await savePillarPage(pillarPage);
}
```

#### 3.2 Improvement Types

**Content Improvements:**
- Expand thin sections
- Add examples and case studies
- Improve transitions between sections
- Add missing keywords
- Enhance readability

**Structure Improvements:**
- Add/improve table of contents
- Fix heading hierarchy
- Improve section ordering
- Add missing sections

**Linking Improvements:**
- Add missing internal links
- Connect to related roles
- Link to related prompts/patterns
- Add cross-references between sections
- Ensure all cluster content links back

**SEO Improvements:**
- Optimize meta titles/descriptions
- Add FAQ sections
- Improve schema markup
- Add missing keywords

#### 3.3 Usage

```bash
# Improve all pillar pages from audits (uses config from pillar-pages.ts)
tsx scripts/content/batch-improve-pillar-pages-from-audits.ts

# Dry run (preview changes)
tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --dry-run

# Improve specific pillar page
tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --slug=ai-first-engineering-organization

# Improve by ID (from config)
tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --id=prompt-engineering-masterclass

# Audit first, then improve
tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --audit-first

# Improve specific sections only
tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --sections="Introduction,ROI Framework"

# Improve all planned pillar pages
tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --include-planned
```

---

## 🔗 Hub-and-Spoke Integration

### Finding Related Content

**New Utility:** `src/lib/seo/find-pillar-related-content.ts`

```typescript
export async function findRelatedContentForPillar(
  pillarPage: PillarPage,
  section?: PillarPageSection
): Promise<HubAndSpokeLinks> {
  const keywords = section ? section.keywords : pillarPage.seo.keywords;
  const roles = section ? section.relatedRoles : extractRolesFromContent(pillarPage);
  
  // Find related prompts
  const prompts = await promptRepository.findByTags(keywords);
  const rolePrompts = await promptRepository.findByRoles(roles);
  
  // Find related patterns
  const patterns = await patternRepository.findByKeywords(keywords);
  
  // Find related role pages
  const rolePages = roles.map(role => `/for-${role}`);
  
  // Find related articles
  const articles = await learningResourceRepository.findByTags(keywords);
  
  // Find related AI tools
  const tools = await aiToolRepository.findByUseCases(keywords);
  
  return {
    prompts: [...prompts, ...rolePrompts],
    patterns,
    rolePages,
    articles,
    tools
  };
}
```

### Injecting Links into Content

```typescript
export function injectInternalLinks(
  content: string,
  links: HubAndSpokeLinks
): string {
  // Find mentions of related content
  const mentions = findContentMentions(content);
  
  // Inject links at mentions
  for (const mention of mentions) {
    const link = findLinkForMention(mention, links);
    if (link) {
      content = replaceMentionWithLink(content, mention, link);
    }
  }
  
  // Add "Related Content" section at end
  content += generateRelatedContentSection(links);
  
  return content;
}
```

---

## 📊 Database Schema

### Pillar Pages Collection

**Collection:** `pillar_pages` (or extend `learning_resources` with `type: 'pillar'`)

**Schema:**
```typescript
{
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'pillar';
  category: 'masterclass' | 'guide' | 'strategy';
  level: 'beginner' | 'intermediate' | 'advanced';
  
  // Section-based content
  sections: {
    id: string;
    title: string;
    order: number;
    contentHtml: string;
    wordCount: number;
    keywords: string[];
    relatedRoles: string[];
  }[];
  
  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    slug: string;
    canonicalUrl: string;
  };
  
  // FAQ
  faq: {
    question: string;
    answer: string;
  }[];
  
  // Hub-and-Spoke Links
  hubAndSpoke: {
    linksTo: {
      roles: string[];
      prompts: string[];
      patterns: string[];
      articles: string[];
      tools: string[];
    };
    linksFrom: {
      roles: string[];
      prompts: string[];
      patterns: string[];
      articles: string[];
    };
  };
  
  // Schema markup
  schema: {
    course: CourseSchema;
    faqPage: FAQPageSchema;
  };
  
  // Metadata
  wordCount: number;
  auditVersion: number;
  currentRevision: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  status: 'draft' | 'published' | 'archived';
}
```

---

## 🛠️ Implementation Steps

### Step 1: Create Generation Script (Week 1)
- [ ] Create `scripts/content/generate-pillar-page.ts`
- [ ] Implement section-based generation
- [ ] Add hub-and-spoke link generation
- [ ] Test with one pillar page

### Step 2: Create Audit Script (Week 2)
- [ ] Create `scripts/content/audit-pillar-pages.ts`
- [ ] Implement section-based auditing
- [ ] Add hub-and-spoke link auditing
- [ ] Create `pillar_page_audit_results` collection
- [ ] Test audit on existing pillar page

### Step 3: Create Improvement Script (Week 3)
- [ ] Create `scripts/content/batch-improve-pillar-pages-from-audits.ts`
- [ ] Implement section-based improvements
- [ ] Add hub-and-spoke link improvements
- [ ] Test improvement workflow

### Step 4: Integration (Week 4)
- [ ] Connect to role pages
- [ ] Connect to collections
- [ ] Connect to prompts/patterns/articles
- [ ] Test full workflow

---

## 🔴 Red Hat Lens: Critical Concerns

### 1. **Token Limits** ⚠️

**Problem:** 8,000-10,000 words exceeds context windows

**Mitigation:**
- Generate by sections (1,000-1,500 words each)
- Use section context (previous sections) for coherence
- Final review with full content (may need summarization)

### 2. **Cost** ⚠️

**Problem:** Multiple agents × multiple sections = high API costs

**Mitigation:**
- Use cheaper models for initial generation (GPT-4o-mini)
- Use premium models only for final review
- Cache section generations
- Batch improvements

### 3. **Coherence** ⚠️

**Problem:** Section-based generation may lack flow

**Mitigation:**
- Include previous sections as context
- Final coherence review
- Manual editing pass recommended

### 4. **Maintenance** ⚠️

**Problem:** More complex than single-article generation

**Mitigation:**
- Clear documentation
- Automated testing
- Version control for sections

---

## 📝 Next Steps

1. **Review this plan** - Confirm approach
2. **Start with generation script** - Create `generate-pillar-page.ts`
3. **Test with one pillar page** - "AI-First Engineering Organization"
4. **Iterate based on results** - Refine section handling
5. **Create audit script** - After generation works
6. **Create improvement script** - After audit works

---

## Related Documents

- `docs/strategy/PILLAR_PAGES_STRATEGY.md` - Overall pillar page strategy
- `docs/content/MULTI_AGENT_SYSTEMS.md` - Multi-agent system details
- `scripts/content/generate-article.ts` - Current article generation
- `scripts/content/audit-prompts-patterns.ts` - Current audit system
- `scripts/content/batch-improve-from-audits.ts` - Current improvement system

