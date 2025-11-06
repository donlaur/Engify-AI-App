# Prompt Page Display Fields - Complete Reference

## Overview

All prompt pages display data from the database **if it exists**. Components check for data existence and only render sections when data is available. This ensures consistency - prompts with enrichment data show rich content, while basic prompts show just the essentials.

## Fields Displayed (In Order)

### 1. **Basic Information** (Always Shown)
- ✅ `title` - Prompt title
- ✅ `description` - Brief description
- ✅ `category` - Category badge
- ✅ `role` - Role badge (if exists)
- ✅ `pattern` - Pattern badge (if exists)
- ✅ `tags` - Tag badges
- ✅ `content` - Full prompt template (copyable)
- ✅ `lastRevisedAt` / `updatedAt` - Last updated date
- ✅ `views` - View count
- ✅ `rating` - Rating (if exists)
- ✅ `verified` - Verified badge (if true)

### 2. **Context Explanation** (`PromptContextExplanation`)
**Shows if:** `whatIs` OR `whyUse` exists in DB, OR fallback logic matches
- ✅ `whatIs` - Explanation of what the concept is (from DB if available)
- ✅ `whyUse` - Array of reasons why someone would use this (from DB if available)
- **Fallback:** If DB fields don't exist, uses hardcoded logic based on title/category

### 3. **Interactive Parameters** (`PromptParameters`)
**Shows if:** `parameters` array exists and has items
- ✅ `parameters[]` - Interactive form fields for collecting inputs
  - `id`, `label`, `type`, `placeholder`, `required`, `options`, `description`, `example`, `defaultValue`

### 4. **Enrichment Details** (`PromptEnrichment`)
**Shows if:** ANY enrichment field exists
- ✅ `difficulty` - Difficulty level badge (beginner/intermediate/advanced)
- ✅ `estimatedTime` - Estimated time badge
- ✅ `bestTimeToUse` - When to use this prompt (array or string)
- ✅ `recommendedModel` - Recommended AI models with reasoning
- ✅ `useCases` - Specific scenarios where prompts excel
- ✅ `caseStudies` - Real-world examples with challenge/process/outcome
- ✅ `examples` - Input/output examples
- ✅ `bestPractices` - Tips for getting the best results
- ✅ `whenNotToUse` - Guidance on when to avoid using a prompt

### 5. **Meta Description Summary**
**Shows if:** `metaDescription` exists and is >= 100 characters
- ✅ `metaDescription` - SEO-optimized summary (150-160 chars) displayed as a readable description near the bottom of the page
- **Format:** Typically follows template: "Learn to use the [Prompt Name] prompt to solve [Problem]. Get examples and best practices from Engify.ai, the AI training platform for engineering teams."
- **Display:** Shown in a subtle card with muted background after enrichment details

### 6. **Audit Scores** (`PromptAuditScores`)
**Shows if:** Audit data exists in `prompt_audit_results` collection
- ✅ Fetches client-side from API
- Shows quality scores and feedback

### 7. **Revision History** (`PromptRevisions`)
**Shows if:** Revisions exist in `prompt_revisions` collection
- ✅ Fetches client-side from API
- Shows revision history

### 8. **Related Content** (`CrossContentLinks`, `RelatedPrompts`)
- ✅ Links to related prompts, patterns, and articles

## Database Fields NOT Currently Displayed

These fields exist in the schema but are **not** displayed on the page:

- ❌ `seoKeywords` - Used for SEO metadata only (not displayed on page)
- ❌ `authorId` - Not displayed (could be added)
- ❌ `organizationId` - Internal field
- ❌ `source` - Internal field (seed/ai-generated/user-submitted)
- ❌ `qualityScore` - Not displayed (could show in audit section)
- ❌ `isPremium` - Only shown as badge, not full details
- ❌ `isPublic` - Internal field
- ❌ `requiresAuth` - Internal field
- ❌ `currentRevision` - Internal field
- ❌ `lastRevisedBy` - Not displayed (could be added)

## Component Logic

### `PromptContextExplanation`
- **Priority:** Database fields (`whatIs`, `whyUse`) > Hardcoded fallback > Hide if none
- **Behavior:** Returns `null` if no context available

### `PromptEnrichment`
- **Priority:** Shows ALL enrichment fields that exist
- **Behavior:** Returns `null` if NO enrichment fields exist
- **Sections shown:** Only sections with data are rendered

### `PromptParameters`
- **Behavior:** Only renders if `parameters` array exists and has items

## Recommendations

### Fields That Should Be Displayed (If Available)

1. **`authorId`** → Show author name/credit
2. **`qualityScore`** → Display in audit section
3. **`lastRevisedBy`** → Show who last revised the prompt

### Current Status

✅ **All enrichment fields ARE being displayed** if they exist in the database
✅ **Components correctly check for data existence** before rendering
✅ **No duplication** - removed `PromptSEOFeatures` duplication

### Why Some Pages Look "Basic"

If a prompt page looks basic (only title, description, tags, content), it means:
- The prompt doesn't have enrichment fields populated in the database
- This is expected behavior - components only show what exists
- To enrich prompts, run the audit/improvement scripts

## How to Enrich Prompts

1. **Run audit:**
   ```bash
   pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts
   ```

2. **Apply improvements:**
   ```bash
   pnpm tsx scripts/content/batch-improve-from-audits.ts --type=prompts
   ```

3. **Check database:**
   ```javascript
   db.prompts.findOne({ id: 'prompt-id' })
   // Look for: whatIs, whyUse, useCases, bestPractices, examples, etc.
   ```

## Summary

**All available database fields that make sense to display ARE being displayed.** The page components correctly check for data existence and only render sections when data is available. The difference between "basic" and "rich" pages is simply whether the prompt has enrichment data in the database.

