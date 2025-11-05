# Slug Updates & Sitemap Behavior

## Summary

When prompts are enriched and slugs are optimized, the system automatically:
1. **Updates the sitemap** - Sitemap regenerates daily and includes current slugs
2. **Handles redirects** - Old slugs and IDs automatically redirect to canonical slugs (301 permanent redirect)

## How It Works

### 1. Sitemap Updates Automatically

**Sitemap Generation:**
- Reads slugs directly from MongoDB using `getPromptSlug(prompt)`
- Regenerates daily via cron job (`0 0 * * *`)
- ISR revalidates every 12 hours when accessed

**Code Location:** `src/app/sitemap.ts`
```typescript
const promptPages: MetadataRoute.Sitemap = prompts.map((prompt) => ({
  url: `${baseUrl}/prompts/${getPromptSlug(prompt)}`, // Uses current slug from DB
  lastModified: new Date(prompt.updatedAt || prompt.createdAt),
  changeFrequency: 'monthly' as const,
  priority: 0.7,
}));
```

**Result:** When slugs are updated in the database, the sitemap automatically reflects the new slugs on the next regeneration (within 24 hours).

### 2. Automatic Redirects

**Route Handler:** `src/app/prompts/[id]/page.tsx`

**Behavior:**
- Route accepts both IDs and slugs: `/prompts/[id]`
- `getPromptById()` searches by both ID and slug
- If the URL doesn't match the canonical slug, automatically redirects (301)

**Code:**
```typescript
const slug = getPromptSlug(prompt);

// Redirect to canonical slug if URL doesn't match (SEO best practice)
if (params.id !== slug) {
  redirect(`/prompts/${slug}`, 301); // 301 permanent redirect for SEO
}
```

**Examples:**
- Old slug: `/prompts/old-slug-name` → Redirects to `/prompts/new-optimized-slug` (301)
- ID access: `/prompts/test-001` → Redirects to `/prompts/new-optimized-slug` (301)
- Canonical slug: `/prompts/new-optimized-slug` → No redirect, serves page

### 3. Slug Updates During Enrichment

**Enrichment Scripts:**
- `scripts/content/pre-enrich-prompts.ts` - Optimizes slugs during pre-enrichment
- `scripts/content/batch-improve-from-audits.ts` - May update slugs during improvements
- `src/app/api/cron/warm-isr-cache/route.ts` - Automatically updates slugs during cache warming

**Slug Update Process:**
1. Enrichment script updates slug in database
2. `updatedAt` timestamp is set
3. Sitemap picks up new slug on next regeneration
4. Old URLs automatically redirect to new slug

### 4. SEO Benefits

**301 Permanent Redirects:**
- Preserves SEO value from old URLs
- Signals to search engines that content moved permanently
- Consolidates link equity to canonical URL

**Sitemap Consistency:**
- All URLs in sitemap use canonical slugs
- Search engines discover new URLs quickly (daily updates)
- No broken links in sitemap

## Testing

**To verify redirects work:**
1. Update a prompt's slug in the database
2. Visit the old slug URL: `/prompts/old-slug`
3. Should automatically redirect to: `/prompts/new-slug` (301)

**To verify sitemap updates:**
1. Update slugs via enrichment script
2. Wait for sitemap regeneration (daily cron or manual)
3. Check `/sitemap.xml` - should show new slugs

## Related Files

- `src/app/sitemap.ts` - Sitemap generation
- `src/app/prompts/[id]/page.tsx` - Redirect logic
- `src/lib/utils/slug.ts` - Slug generation utilities
- `src/lib/prompts/mongodb-prompts.ts` - Prompt lookup (handles ID/slug)
- `scripts/content/pre-enrich-prompts.ts` - Slug optimization
- `vercel.json` - Sitemap revalidation cron

## Summary

✅ **Sitemap updates automatically** - Daily regeneration includes current slugs  
✅ **Redirects handled automatically** - Old slugs → new slugs (301 permanent)  
✅ **SEO preserved** - Link equity transferred to canonical URLs  
✅ **No manual intervention needed** - System handles slug changes gracefully

