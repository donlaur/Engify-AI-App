# Pillar Page Publishing Workflow

## Overview

Pillar pages are generated, saved to MongoDB as drafts, then published when ready. Here's the complete workflow:

## Step 1: Generate Content

Generate the pillar page content (without images to save costs):

```bash
pnpm tsx scripts/content/generate-pillar-page.ts --id=<pillar-id> --no-images
```

**Example:**
```bash
pnpm tsx scripts/content/generate-pillar-page.ts --id=ultimate-guide-ai-assisted-development --no-images
```

**What this does:**
- Generates ~15,000 words of content using research-based section structures
- Saves to MongoDB (`learning_resources` collection) with `status: 'draft'`
- Saves markdown file to `content/drafts/` for review
- Creates FAQ, hub-and-spoke links, SEO metadata

## Step 2: Review Generated Content

1. **Check the markdown file:**
   - Location: `content/drafts/<date>-<slug>.md`
   - Review content quality, word count, structure

2. **Check MongoDB:**
   - Query: `db.learning_resources.findOne({ id: '<slug>', type: 'pillar' })`
   - Verify all fields are populated correctly

3. **Test locally:**
   - The page won't be visible yet (status is 'draft')
   - But you can check the draft in MongoDB

## Step 3: Run Audit (Optional but Recommended)

Audit the generated content for quality improvements:

```bash
pnpm tsx scripts/content/audit-pillar-pages.ts --id=<pillar-id>
```

**What this does:**
- Reviews content quality, SEO, readability
- Identifies improvements needed
- Stores audit results in `pillar_page_audit_results` collection

## Step 4: Apply Improvements (If Needed)

If audit found issues, apply improvements:

```bash
pnpm tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --id=<pillar-id>
```

**What this does:**
- Reads audit results
- Regenerates sections that need improvement
- Updates MongoDB with improved content

## Step 5: Publish

Change status from 'draft' to 'active':

```bash
pnpm tsx scripts/content/publish-pillar-page.ts --id=<pillar-id>
```

**What this does:**
- Updates MongoDB: `status: 'draft'` → `status: 'active'`
- Sets `publishedAt` timestamp
- Makes the page visible at `/learn/<slug>`

## Step 6: Update Config Status

Manually update `src/lib/data/pillar-pages.ts`:

```typescript
{
  id: 'ultimate-guide-ai-assisted-development',
  // ... other fields ...
  status: 'complete', // Change from 'planned' to 'complete'
}
```

**Why:** This marks the page as complete in the config, so scripts know it's done.

## Step 7: Verify Live Page

1. **Check the page:**
   - URL: `https://engify.ai/learn/<slug>`
   - Verify content renders correctly
   - Check SEO metadata
   - Test internal links

2. **Check sitemap:**
   - Should be automatically included
   - Verify URL is present

## Complete Example Workflow

```bash
# 1. Generate
pnpm tsx scripts/content/generate-pillar-page.ts --id=ultimate-guide-ai-assisted-development --no-images

# 2. Review (check content/drafts/ folder)

# 3. Audit (optional)
pnpm tsx scripts/content/audit-pillar-pages.ts --id=ultimate-guide-ai-assisted-development

# 4. Improve (if needed)
pnpm tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --id=ultimate-guide-ai-assisted-development

# 5. Publish
pnpm tsx scripts/content/publish-pillar-page.ts --id=ultimate-guide-ai-assisted-development

# 6. Update config (manually edit pillar-pages.ts)

# 7. Verify (check https://engify.ai/learn/<slug>)
```

## Troubleshooting

### Word Count Looks Low

The word count shown during generation might be per-section. Check the final markdown file for total word count. If sections are under target, run the improvement script.

### Page Not Showing

- Check MongoDB: `db.learning_resources.findOne({ 'seo.slug': '<slug>' })`
- Verify `status: 'active'` (not 'draft')
- Check `type: 'pillar'` is set
- Verify slug matches exactly

### Content Needs Updates

1. Re-run generation with same ID (will update existing draft)
2. Or manually edit MongoDB document
3. Or use improvement script after audit

## Status Flow

```
planned → (generate) → draft → (publish) → active
                              ↓
                         (audit/improve)
                              ↓
                            draft → (publish) → active
```

## MongoDB Schema

Pillar pages are stored in `learning_resources` collection with:

```javascript
{
  id: 'ultimate-guide-to-ai-assisted-software-development',
  type: 'pillar',
  status: 'active', // or 'draft'
  title: '...',
  description: '...',
  contentHtml: '...', // Full markdown content
  wordCount: 15000,
  sections: [...], // Section metadata
  faq: [...],
  hubAndSpoke: {...},
  seo: {
    slug: 'ultimate-guide-to-ai-assisted-software-development',
    metaTitle: '...',
    metaDescription: '...',
    keywords: [...],
  },
  publishedAt: ISODate('...'),
  createdAt: ISODate('...'),
  updatedAt: ISODate('...'),
}
```

## Notes

- **Images:** Disabled by default (`--no-images`) to save costs (~$0.16/page)
- **Word Count:** Target is 15,000 words for comprehensive guides
- **Status:** Only `status: 'active'` pages are visible on the site
- **Config:** Update `pillar-pages.ts` status to 'complete' when done

