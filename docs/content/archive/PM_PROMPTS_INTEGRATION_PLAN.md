# Product Manager Prompts Integration Plan

## Overview

Integrate prompts from [Product Manager Prompts](https://github.com/deanpeters/product-manager-prompts) repository into Engify.ai's PM section. The repository is MIT licensed, allowing modification and distribution with attribution.

## Current State

**Existing PM Prompts:**
- 3 basic prompts in `src/data/seed-prompts.ts`:
  - `pm-001`: User Story Generator
  - `pm-002`: Feature Prioritization Matrix
  - `pm-003`: Competitive Analysis

**Target State:**
- Expand to 30-50+ PM prompts covering:
  - User stories & requirements
  - Product strategy & positioning
  - Roadmap planning
  - Competitive analysis
  - Stakeholder management
  - Metrics & analytics
  - Go-to-market planning

## Repository Structure Analysis

From the GitHub repo, the `/prompts/` folder contains markdown files with:
- Structured prompts with instructional comments
- Framework-based approaches (Jobs-to-be-Done, Value Proposition Canvas, etc.)
- Conversational prompts (AI guides user through process)
- Template-based prompts

**Key Folders:**
- `/prompts/` - Main collection (target for integration)
- `/prompt-generators/` - Tools to build custom prompts (reference)
- `/storytelling/` - Narrative techniques (potential content)
- `/skeletons/` - Document templates (could be prompts)

## Integration Strategy

### Phase 1: Content Extraction & Analysis (Week 1)

**Tasks:**
1. Clone repository locally
2. Extract all prompts from `/prompts/` folder
3. Analyze format and structure
4. Map to Engify.ai schema:
   - `title` → Extract from filename or first heading
   - `description` → Extract from prompt intro or create
   - `content` → Full prompt text (strip GitHub comments)
   - `category` → Map to our categories (general, documentation, etc.)
   - `role` → `product-manager`
   - `pattern` → Identify pattern (template, chain-of-thought, etc.)
   - `tags` → Extract from prompt or infer from content

**Script:**
```bash
# Clone repo
git clone https://github.com/deanpeters/product-manager-prompts.git /tmp/pm-prompts

# Analyze structure
ls -la /tmp/pm-prompts/prompts/
```

### Phase 2: Content Adaptation (Week 1-2)

**Adaptation Requirements:**
1. **Remove GitHub-specific comments** (<!-- comment blocks -->)
   - Keep instructional content but adapt to our format
   - Convert teaching comments to `description` or `usageNotes`

2. **Format standardization:**
   - Convert markdown to our prompt format
   - Ensure placeholders use `{variable}` syntax
   - Remove references to "copy raw code" (GitHub-specific)

3. **Enhancement:**
   - Add Engify.ai branding context
   - Add pattern identification
   - Add relevant tags
   - Create proper descriptions

4. **Attribution:**
   - Add attribution note: "Adapted from product-manager-prompts by Dean Peters"
   - Include in prompt metadata or footer

**Example Adaptation:**
```typescript
// Original (GitHub markdown)
<!-- 
## Description: Why this prompt works for PMs
## Usage Note: What context you need before starting
-->
You are a product management expert...

// Adapted (Engify.ai format)
{
  id: 'pm-004',
  title: 'Jobs-to-Be-Done Analysis',
  description: 'Systematically analyze customer needs using the Jobs-to-Be-Done framework. Helps identify what customers are really trying to accomplish.',
  content: `You are a product management expert...
  
  [Full prompt content without GitHub comments]
  
  ---
  Adapted from product-manager-prompts by Dean Peters (MIT License)`,
  category: 'general',
  role: 'product-manager',
  pattern: 'audience-persona',
  tags: ['jobs-to-be-done', 'customer-research', 'strategy'],
  ...
}
```

### Phase 3: Import Script (Week 2)

**Create Import Script:**
`scripts/content/import-pm-prompts.ts`

**Features:**
1. Read markdown files from cloned repo
2. Parse and extract content
3. Map to Engify.ai schema
4. Generate unique IDs (`pm-004`, `pm-005`, etc.)
5. Validate against schema
6. Import to MongoDB via ContentService
7. Handle duplicates (skip if title/content already exists)

**Script Structure:**
```typescript
import { promptRepository } from '@/lib/db/repositories/ContentService';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface PMPromptFile {
  filename: string;
  content: string;
}

async function extractPromptsFromRepo(repoPath: string): Promise<PMPromptFile[]> {
  // Read all .md files from /prompts/ folder
  // Extract content, remove GitHub comments
}

async function adaptToEngifyFormat(pmPrompt: PMPromptFile): Promise<Prompt> {
  // Parse markdown
  // Extract title, description, content
  // Map to schema
  // Add attribution
}

async function importPMPrompts() {
  const repoPath = '/tmp/pm-prompts/prompts';
  const files = await extractPromptsFromRepo(repoPath);
  
  for (const file of files) {
    const prompt = await adaptToEngifyFormat(file);
    await promptRepository.create(prompt);
  }
}
```

### Phase 4: Quality Review & Curation (Week 2-3)

**Review Process:**
1. **Manual Review:**
   - Review each prompt for quality
   - Ensure it fits Engify.ai style
   - Verify adaptations are correct
   - Check for duplicates

2. **Categorization:**
   - Assign appropriate categories
   - Add relevant tags
   - Identify patterns

3. **Featured Selection:**
   - Mark top 10-15 prompts as featured
   - Ensure variety across categories

4. **Testing:**
   - Test prompts with ChatGPT/Claude
   - Verify they work correctly
   - Refine based on results

### Phase 5: Documentation & Attribution (Week 3)

**Documentation:**
1. Update `docs/content/PM_PROMPTS.md`:
   - List all imported prompts
   - Credit original source
   - Explain adaptations

2. Add attribution in UI:
   - Option A: Footer note on PM prompts page
   - Option B: Metadata field in prompt schema
   - Option C: Credits page

3. Update README:
   - Note PM prompt expansion
   - Credit Dean Peters' repository

## Schema Mapping

| GitHub Repo | Engify.ai Schema |
|------------|------------------|
| Filename | `title` (cleaned) |
| First paragraph | `description` |
| Full content | `content` |
| Folder structure | `category` (mapped) |
| N/A | `role`: `product-manager` |
| Prompt style | `pattern` (inferred) |
| Keywords in content | `tags` (extracted) |
| N/A | `isPublic`: `true` |
| N/A | `isFeatured`: `false` (manual) |

## Categories Mapping

| GitHub Category | Engify.ai Category |
|----------------|-------------------|
| User Stories | `documentation` |
| Strategy | `general` |
| Roadmap | `general` |
| Competitive Analysis | `general` |
| Positioning | `general` |
| Stakeholder Management | `general` |
| Metrics | `general` |

## Pattern Identification

**Automated Pattern Detection:**
- `template` - If uses placeholders like `{variable}`
- `chain-of-thought` - If uses "think step by step" or numbered steps
- `audience-persona` - If mentions "customer" or "user persona"
- `few-shot` - If includes examples before prompt
- `meta-language` - If describes how to create prompts

## Estimated Counts

- **Initial Import:** 30-50 prompts (from `/prompts/` folder)
- **After Curation:** 25-40 prompts (remove duplicates/low quality)
- **Target Total:** 50+ PM prompts (combining existing + new)

## Risks & Mitigations

**Risk 1: Copyright/License Compliance**
- ✅ Mitigation: MIT License allows modification and distribution
- ✅ Mitigation: Include attribution in prompt metadata

**Risk 2: Content Quality**
- ✅ Mitigation: Manual review of all prompts
- ✅ Mitigation: Test prompts before publishing
- ✅ Mitigation: Adapt to Engify.ai style guide

**Risk 3: Duplicate Content**
- ✅ Mitigation: Check for existing prompts before import
- ✅ Mitigation: Deduplicate by title/content similarity

**Risk 4: Format Mismatch**
- ✅ Mitigation: Robust parsing script
- ✅ Mitigation: Manual review of adaptations

## Success Metrics

- ✅ 30+ new PM prompts added
- ✅ All prompts properly formatted
- ✅ No duplicates with existing prompts
- ✅ Attribution properly included
- ✅ Prompts tested and working
- ✅ PM section significantly expanded

## Next Steps

1. **Immediate:** Clone repo and analyze structure
2. **Week 1:** Create import script
3. **Week 2:** Import and adapt prompts
4. **Week 3:** Review, test, and publish
5. **Ongoing:** Monitor usage and gather feedback

## Attribution Example

**Footer on PM Prompts Page:**
```
Product Manager prompts adapted from product-manager-prompts by Dean Peters.
Original repository: https://github.com/deanpeters/product-manager-prompts
Licensed under MIT License.
```

**In Prompt Metadata:**
```typescript
{
  ...promptData,
  source: 'product-manager-prompts',
  attribution: 'Adapted from product-manager-prompts by Dean Peters (MIT License)',
  sourceUrl: 'https://github.com/deanpeters/product-manager-prompts'
}
```

## Files to Create

1. `scripts/content/import-pm-prompts.ts` - Import script
2. `docs/content/PM_PROMPTS.md` - Documentation
3. `scripts/content/adapt-pm-prompt.ts` - Adaptation utility
4. `docs/content/ATTRIBUTION.md` - Attribution guidelines

## Timeline

- **Week 1:** Analysis & Script Development
- **Week 2:** Import & Adaptation
- **Week 3:** Review & Polish
- **Total:** ~3 weeks for complete integration

---

**License Compliance:** All prompts from product-manager-prompts are MIT licensed and can be freely used, modified, and distributed with attribution.

