# Prompts Page Sorting & Badges Implementation

## Summary

Implemented sorting functionality and badges for the prompts page as requested.

## Changes Made

### 1. Alphabetical Sorting (Default)
- **Server-side sorting**: Prompts are now sorted alphabetically by title on the server (`src/app/prompts/page.tsx`)
- **Client-side sorting**: Maintains alphabetical order as default, with ability to change via dropdown

### 2. Sorting Dropdown
Added a sorting dropdown with 4 options:
- **Alphabetical** (default): Sort by title A-Z
- **Last Modified**: Sort by `updatedAt` or `lastRevisedAt`, newest first
- **Version Number**: Sort by `currentRevision`, higher versions first
- **By Category**: Sort by category first, then alphabetically within each category

Location: Above the prompt grid, next to the results count

### 3. Recently Updated Badge
- Shows a green "Recently Updated" badge on prompts that were updated within the last 7 days
- Uses `updatedAt` or `lastRevisedAt` field
- Badge includes a clock icon for visual clarity

### 4. Version Badge
- Shows version number (e.g., "v2") for prompts with `currentRevision > 1`
- Displayed as a small outline badge

### 5. Repository Updates
- Updated `PromptRepository` to include `currentRevision` and `lastRevisedAt` fields in the processing
- Ensures these fields are available throughout the application

## Files Modified

1. `src/app/prompts/page.tsx` - Server-side alphabetical sorting
2. `src/components/features/LibraryClient.tsx` - Sorting dropdown and client-side sorting logic
3. `src/components/features/PromptCard.tsx` - Added badges for recently updated and version
4. `src/lib/db/repositories/PromptRepository.ts` - Added `currentRevision` and `lastRevisedAt` to processor

## Next Steps: Unique Slugs

To ensure unique slugs in the database:

1. **Check for duplicates**:
   ```bash
   tsx scripts/admin/find-duplicate-slugs.ts
   ```

2. **Fix duplicates** (dry run first):
   ```bash
   tsx scripts/admin/fix-duplicate-slugs.ts --dry-run
   ```

3. **Apply fixes**:
   ```bash
   tsx scripts/admin/fix-duplicate-slugs.ts
   ```

4. **Create unique index**:
   ```bash
   tsx scripts/admin/ensure-slug-unique-index.ts
   ```

## Testing

- Verify prompts are sorted alphabetically by default
- Test sorting dropdown with all 4 options
- Verify "Recently Updated" badge appears on recently updated prompts
- Verify version badge appears on prompts with revision > 1
- Check that badges are properly styled and responsive

## Notes

- Sorting is done client-side for instant feedback
- Server-side alphabetical sorting ensures SEO-friendly initial order
- Badges use existing design system components (Badge, Icons)
- All sorting respects existing filters (category, role, search)

