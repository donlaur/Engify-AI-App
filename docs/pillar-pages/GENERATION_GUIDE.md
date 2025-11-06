# Pillar Page Generation - Step-by-Step Guide

## Quick Start Commands

### Generate All 3 Planned Pillar Pages (One at a Time)

```bash
# 1. AI Upskilling Program
pnpm tsx scripts/content/generate-pillar-page.ts --id=ai-upskilling-program --no-images

# 2. Ultimate Guide to AI-Assisted Development
pnpm tsx scripts/content/generate-pillar-page.ts --id=ultimate-guide-ai-assisted-development --no-images

# 3. AI-First Engineering Organization
pnpm tsx scripts/content/generate-pillar-page.ts --id=ai-first-engineering-organization --no-images
```

### Or Generate All at Once

```bash
pnpm tsx scripts/content/generate-pillar-page.ts --all-planned --no-images
```

**Note:** `--no-images` saves ~$0.16 per page. Remove it if you want images.

---

## Complete Workflow for Each Pillar Page

### Step 1: Generate Content

```bash
# Replace <pillar-id> with one of:
# - ai-upskilling-program
# - ultimate-guide-ai-assisted-development
# - ai-first-engineering-organization

pnpm tsx scripts/content/generate-pillar-page.ts --id=<pillar-id> --no-images
```

**Expected Output:**
- ✅ Generates ~8,000-15,000 words
- ✅ Saves to `content/drafts/<date>-<slug>.md`
- ✅ Saves to MongoDB with `status: 'draft'`
- ⏱️ Takes 10-15 minutes per page

**If it fails:**
- Check MongoDB connection (`MONGODB_URI` in `.env.local`)
- Check AI API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.)
- Check console for specific error messages

---

### Step 2: Review Generated Content

1. **Check the markdown file:**
   ```bash
   ls -la content/drafts/
   # Look for files like: 2025-11-06-ai-upskilling-program-for-engineering-teams.md
   ```

2. **Check MongoDB:**
   ```javascript
   // In MongoDB shell or Compass
   db.learning_resources.findOne({ 
     id: 'ai-upskilling-program-for-engineering-teams',
     type: 'pillar' 
   })
   ```

3. **Verify word count:**
   - Should be ~8,000 words for upskilling/AI-first
   - Should be ~15,000 words for ultimate guide
   - If too low, proceed to Step 3

---

### Step 3: Audit Content (Optional but Recommended)

```bash
pnpm tsx scripts/content/audit-pillar-pages.ts --id=<pillar-id>
```

**What this does:**
- Reviews content quality, SEO, readability
- Identifies improvements needed
- Stores audit results in `pillar_page_audit_results` collection

---

### Step 4: Apply Improvements (If Needed)

```bash
pnpm tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --id=<pillar-id>
```

**When to run:**
- If audit found issues
- If word count is too low
- If sections need improvement

---

### Step 5: Publish the Page

```bash
pnpm tsx scripts/content/publish-pillar-page.ts --id=<pillar-id>
```

**What this does:**
- Changes `status: 'draft'` → `status: 'active'`
- Sets `publishedAt` timestamp
- Makes page visible at `/learn/<slug>`

---

### Step 6: Update Config Status

Edit `src/lib/data/pillar-pages.ts`:

```typescript
{
  id: 'ai-upskilling-program',
  // ... other fields ...
  status: 'complete', // Change from 'planned' to 'complete'
}
```

---

### Step 7: Verify Live Page

Visit: `https://engify.ai/learn/<slug>`

---

## Troubleshooting

### Script Says "Pillar page not found"

**Check the exact ID:**
```bash
# List all available pillar pages
pnpm tsx -e "import { PILLAR_PAGES } from './src/lib/data/pillar-pages.ts'; console.log(PILLAR_PAGES.map(p => p.id).join('\n'))"
```

**Common IDs:**
- `ai-upskilling-program`
- `ultimate-guide-ai-assisted-development`
- `ai-first-engineering-organization`

---

### Word Count Too Low

**Problem:** Sections are under 1k words when target is 8k total.

**Solution:**
1. Run improvement script:
   ```bash
   pnpm tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --id=<pillar-id>
   ```

2. Or re-generate with explicit word count enforcement (already in script, but verify)

---

### JSON Parsing Errors

**Problem:** Script fails with "JSON parse error" or "Bad control character"

**Solution:** Already fixed in `content-publishing-pipeline.ts` with robust JSON repair. If still occurs:
1. Check AI provider API status
2. Try again (may be transient)
3. Check `maxTokens` settings (should be 3000-4000)

---

### MongoDB Connection Error

**Check:**
```bash
# Verify .env.local exists
cat .env.local | grep MONGODB_URI

# Should show:
# MONGODB_URI=mongodb+srv://...
```

---

### AI Model Errors (404, invalid model)

**Problem:** Script tries to use deprecated models like `claude-3-5-sonnet-20240620`

**Solution:** Already fixed! Script now:
- Filters out deprecated models
- Uses fallback models
- Normalizes model IDs

If still occurs, check `src/lib/content/content-publishing-pipeline.ts` for latest model updates.

---

## Expected Timeline

- **Generation:** 10-15 minutes per page
- **Audit:** 5-10 minutes per page
- **Improvement:** 10-15 minutes per page
- **Publishing:** Instant

**Total per page:** ~30-40 minutes

---

## Quick Reference: All Commands

```bash
# Generate
pnpm tsx scripts/content/generate-pillar-page.ts --id=ai-upskilling-program --no-images

# Audit
pnpm tsx scripts/content/audit-pillar-pages.ts --id=ai-upskilling-program

# Improve
pnpm tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --id=ai-upskilling-program

# Publish
pnpm tsx scripts/content/publish-pillar-page.ts --id=ai-upskilling-program
```

---

## Status Check

To see which pillar pages are planned vs complete:

```bash
pnpm tsx -e "import { PILLAR_PAGES } from './src/lib/data/pillar-pages.ts'; PILLAR_PAGES.forEach(p => console.log(\`\${p.id}: \${p.status}\`))"
```

